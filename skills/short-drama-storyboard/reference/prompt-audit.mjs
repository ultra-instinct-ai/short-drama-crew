#!/usr/bin/env node
/**
 * prompt-audit.mjs — reference-binding proofreader for AI short-drama video prompts.
 *
 * It does NOT rewrite the prompt. It reads the prompt as TEXT, compares it with what the
 * project says must be on screen (cuts → characters / props / scene), and reports every place
 * where the model could mistake which @imageN is a person, which is the room, which is a prop,
 * or where a shot simply never mentions the reference it depends on.
 *
 * usage:
 *   node prompt-audit.mjs --project <dir> --ep 1 --segment E01-02 --prompt <file> [--json]
 *
 * exit code: 0 clean (warnings allowed), 1 errors found.
 */

import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const PROJECT = arg('project');
const EP = Number(arg('ep', 1));
const SEGMENT = arg('segment');
const PROMPT_FILE = arg('prompt');
const AS_JSON = argv.includes('--json');
if (!PROJECT || !SEGMENT || !PROMPT_FILE) {
  console.error('usage: node prompt-audit.mjs --project <dir> --ep 1 --segment E01-02 --prompt <file> [--json]');
  process.exit(2);
}

const project = JSON.parse(readFileSync(resolve(PROJECT, 'project.json'), 'utf8'));
const epFile = join(resolve(PROJECT, 'episodes'), `E${String(EP).padStart(2, '0')}.json`);
const episode = JSON.parse(readFileSync(epFile, 'utf8'));
const prompt = readFileSync(resolve(PROMPT_FILE), 'utf8')
  .split('\n')
  .filter((l) => !l.startsWith('#'))          // drop `prompt` command's header comment line
  .join('\n')
  .trim();

const seg = (episode.storyboard?.segments || []).find((s) => s.id === SEGMENT);
if (!seg) {
  console.error(`no segment ${SEGMENT} in ${epFile}`);
  process.exit(2);
}
const scene = (episode.scenes || [])[Number(seg.sceneIndex) - 1] || {};
const params = project.params || {};
const charById = (id) => (project.characters || []).find((c) => c.id === id);
const sceneById = (id) => (project.scenes || []).find((s) => s.id === id);
const propById = (id) => (project.props || []).find((p) => p.id === id);

// ── what the project says the segment needs ────────────────────────────────
/** Reference plan in connection order, the same way the engine derives it (env → people → props → voices). */
function planOf(seg) {
  const imgs = [];
  if (Array.isArray(seg.refOverride) && seg.refOverride.length) {
    for (const r of seg.refOverride) imgs.push({ entity: r.entity, asset: r.asset || 'sheet', declared: r.role || null });
  } else {
    if (scene.sceneId) {
      imgs.push({ entity: scene.sceneId, asset: 'sheet', declared: 'scene' });
      const se = sceneById(scene.sceneId);
      if (scene.lighting && se?.wji?.assets?.lighting?.[scene.lighting]) imgs.push({ entity: scene.sceneId, asset: `lighting:${scene.lighting}`, declared: 'lighting' });
    }
    const seen = new Set();
    for (const c of seg.cuts || []) for (const id of c.characters || []) if (!seen.has(id)) { seen.add(id); imgs.push({ entity: id, asset: 'sheet', declared: 'character' }); }
    for (const c of seg.cuts || []) for (const id of c.props || []) if (!seen.has(id)) { seen.add(id); imgs.push({ entity: id, asset: 'sheet', declared: 'prop' }); }
  }
  imgs.forEach((r, i) => (r.label = `@image${i + 1}`));
  const speakers = [];
  for (const c of seg.cuts || []) for (const id of c.characters || []) if (id !== 'VO' && !speakers.includes(id)) speakers.push(id);
  const voices = speakers.map((id, i) => ({ entity: id, label: `@audio${i + 1}`, kind: 'audio' }));
  return { imgs, voices };
}

const roleOfEntity = (id, asset, declared) => {
  if (declared) return declared;
  if (/^lighting:/.test(String(asset))) return 'lighting';
  if (/^S/i.test(id)) return 'scene';
  if (/^P/i.test(id)) return 'prop';
  if (/^C/i.test(id)) return 'character';
  return 'unknown';
};

const plan = planOf(seg);
for (const r of plan.imgs) r.role = roleOfEntity(r.entity, r.asset, r.declared);

// ── identity tokens: how a legend can prove WHICH person a picture is ──────
const CN_STOP = new Set(['男的', '女的', '一個', '一个', 'the', 'and', 'with', 'her', 'his', 'man', 'woman']);
function tokensOf(ch) {
  const t = new Set();
  const add = (s) => {
    for (const w of String(s || '').toLowerCase().split(/[^a-z0-9\u4e00-\u9fff]+/)) if (w.length > 2 && !CN_STOP.has(w)) t.add(w);
    for (const run of String(s || '').match(/[\u4e00-\u9fff]+/g) || []) {
      if (run.length <= 3) t.add(run);
      for (let i = 0; i + 1 < run.length && run.length > 3; i++) t.add(run.slice(i, i + 2));
      for (let i = 0; i + 2 < run.length; i++) t.add(run.slice(i, i + 3));
    }
  };
  add(ch.identityEn);
  add(ch.profile?.appearance);
  add(ch.profile?.identity);
  const g = ch.profile?.gender;
  if (g) t.add(g === '男' ? '男' : '女');
  return t;
}

// ── prompt parsing ─────────────────────────────────────────────────────────
const SHOT_RE = /(?:^|\n)[ \t]*(?:镜头|鏡頭|Shot)[ \t]*(\d+)/g;
const shotMarks = [];
for (let m; (m = SHOT_RE.exec(prompt)); ) shotMarks.push({ k: Number(m[1]), at: m.index + (m[0].startsWith('\n') ? 1 : 0) });
const firstShotAt = shotMarks.length ? shotMarks[0].at : prompt.length;
const head = prompt.slice(0, firstShotAt);              // legend + global blocks
const shots = shotMarks.map((s, i) => ({
  k: s.k,
  text: prompt.slice(s.at, i + 1 < shotMarks.length ? shotMarks[i + 1].at : prompt.length),
}));
const legend = head.split('\n').filter((l) => /@image\d+/.test(l)).join('\n');

const IMG_RE = /@image(\d+)/g;
const labelPositions = new Map();       // label -> { first, count, span }
const legendLines = head.split('\n').filter((l) => /^@image\d+\b/.test(l.trim()));
{
  const all = [...head.matchAll(IMG_RE)];
  for (let i = 0; i < all.length; i++) {
    const label = `@image${all[i][1]}`;
    const from = all[i].index;
    const to = i + 1 < all.length ? all[i + 1].index : head.length;
    const prev = labelPositions.get(label);
    const mine = legendLines.filter((l) => l.trim().startsWith(label));
    const lines = mine.length;
    const span = lines ? mine[0].trim().slice(label.length) : head.slice(from, to);
    labelPositions.set(label, { first: from, count: (prev?.count || 0) + 1, lines, span });
  }
}

const countIn = (text, label) => (text.match(new RegExp(`${label}(?!\\d)`, 'g')) || []).length;

// ── checks ─────────────────────────────────────────────────────────────────
const issues = [];
const add = (level, code, msg) => issues.push({ level, code, msg });
const ROLE_EN = /\b(scene|environment|character|person|prop|lighting|light reference|moment|action reference|style)\b/i;
const ROLE_ZH = /(場景|场景|環境|环境|人物|角色|道具|光影|光線|光线|瞬間|瞬间|撞擊|撞击|動作參考|动作参考|風格|风格|車廂|车厢)/;
const BIND_EN = /\b(match|as in|from|same as|use)\b/i;
const BIND_ZH = /(照|參照|参照|跟|用|依|係|是)/;
const NEG_EN = /\b(not|only|do not|don't)\b/i;
const NEG_ZH = /(唔照|不要照|唔好照|只照|只取|唔要|不要|只係|只是|只)/;
const hasCJK = (t) => /[\u4e00-\u9fff]/.test(String(t || ''));
const ROLE_WORDS = { test: (t) => (hasCJK(t) ? ROLE_ZH : ROLE_EN).test(t) };
const BIND_WORDS = { test: (t) => (hasCJK(t) ? BIND_ZH : BIND_EN).test(t) };
const NEG_WORDS = { test: (t) => (hasCJK(t) ? NEG_ZH : NEG_EN).test(t) };

// R1 legend exists
if (!/@image\d+/.test(head)) add('error', 'R1-legend-missing', 'prompt 首段冇 @imageN legend：模型唔知邊張圖係咩');

// R2 every planned image is in the legend, exactly once
for (const r of plan.imgs) {
  const p = labelPositions.get(r.label);
  if (!p) add('error', 'R2-legend-missing-label', `${r.label}（${r.role}：${r.entity}）已接但 legend 冇提`);
  else if (p.lines > 1) add('warn', 'R2-legend-duplicate', `${r.label} 有 ${p.lines} 條 legend 行 — 一張圖一行，重覆會令模型重新解讀角色`);
  else if (p.lines === 0) add('warn', 'R2-legend-inline', `${r.label} 夾在一句裡面，冇自己一行 — 一張圖一行，「@image2、@image3 是人物圖」係模型撈亂嘅溫床`);
}

// R3 prompt uses labels the plan does not have (extra hand-connected refs)
const maxPlanned = plan.imgs.length;
for (const label of labelPositions.keys()) {
  const n = Number(label.slice(6));
  if (n > maxPlanned) add('warn', 'R3-extra-ref', `${label} 唔在項目派生嘅引用次序（只有 ${maxPlanned} 張圖）— 額外接嘅圖要寫入 segment.refOverride，否則重跑 prompt 就對唔上`);
}

// R4 role words per label + R5 negative instruction on non-character refs
for (const r of plan.imgs) {
  const p = labelPositions.get(r.label);
  if (!p) continue;
  if (!ROLE_WORDS.test(p.span)) add('warn', 'R4-role-unsaid', `${r.label} 冇講明係咩角色（場景／人物／道具／光影／瞬間）— 模型只會當「一張參考圖」`);
  if (r.role !== 'character' && !NEG_WORDS.test(p.span)) add('warn', 'R5-no-negative', `${r.label}（${r.role}）冇寫「只照…唔照…」：非人物圖一定要講明唔好抄佢嘅構圖／人物，唔係模型會連人一齊抄`);
}

// R6 legend must let the model tell one person from another
const segChars = [];
for (const c of seg.cuts || []) for (const id of c.characters || []) if (id !== 'VO' && !segChars.includes(id)) segChars.push(id);
const charImgs = plan.imgs.filter((r) => r.role === 'character');
if (segChars.length >= 2 && charImgs.length >= 2) {
  const total = new Map();
  for (const id of segChars) for (const t of tokensOf(charById(id) || {})) total.set(t, (total.get(t) || 0) + 1);
  const assigned = new Map();
  for (const r of charImgs) {
    const span = (labelPositions.get(r.label)?.span || '').toLowerCase();
    let best = null, bestScore = 0;
    for (const id of segChars) {
      if (assigned.has(id)) continue;
      let score = 0;
      for (const t of tokensOf(charById(id) || {})) if (span.includes(t) && (total.get(t) || 0) <= 1) score += 2;
      const g = charById(id)?.profile?.gender;
      if (g && span.includes(g) && segChars.filter((x) => charById(x)?.profile?.gender === g).length === 1) score += 1;
      if (score > bestScore) { best = id; bestScore = score; }
    }
    if (best && bestScore >= 2) assigned.set(best, r.label);
  }
  if (assigned.size < segChars.length) {
    const missing = segChars.filter((id) => !assigned.has(id)).map((id) => charById(id)?.name || id);
    add('error', 'R6-identity-unresolvable', `legend 冇寫到分辨特徵，無法對應邊張圖係邊個人（對唔到：${missing.join('、')}）。` +
      `人物圖必須逐張寫「係邊個」——性別、年齡、髮型、衣著各一句；寫成「@image2、@image3 是人物參考圖」模型就會互換面孔`);
  }
  // two people described in one legend sentence, with no per-picture role
  for (const line of legendLines) {
    const labels = line.match(/@image\d+/g) || [];
    const people = labels.filter((l) => charImgs.some((r) => r.label === l));
    if (people.length >= 2 && !/not its|never its|只照|不要照/i.test(line.replace(/@image\d+/g, ''))) {
      add('warn', 'R6b-shared-clause', `legend 一句寫咗幾個人（${people.join('、')}）又冇逐個講明 — 一張圖一句，否則模型會互換`);
    }
  }
}

// R7 per-shot binding: person / prop / scene
const cuts = seg.cuts || [];
if (shots.length !== cuts.length) add('warn', 'R0-shot-count', `prompt 有 ${shots.length} 個鏡頭，分鏡有 ${cuts.length} 個 cut — 冇法逐鏡核對（人名／道具綁定會漏）`);
const deriveOrder = (() => {
  // when the legend is ambiguous, fall back to the engine's derivation order to still give per-shot advice
  const m = new Map();
  for (const r of plan.imgs) if (r.role === 'character') m.set(r.entity, r.label);
  return m;
})();
const unboundChar = new Map();   // entity -> {label, shots: []}
for (let i = 0; i < cuts.length && i < shots.length; i++) {
  const c = cuts[i];
  const s = shots[i];
  for (const id of c.characters || []) {
    const label = deriveOrder.get(id);
    if (!label) continue;
    if (!countIn(s.text, label)) {
      if (!unboundChar.has(id)) unboundChar.set(id, { label, shots: [] });
      unboundChar.get(id).shots.push(s.k);
    }
  }
  for (const id of c.props || []) {
    const label = plan.imgs.find((r) => r.entity === id)?.label;
    if (label && !countIn(s.text, label)) add('error', 'R7-prop', `鏡頭 ${s.k}：道具 ${propById(id)?.name || id} 在畫面內，但鏡頭文冇 ${label} — 道具外觀會由模型自創`);
  }
  if (i === 0) {
    const sceneLabel = plan.imgs.find((r) => r.role === 'scene')?.label;
    if (sceneLabel && !countIn(head + '\n' + shots.map((x) => x.text).join('\n'), sceneLabel) && !countIn(prompt.slice(firstShotAt), sceneLabel)) {
      add('warn', 'R7-scene', `${sceneLabel} 只在 legend 出現，冇任何鏡頭講明照佢嘅空間／材質 — 每個 segment 至少講一次「整段都在 ${sceneLabel} 的空間裡」`);
    }
  }
}

for (const [id, bad] of unboundChar) {
  add('error', 'R7-char', `${charById(id)?.name || id} 在鏡頭 ${bad.shots.join('、')} 畫面內，但鏡頭文冇 ${bad.label}` +
    ` — 模型會沿用上一鏡嘅樣或者自己編。每個有佢嘅鏡頭都要寫一次 ${bad.label}`);
}
// R8 every image ref is actually used somewhere outside the legend (people are covered by R7)
const bodyText = prompt.slice(firstShotAt);
for (const r of plan.imgs) {
  if (r.role === 'character' || r.role === 'scene') continue;
  if (!countIn(bodyText, r.label)) add('error', 'R8-unused-ref', `${r.label}（${r.role}：${r.entity}）接咗但鏡頭文一次都冇用 — 等於冇參考`);
}

// R9 dialogue still carries its voice label (mirrors the engine's own rule)
const dialogues = [];
for (const c of cuts) {
  for (let b = (c.beats?.[0] || 1) - 1; b <= (c.beats?.[1] || 1) - 1; b++) {
    const beat = (scene.flow || [])[b];
    if (beat?.speaker) dialogues.push({ speaker: beat.speaker, line: beat.line });
  }
}
const norm = (t) => String(t).replace(/[…⋯]/g, '...').replace(/[“”「」『』"]/g, '').replace(/\s+/g, '');
const flat = norm(prompt);
for (const l of dialogues) {
  const needle = norm(l.line);
  const at = flat.indexOf(needle);
  if (at < 0) { add('error', 'R9-dialogue-missing', `台詞「${l.line}」逐字唔見（引擎逐字對，標點差異都算唔同）`); continue; }
  const around = flat.slice(Math.max(0, at - 160), at + needle.length + 60);
  if (!/@audio\d/.test(around)) add('error', 'R9-voice-unbound', `台詞「${l.line}」附近冇 @audioN — 模型會用預設聲`);
}

// R10 hygiene: no names, subtitles off
for (const ch of project.characters || []) if (ch.name && prompt.includes(ch.name)) add('warn', 'R10-name-leak', `prompt 出現角色名「${ch.name}」（引擎 prompt-hygiene 會當錯；描述性名字可以留，但要預期被擋）`);
if (!params.subtitles && !/(全程无字幕|no subtitles)/i.test(prompt)) add('warn', 'R10-subtitles', 'prompt 冇寫「無字幕／no subtitles」');

// R11 ambiguity sweep: a whole sentence that names several pictures without saying what each is for
for (const s of shots) {
  for (const sentence of s.text.split(/[。；;\n]/)) {
    const body = sentence.replace(/^\s*(?:Shot|镜头|鏡頭)\s*\d+\s*\([^)]*\)\s*:?/, '');
    const labels = body.match(/@image\d+/g) || [];
    if (labels.length >= 2 && !BIND_WORDS.test(body.replace(/@image\d+/g, '')) && body.length > 40) {
      add('warn', 'R11-ambiguous-clause', `鏡頭 ${s.k}「${body.trim().slice(0, 44)}…」一句有 ${labels.length} 張圖但冇逐張講用途 — 拆開寫`);
    }
  }
}

// ── report ─────────────────────────────────────────────────────────────────
const errors = issues.filter((x) => x.level === 'error');
const warns = issues.filter((x) => x.level === 'warn');
if (AS_JSON) {
  console.log(JSON.stringify({ segment: SEGMENT, shots: shots.length, cuts: cuts.length, plan: plan.imgs, issues }, null, 2));
} else {
  console.log(`\n== prompt-audit · ${SEGMENT} ==`);
  console.log(`refs (derived order): ${plan.imgs.map((r) => `${r.label}=${r.role}:${r.entity}`).join('  ')}`);
  console.log(`shots in prompt: ${shots.length} · cuts in storyboard: ${cuts.length} · images declared: ${labelPositions.size}\n`);
  for (const x of errors) console.log(`❌ [${x.code}] ${x.msg}`);
  for (const x of warns) console.log(`⚠️  [${x.code}] ${x.msg}`);
  if (!issues.length) console.log('✅ 冇發現引用綁定問題');
  console.log(`\n${errors.length} error(s), ${warns.length} warning(s)`);
}
process.exit(errors.length ? 1 : 0);
