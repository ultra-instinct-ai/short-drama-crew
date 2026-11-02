#!/usr/bin/env node
// short-drama selftest: no model calls, no credits. Every gate gets a breaking
// case — a gate that cannot fail is not a gate.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAMERAS, GATES, STAGES, STYLE_PRESETS, CINEMATOGRAPHY_PRESETS, cinematographyForGenre, ACTION_STYLES, ACTION_RULES, actionForGenre, IP_NAMES_RE, GRAMMARS, GRAMMAR_RULES, COMEDY_STYLES, FACESLAP, grammarsOf, grammarLines, grammarForGenre, comedyForGenre, COMPOSITION_STYLES, COMPOSITION_DEVICES, compositionOf, compositionForGenre, STORY_GENRES, STORY_RULES, storyOf, storyForGenre, FORMATS, span, runsAtLeast, formatForGenre, cinematographyOf, stopNumber,
  bindPath, claimedLines, containsName, cutStarts, dialogueSeconds, episodeSeconds,
  forbiddenNames, h3AlignmentLine, initProject, jaccard, lineSeconds, loadProject, makeContext, manifest,
  paramsOf, parseEpRange, promptSkeleton, renderCharacter, renderOutline, renderProp, renderScene, renderScript,
  renderSegment, runGates, seedScript, seedStoryboard, seedanceAnchors, slug, timestamp, writeJsonFile,
  wanLegendLine, wanSheetLegendLine, wanShotHeader, segmentReferences, imageReferences, audioReferences, voiceSamplePrompt, voiceSampleSeconds, nonWhitespace,
  speechDirection, cameraPhrase, lightPhrase, foregroundPhrase, foregroundBand, foregroundForLook, focalOf, LIGHT_DIRECTIONS, identityOf, isEnglish,
  renderGuideline, renderDialogue, scriptSelfCheck, beatOffsets, turnPoints, parseAge, talkAndAction, normalizeRegister, REGISTERS, REGISTER_ACCENT,
  cutStart, segmentCharacters, keyScenes, shotTexts, motionSentence, cameraClause, PURPOSE_KINDS, ANGLES, HEIGHTS, NO_SUBTITLES, LIPS_CLOSED,
  audioPrompt, musicOf, cueSeconds, AUDIO_MODEL, AUDIO_MAX_CHARS, AUDIO_MAX_SECONDS, scoreSheet, smpte,
  VIDEO_MODELS, VIDEO_MODES, DEFAULT_PARAMS, videoModel, videoResolutionFor, nearestResolution, segmentPlan, videoReferences,
  formatGates, displayName, imagePrompt, imagePromptKit, foldZh, IMAGE_PROMPT_LANGS,
} from './short-drama.mjs';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, symlinkSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(here, '../examples/night-shift');
const PROJECT = JSON.parse(readFileSync(join(FIXTURE, 'project.json'), 'utf8'));
const E01 = JSON.parse(readFileSync(join(FIXTURE, 'episodes/E01.json'), 'utf8'));
const clone = (x) => structuredClone(x);
const ETHNICITY_WORDS = /\b(asian|chinese|japanese|korean|k-drama|caucasian|european|western)\b/i;

let passed = 0;
const ok = (cond, label) => { assert.ok(cond, label); passed += 1; };
const eq = (a, b, label) => { assert.equal(a, b, `${label} — expected ${b}, got ${a}`); passed += 1; };

/** Run one gate on a (project, episode) pair and return its failures. */
function failures(gateId, project = PROJECT, episode = E01) {
  const g = GATES.find((x) => x.id === gateId);
  assert.ok(g, `gate ${gateId} exists`);
  return g.run(makeContext(project, episode ? { 1: episode } : {}));
}
const passes = (gateId, project, episode) => ok(failures(gateId, project, episode).length === 0, `${gateId} passes`);
const breaks = (gateId, project, episode, needle) => {
  const f = failures(gateId, project, episode);
  ok(f.length > 0, `${gateId} breaks`);
  if (needle) ok(f.some((m) => m.includes(needle)), `${gateId} names the problem (${needle}): ${f.join(' | ')}`);
};

// ── dashboard ──────────────────────────────────────────────────────────────
{
  const html = readFileSync(join(here, '../dashboard.html'), 'utf8');
  ok(html.startsWith('<!doctype html>'), 'dashboard is a standalone HTML document');
  ok(html.includes('project.json') && html.includes('episodes/E'), 'dashboard loads project.json and episode files');
  ok(html.includes('/assets/check-status') && html.includes('/assets/list/'), 'dashboard resolves an asset id to its file url');
  ok(html.includes('圖片佔位'), 'dashboard keeps an image placeholder when no media is bound');
  ok(!html.includes('夜班便利店'), 'dashboard does not bake the fixture into the page');
  ok(!html.includes('asset download'), 'dashboard does not download asset files');
  ok(html.includes('data-target') && html.includes('scrollTo'), 'dashboard left nav scrolls the content column');
  ok(html.includes('episode.scenes') && html.includes('△') && html.includes('<details class="script">'), 'dashboard folds the episode script from scenes[].flow');
  ok(html.includes('localStorage.setItem') && html.includes('wji-short-drama-token') && html.includes('login-dialog'), 'dashboard saves the API key in localStorage');
  ok(html.includes('https://app.wji.ai') && html.includes('InfiniteCanvas') && html.includes("app: 'Dataset'"), 'dashboard links to the WJI canvas and dataset pages');
  ok(html.includes('id="viewer"') && html.includes('data-kind'), 'dashboard enlarges an image or video on click');

  const dir = mkdtempSync(join(tmpdir(), 'sd-dash-copy-'));
  try {
    writeFileSync(join(dir, 'project.json'), JSON.stringify(PROJECT));
    const engine = join(here, 'short-drama.mjs');
    const first = spawnSync(process.execPath, [engine, 'dashboard', dir], { encoding: 'utf8' });
    eq(first.status, 0, `dashboard copies a missing file: ${first.stderr}`);
    ok(existsSync(join(dir, 'dashboard.html')), 'dashboard.html is copied beside project.json');
    const stamped = join(dir, 'dashboard.html');
    writeFileSync(stamped, 'keep');
    const second = spawnSync(process.execPath, [engine, 'dashboard', dir], { encoding: 'utf8' });
    eq(second.status, 0, 'dashboard leaves an existing file');
    eq(readFileSync(stamped, 'utf8'), 'keep', 'an existing dashboard.html is not overwritten');
    ok(second.stdout.includes('already beside project.json'), 'dashboard reports the file is already there');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── fixture is green ────────────────────────────────────────────────────────
{
  const results = runGates(makeContext(PROJECT, { 1: E01 }));
  const red = results.filter((r) => r.failures.length);
  ok(red.length === 0, `fixture passes every gate: ${red.map((r) => `${r.id}: ${r.failures.join('; ')}`).join('\n')}`);
  eq(results.filter((r) => !r.skipped).length, GATES.length, 'every gate ran');
  ok(GATES.every((g) => STAGES.includes(g.stage)), 'every gate belongs to a stage');
  const staged = runGates(makeContext(PROJECT, {}), { stage: 'art' });
  ok(staged.every((r) => ['outline', 'characters', 'art'].includes(r.stage)), '--stage art runs outline..art only');
  const noEp = runGates(makeContext(PROJECT, {}));
  ok(noEp.filter((r) => r.stage === 'script').every((r) => r.skipped), 'script gates skip without episode files');
}

// ── params ──────────────────────────────────────────────────────────────────
{
  const p = paramsOf(PROJECT);
  eq(p.thresholds.maxPrimaryScenes, 5, 'primary scene cap for 3 episodes is 5 (clamped)');
  eq(paramsOf({ params: { episodes: 60 } }).thresholds.maxPrimaryScenes, 10, 'primary scene cap for 60 episodes is 10');
  eq(paramsOf({ params: { episodes: 200 } }).thresholds.maxPrimaryScenes, 15, 'primary scene cap clamps at 15');
  eq(paramsOf({ params: { episodes: 60, thresholds: { maxPrimaryScenes: 3 } } }).thresholds.maxPrimaryScenes, 3, 'explicit cap wins');
  const bad = clone(PROJECT); bad.params.video = 'sora';
  breaks('params', bad, null, 'params.video');
  const bad2 = clone(PROJECT); bad2.params.adaptMode = '随便';
  breaks('params', bad2, null, 'adaptMode');
}

// ── outline gates ───────────────────────────────────────────────────────────
{
  const p = clone(PROJECT); p.outline.core = '';
  breaks('adaptation', p, null, 'core');
  const p2 = clone(PROJECT); p2.params.adaptMode = '抽核';
  breaks('adaptation', p2, null, 'cut');
  p2.outline.cut = [{ what: 'x', why: 'y' }]; p2.outline.keep = [{ what: 'a', why: 'b' }];
  passes('adaptation', p2, null);
  const p3 = clone(PROJECT); p3.outline.cutNote = '   ';
  breaks('adaptation', p3, null, 'cutNote');
}
{
  const p = clone(PROJECT); p.characters[0].tier = 'support';
  breaks('tiers', p, null, 'lead characters: 0');
  const p2 = clone(PROJECT);
  for (let i = 0; i < 6; i++) p2.characters.push({ id: `C1${i}`, name: `x${i}`, tier: 'lead', role: 'r', arc: 'a', from: ['原创'] });
  breaks('tiers', p2, null, 'must be 1–5');
  const p3 = clone(PROJECT); delete p3.characters[1].arc;
  breaks('tiers', p3, null, 'need an arc');
  const p4 = clone(PROJECT); p4.characters[0].from = [];
  breaks('tiers', p4, null, 'from[]');
  const p5 = clone(PROJECT); p5.characters[1].id = 'C01';
  breaks('tiers', p5, null, 'duplicate');
}
{
  const p = clone(PROJECT);
  for (let i = 0; i < 5; i++) { p.scenes.push({ id: `S1${i}`, name: `s${i}`, primary: true }); p.outline.episodes[0].sceneIds.push(`S1${i}`); }
  breaks('scenes', p, null, 'primary scenes: 7');
  const p2 = clone(PROJECT);
  p2.scenes.push({ id: 'S03', name: 'once', primary: false }); p2.outline.episodes[1].sceneIds.push('S03');
  breaks('scenes', p2, null, 'reusePlan');
  p2.scenes[2].reusePlan = 'reuse S01 at dawn';
  passes('scenes', p2, null);
  p2.scenes[2].reusePlan = ''; p2.scenes[2].variantOf = 'S01';
  passes('scenes', p2, null);
}
{
  const p = clone(PROJECT); p.props[0].function = '';
  breaks('props-cap', p, null, 'function');
  const p2 = clone(PROJECT);
  for (let i = 0; i < 8; i++) p2.props.push({ id: `P1${i}`, name: `p${i}`, function: 'f' });
  breaks('props-cap', p2, null, 'max 8');
  const p3 = clone(PROJECT); p3.props[0].beatIds = ['B99'];
  breaks('props-cap', p3, null, 'B99');
}
{
  const p = clone(PROJECT); p.outline.beats = [];
  breaks('beats', p, null, 'empty');
  const p2 = clone(PROJECT); p2.outline.beats[0].episode = 2;
  breaks('beats', p2, null, 'episode 1');
  const p3 = clone(PROJECT); p3.params.episodes = 6; p3.outline.beats[1].episode = 5; p3.outline.beats[2].episode = 6;
  breaks('beats', p3, null, 'beat gap');
  const p4 = clone(PROJECT); p4.outline.beats[1].weight = 'minor'; p4.outline.beats[2].weight = 'major';
  breaks('beats', p4, null, 'last episode');
  const p5 = clone(PROJECT); p5.outline.beats.forEach((b) => (b.weight = 'minor'));
  breaks('beats', p5, null, 'major');
  const p6 = clone(PROJECT); p6.outline.beats[0].episode = 1; p6.outline.beats[1].episode = 1; p6.outline.beats[2].episode = 1;
  breaks('beats', p6, null, 'finale');
}
{
  const p = clone(PROJECT); p.outline.episodes[0].synopsis = '她说：「你是谁」';
  breaks('episodes', p, null, 'dialogue quotes');
  const p2 = clone(PROJECT); p2.outline.episodes[1].hook = '';
  breaks('episodes', p2, null, 'hook is empty');
  const p3 = clone(PROJECT); delete p3.outline.episodes[0].crowdPlan;
  breaks('episodes', p3, null, 'crowdPlan');
  const p4 = clone(PROJECT); p4.outline.episodes.pop();
  breaks('episodes', p4, null, '2 entries');
  const p5 = clone(PROJECT); p5.outline.episodes[0].warnings = ['爆炸'];
  breaks('episodes', p5, null, 'unknown warning');
}
{
  const p = clone(PROJECT); p.outline.episodes[0].characterIds.push('C77');
  breaks('refs', p, null, 'unknown character C77');
  const p2 = clone(PROJECT); p2.characters.push({ id: 'C09', name: 'idle', tier: 'functional', role: 'r', from: ['原创'] });
  breaks('refs', p2, null, 'appears in no episode');
  const p3 = clone(PROJECT); p3.outline.episodes.forEach((e) => (e.propIds = []));
  breaks('refs', p3, null, 'prop P01');
}

// ── character gates ─────────────────────────────────────────────────────────
{
  const p = clone(PROJECT); p.characters[0].profile.personality = ['a'];
  breaks('profile', p, null, '3–5');
  const p2 = clone(PROJECT); p2.characters[2].oneLiner = '';
  breaks('profile', p2, null, 'oneLiner');
}
{
  const p = clone(PROJECT); p.characters[0].image.prompt += ' 林小夏';
  breaks('char-prompts', p, null, 'name');
  const p2 = clone(PROJECT); p2.characters[0].image.prompt = p2.characters[0].image.prompt.replace('East Asian ', '').replace('Chinese ', '');
  breaks('char-prompts', p2, null, 'ethnicity');
  const p3 = clone(PROJECT); p3.characters[0].image.prompt = p3.characters[0].image.prompt.replace('contemporary 2020s ', '');
  breaks('char-prompts', p3, null, 'era');
  const p4 = clone(PROJECT); p4.characters[0].image.negativePrompt += ', photorealistic';
  breaks('char-prompts', p4, null, 'must not ban');
  const p5 = clone(PROJECT); p5.params.style = 'ghibli';
  breaks('char-prompts', p5, null, 'must ban');
  const p6 = clone(PROJECT); p6.characters[1].image.sheet = 'a sheet without the render phrase, 16:9';
  breaks('char-prompts', p6, null, 'render phrase');
  const p7 = clone(PROJECT); p7.characters[1].image.prompt = '一个老人的画像 portrait';
  breaks('char-prompts', p7, null, 'English');
  ok(containsName('the old man', 'man'), 'ascii name match is word-bounded');
  ok(!containsName('the woman', 'man'), 'ascii name does not match inside a word');
  ok(containsName('画面里的小夏', '小夏'), 'cjk name matches as substring');
  eq(forbiddenNames(PROJECT).includes('陈叔'), true, 'aliases are forbidden too');
}
{
  const p = clone(PROJECT); p.characters[0].voice.prompt = 'x'.repeat(401);
  breaks('voice', p, null, 'max 400');
  const p2 = clone(PROJECT); p2.characters[0].voice.prompt += ' She says "lock the door".';
  breaks('voice', p2, null, 'quoted line');
  const p3 = clone(PROJECT); p3.characters[0].voice.timbre = '';
  breaks('voice', p3, null, 'timbre');
}
{
  const p = clone(PROJECT); p.characters[1].image.prompt = p.characters[0].image.prompt.replace('mid-twenties', 'thirties');
  breaks('distinct', p, null, 'alike');
  ok(jaccard('one two three four five six seven eight', 'one two three four five six seven nine') > 0.7, 'jaccard of near-identical sets is high');
  eq(jaccard('short', 'short'), 0, 'short prompts do not count');
}

// ── art gates ───────────────────────────────────────────────────────────────
{
  const p = clone(PROJECT); p.scenes[0].anchors.pop(); p.scenes[0].anchors.pop();
  breaks('scene-design', p, null, 'need 3–5');
  const p2 = clone(PROJECT); p2.scenes[0].lighting = [];
  breaks('scene-design', p2, null, 'lighting');
  const p3 = clone(PROJECT); p3.scenes[1].variantOf = 'S09';
  breaks('scene-design', p3, null, 'does not exist');
  const p4 = clone(PROJECT); p4.scenes[1].variantOf = 'S01'; p4.scenes[1].changes = '';
  breaks('scene-design', p4, null, 'changes');
  const p5 = clone(PROJECT); p5.scenes[0].lighting[0].prompt = '冷白光';
  breaks('scene-design', p5, null, 'English');
}
{
  const p = clone(PROJECT); p.scenes[0].image.negativePrompt = 'warped perspective';
  breaks('scene-prompts', p, null, 'ban people');
  const p2 = clone(PROJECT); p2.scenes[0].image.prompt = 'Interior of a store at night, cinematic film still';
  breaks('scene-prompts', p2, null, 'empty');
  const p3 = clone(PROJECT); p3.scenes[0].image.prompt += ' 老陈';
  breaks('scene-prompts', p3, null, 'name');
}
{
  const p = clone(PROJECT); p.props[0].scale = 'huge';
  breaks('prop-design', p, null, 'scale');
  const p2 = clone(PROJECT); p2.props[0].image.prompt = p2.props[0].image.prompt.replace('handheld scale', 'small');
  breaks('prop-design', p2, null, 'handheld scale');
  const p3 = clone(PROJECT); p3.props[0].image.negativePrompt = 'people, text';
  breaks('prop-design', p3, null, 'hands');
  const p4 = clone(PROJECT); p4.props[0].image.sheet = p4.props[0].image.sheet.replace(/white background/gi, 'grey background');
  breaks('prop-design', p4, null, 'white background');
  const p5 = clone(PROJECT); p5.props[0].states = [];
  breaks('prop-design', p5, null, 'state');
}
{
  const missing = clone(PROJECT);
  delete missing.scenes[0].condition;
  delete missing.scenes[0].conditionReason;
  breaks('scene-design', missing, null, 'condition must be new, lived-in or worn');
  const fresh = clone(PROJECT);
  fresh.scenes[0].condition = 'new';
  fresh.scenes[0].conditionReason = 'the organisers finished this set this morning';
  breaks('scene-design', fresh, null, 'condition is new but');
  const clean = clone(PROJECT);
  clean.scenes[1].condition = 'new';
  clean.scenes[1].conditionReason = 'a pavilion built for this episode and struck the next day';
  const scrub = (text) => String(text || '').replace(/\b(worn|rust|rusty|rusted|faded|chipped|torn|frayed|peeling|stain|stained|stains)\b/gi, 'plain').replace(/殘舊|残旧|生鏽|生锈|褪色|剝落|剥落/g, '');
  for (const a of clean.scenes[1].anchors) { a.name = scrub(a.name); a.desc = scrub(a.desc); }
  clean.scenes[1].image.prompt = scrub(clean.scenes[1].image.prompt);
  clean.scenes[1].image.sheet = scrub(clean.scenes[1].image.sheet);
  for (const l of clean.scenes[1].lighting) l.prompt = scrub(l.prompt);
  passes('scene-design', clean, null);
  const ban = clone(PROJECT);
  ban.scenes[0].image.negativePrompt += ', brand-new, showroom-clean';
  breaks('scene-design', ban, null, 'only condition worn may ban');
  const propMissing = clone(PROJECT);
  delete propMissing.props[0].conditionReason;
  breaks('prop-design', propMissing, null, 'conditionReason');
  const propNew = clone(PROJECT);
  propNew.props[0].condition = 'new';
  propNew.props[0].conditionReason = 'a drive the organisers just issued';
  breaks('prop-design', propNew, null, 'condition is new but');
}

// ── script gates ────────────────────────────────────────────────────────────
{
  const params = paramsOf(PROJECT);
  eq(lineSeconds('又是你值夜班。', params), 7 / 4.5, 'line seconds count non-whitespace chars incl. punctuation');
  const est = episodeSeconds(E01, params);
  ok(est > 51 && est < 69, `E01 estimate ${est} within ±15% of 60`);
  const e = clone(E01); e.scenes[1].lighting = '正午';
  breaks('script-shape', PROJECT, e, 'not a state');
  const e2 = clone(E01); e2.scenes[0].sceneId = 'S99';
  breaks('script-shape', PROJECT, e2, 'unknown scene');
  const e3 = clone(E01); e3.scenes[0].characters.push('C88');
  breaks('script-shape', PROJECT, e3, 'unknown character');
  const e4 = clone(E01); e4.cliff = '';
  breaks('script-shape', PROJECT, e4, 'cliff');
}
{
  const e = clone(E01); e.scenes[0].flow[0] = { action: '她说「你是谁」' };
  breaks('beat-flow', PROJECT, e, 'quotes');
  const e2 = clone(E01); e2.scenes[0].flow[1].speaker = 'C02';
  breaks('beat-flow', PROJECT, e2, 'not in this scene');
  const e3 = clone(E01); e3.scenes[0].flow[1].line = '这句话实在是太长了太长了太长了太长了太长了太长了太长了太长了太长了太长了。';
  breaks('beat-flow', PROJECT, e3, 'max 35');
  const e4 = clone(E01); e4.scenes[0].flow = e4.scenes[0].flow.filter((b) => b.line !== undefined);
  breaks('beat-flow', PROJECT, e4, 'radio play');
  const e5 = clone(E01); e5.scenes[0].flow[0] = { action: 'x', line: 'y', speaker: 'C01' };
  breaks('beat-flow', PROJECT, e5, 'not both');
  const e6 = clone(E01); e6.scenes[1].flow[16].speaker = 'VO';
  passes('beat-flow', PROJECT, e6);
}
{
  const e = clone(E01); e.targetSeconds = 120;
  breaks('duration', PROJECT, e, 'target 120');
  const e2 = clone(E01); e2.scenes[1].flow.push(...Array(10).fill({ action: 'padding' }));
  breaks('duration', PROJECT, e2, 'estimated');
}
{
  const e = clone(E01); e.hookBeat = [1, 4];
  breaks('hook-cliff', PROJECT, e, 'first 3');
  const e2 = clone(E01); e2.hookBeat = [2, 1];
  breaks('hook-cliff', PROJECT, e2, 'beat 6');
  const e3 = clone(E01); e3.hookBeat = [9, 9];
  breaks('hook-cliff', PROJECT, e3, 'does not point');
}
{
  const e = clone(E01); e.beatsClaimed = [];
  breaks('beats-claimed', PROJECT, e, 'not claimed: B01');
  const e2 = clone(E01); e2.beatsClaimed = ['B01', 'B02'];
  breaks('beats-claimed', PROJECT, e2, 'not in this episode');
}

// ── screenplay craft gates ──────────────────────────────────────────────────
{
  // params.register drives the accent in the prompt language
  eq(paramsOf(PROJECT).speechAccent, 'standard Mandarin', 'register derives an English accent for an English-prompt model');
  const w = clone(PROJECT); w.params.video = 'wan';
  eq(paramsOf(w).speechAccent, '标准普通话', 'register derives a Chinese accent for wan');
  const explicit = clone(PROJECT); explicit.params.speechAccent = 'Beijing Mandarin';
  eq(paramsOf(explicit).speechAccent, 'Beijing Mandarin', 'an explicit speechAccent wins');
  eq(normalizeRegister('港式普通話'), '港式普通话', 'traditional spellings normalise');
  const bad = clone(PROJECT); bad.params.register = '火星话';
  breaks('params', bad, null, 'register');
  const none = clone(PROJECT); delete none.params.register;
  breaks('params', none, null, 'register');
  ok(REGISTERS.every((r) => REGISTER_ACCENT[r]), 'every register has an accent');
}
{
  const p = clone(PROJECT); delete p.outline.brief;
  breaks('brief', p, null, 'brief is missing');
  const p2 = clone(PROJECT); p2.outline.brief.mainHook = '';
  breaks('brief', p2, null, 'mainHook');
  const p3 = clone(PROJECT); p3.outline.brief.logline = '她说：「我不管」';
  breaks('brief', p3, null, 'quotes');
  const p4 = clone(PROJECT); p4.outline.brief.satisfactionEngine = '很爽';
  breaks('brief', p4, null, 'satisfactionEngine');
}
{
  const p = clone(PROJECT); p.outline.structure = [];
  breaks('structure', p, null, 'structure is missing');
  const p2 = clone(PROJECT); p2.outline.structure[1].episodes = [3, 3]; p2.outline.structure[2].episodes = [3, 3];
  breaks('structure', p2, null, 'expected 2');
  const p3 = clone(PROJECT); p3.outline.structure[0].episodes = [1, 2]; p3.outline.structure[1].episodes = [3, 3];
  breaks('structure', p3, null, 'golden window ends at episode 2');
  const p4 = clone(PROJECT); p4.outline.structure[0].task = '';
  breaks('structure', p4, null, 'task is empty');
  const p5 = clone(PROJECT); p5.outline.structure = [p5.outline.structure[2], p5.outline.structure[1], p5.outline.structure[0]];
  breaks('structure', p5, null, 'in that order');
  const long = clone(PROJECT); long.params.episodes = 10;
  long.outline.structure = [{ phase: 'golden', episodes: [1, 2], task: 't', satisfactionPlan: 's', hookPlan: 'h' }, { phase: 'escalation', episodes: [3, 8], task: 't', satisfactionPlan: 's', hookPlan: 'h' }, { phase: 'climax', episodes: [9, 10], task: 't', satisfactionPlan: 's', hookPlan: 'h' }];
  breaks('structure', long, null, 'first three episodes');
  long.outline.structure[0].episodes = [1, 3]; long.outline.structure[1].episodes = [4, 8];
  passes('structure', long, null);
}
{
  const p = clone(PROJECT); delete p.outline.guideline;
  breaks('guideline', p, null, 'guideline is missing');
  const p2 = clone(PROJECT); p2.outline.guideline.forbidden = ['一条'];
  breaks('guideline', p2, null, 'forbidden');
  const p3 = clone(PROJECT); p3.outline.guideline.priorities = ['a', 'b', 'c', 'd', 'e', 'f'];
  breaks('guideline', p3, null, 'priorities');
  const p4 = clone(PROJECT); p4.outline.guideline.tone = '{{整体风格}}';
  breaks('guideline', p4, null, 'placeholders');
}
{
  const p = clone(PROJECT); p.outline.episodes[0].function = [];
  breaks('episode-design', p, null, 'function is empty');
  const p2 = clone(PROJECT); p2.outline.episodes[0].function = ['情感推进'];
  breaks('episode-design', p2, null, '开局钩子');
  const p3 = clone(PROJECT); p3.outline.episodes[1].satisfaction.type = '强宠';
  breaks('episode-design', p3, null, 'episode two proves');
  const p4 = clone(PROJECT); p4.outline.episodes[2].function = ['情感推进'];
  breaks('episode-design', p4, null, 'episode three');
  const p5 = clone(PROJECT); p5.outline.episodes[1].task.stake = '';
  breaks('episode-design', p5, null, 'task.stake');
  const p6 = clone(PROJECT); p6.outline.episodes[1].change = '';
  breaks('episode-design', p6, null, 'change is empty');
  const p7 = clone(PROJECT); p7.outline.episodes[1].hookType = '悬念';
  breaks('episode-design', p7, null, 'hookType');
  const p8 = clone(PROJECT); p8.outline.episodes[1].satisfaction.action = '';
  breaks('episode-design', p8, null, 'satisfaction.action');
}
{
  const p = clone(PROJECT); delete p.characters[0].bible;
  breaks('bible', p, null, 'bible is missing');
  const p2 = clone(PROJECT); p2.characters[0].bible.need = p2.characters[0].bible.want;
  breaks('bible', p2, null, 'same sentence');
  const p3 = clone(PROJECT); p3.characters[0].bible.forbidden.pop();
  breaks('bible', p3, null, 'exactly 3');
  const p4 = clone(PROJECT); p4.characters[0].bible.arc = p4.characters[0].bible.arc.filter((st) => st.stage !== '高潮选择');
  breaks('bible', p4, null, '高潮选择');
  const p5 = clone(PROJECT); p5.characters[1].bible.speech.rhythm = '';
  breaks('bible', p5, null, 'speech.rhythm');
  const p6 = clone(PROJECT); p6.characters[2].bible = { function: '路人' };
  breaks('bible', p6, null, 'bible.function');
  const p7 = clone(PROJECT); p7.characters[2].bible = { function: '反派' };
  passes('bible', p7, null);
  const p8 = clone(PROJECT); p8.characters[0].bible.pastChoices.pop();
  breaks('bible', p8, null, 'pastChoices');
  const p9 = clone(PROJECT); p9.characters[0].bible.arc[0].episode = 9;
  breaks('bible', p9, null, 'outside 1–3');
  const p10 = clone(PROJECT); p10.characters[1].bible.speech.register = '粵語';
  passes('bible', p10, null);
}
{
  const p = clone(PROJECT); p.characters[0].profile.relationships = [];
  breaks('relationships', p, null, 'a lead needs');
  const p2 = clone(PROJECT); p2.characters.forEach((c) => c.profile.relationships.forEach((r) => (r.secret = '')));
  breaks('relationships', p2, null, 'secret');
  const p3 = clone(PROJECT); p3.characters[0].profile.relationships[0].id = 'C77';
  breaks('relationships', p3, null, 'C77');
  const p4 = clone(PROJECT); p4.characters[0].profile.relationships[0].turnEpisode = 8;
  breaks('relationships', p4, null, 'turnEpisode');
}
{
  const e = clone(E01); e.function = [];
  breaks('script-design', PROJECT, e, 'function is empty');
  const e2 = clone(E01); e2.function = ['大反转'];
  breaks('script-design', PROJECT, e2, 'differs from the outline');
  const e3 = clone(E01); e3.satisfactionBeat = null;
  breaks('script-design', PROJECT, e3, 'satisfactionBeat');
  const e4 = clone(E01); e4.satisfactionBeat = [2, 4];   // a line between two lines
  breaks('script-design', PROJECT, e4, 'no action beat beside it');
  const e5 = clone(E01); e5.satisfactionBeat = [2, 8];   // a line next to an action
  passes('script-design', PROJECT, e5);
  const e6 = clone(E01); e6.task.goal = '';
  breaks('script-design', PROJECT, e6, 'task.goal');
  const e7 = clone(E01); e7.hookType = '危机';
  breaks('script-design', PROJECT, e7, 'differs from the outline');
}
{
  const params = paramsOf(PROJECT);
  const offsets = beatOffsets(E01, params);
  eq(offsets.length, 24, 'beatOffsets lists every beat');
  ok(Math.abs(offsets[5].start - 12.6) < 0.05, 'beat offsets accumulate across scenes');
  const points = turnPoints(E01, params);
  eq(points[0].what, 'hook', 'turn points start at the hook');
  eq(points[points.length - 1].what, 'cliff', 'turn points end at the cliff');
  const e = clone(E01); e.scenes[1].flow.forEach((b) => delete b.turn);
  breaks('rhythm', PROJECT, e, 'no turn');
  const e2 = clone(E01); e2.hookBeat = [2, 3]; e2.scenes[0].flow.forEach((b) => delete b.turn);
  breaks('rhythm', PROJECT, e2, 'hook image lands');
  const e3 = clone(E01); e3.scenes[1].flow.splice(5, 1);   // remove the action between b5 and b7 → 5 lines in a row
  breaks('rhythm', PROJECT, e3, 'in a row');
  const e4 = clone(E01); e4.satisfactionBeat = [2, 19];
  breaks('rhythm', PROJECT, e4, 'last beat is the cliff');
  const e5 = clone(E01); e5.satisfactionBeat = [1, 1];
  breaks('rhythm', PROJECT, e5, 'before or on the hook');
  const e6 = clone(E01); e6.scenes.forEach((sc) => (sc.flow = sc.flow.filter((b, i) => b.line !== undefined || i === 0)));
  const loose = clone(PROJECT); loose.params.maxConsecutiveLines = 10;
  breaks('rhythm', loose, e6, '%');
  const ta = talkAndAction(E01);
  eq(ta.longestLineRun, 3, 'longest run of lines in the fixture is 3');
  eq(parseAge('六十岁出头'), 60, 'parseAge reads Chinese numerals');
  eq(parseAge('24 岁左右'), 24, 'parseAge reads digits');
  eq(parseAge('四十上下'), 40, 'parseAge reads 四十');
  eq(parseAge('中年'), null, 'parseAge gives null when there is no number');
}
{
  const e = clone(E01); e.scenes[1].flow[5].action = '老陈心想，这袋子不简单。';
  breaks('filmable', PROJECT, e, 'novel prose');
  const e2 = clone(E01); e2.scenes[1].flow[5].action = '老陈似乎认出了那个袋子。';
  breaks('filmable', PROJECT, e2, 'inner state');
  const e3 = clone(E01); e3.scenes[1].flow[8].action = '老陈拿起碗，放下筷子，递过纸巾，接过袋子，握住她的手。';
  breaks('filmable', PROJECT, e3, 'hand verbs');
  const e4 = clone(E01); e4.scenes[1].flow[8].action = '老陈把碗放下，伸手想拿袋子。';
  passes('filmable', PROJECT, e4);
}
{
  // dialogue-register is advisory: it reports, validate still passes
  const g = GATES.find((x) => x.id === 'dialogue-register');
  ok(g.advisory === true, 'dialogue-register is advisory');
  const e = clone(E01); e.scenes[1].flow[2].line = '你又嚟值夜班。';
  const notes = failures('dialogue-register', PROJECT, e);
  ok(notes.some((m) => m.includes('Cantonese')), 'a Cantonese marker in a 大陆普通话 line is noted');
  const results = runGates(makeContext(PROJECT, { 1: e }));
  const adv = results.find((r) => r.id === 'dialogue-register');
  ok(adv.advisory && adv.failures.length === 0 && adv.warnings.length > 0, 'advisory findings come back as warnings, not failures');
  ok(results.filter((r) => !r.advisory && r.stage !== 'storyboard').every((r) => !r.failures.length), 'a register note never fails validate (the storyboard is stale on purpose here)');
  const p2 = clone(PROJECT); p2.params.register = '粤语';
  ok(failures('dialogue-register', p2, E01).some((m) => m.includes('书面中文硬转')), 'a 粤语 drama with written-Chinese lines is noted');
  const p3 = clone(PROJECT); p3.params.register = '古装';
  const e3 = clone(E01); e3.scenes[1].flow[2].line = 'OK，又是你值夜班。';
  ok(failures('dialogue-register', p3, e3).some((m) => m.includes('modern speech')), 'a modern word in 古装 is noted');
  const e4 = clone(E01); e4.scenes[1].flow[2].line = '绝了，又是你值夜班。';   // C02 is 60
  ok(failures('dialogue-register', PROJECT, e4).some((m) => m.includes('网络用语')), 'net slang on a sixty-year-old is noted');
  const e5 = clone(E01); e5.scenes[1].flow[3].line = '绝了，陈叔你怎么天天来。';   // C01 is 24
  ok(!failures('dialogue-register', PROJECT, e5).some((m) => m.includes('网络用语')), 'net slang on a twenty-four-year-old is fine');
  const p6 = clone(PROJECT); p6.params.register = '英文美式';
  const e6 = clone(E01); e6.scenes[1].flow[2].line = 'I am telling you right now that this is absolutely not something I am going to keep doing every single night.';
  const en = failures('dialogue-register', p6, e6);
  ok(en.some((m) => m.includes('words')), 'an over-long English line is noted');
  ok(en.some((m) => m.includes('uncontracted')), 'uncontracted English is noted');
  const e7 = clone(E01); e7.scenes[1].flow[3].delivery = '生气';
  ok(failures('dialogue-register', PROJECT, e7).some((m) => m.includes('emotion')), 'an emotion-only delivery is noted');
  const p8 = clone(PROJECT); p8.characters[1].bible.speech.register = '粤语';
  const e8 = clone(E01); e8.scenes[1].flow[2].line = '你又嚟值夜班。';
  ok(!failures('dialogue-register', p8, e8).some((m) => m.includes('Cantonese')), 'a per-character register override allows Cantonese');
}

// ── storyboard gates ────────────────────────────────────────────────────────
{
  const e = clone(E01); e.storyboard.segments[1].id = 'E01-09';
  breaks('segments', PROJECT, e, 'expected id E01-02');
  const e2 = clone(E01); e2.storyboard.segments[0].cuts[0].beats = [1, 2];
  breaks('segments', PROJECT, e2, 'claimed twice');
  const e3 = clone(E01); e3.storyboard.segments[0].cuts.pop();
  breaks('segments', PROJECT, e3, 'unclaimed');
  const e4 = clone(E01); e4.storyboard.segments[0].sceneIndex = 5;
  breaks('segments', PROJECT, e4, 'does not exist');
  const e5 = clone(E01); e5.storyboard.segments = [];
  breaks('segments', PROJECT, e5, 'no segments');
}
{
  const e = clone(E01); e.storyboard.segments[0].cuts[0].seconds = 6;
  breaks('timing', PROJECT, e, '2–5');
  const e2 = clone(E01); e2.storyboard.segments[1].cuts[2].seconds = 2;
  breaks('timing', PROJECT, e2, 'does not fit');
  const e3 = clone(E01); e3.storyboard.segments[0].cuts.forEach((c) => (c.seconds = 5));
  breaks('timing', PROJECT, e3, 'must be 5–15 s (minimax-h3-ref)');
  // Under the model's floor is a failure too, not only over its ceiling.
  const e3b = clone(E01); e3b.storyboard.segments[0].cuts = [{ ...e3b.storyboard.segments[0].cuts[0], seconds: 2, beats: [1] }];
  breaks('timing', PROJECT, e3b, 'must be 5–15 s');
  const e4 = clone(E01); e4.targetSeconds = 30;
  breaks('timing', PROJECT, e4, 'storyboard totals');
  const sc = E01.scenes[1];
  ok(Math.abs(dialogueSeconds(sc, [3, 4], paramsOf(PROJECT)) - (7 + 12) / 4.5) < 1e-9, 'dialogue seconds sum the claimed lines');
  eq(cutStarts([{ seconds: 3 }, { seconds: 2 }, { seconds: 5 }]).join(','), '0,3,5', 'cut starts are cumulative');
  eq(timestamp(63.5), '01:03.500', 'timestamp format mm:ss.mmm');
}
{
  const e = clone(E01); e.storyboard.segments[0].cuts[0].size = 'huge';
  breaks('cut-content', PROJECT, e, 'size');
  const e2 = clone(E01); e2.storyboard.segments[0].cuts[0].camera = 'Dolly Zoom';
  breaks('cut-content', PROJECT, e2, 'vocabulary');
  ok(CAMERAS.length === 20, '20 camera words');
  const e3 = clone(E01); e3.storyboard.segments[0].cuts[0].characters = ['C02'];
  breaks('cut-content', PROJECT, e3, 'not in this scene');
  const e4 = clone(E01); e4.storyboard.segments[1].cuts[0].characters = ['C01', 'C02', 'C01', 'C02'];
  breaks('cut-content', PROJECT, e4, 'on screen');
  const e5 = clone(E01); e5.storyboard.segments[0].cuts[0].frame = e5.storyboard.segments[0].cuts[0].frame.replace('medium shot', 'shot');
  breaks('cut-content', PROJECT, e5, 'medium shot');
  const e6 = clone(E01); e6.storyboard.segments[0].cuts[0].frame = e6.storyboard.segments[0].cuts[0].frame.replace('cinematic film still', 'photo');
  breaks('cut-content', PROJECT, e6, 'cinematic film still');
  const e7 = clone(E01); e7.storyboard.segments[0].cuts[0].frame += ' 林小夏';
  breaks('cut-content', PROJECT, e7, 'name');
  const p = clone(PROJECT); p.params.style = 'ghibli';
  breaks('cut-content', p, E01, STYLE_PRESETS.ghibli.framePhrase);
}
{
  // H3 mode
  const seg = E01.storyboard.segments[0];
  eq(h3AlignmentLine(seg.cuts), seg.prompt.split('\n')[0], 'alignment line is derived from the cuts');
  eq(h3AlignmentLine([{ seconds: 4 }]), 'For the target video, at 0.00 seconds into the target video, @image1 (from [Shot 1]) is fully referenced.', 'single-cut alignment sentence');
  const e = clone(E01); e.storyboard.segments[0].cuts[1].seconds = 4; e.storyboard.segments[0].cuts[2].seconds = 2;
  breaks('video-prompt', PROJECT, e, 'alignment line');
  const e2 = clone(E01); e2.storyboard.segments[0].prompt = e2.storyboard.segments[0].prompt.replace('<d>[Chinese] 帮我收着。明天有人来拿。</d>', 'he asks her to keep it');
  breaks('video-prompt', PROJECT, e2, 'verbatim');
  const e3 = clone(E01); e3.storyboard.segments[0].prompt = e3.storyboard.segments[0].prompt.replace('[Shot 3] At 00:07.000,', '[Shot 3] At 00:08.000,');
  breaks('video-prompt', PROJECT, e3, 'At 00:07.000');
  const e4 = clone(E01); e4.storyboard.segments[0].prompt = e4.storyboard.segments[0].prompt.replace('overall_soundscape:', 'sounds:');
  breaks('video-prompt', PROJECT, e4, 'overall_soundscape');
  const e5 = clone(E01); e5.storyboard.segments[0].prompt = e5.storyboard.segments[0].prompt.replace('a tracking shot follows', 'the camera follows');
  breaks('video-prompt', PROJECT, e5, 'Tracking Shot');
  const e6 = clone(E01); e6.storyboard.segments[0].prompt = e6.storyboard.segments[0].prompt.replace('a young night-shift clerk', '林小夏');
  breaks('video-prompt', PROJECT, e6, 'name');
  const e7 = clone(E01); e7.storyboard.segments[0].prompt = '';
  breaks('video-prompt', PROJECT, e7, 'empty');
  const lines = claimedLines(E01.scenes[0], seg.cuts);
  eq(lines.length, 2, 'segment 1 claims two lines');
  eq(lines[0].speaker, 'C03', 'first claimed line is the stranger');
}
{
  // Seedance mode
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '720p';
  const e = clone(E01);
  const seg = e.storyboard.segments[3]; // 4 cuts
  const lines = claimedLines(e.scenes[1], seg.cuts).map((l) => l.line);
  const C02_DIRECTION = PROJECT.characters.find((c) => c.id === 'C02').voice.videoDirection;
  seg.prompt = [...seedanceAnchors(4), 'This first frame defines the clerk behind the counter and the older man facing the doors, a wide shot with a static shot.', '@image2 defines the second keyframe: a close-up from behind him with a static shot.', '@image3 defines the third keyframe: a slow pan left as he turns, medium shot.', 'This last frame defines his grave face in close-up, a slow push in.', '@audio1 is the voice of the stocky man in his sixties.',
    `@audio1, ${C02_DIRECTION}, says: ${lines[0]} Then @audio1 says: ${lines[1]}`, 'Sound: all dialogue in standard Mandarin, no subtitles.'].join('\n');
  const ep = { 1: e };
  const f = GATES.find((g) => g.id === 'video-prompt').run(makeContext(p, ep));
  const segFails = f.filter((m) => m.startsWith('E01-04'));
  ok(segFails.length === 0, `seedance prompt passes: ${segFails.join(' | ')}`);
  eq(seedanceAnchors(1).length, 1, 'single keyframe only needs the first-frame sentence');
  const e2 = clone(e); e2.storyboard.segments[3].prompt = e2.storyboard.segments[3].prompt.replace('Use @image4 as the last frame.', '');
  breaks('video-prompt', p, e2, 'Use @image4 as the last frame.');
  const e3 = clone(e); e3.storyboard.segments[3].prompt += '\n@image7 is unused.';
  breaks('video-prompt', p, e3, '@image7');
  const e4 = clone(e); e4.storyboard.segments[3].prompt = e4.storyboard.segments[3].prompt.replace(lines[1], 'something else');
  breaks('video-prompt', p, e4, 'verbatim');
  const e5 = clone(e); e5.storyboard.segments[3].prompt = e5.storyboard.segments[3].prompt.replace('slow pan left', 'camera swings');
  breaks('video-prompt', p, e5, 'Pan Left');
}

{
  // Wan 3.0 Ref mode — Chinese prompt, 图N legend, integer duration
  const p = clone(PROJECT); p.params.video = 'wan'; p.params.speechAccent = '台湾口音国语'; p.params.videoResolution = '480P';
  const e = clone(E01);
  const seg = e.storyboard.segments[3]; // 4 cuts, 12 s
  const lines = claimedLines(e.scenes[1], seg.cuts).map((l) => l.line);
  const C02_ZH = speechDirection(PROJECT.characters.find((c) => c.id === 'C02'), '', 'zh');
  seg.prompt = [
    wanLegendLine(seg.cuts, segmentReferences(p, e, seg)), '',
    `${wanShotHeader(seg.cuts, 0)}店内全景，年轻店员站在收银台后，一名年长男子背对镜头。`,
    `台词（@audio1，即@image1中的年长男子，${C02_ZH}）：「${lines[0]}」`, '',
    `${wanShotHeader(seg.cuts, 1)}他的手推过一个纸袋。`, '',
    `${wanShotHeader(seg.cuts, 2)}他转过身来。`, '',
    `${wanShotHeader(seg.cuts, 3)}他的脸靠近。`,
    `台词（@audio1，即@image4中的年长男子，${C02_ZH}）：「${lines[1]}」`, '',
    '整体：凌晨便利店，冷白灯光。',
    '音频：对白为台湾口音国语，冷气柜嗡嗡声。',
  ].join('\n');
  const ep = { 1: e };
  const fails = GATES.find((g) => g.id === 'video-prompt').run(makeContext(p, ep)).filter((m) => m.startsWith('E01-04'));
  ok(fails.length === 0, `wan prompt passes: ${fails.join(' | ')}`);
  eq(paramsOf(p).maxSegmentSeconds, 30, 'wan raises the segment cap to 30 s');
  const e2 = clone(e); e2.storyboard.segments[3].prompt = e2.storyboard.segments[3].prompt.replace(wanLegendLine(seg.cuts, segmentReferences(p, e, seg)), '参考图说明：随便用。');
  breaks('video-prompt', p, e2, 'reference legend');
  const e3 = clone(e); e3.storyboard.segments[3].prompt = e3.storyboard.segments[3].prompt.replace(wanShotHeader(seg.cuts, 2), '镜头3：');
  breaks('video-prompt', p, e3, wanShotHeader(seg.cuts, 2));
  const e4 = clone(e); e4.storyboard.segments[3].prompt = e4.storyboard.segments[3].prompt.replace(lines[1], '随便说点别的。');
  breaks('video-prompt', p, e4, 'verbatim');
  const e5 = clone(e); e5.storyboard.segments[3].prompt = e5.storyboard.segments[3].prompt.replace('音频：', '声音：');
  breaks('video-prompt', p, e5, '音频');
  const e6 = clone(e); e6.storyboard.segments[3].prompt = e6.storyboard.segments[3].prompt.replace('台湾口音国语', '普通话');
  breaks('video-prompt', p, e6, 'accent');
  const e7 = clone(e); e7.storyboard.segments[3].prompt = e7.storyboard.segments[3].prompt.replace('年长男子背对镜头', '老陈背对镜头');
  breaks('video-prompt', p, e7, 'name');
  // Fractional seconds only matter when a duration is actually sent; `auto` lets the model pick.
  const pFixed = clone(p); pFixed.params.videoDuration = 'fixed';
  const e8 = clone(e); e8.storyboard.segments[3].cuts[0].seconds = 3.5;
  breaks('timing', pFixed, e8, 'whole seconds');
  const autoFails = GATES.find((g) => g.id === 'timing').run(makeContext(p, { 1: e8 })).filter((m) => m.includes('whole seconds'));
  ok(autoFails.length === 0, 'auto duration does not demand whole seconds');
  const sk = promptSkeleton(p, e, 'E01-04');
  eq(sk.video.model, 'wan-3.0-ref', 'wan model');
  eq(sk.video.resolution, '480P', 'skeleton carries the output resolution');
  ok(sk.video.prompt.startsWith(wanLegendLine(seg.cuts, segmentReferences(p, e, seg))), 'wan skeleton starts with the legend, voices included');
  ok(sk.video.prompt.includes('@audio1'), 'and the wan legend carries the voice reference');
  ok(sk.video.prompt.includes('台湾口音国语'), 'wan skeleton names the accent');
}

{
  // Style presets are self-consistent: a preset never demands and forbids the same word
  for (const [name, preset] of Object.entries(STYLE_PRESETS)) {
    ok(preset.render && preset.framePhrase, `${name}: render + framePhrase present`);
    for (const w of preset.negativeMust) ok(!preset.negativeMustNot.includes(w), `${name}: "${w}" is not both required and forbidden`);
  }
  eq(STYLE_PRESETS.photoreal.framePhrase, 'photorealistic cinematic film still', 'photoreal frame phrase');
}


{
  // Sheets reference mode: no keyframes, the video node references the sheets, duration auto
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '720p'; p.params.references = 'sheets'; p.params.videoDuration = 'auto'; p.params.lookPhrase = 'shallow depth of field';
  const e = clone(E01);
  const seg = e.storyboard.segments[3];
  const refs = segmentReferences(p, e, seg);
  ok(refs.length >= 2, 'segment references at least the scene and one person');
  eq(refs[0].entity, 'S01', 'first sheet reference is the environment');
  eq(refs[0].label, '@image1', 'sheet references are labelled @imageN');
  const lines = claimedLines(e.scenes[1], seg.cuts).map((l) => l.line);
  const legend = refs.map((r) => `${r.label} is ${r.use}.`).join('\n');
  const dirC02 = speechDirection(PROJECT.characters.find((c) => c.id === 'C02'), '', 'en');
  seg.prompt = [legend, 'Shot 1: a wide shot with a static shot of the clerk and the older man.', 'Shot 2: a close-up, static shot, from behind him.', 'Shot 3: a slow pan left as he turns, medium shot.', 'Shot 4: a slow push in on his grave face.', '@audio1 is the voice of the person in @image3.',
    `@audio1 / @image3, ${dirC02}, says: ${lines[0]} Then @audio1 says: ${lines[1]}`, 'Look: semi-realistic painterly cinematic footage, shallow depth of field.', 'Sound: all dialogue in standard Mandarin.'].join('\n');
  const ep = { 1: e };
  const fails = GATES.find((g) => g.id === 'video-prompt').run(makeContext(p, ep)).filter((m) => m.startsWith('E01-04'));
  ok(fails.length === 0, `sheets-mode prompt passes: ${fails.join(' | ')}`);
  const e2 = clone(e); e2.storyboard.segments[3].prompt = e2.storyboard.segments[3].prompt.replace('@image1 is', '@image9 is');
  breaks('video-prompt', p, e2, '@image1');
  const e3 = clone(e); e3.storyboard.segments[3].prompt += '\nUse @image1 as the first frame.';
  breaks('video-prompt', p, e3, 'keyframe anchor');
  const e4 = clone(e); e4.storyboard.segments[3].prompt = e4.storyboard.segments[3].prompt.replace('shallow depth of field', 'deep focus');
  breaks('video-prompt', p, e4, 'look phrase');
  const e5 = clone(e); e5.storyboard.segments[3].prompt = e5.storyboard.segments[3].prompt.replace('semi-realistic painterly cinematic footage', 'footage');
  breaks('video-prompt', p, e5, 'semi-realistic painterly cinematic footage');
  const p2 = clone(p); p2.params.video = 'h3'; p2.params.videoResolution = '768P';
  breaks('params', p2, e, 'auto duration');   // h3 accepts sheets but not auto duration
  const sk = promptSkeleton(p, e, 'E01-04');
  eq(sk.keyframes.length, 0, 'sheets mode makes no keyframes');
  eq(sk.video.duration, null, 'auto duration passes no -d');
  eq(sk.video.plannedSeconds, 12, 'planned seconds still reported');
  ok(sk.video.references[0] === 'S01:sheet', 'video references are sheet keys');
  ok(sk.video.prompt.includes('@image1 is the environment'), 'skeleton legend describes the sheets');
  ok(sk.video.prompt.includes('shallow depth of field'), 'skeleton carries the look phrase');
  const cutFails = GATES.find((g) => g.id === 'cut-content').run(makeContext(p, ep));
  ok(cutFails.length === 0, `frame phrase not demanded in sheets mode: ${cutFails.join(' | ')}`);
  const m = manifest(p, ep, { ep: 1 });
  ok(!m.some((it) => it.item.includes('keyframes')), 'manifest lists no keyframes in sheets mode');
  ok(m.some((it) => it.hint.includes('sheet display nodes')), 'manifest points the video node at the sheet display nodes');
}


{
  // Provider policy: Seedance refuses photoreal people as references
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '720p'; p.params.style = 'photoreal';
  breaks('params', p, E01, 'real-person');
  p.params.references = 'sheets'; p.params.humanReferences = false;
  const f = GATES.find((g) => g.id === 'params').run(makeContext(p, { 1: E01 }));
  ok(f.length === 0, `seedance + photoreal passes with sheets and no human references: ${f.join(' | ')}`);
  const p3 = clone(p); p3.params.humanReferences = true;
  ok(GATES.find((g) => g.id === 'params').run(makeContext(p3, { 1: E01 })).length === 0, 'an explicit humanReferences: true (permission enabled) also passes');
  const refs = segmentReferences(p, E01, E01.storyboard.segments[3]);
  // humanReferences is about PICTURES of people — the provider's real-person check looks at images.
  // The voices are audio references and are unaffected.
  ok(refs.filter((r) => r.kind === 'image').every((r) => !/^C\d/.test(r.entity)), 'no character sheet is referenced when humanReferences is false');
  ok(refs.some((r) => r.kind === 'audio' && /^C\d/.test(r.entity)), 'the speakers keep their voice references');
  eq(refs[0].entity, 'S01', 'environment still first');
}


{
  // H3 in sheets mode: "Image k" legend instead of the alignment line, no <Picture k> anchors
  const p = clone(PROJECT); p.params.references = 'sheets'; p.params.lookPhrase = 'shallow depth of field';
  const e = clone(E01);
  const seg = e.storyboard.segments[3];
  const n = segmentReferences(p, e, seg).length;
  const lines = claimedLines(e.scenes[1], seg.cuts).map((l) => l.line);
  const legend = [...Array.from({ length: n }, (_, i) => `@image${i + 1} is a reference sheet.`), '@audio1 is the voice of the person in @image3.'].join('\n');
  const dir = speechDirection(PROJECT.characters.find((c) => c.id === 'C02'), '', 'en');
  seg.prompt = [legend, '', 'Look: semi-realistic painterly cinematic footage, shallow depth of field.', '', 'integrated_multimodal_description:',
    `[Shot 1] the clerk and the older man, a wide shot, static shot. @audio1 / @image3, ${dir}, says <d>[Chinese] ${lines[0]}</d>`,
    '[Shot 2] At 00:02.000, from behind him, close-up, static shot.',
    '[Shot 3] At 00:06.000, he turns, a slow pan left, medium shot.',
    `[Shot 4] At 00:09.000, his grave face, a slow push in. @audio1 says <d>[Chinese] ${lines[1]}</d>`, '', 'overall_soundscape: night store hum, dialogue in standard Mandarin', '', 'non_diegetic_music: N/A'].join('\n');
  const ep = { 1: e };
  const fails = GATES.find((g) => g.id === 'video-prompt').run(makeContext(p, ep)).filter((m) => m.startsWith('E01-04'));
  ok(fails.length === 0, `h3 sheets-mode prompt passes: ${fails.join(' | ')}`);
  const e2 = clone(e); e2.storyboard.segments[3].prompt = e2.storyboard.segments[3].prompt.replace('@image1 is', '@image7 is');
  breaks('video-prompt', p, e2, '@image1');
  const e3 = clone(e); e3.storyboard.segments[3].prompt = h3AlignmentLine(seg.cuts) + '\n' + e3.storyboard.segments[3].prompt;
  breaks('video-prompt', p, e3, 'alignment wording');
  const p2 = clone(p); p2.params.videoDuration = 'auto';
  breaks('params', p2, e, 'auto duration');
  const sk = promptSkeleton(p, e, 'E01-04');
  ok(sk.video.prompt.startsWith('@image1 is'), 'h3 sheets skeleton opens with the @image legend');
  ok(!/<Picture|\bPicture \d/.test(sk.video.prompt), 'h3 sheets skeleton has no picture anchors');
  ok(sk.video.prompt.includes('[Shot 2] At 00:02.000,'), 'h3 sheets skeleton keeps the shot timestamps');
}


{
  // resolution spelling follows the model form; the wan skeleton stays short
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '480P';
  eq(promptSkeleton(p, E01, 'E01-04').video.resolution, '480p', 'seedance wants lowercase resolution');
  const p2 = clone(PROJECT); p2.params.video = 'wan'; p2.params.videoResolution = '480P';
  const sk = promptSkeleton(p2, E01, 'E01-04');
  eq(sk.video.resolution, '480P', 'wan keeps uppercase resolution');
  ok(!sk.video.prompt.includes('\u6574\u4f53\uff1a'), 'wan skeleton has no 整体 paragraph');
}


{
  // Per-model duration: the model decides how long a segment may be, and the plot is cut to fit it.
  eq(VIDEO_MODES.join(' '), 'h3 seedance seedance2 seedance2fast wan', 'five ref modes');
  for (const [key, m] of Object.entries(VIDEO_MODELS)) {
    ok(m.model && m.family && m.promptLang, `${key} is fully described`);
    ok(m.minSegmentSeconds >= 2 && m.minSegmentSeconds < m.maxSegmentSeconds, `${key} has a sane duration range`);
    ok(Array.isArray(m.resolutions) && m.resolutions.length, `${key} lists its resolution tiers`);
  }
  eq(VIDEO_MODELS.wan.maxSegmentSeconds, 30, 'wan-3.0-ref: 30 s');
  eq(VIDEO_MODELS.seedance.maxSegmentSeconds, 30, 'seedance-2.5-ref: 30 s');
  eq(VIDEO_MODELS.h3.maxSegmentSeconds, 15, 'minimax-h3-ref: 15 s');
  eq(VIDEO_MODELS.seedance2.maxSegmentSeconds, 15, 'seedance-2.0-ref: 15 s');
  eq(VIDEO_MODELS.seedance2fast.maxSegmentSeconds, 15, 'seedance-2.0-fast-ref: 15 s');
  eq(VIDEO_MODELS.seedance2.model, 'seedance-2.0-ref', 'seedance2 maps to the 2.0 ref model');
  eq(VIDEO_MODELS.seedance2fast.model, 'seedance-2.0-fast-ref', 'seedance2fast maps to the 2.0 fast ref model');
  eq(VIDEO_MODELS.seedance2.family, 'seedance', '2.0 shares the Seedance prompt dialect');
  // Defaults: auto duration and no storyboard keyframes.
  eq(DEFAULT_PARAMS.videoDuration, 'auto', 'auto duration is the default');
  eq(DEFAULT_PARAMS.references, 'sheets', 'sheets (no keyframe images) is the default');
  // … except where the model has no autoDuration parameter, where it silently becomes fixed.
  const h3p = clone(PROJECT); delete h3p.params.videoDuration;
  eq(paramsOf(h3p).videoDuration, 'fixed', 'h3 falls back to a fixed duration');
  const wanp = clone(PROJECT); wanp.params.video = 'wan'; wanp.params.videoResolution = '480P'; delete wanp.params.videoDuration;
  eq(paramsOf(wanp).videoDuration, 'auto', 'wan keeps auto');
  eq(paramsOf(wanp).maxSegmentSeconds, 30, 'wan raises the cap');
  eq(paramsOf(wanp).minSegmentSeconds, 2, 'wan lowers the floor');
  // An explicit `auto` on a model without it is an error, not a silent downgrade.
  const h3auto = clone(PROJECT); h3auto.params.videoDuration = 'auto';
  breaks('params', h3auto, E01, 'has no auto duration');
  // Resolution tiers are per model: h3 has 768P and no 720P, the Seedance pair is lowercase.
  eq(videoResolutionFor(VIDEO_MODELS.h3, '720P'), null, 'h3 has no 720P tier');
  eq(videoResolutionFor(VIDEO_MODELS.h3, '768p'), '768P', 'h3 spells it 768P');
  eq(videoResolutionFor(VIDEO_MODELS.seedance2, '480P'), '480p', 'seedance 2.0 spells it lowercase');
  eq(videoResolutionFor(VIDEO_MODELS.seedance2fast, '1080p'), null, 'seedance 2.0 fast tops out at 720p');
  const badRes = clone(PROJECT); badRes.params.videoResolution = '720P';
  breaks('params', badRes, E01, 'is not a tier of minimax-h3-ref');
  // init never writes an invalid tier: it lands on the nearest one the model has, in the model's spelling.
  eq(nearestResolution(VIDEO_MODELS.h3, '720P'), '768P', 'h3 lands on 768P, not on the cheapest tier');
  eq(nearestResolution(VIDEO_MODELS.seedance2, '720P'), '720p', 'the Seedance spelling is lowercase');
  for (const key of VIDEO_MODES) {
    const dir = mkdtempSync(join(tmpdir(), 'sd-init-'));
    try {
      const p = initProject({ title: 'T', episodes: 3, minutes: 1, genre: 'G', video: key });
      const fails = GATES.find((g) => g.id === 'params').run(makeContext({ ...p, title: 'T' }, {}));
      eq(fails.filter((m) => /videoResolution|auto duration/.test(m)).length, 0, `init ${key} is self-consistent`);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  // Segment caps cannot be widened past the model.
  const wide = clone(PROJECT); wide.params.maxSegmentSeconds = 30;
  breaks('params', wide, E01, 'minimax-h3-ref takes 5–15 s');
}

{
  // The seed's plan splits each scene by the model's ceiling, so the same episode is cut differently per model.
  const h3plan = segmentPlan(PROJECT, E01);
  eq(h3plan.model, 'minimax-h3-ref', 'plan names the model');
  eq(h3plan.segmentSeconds.join('–'), '5–15', 'plan carries the model duration range');
  ok(h3plan.wholeSecondsOnly, 'every ref model takes whole seconds only');
  const wanProject = clone(PROJECT); wanProject.params.video = 'wan'; wanProject.params.videoResolution = '480P';
  const wanPlan = segmentPlan(wanProject, E01);
  ok(wanPlan.segments < h3plan.segments, 'a 30 s model needs fewer generations than a 15 s one');
  for (const sc of h3plan.scenes) ok(sc.secondsPerSegment <= 15 + 1e-9, 'no planned segment exceeds the h3 ceiling');
  for (const sc of wanPlan.scenes) ok(sc.secondsPerSegment <= 30 + 1e-9, 'no planned segment exceeds the wan ceiling');
  ok(seedStoryboard(PROJECT, E01).storyboard.plan.model === 'minimax-h3-ref', 'seed storyboard carries the plan');
  // Seedance 2.0 is a 15 s model, so it plans like h3 while speaking Seedance's prompt dialect.
  const sd2 = clone(PROJECT); sd2.params.video = 'seedance2'; sd2.params.videoResolution = '720p';
  eq(segmentPlan(sd2, E01).segments, h3plan.segments, 'seedance 2.0 splits like the other 15 s model');
  eq(videoModel(paramsOf(sd2)).family, 'seedance', 'and prompts like seedance');
}

{
  // Photography: lens + stop, key light relative to the camera, and foreground on most cuts.
  const seg = E01.storyboard.segments[0];
  const cut = seg.cuts[0];
  eq(focalOf(cut), '40mm', 'a medium shot defaults to 40mm');
  eq(focalOf({ size: 'close' }), '75mm', 'a close-up defaults to 75mm');
  eq(focalOf({ size: 'close', focal: '135mm' }), '135mm', 'the cut may name its own focal');
  const phrase = cameraPhrase(cut, paramsOf(PROJECT));
  ok(phrase.includes('ARRI ALEXA Mini LF') && phrase.includes('40mm') && phrase.includes('T1.5'), 'camera phrase carries body, focal and stop');
  ok(cut.frame.includes(phrase), 'the fixture frame pastes the camera phrase verbatim');
  eq(cameraPhrase({ size: 'close', aperture: 'T2.8' }, paramsOf(PROJECT)).endsWith('at T2.8'), true, 'a cut may stop down on its own');
  ok(cameraPhrase(cut, paramsOf(PROJECT), 'zh').includes('\u5149\u5708'), 'the Chinese phrase says 光圈');
  // Light direction is camera-relative and gated against the vocabulary.
  ok(cut.frame.includes(LIGHT_DIRECTIONS[cut.light.direction]), 'the frame carries the light-direction phrase');
  const noLens = clone(E01); noLens.storyboard.segments[0].cuts[0].frame = noLens.storyboard.segments[0].cuts[0].frame.replace('40mm', '');
  breaks('photography', PROJECT, noLens, 'must name "40mm"');
  const badDir = clone(E01); badDir.storyboard.segments[0].cuts[0].light.direction = 'from the window';
  breaks('photography', PROJECT, badDir, 'not in the vocabulary');
  const noDir = clone(E01); delete noDir.storyboard.segments[0].cuts[0].light.direction;
  breaks('photography', PROJECT, noDir, 'light.direction is required');
  const noNote = clone(E01); noNote.storyboard.segments[0].cuts[0].light.note = '';
  breaks('photography', PROJECT, noNote, 'light.note is required');
  const wrongDir = clone(E01); wrongDir.storyboard.segments[0].cuts[0].light.direction = 'top';
  breaks('photography', PROJECT, wrongDir, 'keyed from directly above');
  // Foreground: named in the frame, said to be out of focus, and within params.foregroundLevel across the episode.
  ok(foregroundPhrase(cut).includes('out of focus'), 'the foreground phrase says it is defocused');
  eq(foregroundPhrase({ foreground: '' }), '', 'a clean frame adds nothing');
  ok(foregroundPhrase({ foreground: '\u6536\u94f6\u53f0' }, 'zh').includes('\u524d\u666f'), 'the Chinese foreground phrase says 前景');
  const noFg = clone(E01); noFg.storyboard.segments.forEach((seg) => seg.cuts.forEach((c) => { c.foreground = ''; }));
  // The fixture sits at `high`: no foreground at all is too few there, and fine at `low`.
  breaks('photography', PROJECT, noFg, 'params.foregroundLevel high allows');
  const asLevel = (level) => ({ ...PROJECT, params: { ...PROJECT.params, foregroundLevel: level } });
  ok(!failures('photography', asLevel('low'), noFg).some((f) => f.includes('foregroundLevel')), 'low accepts an episode of clean frames');
  breaks('photography', asLevel('low'), E01, 'params.foregroundLevel low allows');
  breaks('photography', asLevel('medium'), E01, 'params.foregroundLevel medium allows');
  breaks('params', asLevel('sometimes'), E01, 'params.foregroundLevel must be one of');
  const levelFor = (params) => paramsOf({ params }).foregroundLevel;
  eq(levelFor({}), 'medium', 'the default level is medium');
  eq(levelFor({ composition: 'standard', cinematography: 'low-key', genre: '复仇' }), 'medium', 'a standard look stays medium');
  eq(levelFor({ composition: 'art-first' }), 'high', '艺术优先 defaults to high');
  eq(levelFor({ cinematography: 'sweet-romance' }), 'high', 'the 唯美 romance preset defaults to high');
  eq(levelFor({ cinematography: 'costume-idol' }), 'high', 'the 唯美 costume preset defaults to high');
  eq(levelFor({ genre: '唯美古风' }), 'high', 'a 唯美 genre defaults to high');
  eq(levelFor({ genre: '美感優先' }), 'high', 'a 美感優先 genre defaults to high');
  eq(levelFor({ composition: 'art-first', foregroundLevel: 'low' }), 'low', 'a named level beats the look');
  eq(foregroundForLook({ cinematography: 'costume-dark' }), 'medium', 'the dark costume preset is not 唯美');
  eq(foregroundBand('low', 40).max, 10, 'low allows a quarter of the cuts');
  eq(foregroundBand('medium', 40).min, 10, 'medium starts at a quarter');
  eq(foregroundBand('medium', 40).max, 20, 'medium stops at half');
  eq(foregroundBand('high', 40).min, 20, 'high starts at half');
  ok(foregroundBand('nope', 40) === null, 'an unknown level has no band');
  for (const [k, pr] of Object.entries(CINEMATOGRAPHY_PRESETS)) if (pr) ok(!/foreground/i.test(pr.videoPhrase) && !/前景/.test(pr.videoPhraseZh), `${k} leaves the foreground to the level`);
  const missingFg = clone(E01); delete missingFg.storyboard.segments[0].cuts[0].foreground;
  breaks('photography', PROJECT, missingFg, 'foreground is required');
  const unsaidFg = clone(E01); unsaidFg.storyboard.segments[0].cuts[0].frame = unsaidFg.storyboard.segments[0].cuts[0].frame.replace('the dripping edge of the striped awning', 'a wall');
  breaks('photography', PROJECT, unsaidFg, 'must name the foreground');
}

{
  // The house cinematography (params.cinematography low-key): practical sources, no flat light on a
  // person, most cuts keyed from the side or behind, shot wide open; the look rides every prompt.
  const look = CINEMATOGRAPHY_PRESETS['low-key'];
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g' }).params.cinematography, 'low-key', 'init gives new projects the house look');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '甜宠恋爱' }).params.cinematography, 'sweet-romance', 'a romance genre gets the sweet look');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '甜宠', cinematography: 'low-key' }).params.cinematography, 'low-key', 'an explicit --cinematography wins over the genre');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', cinematography: 'none' }).params.cinematography, 'none', 'init --cinematography none opts out');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', cinematography: 'noir' }), /--cinematography/, 'init rejects an unknown cinematography');
  eq(paramsOf(PROJECT).cinematography, 'none', 'a project without the key keeps its old rules');
  eq(cinematographyOf(paramsOf(PROJECT)), null, 'none means no preset');
  eq(stopNumber('T1.5'), 1.5, 'T-stop parses'); eq(stopNumber('f/2'), 2, 'f-stop parses');
  const lk = clone(PROJECT); lk.params.cinematography = 'low-key';
  const bogus = clone(PROJECT); bogus.params.cinematography = 'noir';
  breaks('params', bogus, E01, 'params.cinematography');
  // Scene lighting states are written in the look.
  breaks('scene-design', lk, null, look.framePhrase);
  const lkLit = clone(lk); lkLit.scenes.forEach((sc) => sc.lighting.forEach((l) => { l.prompt = `${look.framePhrase} from the shop's own fixtures, ${l.prompt}`; }));
  passes('scene-design', lkLit, null);
  // A storyboard that follows it: every cut side-keyed by a named practical.
  const source = 'the flickering oden light box';
  const lit = clone(E01);
  for (const seg of lit.storyboard.segments) for (const c of seg.cuts) {
    c.frame = c.frame.replace(LIGHT_DIRECTIONS[c.light.direction], LIGHT_DIRECTIONS['side-left']) + ` Low-key practical lighting from ${source}.`;
    c.light = { ...c.light, direction: 'side-left', source };
  }
  passes('photography', lk, lit);
  breaks('photography', lk, E01, 'light.source is required');
  const noPhrase = clone(lit); noPhrase.storyboard.segments[0].cuts[0].frame = noPhrase.storyboard.segments[0].cuts[0].frame.replace('Low-key practical lighting', 'Lighting');
  breaks('photography', lk, noPhrase, `must contain "${look.framePhrase}"`);
  const unnamed = clone(lit); unnamed.storyboard.segments[0].cuts[0].frame = unnamed.storyboard.segments[0].cuts[0].frame.replace(source, 'a lamp');
  breaks('photography', lk, unnamed, 'must name the light source');
  const flat = clone(lit); const fc = flat.storyboard.segments[0].cuts.find((c) => (c.characters || []).length);
  fc.frame = fc.frame.replace(LIGHT_DIRECTIONS['side-left'], LIGHT_DIRECTIONS.frontal); fc.light.direction = 'frontal';
  breaks('photography', lk, flat, '包围光');
  passes('photography', PROJECT, flat);
  const slow = clone(lit); slow.storyboard.segments[0].cuts[0].aperture = 'T4';
  slow.storyboard.segments[0].cuts[0].frame = slow.storyboard.segments[0].cuts[0].frame.replace('T1.5', 'T4');
  breaks('photography', lk, slow, 'too slow');
  const frontish = clone(lit);
  for (const c of frontish.storyboard.segments[0].cuts) { c.frame = c.frame.replace(LIGHT_DIRECTIONS['side-left'], LIGHT_DIRECTIONS['front-left']); c.light.direction = 'front-left'; }
  breaks('photography', lk, frontish, 'at least 50 %');
  // The Look line carries the phrase when no keyframes do, and the gate asks for it.
  const sheets = clone(lk); sheets.params.references = 'sheets';
  ok(promptSkeleton(sheets, lit, 'E01-04').video.prompt.includes(look.videoPhrase), 'the sheets skeleton Look line carries the cinematography');
  ok(failures('video-prompt', sheets, lit).some((m) => m.includes('cinematography phrase')), 'video-prompt asks for the cinematography phrase');
  const wanSheets = clone(sheets); wanSheets.params.video = 'wan'; wanSheets.params.videoResolution = '480P';
  ok(promptSkeleton(wanSheets, lit, 'E01-04').video.prompt.includes(look.videoPhraseZh), 'the wan skeleton carries the Chinese cinematography');
  ok(!failures('video-prompt', clone(PROJECT), E01).some((m) => m.includes('cinematography')), 'no cinematography demand without the preset');
}

{
  // sweet-romance: the same machinery with the opposite light — soft front keys and halos welcome,
  // under- and top light on a face refused, and no nationality in the phrases.
  const look = CINEMATOGRAPHY_PRESETS['sweet-romance'];
  const sr = clone(PROJECT); sr.params.cinematography = 'sweet-romance';
  passes('params', sr, E01);
  for (const k of Object.keys(CINEMATOGRAPHY_PRESETS)) {
    const pr = CINEMATOGRAPHY_PRESETS[k];
    if (pr) ok(!ETHNICITY_WORDS.test(`${pr.videoPhrase} ${pr.framePhrase}`) && !/韩|韓|日系|欧美/.test(pr.videoPhraseZh), `${k} phrases name no nationality`);
  }
  breaks('scene-design', sr, null, look.framePhrase);
  const source = 'the big café window behind them';
  const soft = clone(E01);
  for (const seg of soft.storyboard.segments) for (const c of seg.cuts) {
    c.frame = c.frame.replace(LIGHT_DIRECTIONS[c.light.direction], LIGHT_DIRECTIONS['front-left']) + ` Soft romantic lighting from ${source}, the fairy lights behind melting into creamy bokeh.`;
    c.light = { ...c.light, direction: 'front-left', source };
  }
  passes('photography', sr, soft);
  const lk = clone(PROJECT); lk.params.cinematography = 'low-key';
  breaks('photography', lk, soft, 'at least 50 %');
  eq(cinematographyForGenre('都市悬疑'), 'low-key', 'a thriller genre reads low-key');
  eq(cinematographyForGenre('韓風浪漫'), 'sweet-romance', 'traditional spellings read sweet');
  eq(cinematographyForGenre('古装甜宠'), 'costume-idol', 'a costume romance is a costume drama first');
  eq(cinematographyForGenre('仙侠'), 'costume-idol', 'xianxia reads idol');
  eq(cinematographyForGenre('古裝權謀'), 'costume-dark', 'court intrigue reads dark');
  eq(cinematographyForGenre('武侠复仇'), 'costume-dark', 'wuxia revenge reads dark');
  eq(cinematographyForGenre('古装'), 'costume-idol', 'a bare 古装 defaults to idol');
  eq(cinematographyForGenre('八十年代怀旧'), 'period-nostalgia', 'an era reads nostalgia');
  eq(cinematographyForGenre('年代剧'), 'period-nostalgia', '年代剧 reads nostalgia');
  const under = clone(soft); const uc = under.storyboard.segments[0].cuts.find((c) => (c.characters || []).length);
  uc.frame = uc.frame.replace(LIGHT_DIRECTIONS['front-left'], LIGHT_DIRECTIONS.underlight); uc.light.direction = 'underlight';
  breaks('photography', sr, under, '底光');
  const noHint = clone(soft); delete noHint.storyboard.segments[0].cuts[0].light.source;
  breaks('photography', sr, noHint, 'string lights');
  const sheets = clone(sr); sheets.params.references = 'sheets';
  ok(promptSkeleton(sheets, soft, 'E01-04').video.prompt.includes(look.videoPhrase), 'the sheets skeleton carries the romance look');
  // The dreamiest bokeh: a faster package from init, T2 at the slowest, half the frames name it.
  const init = initProject({ title: 't', episodes: 1, minutes: 1, genre: '甜宠' });
  eq(init.params.camera.aperture, 'T1.3', 'sweet-romance brings a T1.3 package');
  eq(init.params.camera.body, DEFAULT_PARAMS.camera.body, 'the kit keeps the default body');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '悬疑' }).params.camera, undefined, 'low-key keeps the default package');
  const t28 = clone(soft); t28.storyboard.segments[0].cuts[0].aperture = 'T2.8';
  t28.storyboard.segments[0].cuts[0].frame = t28.storyboard.segments[0].cuts[0].frame.replace('T1.5', 'T2.8');
  breaks('photography', sr, t28, 'T2 or faster');
  const flatBg = clone(soft); for (const c of flatBg.storyboard.segments[0].cuts) c.frame = c.frame.replace(/bokeh/gi, 'blur');
  breaks('photography', sr, flatBg, 'name their bokeh');
}

{
  // period and costume presets: each one's own storyboard passes, and a source from the wrong era fails.
  const cases = [
    ['period-nostalgia', 'side-left', 'the bare tungsten bulb over the table', 'the LED strip'],
    ['costume-idol', 'backlight', 'the sun through the paper window', 'the street light'],
    ['costume-dark', 'side-right', 'the oil lamp on the desk', 'an electric bulb'],
  ];
  for (const [key, dir, source, wrong] of cases) {
    const look = CINEMATOGRAPHY_PRESETS[key];
    const p = clone(PROJECT); p.params.cinematography = key;
    passes('params', p, E01);
    const e = clone(E01);
    for (const seg of e.storyboard.segments) seg.cuts.forEach((c, k) => {
      c.frame = c.frame.replace(LIGHT_DIRECTIONS[c.light.direction], LIGHT_DIRECTIONS[dir]) + ` ${look.framePhrase[0].toUpperCase()}${look.framePhrase.slice(1)} from ${source}, lanterns behind melting into creamy bokeh.`;
      c.light = { ...c.light, direction: dir, source };
      // costume-idol steps back once per segment: the first cut becomes a wide with negative space.
      if (look.widePerSegment && k === 0 && c.size !== 'wide' && c.size !== 'extreme-wide') { c.focal = focalOf(c); c.size = 'wide'; c.frame += ' Vast negative space of mist above.'; }
      else if (look.widePerSegment && (c.size === 'wide' || c.size === 'extreme-wide')) c.frame += ' Vast negative space of mist above.';
    });
    passes('photography', p, e);
    const bad = clone(e); const c0 = bad.storyboard.segments[0].cuts[0];
    c0.frame = c0.frame.replace(source, wrong); c0.light.source = wrong;
    breaks('photography', p, bad, 'does not exist in this era');
    const banned = clone(e); const bc = banned.storyboard.segments[0].cuts.find((c) => (c.characters || []).length);
    bc.frame = bc.frame.replace(LIGHT_DIRECTIONS[dir], LIGHT_DIRECTIONS[look.bannedLight[0]]); bc.light.direction = look.bannedLight[0];
    breaks('photography', p, banned, look.bannedWhy.slice(0, 20));
    breaks('scene-design', p, null, look.framePhrase);
  }
  ok(!CINEMATOGRAPHY_PRESETS['costume-dark'].anachronisms.test('the oil lamp'), 'an oil lamp is not an electric lamp');
  // costume-idol: a 全景 / 大全景 in every segment, built on negative space.
  {
    const p = clone(PROJECT); p.params.cinematography = 'costume-idol';
    const e = clone(E01);
    for (const seg of e.storyboard.segments) seg.cuts.forEach((c, k) => {
      c.frame = c.frame.replace(LIGHT_DIRECTIONS[c.light.direction], LIGHT_DIRECTIONS.backlight) + ' Ethereal costume drama lighting from the paper window, lanterns melting into creamy bokeh.';
      c.light = { ...c.light, direction: 'backlight', source: 'the paper window' };
      if (c.size === 'wide' || c.size === 'extreme-wide') c.frame += ' Vast negative space.';
    });
    const noWide = clone(e);
    for (const seg of noWide.storyboard.segments) for (const c of seg.cuts) if (c.size === 'wide' || c.size === 'extreme-wide') { c.focal = focalOf(c); c.size = 'medium'; }
    breaks('photography', p, noWide, 'no wide or extreme-wide cut');
    const full = clone(noWide); const c0 = full.storyboard.segments[0].cuts[0];
    c0.focal = focalOf(c0); c0.size = 'extreme-wide';
    breaks('photography', p, full, 'built on negative space');
    ok(!failures('photography', PROJECT, noWide).some((m) => m.includes('wide or extreme-wide')), 'other presets do not ask for wides');
    eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '仙侠' }).params.camera.aperture, 'T1.3', 'costume-idol brings a T1.3 package');
    const dark = clone(PROJECT); dark.params.cinematography = 'costume-dark';
    breaks('photography', dark, noWide, 'no wide or extreme-wide cut');
    breaks('photography', dark, full, 'built on negative space');
  }
  ok(CINEMATOGRAPHY_PRESETS['period-nostalgia'].maxStop === 4, 'nostalgia may stop down to T4 for the period detail');
}

{
  // Every reference is addressed the way WJI labels it: @image1 / @video1 / @audio1.
  ok(h3AlignmentLine([{ seconds: 3 }, { seconds: 2 }]).includes('@image1'), 'the h3 alignment line uses @image1');
  ok(!/Picture/.test(h3AlignmentLine([{ seconds: 3 }, { seconds: 2 }])), 'and never <Picture k>');
  ok(h3AlignmentLine([{ seconds: 3 }]).includes('@image1'), 'single-cut alignment too');
  ok(seedanceAnchors(3).every((l) => !l.includes('@Image')), 'seedance anchors are lowercase');
  ok(wanLegendLine([{ seconds: 3 }]).includes('@image1'), 'the wan legend uses @image1, not 图1');
  for (const p of [PROJECT, { ...PROJECT, params: { ...PROJECT.params, video: 'wan', videoResolution: '480P' } }]) {
    const sk = promptSkeleton(p, E01, 'E01-01');
    ok(!/@Image|<Picture|\bPicture \d/.test(sk.video.prompt), 'no legacy reference token in the skeleton');
  }
  // Numbering restarts per type, so the voices are @audio1… and do not continue the image series.
  const refs0 = segmentReferences(PROJECT, E01, E01.storyboard.segments[0]);
  for (const r of refs0.filter((x) => x.kind === 'image')) ok(/^@image\d+$/.test(r.label), `sheet label ${r.label} is @imageN`);
  for (const r of refs0.filter((x) => x.kind === 'audio')) ok(/^@audio\d+$/.test(r.label), `voice label ${r.label} is @audioN`);
  eq(refs0.filter((x) => x.kind === 'audio')[0].label, '@audio1', 'the first voice is @audio1 whatever the image count');
  eq(imageReferences(PROJECT, E01, E01.storyboard.segments[0]).length + audioReferences(PROJECT, E01, E01.storyboard.segments[0]).length, refs0.length, 'images + audio = every reference');
  // Wan in sheets mode: the legend describes sheets, in Chinese, and the gate expects that one.
  const wanSheets = clone(PROJECT); wanSheets.params.video = 'wan'; wanSheets.params.videoResolution = '480P'; wanSheets.params.references = 'sheets';
  const refs = segmentReferences(wanSheets, E01, E01.storyboard.segments[0]);
  const legend = wanSheetLegendLine(refs);
  ok(legend.includes('@image1='), 'the wan sheets legend numbers the sheets');
  ok(!legend.includes('\u5173\u952e\u5e27'), 'and does not call a sheet a keyframe');
  ok(refs.every((r) => r.zh), 'every sheet reference has a Chinese label for it');
  const wanSk = promptSkeleton(wanSheets, E01, 'E01-01');
  ok(wanSk.video.prompt.startsWith(legend), 'the wan sheets skeleton opens with it');
  ok(!/[a-z]{4,} [a-z]{4,} [a-z]{4,}/.test(wanSk.video.prompt.split('\n')[0]), 'the wan legend is Chinese, not English prose');
}

{
  // Dialogue is delivered the way the character bible says, and never attributed by name.
  const c02 = PROJECT.characters.find((c) => c.id === 'C02');
  eq(speechDirection(c02, '', 'en'), c02.voice.videoDirection, 'the English direction is voice.videoDirection');
  ok(speechDirection(c02, 'almost whispering', 'en').endsWith('almost whispering'), "the beat's own delivery is appended");
  ok(speechDirection(c02, '', 'zh').includes(c02.voice.pace), 'the Chinese direction is built from the voice fields');
  eq(identityOf(c02), c02.identityEn, 'identityOf is the name-free identity');
  // The skeleton must hand the agent something that validates: no names in it.
  const names = forbiddenNames(PROJECT);
  for (const mode of ['h3', 'seedance', 'wan']) {
    const p = clone(PROJECT); p.params.video = mode; p.params.videoResolution = VIDEO_MODELS[mode].resolutions[0];
    const sk = promptSkeleton(p, E01, 'E01-01');
    const spoken = claimedLines(E01.scenes[0], E01.storyboard.segments[0].cuts).map((l) => l.line);
    const outside = spoken.reduce((t, line) => t.split(line).join(''), sk.video.prompt);
    for (const n of names) ok(!containsName(outside, n), `${mode} skeleton does not attribute a line to "${n}"`);
    ok(sk.video.prompt.includes(speechDirection(PROJECT.characters.find((c) => c.id === 'C03'), '', videoModel(paramsOf(p)).promptLang)), `${mode} skeleton carries the speaker's delivery`);
  }
  // A prompt that drops a speaker's delivery fails.
  const stripped = clone(E01);
  stripped.storyboard.segments[0].prompt = stripped.storyboard.segments[0].prompt.split(c02.voice.videoDirection).join('');
  const e2 = clone(E01);
  e2.storyboard.segments[1].prompt = e2.storyboard.segments[1].prompt.split(c02.voice.videoDirection).join('flatly');
  breaks('video-prompt', PROJECT, e2, 'must carry their delivery verbatim');
  // The character fields behind it are required.
  const noDirection = clone(PROJECT); delete noDirection.characters[1].voice.videoDirection;
  breaks('voice', noDirection, E01, 'voice.videoDirection is empty');
  const noIdentity = clone(PROJECT); noIdentity.characters[1].identityEn = '';
  breaks('profile', noIdentity, E01, 'identityEn is empty');
  const sameIdentity = clone(PROJECT); sameIdentity.characters[1].identityEn = sameIdentity.characters[0].identityEn;
  breaks('profile', sameIdentity, E01, 'same as');
  const namedIdentity = clone(PROJECT); namedIdentity.characters[1].identityEn = 'the man called \u8001\u9648';
  breaks('profile', namedIdentity, E01, 'contains the name');
}

{
  // The voice references: every line points at the @audioN it must be read in.
  const seg = E01.storyboard.segments[0];
  const audio = audioReferences(PROJECT, E01, seg);
  eq(audio.length, 2, 'both speakers in the segment bring a voice reference');
  eq(audio[0].entity, 'C03', 'voices are numbered in speaking order, not cast order');
  ok(audio[0].use.includes('the voice of'), 'the legend line says whose voice it is');
  // In sheets mode a voice points at its sheet; in keyframes mode @imageN are frames, so it describes.
  const sheetsP = clone(PROJECT); sheetsP.params.references = 'sheets';
  ok(audioReferences(sheetsP, E01, seg)[0].use.includes('@image'), 'sheets mode ties the voice to a sheet label');
  ok(!audio[0].use.includes('@image'), 'keyframes mode does not, because @imageN are the frames');
  ok(audio[0].use.includes(PROJECT.characters.find((c) => c.id === 'C03').identityEn), 'it names them instead');
  // Dropping one line's attribution fails, even though the label is still in the legend.
  const line = claimedLines(E01.scenes[0], seg.cuts)[0].line;
  const e = clone(E01);
  const at = e.storyboard.segments[0].prompt.indexOf(line);
  const lead = e.storyboard.segments[0].prompt.slice(Math.max(0, at - 400), at);
  e.storyboard.segments[0].prompt = e.storyboard.segments[0].prompt.replace(lead, lead.split('@audio1').join('the man'));
  breaks('video-prompt', PROJECT, e, 'is not attributed to @audio1');
  // A label with no reference behind it fails too.
  const e2 = clone(E01); e2.storyboard.segments[0].prompt += '\n@audio7 says something.';
  breaks('video-prompt', PROJECT, e2, '@audio7 but only 2 voice reference(s)');
  // A connected voice that the prompt never uses fails.
  const e3 = clone(E01); e3.storyboard.segments[0].prompt = e3.storyboard.segments[0].prompt.split('@audio2').join('the clerk');
  breaks('video-prompt', PROJECT, e3, '@audio2');
  // Turning voice samples off removes the references entirely — nothing to point at.
  const noVoice = clone(PROJECT); noVoice.params.voiceSamples = false;
  eq(audioReferences(noVoice, E01, seg).length, 0, 'no voice samples, no audio references');
  // Every model states how many voices it takes.
  for (const [key, m] of Object.entries(VIDEO_MODELS)) ok(m.maxAudioRefs >= 3, `${key} states its audio reference cap`);
  eq(VIDEO_MODELS.seedance.maxAudioRefs, 10, 'seedance 2.5 takes 10 audio references');
  eq(VIDEO_MODELS.h3.maxAudioRefs, 3, 'h3 takes 3');
  eq(VIDEO_MODELS.wan.maxAudioRefs, 5, 'wan takes 5');
  eq(paramsOf(PROJECT).maxAudioRefs, 3, 'the cap follows the model unless set');
  // A beat's acting note is script prose in the drama's language: it belongs in a prompt written in
  // that language, never inside an English one — the skeleton must not hand over something the
  // English-only gate would reject.
  const zhBeat = PROJECT.characters[0];
  ok(!speechDirection(zhBeat, '\u538b\u7740\u55d3\u5b50', 'en').includes('\u538b\u7740\u55d3\u5b50'), 'an English prompt drops a Chinese beat delivery');
  ok(speechDirection(zhBeat, '\u538b\u7740\u55d3\u5b50', 'zh').includes('\u538b\u7740\u55d3\u5b50'), 'a Chinese prompt keeps it');
  ok(speechDirection(zhBeat, 'almost whispering', 'en').includes('almost whispering'), 'an English beat delivery survives either way');
  eq(speechDirection(zhBeat, 'almost whispering', null), 'almost whispering', 'after the first line only the beat note is added');
  for (const mode of ['h3', 'seedance']) {
    const p = clone(PROJECT); p.params.video = mode; p.params.videoResolution = VIDEO_MODELS[mode].resolutions[0];
    const sk = promptSkeleton(p, E01, 'E01-01');
    const spoken = claimedLines(E01.scenes[0], E01.storyboard.segments[0].cuts).map((l) => l.line);
    const outside = spoken.reduce((t, line) => t.split(line).join(''), sk.video.prompt);
    ok(isEnglish(outside), `the ${mode} skeleton is English outside the dialogue`);
  }
}

{
  eq(1, 1, 'scope');
  // The full voice description lands on a character's first line only; later lines carry the label.
  const twoLines = promptSkeleton(PROJECT, E01, 'E01-02').video.prompt;
  const c01 = PROJECT.characters.find((c) => c.id === 'C01');
  eq(twoLines.split(c01.voice.videoDirection).length - 1, 1, 'the delivery is spelled out once per character per segment');
  // A Chinese prompt takes the Chinese look phrase, not the English one.
  const wanLook = clone(PROJECT);
  wanLook.params.video = 'wan'; wanLook.params.videoResolution = '480P';
  wanLook.params.lookPhrase = 'shallow depth of field'; wanLook.params.lookPhraseZh = '\u5927\u5149\u5708\u6DFA\u666F\u6DF1';
  const wanE = clone(E01);
  const wanFails = GATES.find((g) => g.id === 'video-prompt').run(makeContext(wanLook, { 1: wanE })).filter((m) => m.includes('look phrase'));
  ok(wanFails.every((m) => m.includes('lookPhraseZh')), 'wan is asked for lookPhraseZh, never the English one');
  const enFails = GATES.find((g) => g.id === 'video-prompt').run(makeContext({ ...PROJECT, params: { ...PROJECT.params, lookPhrase: 'shallow depth of field' } }, { 1: E01 })).filter((m) => m.includes('look phrase'));
  ok(enFails.every((m) => m.includes('params.lookPhrase)')), 'an English prompt is asked for lookPhrase');
  // manifest asks for the voice display node of everyone who speaks in the episode.
  const items = manifest(PROJECT, { 1: E01 }, { stage: 'storyboard' }).map((it) => it.item);
  ok(items.some((it) => it === 'wji.displayNodes.C01:voice'), 'manifest wants the speakers\u2019 voices on the canvas');
  ok(items.find((it) => it === 'wji.displayNodes.C01:voice') !== undefined, 'keyed like the sheets');
  const quiet = clone(PROJECT); quiet.params.voiceSamples = false;
  ok(!manifest(quiet, { 1: E01 }, { stage: 'storyboard' }).some((it) => it.item.endsWith(':voice')), 'and not when voice samples are off');
  // More speakers than the model takes voices for is a failure, not a silent drop.
  const tight = clone(PROJECT); tight.params.maxAudioRefs = 1;
  breaks('timing', tight, E01, 'people speak, so 2 voice references, but minimax-h3-ref takes at most 1');
}

{
  // @videoN — the previous clip, when the project asks for continuity that way.
  eq(DEFAULT_PARAMS.videoReferences, 'none', 'clip references are opt-in');
  eq(videoReferences(PROJECT, E01, E01.storyboard.segments[1]).length, 0, 'and off by default');
  const p = clone(PROJECT); p.params.videoReferences = 'previous';
  eq(videoReferences(p, E01, E01.storyboard.segments[0]).length, 0, 'the first segment has nothing before it');
  const v = videoReferences(p, E01, E01.storyboard.segments[1]);
  eq(v.length, 1, 'every later segment references the one before it');
  eq(v[0].label, '@video1', 'clips are their own @videoN series');
  eq(v[0].entity, 'E01-01', 'and it is the previous segment');
  ok(v[0].use.includes('continue its look'), 'the legend says what to carry over');
  // Numbering stays per type: images keep theirs, voices keep theirs.
  const refs = segmentReferences(p, E01, E01.storyboard.segments[1]);
  eq(refs.filter((r) => r.kind === 'image')[0].label, '@image1', 'images still start at 1');
  eq(refs.filter((r) => r.kind === 'audio')[0].label, '@audio1', 'voices still start at 1');
  // The skeleton names it, and lists it between the pictures and the voices — the connection order.
  const sk = promptSkeleton(p, E01, 'E01-02');
  ok(sk.video.prompt.includes('@video1 is the clip'), 'the skeleton legends the clip');
  const order = sk.video.references;
  ok(order.indexOf('E01-01:video') > 0 && order.indexOf('E01-01:video') < order.indexOf('C01:voice'), 'pictures, then the clip, then the voices');
  // Gated both ways.
  const dropped = clone(E01);
  dropped.storyboard.segments[1].prompt = dropped.storyboard.segments[1].prompt.split('@video1').join('');
  breaks('video-prompt', p, dropped, '@video1 (the clip before this one (E01-01)) is connected');
  const overNumbered = clone(E01);
  overNumbered.storyboard.segments[1].prompt += '\n@video1 continues. @video4 too.';
  breaks('video-prompt', p, overNumbered, '@video4 but only 1 clip reference');
  const bad = clone(PROJECT); bad.params.videoReferences = 'sometimes';
  breaks('params', bad, E01, 'params.videoReferences must be one of');
  // A reference video has its own duration cap — h3 takes 15 s, and its segments are 15 s.
  for (const [key, m] of Object.entries(VIDEO_MODELS)) {
    ok(m.maxVideoRefs >= 3 && m.maxRefVideoSeconds >= 15, `${key} states its clip reference limits`);
    ok(m.maxRefVideoSeconds <= m.maxSegmentSeconds || key === 'h3', `${key}'s reference cap is consistent with its output`);
  }
  eq(VIDEO_MODELS.seedance.maxVideoRefs, 10, 'seedance 2.5 takes 10 clips');
  eq(VIDEO_MODELS.wan.maxRefVideoSeconds, 15, 'wan reference videos are 15 s even though it outputs 30');
  // A 30 s seedance segment cannot be fed to wan as a reference.
  const long = clone(PROJECT);
  long.params.video = 'wan'; long.params.videoResolution = '480P'; long.params.videoReferences = 'previous';
  long.params.maxSegmentSeconds = 30; long.params.minSegmentSeconds = 2;
  const longE = clone(E01);
  longE.storyboard.segments[0].cuts = [...longE.storyboard.segments[0].cuts, ...longE.storyboard.segments[0].cuts].map((c, i) => ({ ...c, beats: [i + 1, i + 1] }));
  const fails = GATES.find((g) => g.id === 'timing').run(makeContext(long, { 1: longE })).filter((m) => m.includes('reference videos of at most'));
  ok(fails.length > 0, 'a clip longer than the reference cap is reported');
}

{
  // @imageN is used per shot, not just declared once.
  const dropped = clone(E01);
  dropped.storyboard.segments[0].prompt = dropped.storyboard.segments[0].prompt.replace('@image2:', 'the keyframe:');
  breaks('video-prompt', PROJECT, dropped, '[Shot 2] must anchor on @image2');
  // Seedance keyframes: the middle frames need their own state sentence, not only first and last.
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '720p';
  const e = clone(E01);
  const seg = e.storyboard.segments[3];
  const lines = claimedLines(e.scenes[1], seg.cuts).map((l) => l.line);
  const dir = speechDirection(PROJECT.characters.find((c) => c.id === 'C02'), '', 'en');
  seg.prompt = [...seedanceAnchors(4),
    '@audio1 is the voice of the stocky man in his sixties.',
    'This first frame defines the room, a wide shot with a static shot.',
    'This last frame defines his grave face in close-up, a slow push in.',
    `@audio1, ${dir}, says: ${lines[0]} Then @audio1 says: ${lines[1]}`].join('\n');
  breaks('video-prompt', p, e, '@image2 (keyframe 2) is never mentioned');
}

{
  // Voice sample: 3–5 s at the TTS speech rate, an acting direction that becomes a parenthetical
  const p = clone(PROJECT);
  const c = p.characters[0];
  const vp = voiceSamplePrompt(c, paramsOf(p));
  ok(vp.endsWith(`）${c.voice.sample.line}`), 'sample prompt ends with the bare line');
  const brief = vp.slice(1, vp.indexOf('）'));
  for (const part of [c.profile.ageRange, c.profile.identity, c.voice.timbre, c.voice.pitch, c.voice.pace, c.voice.accent, c.voice.emotion, c.voice.sample.direction]) {
    ok(brief.includes(part), `voice brief carries "${part}"`);
  }
  for (const w of c.profile.personality) ok(brief.includes(w), `voice brief carries the trait "${w}"`);
  ok(!/[「」『』“”]/.test(brief), 'quote marks are stripped from the brief — they would be read aloud');
  const noAccent = clone(p); noAccent.params.speechAccent = 'Taiwanese-accented Mandarin';
  ok(voiceSamplePrompt(noAccent.characters[0], paramsOf(noAccent)).includes(c.voice.accent), 'voice.accent wins over params.speechAccent');
  delete noAccent.characters[0].voice.accent;
  ok(voiceSamplePrompt(noAccent.characters[0], paramsOf(noAccent)).includes('Taiwanese-accented Mandarin'), 'speechAccent fills the gap when voice.accent is empty');
  ok(Math.abs(voiceSampleSeconds(c, paramsOf(p)) - nonWhitespace(c.voice.sample.line) / 2.4) < 0.01, 'sample seconds use the speech rate, not the reading rate');
  const long = clone(p); long.characters[0].voice.sample.line = '今晚也是我值班，你要的東西我幫你收在櫃檯下面了。';
  breaks('voice', long, E01, '3–5 s');
  const bare = clone(p); delete bare.characters[0].voice.sample.direction;
  breaks('voice', bare, E01, 'direction is empty');
  const quoted = clone(p); quoted.characters[0].voice.sample.line = '「今晚也是我值班。」';
  breaks('voice', quoted, E01, 'quote marks');
  const off = clone(p); off.params.voiceSamples = false;
  delete off.characters[0].voice.sample;
  ok(GATES.find((g) => g.id === 'voice').run(makeContext(off, { 1: E01 })).length === 0, 'voiceSamples false drops the sample requirement');
  const m = manifest(p, { 1: E01 }, { stage: 'characters' });
  ok(m.some((it) => it.item.endsWith('wji.nodes.voice') && it.hint.includes('seed-audio-1.0')), 'manifest demands the voice node on the headshot');
  ok(!manifest(off, { 1: E01 }, { stage: 'characters' }).some((it) => it.item.endsWith('wji.nodes.voice')), 'and drops it when voiceSamples is false');
}


// ── shot-language gates ─────────────────────────────────────────────────────
{
  const seg = () => E01.storyboard.segments[2];   // E01-03: the 爽点 segment
  eq(cutStart(seg(), 0).positions.C02, seg().cuts[0].start.positions.C02, 'the first cut starts on its own start boundary');
  eq(cutStart(seg(), 1).positions.C02, seg().cuts[0].end.positions.C02, 'later cuts start where the previous cut ended');
  eq(segmentCharacters(seg()).join(','), 'C02,C01', 'segment characters in first-appearance order');
  eq(keyScenes(E01).join(','), '2', 'the key scenes are the 爽点 scene and the cliff scene');
  ok(motionSentence(seg().cuts[2]).startsWith('Cue: he sets the bowl down'), 'motion sentence is cue / action / end');
  ok(cameraClause(seg().cuts[0]).startsWith('The camera holds;'), 'a static shot writes its hold');
  ok(cameraClause(seg().cuts[4]).startsWith('Push In (pressure), as he starts the question:'), 'a move writes motivation, trigger, path and end framing');
  ok(motionSentence(seg().cuts[2], 'zh').startsWith('触发：'), 'motion sentence has a Chinese form for wan');
}
{
  const e = clone(E01); e.storyboard.segments[2].cuts[0].purpose = { kind: 'pretty', change: 'x' };
  breaks('shot-purpose', PROJECT, e, 'purpose.kind');
  const e2 = clone(E01); e2.storyboard.segments[2].cuts[0].purpose.change = '';
  breaks('shot-purpose', PROJECT, e2, 'purpose.change');
  const e3 = clone(E01); const c = e3.storyboard.segments[2].cuts; c[1].size = c[0].size; c[1].angle = c[0].angle; c[1].characters = [...c[0].characters];
  breaks('shot-purpose', PROJECT, e3, 'same size, angle and people');
  const e4 = clone(E01); e4.storyboard.segments[2].cuts[2].purpose.kind = 'performance';   // the 爽点 cut
  breaks('shot-purpose', PROJECT, e4, 'claims a turn / 爽点');
  const e5 = clone(E01); e5.storyboard.segments[2].cuts[2].purpose.kind = 'performance'; e5.storyboard.segments[2].cuts[3].purpose.kind = 'reaction';
  passes('shot-purpose', PROJECT, e5);   // the next cut reads her reaction
  const e6 = clone(E01); e6.storyboard.segments[4].cuts[3].purpose.kind = 'establish';   // the cliff cut
  breaks('shot-purpose', PROJECT, e6, 'cliff');
}
{
  const e = clone(E01); e.storyboard.segments[2].cuts[0].angle = 'dutch';
  breaks('framing-axis', PROJECT, e, 'angle');
  const e2 = clone(E01); e2.storyboard.segments[2].cuts[0].height = 'medium';
  breaks('framing-axis', PROJECT, e2, 'height');
  const e3 = clone(E01); e3.storyboard.segments[2].cuts[0].axisSide = 'cross';
  breaks('framing-axis', PROJECT, e3, 'crossing the axis needs a note');
  const e4 = clone(E01); delete e4.storyboard.segments[2].axis;
  breaks('framing-axis', PROJECT, e4, 'declare axis');
  const e5 = clone(E01); e5.storyboard.segments[2].axis.screenRight = 'C02';
  breaks('framing-axis', PROJECT, e5, 'screenLeft / screenRight');
  const e6 = clone(E01); e6.storyboard.segments[2].cuts[0].start.facing.C02 = 'screen-left';   // now both singles face screen-left
  breaks('framing-axis', PROJECT, e6, 'reverse shots');
  const e7 = clone(E01); e7.storyboard.segments[2].axis.between = ['C01', 'C03'];
  breaks('framing-axis', PROJECT, e7, 'two characters of this scene');
}
{
  const e = clone(E01); delete e.storyboard.segments[2].cuts[0].start;
  breaks('continuity', PROJECT, e, 'start boundary is required');
  const e2 = clone(E01); e2.storyboard.segments[2].cuts[1].start = { positions: {} };
  breaks('continuity', PROJECT, e2, 'only the first cut');
  const e3 = clone(E01); delete e3.storyboard.segments[2].cuts[1].end.hands;
  breaks('continuity', PROJECT, e3, 'end.hands.C01');
  const e4 = clone(E01); e4.storyboard.segments[2].cuts[0].end.facing.C02 = 'left';
  breaks('continuity', PROJECT, e4, 'facing.C02 must be');
  const e5 = clone(E01); e5.storyboard.segments[2].cuts[3].end.heldProps.C01 = [];   // the bag leaves her hands on a line-only cut
  breaks('continuity', PROJECT, e5, 'a hand-over is an action');
  const e6 = clone(E01); e6.storyboard.segments[2].cuts[0].end.heldProps.C02 = ['P09'];
  breaks('continuity', PROJECT, e6, 'not a prop of this scene');
  const e7 = clone(E01); e7.storyboard.segments[3].cuts[0].start.positions.C02 = 'sitting on the stool';   // E01-03 left him standing
  breaks('continuity', PROJECT, e7, 'boundary carries over');
  const e8 = clone(E01); e8.storyboard.segments[2].cuts[2].frame += ' the bowl set down on the counter';   // an end-only state
  breaks('continuity', PROJECT, e8, 'only exists at the end');
  const e9 = clone(E01); e9.storyboard.segments[2].cuts[0].frame += ' then he looks up';
  breaks('continuity', PROJECT, e9, 'one freezeable instant');
  const e10 = clone(E01); e10.storyboard.segments[3].cuts[0].start.heldProps.C02 = ['P01'];   // E01-03 ended with his hands empty
  breaks('continuity', PROJECT, e10, 'starts holding');
}
{
  const e = clone(E01); e.storyboard.segments[2].cuts[0].motion.trigger = '';
  breaks('motion', PROJECT, e, 'motion.trigger');
  const e2 = clone(E01); e2.storyboard.segments[2].cuts[0].motion.action = '他问这是什么';
  breaks('motion', PROJECT, e2, 'must be English');
  const e3 = clone(E01); e3.storyboard.segments[2].cuts[0].motion.action = '林小夏 asks what it is';
  breaks('motion', PROJECT, e3, 'name');
  const e4 = clone(E01); e4.storyboard.segments[2].cuts[0].motion.action = 'he seems to recognise the bag';
  breaks('motion', PROJECT, e4, 'inner state');
  const e5 = clone(E01); e5.storyboard.segments[2].cuts[0].motion.action = 'he grabs the bowl, takes the bag, hands her the chopsticks and pulls the drawer';
  breaks('motion', PROJECT, e5, 'hand verbs');
  const e6 = clone(E01); delete e6.storyboard.segments[2].cuts[4].cameraNote.motivation;
  breaks('motion', PROJECT, e6, 'cameraNote.motivation');
  const e7 = clone(E01); delete e7.storyboard.segments[2].cuts[4].cameraNote.endFraming;
  breaks('motion', PROJECT, e7, 'endFraming');
  const e8 = clone(E01); e8.storyboard.segments[2].cuts[0].cameraNote = {};
  breaks('motion', PROJECT, e8, 'cameraNote.hold');
  const w = clone(PROJECT); w.params.video = 'wan'; w.params.videoResolution = '480P';
  const e9 = clone(E01); e9.storyboard.segments[2].cuts[0].motion.action = '他只动嘴，问这是什么';
  ok(!failures('motion', w, e9).some((m) => m.includes('must be English')), 'a wan project may write the motion in Chinese');
}
{
  const e = clone(E01); delete e.storyboard.segments[2].sound;
  breaks('sound', PROJECT, e, 'sound {');
  const e2 = clone(E01); e2.storyboard.segments[2].sound.ambience = '';
  breaks('sound', PROJECT, e2, 'ambience is empty');
  const e3 = clone(E01); e3.storyboard.segments[2].sound.sfx = [{ cut: 9, event: 'x' }];
  breaks('sound', PROJECT, e3, 'cut number');
  const e4 = clone(E01); e4.storyboard.segments[2].sound.music = '';
  breaks('sound', PROJECT, e4, 'music');
  const e5 = clone(E01); e5.storyboard.segments[3].sound.ambience = 'a different room tone';
  breaks('sound', PROJECT, e5, 'ambience differs');
}
{
  const e = clone(E01); e.storyboard.visualPlans = [];
  breaks('visual-plan', PROJECT, e, 'no visual plan');
  const e2 = clone(E01); e2.storyboard.visualPlans[0].landing = '';
  breaks('visual-plan', PROJECT, e2, 'visualPlan.landing');
  const e3 = clone(E01); e3.storyboard.visualPlans[0].turn = '她说「锁上门」';
  breaks('visual-plan', PROJECT, e3, 'quotes');
}
{
  const p = clone(PROJECT); p.props[0].textPolicy = { mode: 'readable', text: '3' };
  const e = clone(E01);
  ok(failures('text-policy', p, e).some((m) => m.includes('must be in the frame verbatim')), 'a readable prop\'s text must be in every frame that shows it');
  const p2 = clone(PROJECT); p2.props[0].textPolicy = { mode: 'readable', text: 'hard drive' };
  ok(!failures('text-policy', p2, E01).some((m) => m.includes('E01-01 cut 5')), 'a frame that carries the text passes');
  const p3 = clone(PROJECT); p3.props[0].textPolicy = { mode: 'readable' };
  breaks('text-policy', p3, E01, 'needs the exact text');
  const p4 = clone(PROJECT); p4.props[0].textPolicy = { mode: 'blank' };
  const e4 = clone(E01); e4.storyboard.segments[0].cuts[4].frame += ' a label reading "DO NOT OPEN"';
  breaks('text-policy', p4, e4, 'quotes text');
  const p5 = clone(PROJECT); p5.props[0].textPolicy = { mode: 'loud' };
  breaks('text-policy', p5, E01, 'textPolicy.mode');
}
{
  const e = clone(E01); e.storyboard.segments[2].prompt = e.storyboard.segments[2].prompt.replace('overall_soundscape: ', 'overall_soundscape: … ');
  breaks('prompt-hygiene', PROJECT, e, 'unfilled');
  const e2 = clone(E01); e2.storyboard.segments[2].prompt += '\nC01 stays behind the counter.';
  breaks('prompt-hygiene', PROJECT, e2, 'ids');
  const e3 = clone(E01); e3.storyboard.segments[2].prompt += '\nreference: sheet_v3.png';
  breaks('prompt-hygiene', PROJECT, e3, 'file name');
  const e4 = clone(E01); e4.storyboard.segments[2].prompt += '\nTODO fix hands';
  breaks('prompt-hygiene', PROJECT, e4, 'workflow note');
  const e5 = clone(E01); e5.storyboard.segments[2].prompt = e5.storyboard.segments[2].prompt.replace('No subtitles, no captions, no on-screen dialogue text.', '');
  breaks('prompt-hygiene', PROJECT, e5, NO_SUBTITLES.en);
  const p5 = clone(PROJECT); p5.params.subtitles = true;
  passes('prompt-hygiene', p5, e5);
  const e6 = clone(E01); e6.storyboard.segments[1].prompt = e6.storyboard.segments[1].prompt.replace('while she does not speak and her lips remain completely closed; then', 'and then').replace('while his lips remain completely closed', '');
  breaks('prompt-hygiene', PROJECT, e6, 'does not speak');
  const e7 = clone(E01); e7.storyboard.segments[2].prompt = e7.storyboard.segments[2].prompt.replace('<d>[Chinese] 这是什么？</d>', '<d>[Chinese] 这是什么？（轻声）</d>');
  breaks('prompt-hygiene', PROJECT, e7, 'parenthetical');
  // Sheets mode: a person on screen is bound by their @imageK inside their own shot.
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '720p'; p.params.references = 'sheets'; p.params.videoDuration = 'auto';
  const e8 = clone(E01);
  const seg = e8.storyboard.segments[3];
  const refs = segmentReferences(p, e8, seg);
  const legend = refs.map((r) => `${r.label} is ${r.use}.`).join('\n');
  const labelOf = (id) => refs.find((r) => r.entity === id && r.kind === 'image').label;
  const shots = seg.cuts.map((c, k) => `Shot ${k + 1} (${k}.0–${k + 1}.0 s, ${c.size}, ${c.camera}): ${c.characters.map(labelOf).join(' and ')} in frame.`);
  seg.prompt = [legend, ...shots, 'Look: x. Sound: hum. No subtitles, no captions, no on-screen dialogue text.'].join('\n');
  ok(!failures('prompt-hygiene', p, e8).some((m) => m.includes('never binds')), 'every on-screen person bound in their own shot passes');
  const e9 = clone(e8); e9.storyboard.segments[3].prompt = e9.storyboard.segments[3].prompt.replace(`Shot 3 (2.0–3.0 s, ${seg.cuts[2].size}, ${seg.cuts[2].camera}): ${seg.cuts[2].characters.map(labelOf).join(' and ')} in frame.`, `Shot 3 (2.0–3.0 s, ${seg.cuts[2].size}, ${seg.cuts[2].camera}): the two of them in frame.`);
  breaks('prompt-hygiene', p, e9, 'never binds');
  const texts = shotTexts(e8.storyboard.segments[3].prompt, 'seedance', 'sheets');
  eq(texts.size, 4, 'shotTexts splits a sheets-mode prompt into its shots');
  eq(shotTexts(E01.storyboard.segments[0].prompt, 'h3').size, 5, 'shotTexts uses the H3 paragraphs');
}
{
  const g = GATES.find((x) => x.id === 'storyboard-advice');
  ok(g.advisory === true, 'storyboard-advice is advisory');
  eq(failures('storyboard-advice', PROJECT, E01).length, 0, 'fixture has no storyboard advice');
  const e = clone(E01); e.storyboard.segments[0].cuts[3].background = ''; e.storyboard.segments[0].cuts[3].note = '';
  ok(failures('storyboard-advice', PROJECT, e).some((m) => m.includes('9:16')), 'a bare wide on 9:16 is noted');
  const e2 = clone(E01); e2.storyboard.segments[0].cuts[4].note = '';
  ok(failures('storyboard-advice', PROJECT, e2).some((m) => m.includes('size steps')), 'a three-step size jump is noted');
  const e3 = clone(E01); e3.storyboard.segments[2].cuts[0].motion.action = 'he does not answer';
  ok(failures('storyboard-advice', PROJECT, e3).some((m) => m.includes('absence')), 'a negative-form action is noted');
  const e4 = clone(E01); e4.storyboard.segments[2].cuts[0].frame = 'x'.repeat(950);
  ok(failures('storyboard-advice', PROJECT, e4).some((m) => m.includes('padding')), 'an over-long frame is noted');
}
{
  const e = clone(E01); e.storyboard.segments[2].cuts[1].seconds = 4;   // 4 s of dialogue + lead-in
  breaks('timing', PROJECT, e, 'lead-in');
}

// ── Seed Audio soundtrack ───────────────────────────────────────────────────
{
  const seg5 = E01.storyboard.segments[4];
  eq(musicOf({ music: 'N/A' }).intent, '', 'N/A is no music');
  eq(musicOf({ music: 'a cello' }).intent, 'a cello', 'a string is an intent with no cues');
  eq(musicOf(seg5.sound).cues.length, 3, 'an object carries its cues');
  eq(cueSeconds(3, seg5.cuts), 6, 'a cue at a cut number is that cut\'s start');
  eq(cueSeconds('10.5s', seg5.cuts), 10.5, 'a cue in seconds is read as seconds');
  eq(cueSeconds('later', seg5.cuts), null, 'a cue that is neither is null');
  // A per-segment soundtrack node is the `bed` / `full` mode; the default is `post` (scored over the edit).
  const PB = clone(PROJECT); PB.params.audioTrack = 'bed';
  eq(paramsOf(PROJECT).audioTrack, 'post', 'the default soundtrack is made in post, over the edit');
  const bed = audioPrompt(PB, E01, seg5);
  eq(bed.mode, 'bed', 'bed mode makes a bed');
  eq(bed.model, AUDIO_MODEL, 'the soundtrack node is Seed Audio');
  ok(bed.prompt.startsWith('[0.0s:11.0s] Ambience, continuous: the low hum'), 'the bed opens with the timecoded ambience');
  ok(bed.prompt.includes('[6.0s:9.0s] SFX: a single ring of the brass wind chimes'), 'sfx are timecoded to their cut');
  ok(bed.prompt.includes('[6.0s:10.5s] the music swells — on the chime.') && bed.prompt.includes('[10.5s:11.0s] the music falls silent'), 'music cues become timecoded states');
  ok(bed.prompt.includes('No dialogue, no vocals, no narration.'), 'a bed carries no voices');
  eq(bed.references.length, 0, 'a bed references no voices');
  const full = audioPrompt(PB, E01, E01.storyboard.segments[1], { mode: 'full' });
  eq(full.references.map((r) => r.label).join(','), '@Audio1,@Audio2', 'full mode references the speakers as @AudioN');
  ok(full.prompt.includes('[5.5s:7.1s] @Audio1 (the stocky man in his sixties with a grey crew cut), slow and gravelly'), 'a line is timecoded into its cut after the lead-in, in its voice and direction');
  ok(full.prompt.includes('says: 又是你值夜班。'), 'the line is verbatim');
  const noMusic = audioPrompt(PB, E01, E01.storyboard.segments[0]);
  ok(noMusic.prompt.includes('No music.'), 'N/A music is stated');
  const md = renderSegment(PB, E01, 'E01-05');
  ok(md.includes('## 音轨提示词（seed-audio-1.0 · bed · 11 s）') && md.includes('配乐：the low cello note（镜1 enter，镜3 swell，10.5s silence）'), 'segment markdown carries the soundtrack prompt and the cues');
  // gates
  const e = clone(E01); e.storyboard.segments[4].sound.music = { intent: '', cues: [] };
  breaks('sound', PROJECT, e, 'music.intent');
  const e2 = clone(E01); e2.storyboard.segments[4].sound.music.cues[0].do = 'explode';
  breaks('sound', PROJECT, e2, 'cues[0].do');
  const e3 = clone(E01); e3.storyboard.segments[4].sound.music.cues[0].at = '40s';
  breaks('sound', PROJECT, e3, 'inside the segment');
  const e4 = clone(E01); e4.storyboard.segments[4].sound.ambience = 'x'.repeat(AUDIO_MAX_CHARS);
  breaks('audio-track', PB, e4, 'max 2048');
  const p = clone(PROJECT); p.params.audioTrack = 'full';
  p.characters.push({ id: 'C04', name: '路人', tier: 'functional', role: 'r', from: ['原创'], identityEn: 'a passer-by in a wet coat', voice: { videoDirection: 'flat' } });
  const e5 = clone(E01); e5.scenes[1].characters.push('C03', 'C04');
  e5.scenes[1].flow[9].speaker = 'C03'; e5.scenes[1].flow[10].speaker = 'C04';   // E01-03 now has four speakers
  ok(failures('audio-track', p, e5).some((m) => m.includes('at most 3 reference voices')), 'full mode refuses more than three speakers');
  const p2 = clone(PROJECT); p2.params.audioTrack = 'none';
  eq(failures('audio-track', p2, E01).length, 0, 'audioTrack none skips the gate');
  const p3 = clone(PROJECT); p3.params.audioTrack = 'stems';
  breaks('params', p3, null, 'audioTrack');
  const items = manifest(PB, { 1: E01 });
  ok(items.some((i) => i.item === 'storyboard.segments.E01-01.wji.nodes.track'), 'bed mode: manifest asks for the soundtrack node');
  ok(!manifest(p2, { 1: E01 }).some((i) => i.item.includes('.nodes.track')), 'audioTrack none asks for no soundtrack node');
  // post (default): no music in any clip, no per-segment track, the episode is scored over the edit
  ok(!manifest(PROJECT, { 1: E01 }).some((i) => i.item.includes('.nodes.track')), 'post asks for no per-segment soundtrack node');
  eq(failures('audio-track', PROJECT, E01).length, 0, 'post skips the per-segment audio gate');
  for (const video of ['h3', 'seedance2', 'wan']) {
    for (const references of ['keyframes', 'sheets']) {
      const pv = clone(PROJECT); pv.params.video = video; pv.params.references = references;
      const vp = promptSkeleton(pv, E01, 'E01-05').video.prompt;
      ok(!vp.includes('cello'), `post: the music intent stays out of the clip (${video}/${references})`);
      ok(video === 'h3' ? vp.includes('non_diegetic_music: N/A') : video === 'wan' ? vp.includes('无配乐') : vp.includes('No music.'), `post: the clip is told there is no music (${video}/${references})`);
      const pb = clone(pv); pb.params.audioTrack = 'bed';
      ok(promptSkeleton(pb, E01, 'E01-05').video.prompt.includes('cello'), `bed: the music intent is still in the clip (${video}/${references})`);
    }
  }
  const ePost = clone(E01); ePost.storyboard.segments[4].sound.sfx.push({ cut: 3, event: 'SPECIAL: a reversed-cymbal riser into a hard stop', post: true });
  ok(!promptSkeleton(PROJECT, ePost, 'E01-05').video.prompt.includes('reversed-cymbal'), 'a post: true sfx stays out of the clip');
  ok(audioPrompt(PB, ePost, ePost.storyboard.segments[4]).prompt.includes('reversed-cymbal'), 'a post: true sfx is still in a per-segment bed');
  ok(renderSegment(PROJECT, E01, 'E01-05').includes('prompt score E01'), 'post: segment markdown points at the episode score sheet');
  const sheet = scoreSheet(PROJECT, ePost);
  eq(sheet.seconds, 68, 'the score sheet lays the segments end to end');
  eq(sheet.fps, 24, 'the score sheet defaults to 24 fps');
  eq(smpte(63.5, 24), '00:01:03:12', 'SMPTE is HH:MM:SS:FF');
  eq(smpte(3725, 25), '01:02:05:00', 'SMPTE carries hours');
  ok(sheet.rows.some((r) => r.layer === 'BGM' && r.at === 63 && r.what.startsWith('swell')), 'a music cue lands at its segment offset + cut start');
  ok(sheet.rows.some((r) => r.layer === 'design' && r.at === 63 && r.what.includes('reversed-cymbal')), 'post sfx are sound design on the sheet');
  ok(sheet.rows.some((r) => r.layer === 'sfx in clip' && r.what.includes('wind chimes')), 'in-clip sfx are listed so they are not doubled');
  ok(sheet.rows.some((r) => r.layer === 'DX' && r.at === 3.5), 'lines are spotted after the lead-in, for ducking');
  eq(sheet.rows.filter((r) => r.layer === 'BGE').length, 2, 'one ambience bed per scene, chained across its segments');
  eq(sheet.rows.find((r) => r.layer === 'BGE' && r.segment === 'E01-02').end, 68, 'the scene bed runs to the scene end');
  ok(sheet.rows.some((r) => r.layer === 'story' && r.what.startsWith('hook')) && sheet.rows.some((r) => r.layer === 'story' && r.what.startsWith('cliff')), 'the hook and the cliff anchor 起 / 合');
  eq(sheet.sections.length, 1, 'a 68 s episode is one Seed Audio section');
  const eLong = clone(E01);
  for (const sg of eLong.storyboard.segments) for (const c of sg.cuts) c.seconds *= 2;   // 136 s
  const long = scoreSheet(PROJECT, eLong, { fps: 25 });
  ok(long.sections.length === 2 && long.sections.every((x) => x.seconds <= AUDIO_MAX_SECONDS), 'a long episode splits into ≤ 120 s sections');
  eq(long.sections[0].segments.join(','), 'E01-01', 'the split falls on the scene change');
  eq(long.fps, 25, '--fps overrides the frame rate');
  const pp = clone(PROJECT); const eDone = clone(E01);
  for (const sg of eDone.storyboard.segments) sg.wji = { ...(sg.wji || {}), assets: { ...(sg.wji?.assets || {}), video: 'a1' } };
  ok(manifest(pp, { 1: eDone }).some((i) => i.item === 'wji.assets.edit'), 'post: once every clip exists the manifest asks for the edit');
  eDone.wji = { ...(eDone.wji || {}), assets: { edit: 'e1' } };
  ok(manifest(pp, { 1: eDone }).some((i) => i.item === 'wji.assets.mix'), 'post: after the edit it asks for the scored mix');
  ok(!manifest(pp, { 1: E01 }).some((i) => i.item.startsWith('wji.assets.')), 'post: no edit item while clips are missing');
  ok(voiceSamplePrompt(PROJECT.characters[0], paramsOf(PROJECT)).includes('干声，无配乐无音效'), 'the voice sample is asked for dry');
}

// ── seeds, skeletons, renders ───────────────────────────────────────────────
{
  const s = seedScript(PROJECT, 2);
  eq(s.targetSeconds, 60, 'seed target seconds from params');
  eq(s.beatsClaimed.join(','), 'B02', 'seed claims the episode beats');
  eq(s.seedNote.previousCliff, PROJECT.outline.episodes[0].hook, 'seed carries the previous cliff (the outline hook of the episode before)');
  eq(s.hook, '', 'seed leaves the opening hook for the writer');
  eq(s.cliff, PROJECT.outline.episodes[1].hook, 'seed cliff is the outline hook (the question that makes them tap next)');
  eq(s.seedNote.suspense, PROJECT.outline.episodes[1].suspense, 'seed note carries the outline suspense');
  ok(s.seedNote.openingHook.includes('opens the episode'), 'seed note says the hook is the opening image');
  eq(s.scenes.length, 0, 'seed leaves scenes empty');
  assert.throws(() => seedScript(PROJECT, 9), /no episode 9/, 'seed refuses unknown episode');
  const sb = seedStoryboard(PROJECT, E01);
  eq(sb.storyboard.seedScenes.length, 2, 'storyboard seed lists both scenes');
  eq(sb.storyboard.seedScenes[1].beats.length, 19, 'storyboard seed lists every beat');
  eq(sb.storyboard.seedScenes[1].beats[2].kind, 'line', 'seed marks lines');
  ok(Math.abs(sb.storyboard.seedScenes[1].beats[2].seconds - 1.56) < 0.01, 'seed times each beat');
  eq(sb.storyboard.segments.length, 0, 'storyboard seed resets segments');
  eq(sb.storyboard.visualPlans.length, 1, 'storyboard seed adds a visual-plan worksheet for the key scenes');
  eq(sb.storyboard.visualPlans[0].sceneIndex, 2, 'the worksheet is for the 爽点 / cliff scene');
  ok(sb.storyboard.seedScenes[1].axisHint.includes('C01 ↔ C02'), 'storyboard seed hints the axis pairs');
  passed += 0;
}
{
  const sk = promptSkeleton(PROJECT, E01, 'E01-01');
  eq(sk.video.duration, 15, 'skeleton duration is the sum of cuts');
  eq(sk.video.model, 'minimax-h3-ref', 'h3 model');
  ok(sk.video.prompt.startsWith(h3AlignmentLine(E01.storyboard.segments[0].cuts)), 'skeleton starts with the alignment line');
  ok(sk.video.prompt.includes('[Shot 2] At 00:03.000,'), 'skeleton has shot timestamps');
  ok(sk.video.prompt.includes('<d>[Chinese] 帮我收着。明天有人来拿。</d>'), 'skeleton carries the dialogue');
  ok(sk.video.prompt.includes('Cue: the door swings shut behind her. Action:'), 'skeleton carries the motion sentence');
  ok(sk.video.prompt.includes('Tracking Shot (pressure), as she steps out:'), 'skeleton carries the camera clause');
  ok(sk.video.prompt.includes('No subtitles, no captions, no on-screen dialogue text.'), 'skeleton turns subtitles off');
  ok(sk.video.prompt.includes('overall_soundscape: heavy rain on the fabric awning'), 'skeleton fills the soundscape from segment.sound');
  const sk3 = promptSkeleton(PROJECT, E01, 'E01-02');
  ok(sk3.video.prompt.includes(`while the young woman in the faded navy jacket does not speak, ${LIPS_CLOSED}`), 'skeleton keeps the other person\'s lips closed on a line');
  eq(sk.keyframes.length, 5, 'one keyframe per cut');
  eq(sk.keyframes[0].references[0].entity, 'S02', 'first reference is the scene sheet');
  ok(sk.keyframes[0].references.some((r) => r.entity === 'C03'), 'people in the cut are referenced');
  ok(sk.keyframes[0].references.some((r) => r.entity === 'P01'), 'props in the cut are referenced');
  ok(sk.keyframes[0].references.every((r) => /^@image\d+$/.test(r.label)), 'references are labelled @imageN');
  for (const n of forbiddenNames(PROJECT)) ok(!sk.keyframes[0].prompt.includes(n), `keyframe prompt has no name (${n})`);
  const p = clone(PROJECT); p.params.video = 'seedance'; p.params.videoResolution = '720p';
  const sk2 = promptSkeleton(p, E01, 'E01-04');
  eq(sk2.video.model, 'seedance-2.5-ref', 'seedance model');
  ok(sk2.video.prompt.startsWith('Use @image1 through @image4 as keyframes in that order.'), 'seedance skeleton starts with the keyframe order');
  assert.throws(() => promptSkeleton(PROJECT, E01, 'E01-99'), /no segment/, 'skeleton refuses unknown segment');
}
{
  const md = renderOutline(PROJECT);
  ok(md.includes('# 夜班便利店') && md.includes('## 爽点表') && md.includes('第 3 集'), 'outline markdown has title, beats, episodes');
  ok(renderCharacter(PROJECT, 'C01').includes(PROJECT.characters[0].voice.prompt), 'character markdown carries the voice prompt');
  ok(renderScene(PROJECT, 'S01').includes('关东煮灯箱'), 'scene markdown lists anchors');
  ok(renderProp(PROJECT, 'P01').includes('handheld'), 'prop markdown shows the scale');
  const script = renderScript(PROJECT, E01);
  ok(script.includes('穿雨衣的男人（') && script.includes('VO'), 'script markdown names speakers and VO');
  ok(script.includes('△（0-3秒）') && script.includes('【爽点标记】') && script.includes('【钩子标记】'), 'script markdown is in the 短剧 episode format with derived time marks');
  ok(script.includes('## 本集功能') && script.includes('## 本集任务') && script.includes('## 创作自检') && script.includes('16/16'), 'script markdown carries the episode design and a full self-check');
  const guide = renderGuideline(PROJECT);
  ok(guide.includes('创作指引') && guide.includes('## 9. 本项目绝对要注意的重点') && !guide.includes('{{'), 'guideline markdown is complete with no placeholders');
  ok(guide.includes(PROJECT.outline.brief.logline), 'guideline carries the logline');
  const dlg = renderDialogue(PROJECT, E01);
  eq((dlg.match(/^\| [^|]*：/gm) || []).length, 13, 'dialogue worksheet has one row per line');
  ok(dlg.includes('禁用：其实、我觉得'), 'dialogue worksheet carries the speaker\'s speech rules');
  const c1 = renderCharacter(PROJECT, 'C01');
  ok(c1.includes('## 人物圣经') && c1.includes('### 过去的关键选择') && c1.includes('## 人物关系网') && c1.includes('### 写作备忘'), 'character markdown has the bible sections');
  const out = renderOutline(PROJECT);
  ok(out.includes('## 创作简报') && out.includes('## 全剧结构') && out.includes('## 分集目录'), 'outline markdown has brief, structure and episode index');
  const check = scriptSelfCheck(PROJECT, E01);
  eq(check.score, 16, 'fixture episode scores 16/16');
  const segMd = renderSegment(PROJECT, E01, 'E01-02');
  ok(segMd.includes('| 00:02.000 |') && segMd.includes('integrated_multimodal_description'), 'segment markdown has cut table and prompt');
  ok(segMd.includes('### SHOT 1 · establish') && segMd.includes('| 唯一动作 |') && segMd.includes('| 视觉依据 |') && segMd.includes('轴线：'), 'segment markdown has the SHOT blocks, the axis and the sound line');
  ok(renderSegment(PROJECT, E01, 'E01-03').includes('入画（上一镜不在画内）'), 'a person entering a cut is marked as entering');
  assert.throws(() => renderCharacter(PROJECT, 'C99'), /no character/, 'render refuses unknown ids');
}

// ── manifest & bind ─────────────────────────────────────────────────────────
{
  const items = manifest(PROJECT, { 1: E01 });
  ok(items.some((i) => i.item === 'wji.workspaceId'), 'manifest asks for the workspace first');
  ok(items.some((i) => i.item === 'characters.C01.wji.datasetId'), 'manifest lists character datasets');
  ok(items.some((i) => i.item === 'wji.canvases.scenes') && items.some((i) => i.item === 'wji.canvases.props'), 'manifest asks for a scenes canvas and a separate props canvas');
  ok(items.find((i) => i.item === 'props.P01.wji.nodes.sheet').hint.includes('-c <props>'), 'prop sheets go on the props canvas');
  const noProps = clone(PROJECT); noProps.props = []; noProps.outline.episodes.forEach((e) => (e.propIds = []));
  ok(!manifest(noProps, {}).some((i) => i.item === 'wji.canvases.props'), 'no props, no props canvas');
  ok(items.some((i) => i.item === 'wji.displayNodes.S02:sheet'), 'manifest lists display nodes the episode needs');
  ok(items.some((i) => i.item === 'storyboard.segments.E01-01.wji.nodes.keyframes.4'), 'manifest lists every keyframe node');
  ok(items.some((i) => i.item === 'storyboard.segments.E01-05.wji.nodes.video'), 'manifest lists video nodes');
  ok(!items.some((i) => i.item.includes('wji.assets.keyframes')), 'assets are not requested before nodes exist');
  const bound = clone(PROJECT);
  bindPath(bound, 'wji.workspaceId', 'w1');
  bindPath(bound, 'characters.C02.wji.datasetId', 'd2');
  bindPath(bound, 'characters.C02.wji.nodes.headshot', 'n2');
  eq(bound.wji.workspaceId, 'w1', 'bind writes top-level ids');
  eq(bound.characters[1].wji.datasetId, 'd2', 'bind resolves array elements by id');
  const items2 = manifest(bound, {});
  ok(!items2.some((i) => i.item === 'characters.C02.wji.datasetId'), 'bound dataset no longer listed');
  ok(items2.some((i) => i.item === 'characters.C02.wji.assets.headshot'), 'a bound node without an asset asks for the asset');
  const e = clone(E01);
  bindPath(e, 'storyboard.segments.E01-01.wji.nodes.keyframes.0', 'k1');
  eq(e.storyboard.segments[0].wji.nodes.keyframes[0], 'k1', 'bind writes into arrays by index');
  bindPath(e, 'storyboard.segments.E01-02.wji.nodes.keyframes.2', 'k3');
  eq(e.storyboard.segments[1].wji.nodes.keyframes[2], 'k3', 'bind grows arrays');
  assert.throws(() => bindPath(clone(PROJECT), 'characters.C99.wji.datasetId', 'x'), /no element/, 'bind refuses unknown ids');
  const staged = manifest(PROJECT, { 1: E01 }, { stage: 'outline' });
  ok(!staged.some((i) => i.stage === 'characters'), 'manifest --stage limits the stages');
}

{
  // Action styles: fight segments (segment.action) open wide, take one move per cut, answer every
  // impact with a reaction, never ask for provider-refused gore, and carry the style phrase.
  eq(paramsOf(PROJECT).action, 'none', 'no action style unless chosen');
  eq(paramsOf(PROJECT).violence, 'blood', 'blood is allowed by default');
  eq(actionForGenre('港式功夫喜剧'), 'hk-kungfu', 'kung fu reads hk-kungfu');
  eq(actionForGenre('都市杀手枪战'), 'gun-fu', 'a gunfight reads gun-fu');
  eq(actionForGenre('仙侠动作'), 'wuxia-fantasy', 'xianxia + action reads wuxia-fantasy');
  eq(actionForGenre('仙侠甜宠'), 'none', 'xianxia romance has no action style by itself');
  eq(actionForGenre('古装冷兵器战争'), 'historical-realist', 'cold weapons read historical-realist');
  eq(actionForGenre('超级英雄'), 'superhero', 'superhero');
  eq(actionForGenre('飞车追逐'), 'car-chase', 'car chase');
  eq(actionForGenre('都市悬疑'), 'none', 'a thriller is not an action style by itself');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '功夫' }).params.action, 'hk-kungfu', 'init reads the action style from the genre');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '悬疑', action: 'street-brawl', violence: 'implied' }).params.violence, 'implied', 'init takes --violence');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', action: 'kungfu' }), /--action/, 'init rejects an unknown action style');
  for (const k of Object.keys(ACTION_STYLES)) {
    const a = ACTION_STYLES[k];
    if (!a) continue;
    ok(!IP_NAMES_RE.test(`${a.videoPhrase} ${a.videoPhraseZh} ${a.label}`), `${k} names no film or performer`);
    ok(Array.isArray(a.cutSeconds) && a.needs.length > 0, `${k} has a rhythm and signature shots`);
  }
  const p = clone(PROJECT); p.params.action = 'hk-kungfu';
  const bogus = clone(PROJECT); bogus.params.action = 'kungfu';
  breaks('params', bogus, E01, 'params.action');
  // A fight: E01-04 rebuilt as wide establish → strike (impact) → reaction → block.
  const fight = () => {
    const e = clone(E01);
    const seg = e.storyboard.segments[3];
    seg.action = true;
    const [c0, c1, c2, c3] = seg.cuts;
    c0.motion = { trigger: 'the door bangs', action: 'he steps off the counter into the aisle', result: 'they face each other' };
    c1.motion = { trigger: 'she moves', action: 'he punches at her jaw', result: 'the fist lands' }; c1.move = { kind: 'strike', impact: true };
    c2.purpose = { kind: 'reaction', change: 'she is hurt' }; c2.motion = { trigger: 'the blow lands', action: 'she staggers back against the shelf', result: 'cans fall' };
    c3.motion = { trigger: 'he comes again', action: 'she blocks with a tray', result: 'the tray rings' }; c3.move = { kind: 'block' };
    seg.prompt = `${seg.prompt}\nAction: ${ACTION_STYLES['hk-kungfu'].videoPhrase}.`;
    return e;
  };
  passes('action', p, fight());
  const unmarked = clone(fight()); breaks('grammar', PROJECT, unmarked, 'params.action is none');
  const narrow = fight(); const n0 = narrow.storyboard.segments[3].cuts[0]; n0.focal = focalOf(n0); n0.size = 'medium';
  breaks('action', p, narrow, 'opens on a wide');
  const waived = clone(narrow); waived.storyboard.segments[3].actionExceptions = [{ rule: 'open-wide', reason: 'user asked to open on the fist' }];
  passes('action', p, waived);
  const noReason = clone(narrow); noReason.storyboard.segments[3].actionExceptions = [{ rule: 'open-wide', reason: '' }];
  breaks('grammar', p, noReason, 'needs a reason');
  const combo = fight(); combo.storyboard.segments[3].cuts[1].motion.action = 'he punches at her jaw and kicks her knee';
  breaks('action', p, combo, '2 fight moves');
  const chain = fight(); chain.storyboard.segments[3].cuts[1].motion.action = 'he punches at her jaw, then steps in';
  breaks('action', p, chain, 'chains moves');
  const zh = fight(); zh.storyboard.segments[3].cuts[1].motion.action = '他出拳，接着扫腿';
  breaks('action', p, zh, 'fight moves in one cut');
  const noReact = fight(); noReact.storyboard.segments[3].cuts[2].purpose = { kind: 'pressure', change: 'x' };
  breaks('action', p, noReact, 'follow a blow with a reaction');
  const selfShown = clone(noReact); selfShown.storyboard.segments[3].cuts[1].purpose = { kind: 'consequence', change: 'she is hit' };
  ok(!failures('action', p, selfShown).some((m) => m.includes('follow a blow')), 'an impact that shows its own result needs no reaction cut');
  const gore = fight(); gore.storyboard.segments[3].cuts[2].motion.result = 'his severed arm drops';
  breaks('action', p, gore, 'providers refuse');
  const blood = fight(); blood.storyboard.segments[3].cuts[2].motion.result = 'blood on her lip';
  ok(!failures('action', p, blood).some((m) => m.includes('blood')), 'blood is fine by default');
  const implied = clone(p); implied.params.violence = 'implied';
  breaks('action', implied, blood, 'violence is implied');
  const noPhrase = fight(); noPhrase.storyboard.segments[3].prompt = E01.storyboard.segments[3].prompt;
  breaks('grammar', p, noPhrase, 'must carry "Action:');
  const badRule = fight(); badRule.storyboard.segments[3].actionExceptions = [{ rule: 'no-wide', reason: 'x' }];
  breaks('grammar', p, badRule, 'is not one of');
  eq(ACTION_RULES.join(' '), 'open-wide one-move impact-reaction no-graphic', 'the waivable rules');
  // Advisory: rhythm and signature shots; skeleton carries the Action line; IP names are refused.
  const adv = failures('action-advice', clone(Object.assign(clone(PROJECT), { params: { ...PROJECT.params, action: 'bullet-time' } })), fight());
  ok(adv.some((m) => m.includes('Arc Shot')), 'bullet-time asks for an Arc Shot');
  ok(GATES.find((g) => g.id === 'action-advice').advisory, 'action-advice never fails validate');
  ok(promptSkeleton(p, fight(), 'E01-04').video.prompt.includes(`Action: ${ACTION_STYLES['hk-kungfu'].videoPhrase}.`), 'the skeleton writes the Action line on a fight segment');
  ok(!promptSkeleton(p, fight(), 'E01-03').video.prompt.includes(ACTION_STYLES['hk-kungfu'].videoPhrase), 'no Action line on a talk segment');
  const wan = clone(p); wan.params.video = 'wan'; wan.params.videoResolution = '480P';
  ok(promptSkeleton(wan, fight(), 'E01-04').video.prompt.includes(`动作：${ACTION_STYLES['hk-kungfu'].videoPhraseZh}`), 'wan writes 动作：');
  const ip = clone(E01); ip.storyboard.segments[0].prompt += ' Shot like John Wick.';
  breaks('no-ip-names', PROJECT, ip, 'John Wick');
  const ipf = clone(E01); ipf.storyboard.segments[0].cuts[0].frame += ' 李小龙 stance.';
  breaks('no-ip-names', PROJECT, ipf, '李小龙');
  passes('no-ip-names', PROJECT, E01);
  ok(!IP_NAMES_RE.test('the neon sign'), 'neon is not Neo');
}

{
  // Grammars: each segment is cut in its own grammar(s), else the drama's default; they combine.
  eq(GRAMMARS.join(' '), 'drama action faceslap comedy', 'four grammars');
  eq(GRAMMAR_RULES.length, 11, 'eleven waivable rules across the grammars and the composition');
  const base = paramsOf(PROJECT);
  eq(base.grammar, 'drama', 'drama is the default grammar');
  eq(grammarsOf({}, base).join(), 'drama', 'a segment without its own grammar takes the default');
  eq(grammarsOf({ action: true }, base).join(), 'drama,action', 'action: true still means action');
  eq(grammarsOf({ grammar: ['action', 'comedy'] }, base).join(), 'action,comedy', 'grammars combine');
  eq(grammarsOf({}, { ...base, grammar: 'comedy' }).join(), 'comedy', 'a comedy drama cuts every segment as comedy');
  eq(grammarForGenre('古装喜剧'), 'comedy', '古装喜剧 is a comedy');
  eq(comedyForGenre('古装喜剧'), 'slapstick', 'a plain comedy is slapstick');
  eq(comedyForGenre('冷面处境喜剧'), 'deadpan', 'deadpan');
  eq(comedyForGenre('甜宠喜剧'), 'romcom', 'romcom');
  eq(comedyForGenre('都市悬疑'), 'none', 'no comedy');
  eq(actionForGenre('未来科幻动作'), 'bullet-time', 'future action reads bullet-time');
  const gi = initProject({ title: 't', episodes: 1, minutes: 1, genre: '古装喜剧' }).params;
  eq(`${gi.cinematography} ${gi.grammar} ${gi.comedy} ${gi.action}`, 'costume-idol comedy slapstick none', 'init composes 古装喜剧 from its axes');
  const fi = initProject({ title: 't', episodes: 1, minutes: 1, genre: '未来动作' }).params;
  eq(`${fi.grammar} ${fi.action}`, 'drama bullet-time', 'init composes 未来动作');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', grammar: 'comedy' }).params.comedy, 'slapstick', '--grammar comedy without a comedy genre defaults to slapstick');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', grammar: 'farce' }), /--grammar/, 'init rejects an unknown grammar');
  for (const k of Object.keys(COMEDY_STYLES)) if (COMEDY_STYLES[k]) ok(!IP_NAMES_RE.test(`${COMEDY_STYLES[k].videoPhrase} ${COMEDY_STYLES[k].videoPhraseZh}`), `${k} names no film or performer`);
  ok(!IP_NAMES_RE.test(`${FACESLAP.videoPhrase} ${FACESLAP.videoPhraseZh}`), 'faceslap names no film');

  // grammar gate: known grammars, the style chosen, exceptions with reasons, the phrases in the prompt.
  const bad = clone(E01); bad.storyboard.segments[0].grammar = 'farce';
  breaks('grammar', PROJECT, bad, 'not one of');
  const noStyle = clone(E01); noStyle.storyboard.segments[0].grammar = 'comedy';
  breaks('grammar', PROJECT, noStyle, 'params.comedy is none');
  const pc = clone(PROJECT); pc.params.comedy = 'slapstick'; pc.params.action = 'hk-kungfu';
  const mixed = clone(E01); const ms = mixed.storyboard.segments[3]; ms.grammar = ['action', 'comedy'];
  const lines = grammarLines(ms, paramsOf(pc));
  eq(lines.length, 2, 'a comic fight carries two lines');
  ok(promptSkeleton(pc, mixed, 'E01-04').video.prompt.includes(lines[1]), 'the skeleton writes the Comedy line');
  breaks('grammar', pc, mixed, 'must carry "Comedy:');
  ms.prompt += `\n${lines.join('\n')}`;
  ok(!failures('grammar', pc, mixed).some((m) => m.includes('must carry')), 'both lines present');
  const wanP = clone(pc); wanP.params.video = 'wan'; wanP.params.videoResolution = '480P';
  ok(promptSkeleton(wanP, mixed, 'E01-04').video.prompt.includes('喜剧：'), 'wan writes 喜剧：');

  // faceslap: the proof on screen, then at least two reactions (into the next segment of the scene).
  const slap = () => {
    const e = clone(E01); const seg = e.storyboard.segments[3]; seg.grammar = 'faceslap';
    const [c0, c1, c2, c3] = seg.cuts;
    c0.purpose = { kind: 'pressure', change: 'he sneers' }; c1.purpose = { kind: 'evidence', change: 'the badge' };
    c2.purpose = { kind: 'reaction', change: 'he pales' }; c3.purpose = { kind: 'reaction', change: 'she smiles' };
    return e;
  };
  passes('faceslap', PROJECT, slap());
  const noProof = slap(); noProof.storyboard.segments[3].cuts[1].purpose = { kind: 'decision', change: 'x' };
  breaks('faceslap', PROJECT, noProof, 'shows the proof');
  const oneFace = slap(); oneFace.storyboard.segments[3].cuts[3].purpose = { kind: 'decision', change: 'x' };
  breaks('faceslap', PROJECT, oneFace, 'at least 2');
  const carried = clone(oneFace); carried.storyboard.segments[4].cuts[0].purpose = { kind: 'reaction', change: 'x' };
  passes('faceslap', PROJECT, carried);
  const waivedSlap = clone(oneFace); waivedSlap.storyboard.segments[3].exceptions = [{ rule: 'reaction-chain', reason: 'user: one cold stare is enough' }];
  passes('faceslap', PROJECT, waivedSlap);

  // comedy: a setup before the punchline, laugh room after it.
  const gag = () => {
    const e = clone(E01); const seg = e.storyboard.segments[3]; seg.grammar = 'comedy';
    const [c0, c1, c2] = seg.cuts;
    c0.gag = 'setup'; c1.gag = 'punchline'; c1.seconds = 2; c2.purpose = { kind: 'reaction', change: 'she gapes' }; c2.seconds = 3;
    return e;
  };
  passes('comedy', pc, gag());
  const noSetup = gag(); delete noSetup.storyboard.segments[3].cuts[0].gag;
  breaks('comedy', pc, noSetup, 'no setup before it');
  const setupEarlier = clone(noSetup); setupEarlier.storyboard.segments[2].cuts[0].gag = 'setup';
  ok(!failures('comedy', pc, setupEarlier).some((m) => m.includes('no setup')), 'a setup earlier in the scene counts');
  const noRoom = gag(); noRoom.storyboard.segments[3].cuts[2].purpose = { kind: 'decision', change: 'x' };
  breaks('comedy', pc, noRoom, 'no laugh room');
  const held = clone(noRoom); const hc = held.storyboard.segments[3].cuts[1]; hc.camera = 'Static Shot'; hc.seconds = 3;
  ok(!failures('comedy', pc, held).some((m) => m.includes('laugh room')), 'a punchline held long enough is its own laugh room');
  const dp = clone(pc); dp.params.comedy = 'deadpan';
  breaks('comedy', dp, held, 'no laugh room');
  const badGag = gag(); badGag.storyboard.segments[3].cuts[0].gag = 'joke';
  breaks('grammar', pc, badGag, 'gag must be one of');

  // Advice: the 爽点 of a 打脸-type episode is cut as faceslap; a 打脸 has pressure, a low angle, a music hit.
  const adv = failures('grammar-advice', PROJECT, E01);
  ok(adv.some((m) => m.startsWith('E01-03') && m.includes('faceslap')), 'the 智商碾压 爽点 segment is asked to be a 打脸');
  const bare = slap(); const bs = bare.storyboard.segments[3];
  bs.cuts.forEach((c) => { c.height = 'eye'; }); bs.sound.music = 'N/A';
  const advSlap = failures('grammar-advice', PROJECT, bare);
  ok(!failures('grammar-advice', PROJECT, slap()).some((m) => m.startsWith('E01-04') && (m.includes('from below') || m.includes('music hit'))), 'a 打脸 with a low angle and a music enter is fine');
  ok(advSlap.some((m) => m.includes('from below')), 'a 打脸 without a low angle is noted');
  ok(advSlap.some((m) => m.includes('music hit')), 'a 打脸 without a music hit is noted');
  ok(GATES.find((g) => g.id === 'grammar-advice').advisory, 'grammar-advice never fails validate');
  const flat = clone(E01); flat.storyboard.segments[3].grammar = 'comedy';
  ok(failures('grammar-advice', pc, flat).some((m) => m.includes('no punchline')), 'a comedy segment without a punchline is noted');
}

{
  // Sci-fi looks: hard (engineered, no magic or floating holograms) and soft (holograms, neon).
  eq(cinematographyForGenre('硬科幻'), 'scifi-hard', '硬科幻 reads scifi-hard');
  eq(cinematographyForGenre('赛博朋克'), 'scifi-soft', 'cyberpunk reads scifi-soft');
  eq(cinematographyForGenre('科幻'), 'scifi-soft', 'a bare 科幻 reads soft');
  eq(cinematographyForGenre('未来动作'), 'scifi-soft', '未来动作 now has a sci-fi look');
  const hard = CINEMATOGRAPHY_PRESETS['scifi-hard'];
  ok(hard.anachronisms.test('the hologram over the table') && !hard.anachronisms.test('the instrument panel'), 'hard sci-fi refuses holograms, keeps panels');
  const ph = clone(PROJECT); ph.params.cinematography = 'scifi-hard';
  const e = clone(E01);
  for (const seg of e.storyboard.segments) seg.cuts.forEach((c) => {
    c.frame = c.frame.replace(LIGHT_DIRECTIONS[c.light.direction], LIGHT_DIRECTIONS['side-left']) + ' Grounded hard science fiction lighting from the instrument panel.';
    c.light = { ...c.light, direction: 'side-left', source: 'the instrument panel' };
  });
  passes('photography', ph, e);
  const magic = clone(e); const m0 = magic.storyboard.segments[0].cuts[0];
  m0.frame = m0.frame.replace('the instrument panel', 'a floating hologram'); m0.light.source = 'a floating hologram';
  breaks('photography', ph, magic, 'does not belong in hard science fiction');

  // Art-first composition, in any genre: devices named and in the frame, the signature share, a wide.
  eq(paramsOf(PROJECT).composition, 'standard', 'standard framing by default');
  eq(compositionForGenre('艺术古装'), 'art-first', '艺术 in the genre reads art-first');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '文艺科幻' }).params.composition, 'art-first', 'init reads art-first from the genre');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', composition: 'arty' }), /--composition/, 'init rejects an unknown composition');
  const pa = clone(PROJECT); pa.params.composition = 'art-first';
  eq(compositionOf({}, paramsOf(pa)), COMPOSITION_STYLES['art-first'], 'the drama default applies');
  eq(compositionOf({ composition: 'standard' }, paramsOf(pa)), null, 'a segment may step out of art-first');
  eq(compositionOf({ composition: 'art-first' }, paramsOf(PROJECT)), COMPOSITION_STYLES['art-first'], 'a segment may step into art-first');
  const art = () => {
    const x = clone(E01);
    for (const seg of x.storyboard.segments) seg.cuts.forEach((c, k) => {
      const d = k % 2 ? 'symmetry' : 'negative-space';
      c.composition = [d]; c.frame += ` ${COMPOSITION_DEVICES[d]}.`;
      if (k === 0 && !['wide', 'extreme-wide'].includes(c.size)) { c.focal = focalOf(c); c.size = 'wide'; }
    });
    return x;
  };
  passes('composition', pa, art());
  breaks('composition', pa, E01, 'composition is required');
  const missing = art(); const a0 = missing.storyboard.segments[0].cuts[0]; a0.frame = a0.frame.replace(COMPOSITION_DEVICES['negative-space'], '');
  breaks('composition', pa, missing, 'must contain "vast negative space"');
  const unknown = art(); unknown.storyboard.segments[0].cuts[0].composition = ['dutch'];
  breaks('composition', pa, unknown, 'is not one of');
  const plain = art(); plain.storyboard.segments[0].cuts.forEach((c) => { c.composition = ['thirds']; c.frame += ` ${COMPOSITION_DEVICES.thirds}.`; });
  breaks('composition', pa, plain, 'art-first needs at least 50 %');
  const noWide = art(); noWide.storyboard.segments[0].cuts.forEach((c) => { if (['wide', 'extreme-wide'].includes(c.size)) { c.focal = focalOf(c); c.size = 'medium'; } });
  breaks('composition', pa, noWide, 'steps back to the whole composition');
  const waived = clone(noWide); waived.storyboard.segments[0].exceptions = [{ rule: 'art-wide', reason: 'user: all close for this one' }];
  ok(!failures('composition', pa, waived).some((m) => m.startsWith('E01-01') && m.includes('whole composition')), 'art-wide waivable');
  passes('composition', PROJECT, E01);
  ok(grammarLines({}, paramsOf(pa)).some((l) => l.startsWith('Composition: ')), 'art-first adds a Composition line');
  ok(promptSkeleton(pa, art(), 'E01-01').video.prompt.includes(COMPOSITION_STYLES['art-first'].videoPhrase), 'the skeleton writes it');
  breaks('grammar', pa, art(), 'must carry "Composition:');
}

{
  // Story genres: outline ledgers and script markers, per genre, combinable.
  eq(storyForGenre('战神逆袭甜宠').join(), 'revenge,sweet', 'genres combine');
  eq(storyForGenre('悬疑推理').join(), 'mystery', 'mystery');
  eq(storyForGenre('古装喜剧').join(), 'comedy', 'comedy');
  eq(storyForGenre('都市').length, 0, 'no story genre by default');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: '重生复仇' }).params.story.join(), 'revenge', 'init reads the story genre');
  eq(initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', story: 'mystery,comedy' }).params.story.join(), 'mystery,comedy', 'init takes --story');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', story: 'zombie' }), /--story/, 'init rejects an unknown story genre');
  eq(storyOf({ story: ['revenge', 'bogus'] }).join(), 'revenge', 'storyOf keeps known genres');
  const bogus = clone(PROJECT); bogus.params.story = ['zombie'];
  breaks('params', bogus, E01, 'params.story');
  for (const g of ['story-revenge', 'story-sweet', 'story-mystery', 'story-comedy']) passes(g, PROJECT, null);

  // A 30-episode outline: golden 1–4, escalation 5–24, climax 25–30.
  const synth = (story, typeOf) => {
    const p = clone(PROJECT);
    p.params.episodes = 30; p.params.story = story;
    p.outline.structure = [{ phase: 'golden', episodes: [1, 4] }, { phase: 'escalation', episodes: [5, 24] }, { phase: 'climax', episodes: [25, 30] }];
    const hooks = ['身份', '危机', '结果', '情感', '反转', '道具'];
    p.outline.episodes = Array.from({ length: 30 }, (_, i) => ({ ep: i + 1, satisfaction: { type: typeOf(i + 1), action: 'x' }, hookType: hooks[i % 6] }));
    return p;
  };

  // 复仇: payback ladder.
  const rv = () => {
    const p = synth(['revenge'], (ep) => ([5, 6, 7].includes(ep) ? '情感释放' : '打脸'));
    p.characters.push(
      { id: 'A1', name: '舅妈', tier: 'support', antagonist: { tier: 1, firstPressEp: 1, motive: '看不起穷亲戚' } },
      { id: 'A2', name: '二少', tier: 'support', antagonist: { tier: 2, firstPressEp: 3, motive: '争家产' } },
      { id: 'A3', name: '幕后', tier: 'support', antagonist: { tier: 3, firstPressEp: 2, motive: '当年的旧债' } },
    );
    p.outline.paybacks = [
      { ep: 2, target: 'A1', scale: 'small', by: 'C01', how: '当众拆穿' }, { ep: 4, target: 'A1', scale: 'final', by: 'C01', how: '被赶出家门' },
      { ep: 8, target: 'A2', scale: 'big', by: 'C01', how: '合约作废' }, { ep: 14, target: 'A2', scale: 'final', by: 'C01', how: '身败名裂' },
      { ep: 20, target: 'A3', scale: 'big', by: 'C01', how: '证据曝光' }, { ep: 28, target: 'A3', scale: 'final', by: 'C01', how: '伏法' },
    ];
    return p;
  };
  passes('story-revenge', rv(), null);
  const late = rv(); for (const e of late.outline.episodes) if (e.ep <= 3) e.satisfaction.type = '情感释放';
  breaks('story-revenge', late, null, 'units 1–3');
  const gap = rv(); for (const e of gap.outline.episodes) if (e.ep >= 10 && e.ep <= 13) e.satisfaction.type = '强宠';
  breaks('story-revenge', gap, null, '4 episodes in a row');
  const mixedGap = clone(gap); mixedGap.params.story = ['revenge', 'sweet'];
  ok(!failures('story-revenge', mixedGap, null).some((m) => m.includes('in a row')), 'a mixed drama allows a longer gap');
  const noMotive = rv(); noMotive.characters.find((c) => c.id === 'A2').antagonist.motive = '';
  breaks('story-revenge', noMotive, null, '极端反派');
  const twice = rv(); twice.outline.paybacks.push({ ep: 29, target: 'A3', scale: 'final', by: 'C01' });
  breaks('story-revenge', twice, null, '2 final paybacks');
  const rushed = rv(); rushed.outline.paybacks[2].ep = 4;
  breaks('story-revenge', rushed, null, 'a tier 2 needs 3');
  const upside = rv(); upside.outline.paybacks[3].ep = 3; upside.outline.paybacks[2].ep = 3; upside.characters.find((c) => c.id === 'A2').antagonist.firstPressEp = 0;
  breaks('story-revenge', upside, null, 'lower tiers fall first');
  const earlyBoss = rv(); earlyBoss.outline.paybacks[5].ep = 22;
  breaks('story-revenge', earlyBoss, null, 'finished in the climax');
  const lull = rv(); lull.outline.paybacks[3].scale = 'small'; lull.outline.paybacks[4].scale = 'small'; lull.outline.paybacks.push({ ep: 26, target: 'A2', scale: 'final', by: 'C01' });
  breaks('story-revenge', lull, null, 'without a big payback');
  const backer = rv(); backer.outline.paybacks[5].by = 'C02';
  breaks('story-revenge', backer, null, 'never land the last blow');
  const waivedBacker = clone(backer); waivedBacker.outline.storyExceptions = [{ rule: 'hero-delivers', reason: 'user: the old general finishes him' }];
  passes('story-revenge', waivedBacker, null);

  // 甜宠: sugar share and gap, milestones.
  const sw = () => {
    const p = synth(['sweet'], (ep) => (ep % 2 === 0 ? '强宠' : '打脸'));
    p.outline.romance = [
      { ep: 1, milestone: 'meet' }, { ep: 2, milestone: 'bind' }, { ep: 4, milestone: 'touch' }, { ep: 10, milestone: 'kiss' },
      { ep: 14, milestone: 'confession' }, { ep: 16, milestone: 'misunderstanding', until: 18 }, { ep: 24, milestone: 'black-moment' },
      { ep: 26, milestone: 'reconcile' }, { ep: 27, milestone: 'public' },
    ];
    return p;
  };
  passes('story-sweet', sw(), null);
  const dry = sw(); for (const e of dry.outline.episodes) if (e.ep % 4 === 0) e.satisfaction.type = '打脸';
  breaks('story-sweet', dry, null, 'at least 40 %');
  const drought = sw(); for (const e of drought.outline.episodes) if (e.ep >= 6 && e.ep <= 10) e.satisfaction.type = '打脸';
  breaks('story-sweet', drought, null, 'without sugar');
  const unbound = sw(); unbound.outline.romance[1].ep = 5;
  breaks('story-sweet', unbound, null, 'nothing binds');
  const cold = sw(); cold.outline.romance[2].ep = 8; cold.outline.romance[3].ep = 8;
  breaks('story-sweet', cold, null, 'no physical closeness');
  const noConf = sw(); noConf.outline.romance[4].ep = 22;
  breaks('story-sweet', noConf, null, 'midpoint of love');
  const longMis = sw(); longMis.outline.romance[5].until = 20;
  breaks('story-sweet', longMis, null, 'lasts 5 episodes');
  const noUntil = sw(); delete noUntil.outline.romance[5].until;
  breaks('story-sweet', noUntil, null, 'until');
  const noMend = sw(); noMend.outline.romance[7].ep = 30;
  breaks('story-sweet', noMend, null, 'nothing reconciles');
  const sad = sw(); for (const e of sad.outline.episodes) if (e.ep > 27) e.satisfaction.type = '打脸';
  breaks('story-sweet', sad, null, 'happy ending');
  const badMs = sw(); badMs.outline.romance.push({ ep: 3, milestone: 'wink' });
  breaks('story-sweet', badMs, null, 'milestone must be one of');

  // 悬疑: questions and the clue ledger.
  const my = () => {
    const p = synth(['mystery'], () => '智商碾压');
    p.characters.push({ id: 'X1', name: '房东', tier: 'support', mysteryRole: 'culprit', firstEp: 2 });
    p.outline.questions = [
      { id: 'Q1', layer: 1, question: '三年前谁拿走了硬盘', openEp: 1, answerEp: 28, clues: ['K1', 'K2', 'K3'] },
      { id: 'Q2', layer: 2, question: '老陈为什么知道雨衣', openEp: 5, answerEp: 12, clues: ['K4', 'K5'] },
    ];
    p.outline.clues = [
      { id: 'K1', kind: 'true', what: '门口的雨衣', plantEp: 2, echoEps: [20] }, { id: 'K2', kind: 'true', what: '监控时间码', plantEp: 3, echoEps: [22] },
      { id: 'K3', kind: 'true', what: '钥匙串', plantEp: 10 }, { id: 'K4', kind: 'true', what: '碗里的筷子', plantEp: 6 }, { id: 'K5', kind: 'true', what: '旧工牌', plantEp: 8 },
      { id: 'R1', kind: 'red-herring', what: '店长的借据', plantEp: 5, dismissedEp: 12 },
    ];
    return p;
  };
  passes('story-mystery', my(), null);
  const twoCentral = my(); twoCentral.outline.questions[1].layer = 1;
  breaks('story-mystery', twoCentral, null, '2 layer-1 questions');
  const lateAsk = my(); lateAsk.outline.questions[0].openEp = 6;
  breaks('story-mystery', lateAsk, null, 'ask it by E03');
  const earlyTruth = my(); earlyTruth.outline.questions[0].answerEp = 15;
  breaks('story-mystery', earlyTruth, null, 'truth lands in the climax');
  const lateCulprit = my(); lateCulprit.characters.find((c) => c.id === 'X1').firstEp = 12;
  breaks('story-mystery', lateCulprit, null, 'the culprit first appears');
  const inverted = clone(lateCulprit); inverted.outline.mysteryMode = 'thriller';
  ok(!failures('story-mystery', inverted, null).some((m) => m.includes('culprit')), 'a thriller has no culprit rule');
  const thin = my(); thin.outline.questions[0].clues = ['K1', 'K2'];
  breaks('story-mystery', thin, null, 'at least 3');
  const rushedClue = my(); rushedClue.outline.clues[4].plantEp = 11;
  breaks('story-mystery', rushedClue, null, 'at least 3');
  const forgotten = my(); delete forgotten.outline.clues[0].echoEps;
  breaks('story-mystery', forgotten, null, 'echo it');
  const herrings = my(); herrings.outline.clues.push(...[2, 3, 4, 5, 6].map((n) => ({ id: `R${n}`, kind: 'red-herring', what: 'x', plantEp: 4, dismissedEp: 9 })));
  breaks('story-mystery', herrings, null, 'fewer false trails');
  const undismissed = my(); delete undismissed.outline.clues[5].dismissedEp;
  breaks('story-mystery', undismissed, null, 'dismissedEp');
  const crowded = my(); crowded.outline.questions.push(...[3, 4, 5, 6, 7].map((n) => ({ id: `Q${n}`, layer: 3, question: 'x', openEp: 2 })));
  breaks('story-mystery', crowded, null, 'questions are open');
  const noProp = my(); noProp.outline.clues[0].prop = 'P99';
  breaks('story-mystery', noProp, null, 'P99 does not exist');

  // 喜剧: premise, cast, running gags.
  const co = () => {
    const p = synth(['comedy'], () => '打脸');
    p.outline.brief.comicPremise = '十八岁的身体里住着太奶奶';
    for (const c of p.characters) c.comic = { flaw: `${c.id} 的怪癖`, role: c.id === 'C02' ? '捧' : '逗' };
    p.outline.runningGags = [{ id: 'G1', premise: '一紧张就背菜谱', eps: [2, 8, 26] }, { id: 'G2', premise: '永远找不到钥匙', eps: [5, 15, 29] }];
    return p;
  };
  passes('story-comedy', co(), null);
  const noPremise = co(); noPremise.outline.brief.comicPremise = '';
  breaks('story-comedy', noPremise, null, 'comicPremise');
  const noFlaw = co(); noFlaw.characters[0].comic.flaw = '';
  breaks('story-comedy', noFlaw, null, 'comic.flaw is empty');
  const allZany = co(); for (const c of allZany.characters) c.comic.role = '逗';
  breaks('story-comedy', allZany, null, 'nobody plays it straight');
  const oneGag = co(); oneGag.outline.runningGags.pop();
  breaks('story-comedy', oneGag, null, 'at least 2');
  const twice2 = co(); twice2.outline.runningGags[0].eps = [2, 26];
  breaks('story-comedy', twice2, null, 'at least 3');
  const bunched = co(); bunched.outline.runningGags[0].eps = [2, 3, 26];
  breaks('story-comedy', bunched, null, 'too close');
  const noPayoff = co(); noPayoff.outline.runningGags[0].eps = [2, 8, 14];
  breaks('story-comedy', noPayoff, null, 'never returns in the climax');

  // Script markers: clues on screen, gags per episode with setups and short punchlines.
  const pm = clone(PROJECT); pm.params.story = ['mystery']; pm.outline.clues = [{ id: 'K1', kind: 'true', what: '雨衣', plantEp: 1 }];
  breaks('story-script', pm, E01, 'no beat shows it');
  const shown = clone(E01); shown.scenes[0].flow[0].clue = 'K1';
  passes('story-script', pm, shown);
  const pc = clone(PROJECT); pc.params.story = ['comedy'];
  breaks('story-script', pc, E01, 'punchline beat(s)');
  const funny = clone(E01);
  funny.scenes[1].flow[2].gag = 'setup'; funny.scenes[1].flow[4].gag = 'punchline'; funny.scenes[1].flow[9].gag = 'punchline';
  passes('story-script', pc, funny);
  const noSetup = clone(funny); delete noSetup.scenes[1].flow[2].gag;
  breaks('story-script', pc, noSetup, 'no setup before it');
  const wordy = clone(funny); wordy.scenes[1].flow[4].line = '老了，睡不着，你知道吗我年轻的时候可是一夜不睡都行的那种人';
  breaks('story-script', pc, wordy, 'at most 20');
  const badGag = clone(funny); badGag.scenes[1].flow[0].gag = 'joke';
  breaks('story-script', pc, badGag, 'gag must be one of');

  // Advice: hook variety, money-only 强宠, suspects.
  const samey = rv(); for (const e of samey.outline.episodes) e.hookType = '危机';
  ok(failures('story-advice', samey, null).some((m) => m.includes('vary the cliffs')), 'a drama ending every episode the same way is noted');
  ok(GATES.find((g) => g.id === 'story-advice').advisory, 'story-advice never fails validate');
  eq(STORY_RULES.length, Object.values(STORY_GENRES).reduce((n, g) => n + g.rules.length, 0), 'every rule belongs to a genre');
}

{
  // Six more story genres: 虐恋, 家庭伦理, 宫斗, 修仙, 科幻, 恐怖.
  eq(storyForGenre('追妻火葬场').join(), 'angst', '追妻 reads angst');
  eq(storyForGenre('萌宝认亲').join(), 'family', '萌宝认亲 reads family');
  eq(storyForGenre('宫斗权谋').join(), 'palace', 'palace');
  eq(storyForGenre('都市修仙系统').join(), 'cultivation', 'cultivation');
  eq(storyForGenre('末世囤货').join(), 'scifi', 'scifi');
  eq(storyForGenre('规则怪谈').join(), 'horror', 'horror');
  eq(paramsOf(PROJECT).market, 'mainland', 'mainland by default');
  const badMarket = clone(PROJECT); badMarket.params.market = 'moon';
  breaks('params', badMarket, E01, 'params.market');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', market: 'moon' }), /--market/, 'init rejects an unknown market');
  const synth = (story, typeOf) => {
    const p = clone(PROJECT);
    p.params.episodes = 30; p.params.story = story;
    p.outline.structure = [{ phase: 'golden', episodes: [1, 4] }, { phase: 'escalation', episodes: [5, 24] }, { phase: 'climax', episodes: [25, 30] }];
    const hooks = ['身份', '危机', '结果', '情感', '反转', '道具'];
    p.outline.episodes = Array.from({ length: 30 }, (_, i) => ({ ep: i + 1, satisfaction: { type: typeOf(i + 1), action: 'x' }, hookType: hooks[i % 6] }));
    return p;
  };
  const tweak = (make, fn) => { const p = make(); fn(p); return p; };

  // 虐恋
  const an = () => {
    const p = synth(['angst'], () => '情感释放');
    p.outline.brief.redLines = ['动手', '下药'];
    p.outline.angst = {
      ending: 'HE', turnEp: 10, exitEp: 8, reconcileEp: 27,
      misbelief: { belief: '她推了白月光', engineeredBy: 'C02', evidence: '监控片段', audienceRevealEp: 2, heroRevealEp: 15 },
      beats: [
        { ep: 2, kind: '虐', releaseEp: 3 }, { ep: 4, kind: '虐', releaseEp: 5 }, { ep: 6, kind: '虐', releaseEp: 7 },
        { ep: 11, kind: '悔', cost: '失眠' }, { ep: 13, kind: '悔', cost: '当众认错' }, { ep: 15, kind: '悔', cost: '与母亲决裂' },
        { ep: 17, kind: '追', cost: '放下公司' }, { ep: 21, kind: '追', cost: '雨中等候', public: true }, { ep: 25, kind: '追', cost: '交出股份' },
        { ep: 28, kind: '糖' },
      ],
    };
    return p;
  };
  passes('story-angst', an(), null);
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.ending = 'sad'; }), null, 'ending must be one of');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.turnEp = 13; p.outline.angst.beats.push({ ep: 12, kind: '虐', releaseEp: 13 }); }), null, 'the pain runs to E12');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.turnEp = 20; }), null, 'turnEp');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.beats = p.outline.angst.beats.filter((b) => b.kind !== '悔'); }), null, 'outweighs');
  breaks('story-angst', tweak(an, (p) => { delete p.outline.angst.beats[0].releaseEp; }), null, 'not released within 2');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.misbelief.engineeredBy = 'C01'; }), null, 'engineered by a non-lead');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.misbelief.audienceRevealEp = 6; }), null, 'by E03');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.exitEp = 12; }), null, 'leaves by her own choice');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.beats[4].cost = ''; }), null, 'costs him nothing');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.beats[7].public = false; }), null, 'before witnesses');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.reconcileEp = 20; }), null, 'reconciles late');
  breaks('story-angst', tweak(an, (p) => { p.outline.brief.redLines = []; }), null, 'redLines is empty');
  breaks('story-angst', tweak(an, (p) => { p.outline.angst.beats[1].inflictor = 'C01'; p.outline.angst.beats[1].what = '他扇耳光'; }), null, 'crosses a red line');
  passes('story-angst', tweak(an, (p) => { p.outline.angst.beats[1].inflictor = 'C02'; p.outline.angst.beats[1].what = '她扇耳光'; }), null);

  // 家庭伦理
  const fm = () => {
    const p = synth(['family'], (ep) => (ep % 3 === 0 ? '情感释放' : '打脸'));
    const f = (id, name, tier, generation, extra = {}) => ({ id, name, tier, family: { generation, role: 'x', endState: '和解', ...extra } });
    p.characters = [
      { ...p.characters[0], family: { generation: 1, role: '媳婿', endState: '清醒切割' } },
      { ...p.characters[1], family: { generation: 0, role: '长辈', endState: '和解' } },
      f('F1', '大哥', 'support', 1), f('F2', '侄女', 'functional', 2), f('F3', '小宝', 'functional', 2, { minor: true }),
    ];
    p.outline.vindications = [{ char: 'C01', ep: 15, venue: '寿宴', witnesses: ['C02', 'F1', 'F2'] }, { char: 'C01', ep: 27, venue: '分家', witnesses: ['C02', 'F1', 'F2'] }];
    p.outline.secrets = [{ id: 'S1', content: '抱错的孩子', audienceKnowsEp: 2, plantEp: 1, hintEps: [5, 10], revealEp: 20 }];
    p.outline.reconciliations = [{ pair: ['C01', 'C02'], woundEp: 2, triggerEp: 18, turnEp: 22, endState: '和解' }];
    return p;
  };
  passes('story-family', fm(), null);
  breaks('story-family', tweak(fm, (p) => { p.characters.pop(); }), null, 'at least five members');
  breaks('story-family', tweak(fm, (p) => { delete p.characters[2].family.endState; }), null, 'family.endState');
  breaks('story-family', tweak(fm, (p) => { for (const e of p.outline.episodes) if (e.ep >= 5 && e.ep <= 14) e.satisfaction.type = '打脸'; }), null, 'without a tear');
  breaks('story-family', tweak(fm, (p) => { p.outline.vindications[0].witnesses = ['C02']; }), null, 'three or more family witnesses');
  breaks('story-family', tweak(fm, (p) => { p.outline.vindications.pop(); }), null, 'larger vindication in the climax');
  breaks('story-family', tweak(fm, (p) => { p.outline.secrets[0].hintEps = [5]; }), null, 'at least two');
  breaks('story-family', tweak(fm, (p) => { p.outline.secrets[0].audienceKnowsEp = 8; }), null, '信息差');
  breaks('story-family', tweak(fm, (p) => { p.outline.secrets[0].revealEp = 12; }), null, 'room for the fallout');
  breaks('story-family', tweak(fm, (p) => { Object.assign(p.outline.reconciliations[0], { triggerEp: 3, turnEp: 7 }); }), null, 'at least 10');
  breaks('story-family', tweak(fm, (p) => { p.outline.episodes[0].satisfaction = { type: '打脸', action: '小宝当众揭穿舅妈' }; }), null, 'never schemers');

  // 宫斗
  const pl = () => {
    const p = synth(['palace'], () => '智商碾压');
    p.outline.rankLadder = { track: '后宫', levels: ['答应', '贵人', '嫔', '妃', '皇后'] };
    p.outline.rankEvents = [{ char: 'C01', ep: 3, to: '贵人' }, { char: 'C01', ep: 8, to: '嫔' }, { char: 'C01', ep: 14, to: '贵人' }, { char: 'C01', ep: 20, to: '妃' }, { char: 'C01', ep: 28, to: '皇后' }];
    p.outline.schemes = [
      { id: 'X1', schemer: 'C02', target: 'C01', stakes: 'minor', setupEp: 2, revealEp: 5, outcome: 'success' },
      { id: 'X2', schemer: 'C02', target: 'C01', stakes: 'major', setupEp: 6, revealEp: 12, outcome: 'countered', counteredBy: { type: 'prop', ref: '香囊', plantEp: 9 }, flaw: '急于求成' },
      { id: 'X3', schemer: 'C01', target: 'C02', stakes: 'master', setupEp: 4, revealEp: 28, outcome: 'success' },
    ];
    p.outline.factions = [{ id: 'A', leader: 'C01', members: ['C01'] }, { id: 'B', leader: 'C02', members: ['C02', 'C03'] }];
    p.outline.allegiance = [{ char: 'C03', ep: 20, from: 'B', to: 'A', motive: '主子弃她', foreshadowEp: 12 }];
    return p;
  };
  passes('story-palace', pl(), null);
  breaks('story-palace', tweak(pl, (p) => { p.outline.schemes[1].setupEp = 10; }), null, 'a major scheme needs 5');
  breaks('story-palace', tweak(pl, (p) => { p.outline.schemes[2].stakes = 'major'; p.outline.schemes[2].setupEp = 16; }), null, 'no master scheme');
  breaks('story-palace', tweak(pl, (p) => { p.outline.schemes[1].counteredBy.plantEp = 13; }), null, 'out of nowhere');
  breaks('story-palace', tweak(pl, (p) => { delete p.outline.schemes[1].flaw; }), null, 'no flaw recorded');
  breaks('story-palace', tweak(pl, (p) => { p.outline.schemes.push({ id: 'X4', schemer: 'C02', target: 'C01', stakes: 'minor', setupEp: 13, revealEp: 16, outcome: 'countered', counteredBy: { type: 'authority', plantEp: 14 }, flaw: 'x' }, { id: 'X5', schemer: 'C02', target: 'C01', stakes: 'minor', setupEp: 15, revealEp: 18, outcome: 'countered', counteredBy: { type: 'authority', plantEp: 16 }, flaw: 'x' }); }), null, 'rescue button');
  breaks('story-palace', tweak(pl, (p) => { p.outline.schemes[0].outcome = 'countered'; p.outline.schemes[0].counteredBy = { type: 'prop', plantEp: 3 }; p.outline.schemes[0].flaw = 'x'; }), null, 'strong enough villain');
  breaks('story-palace', tweak(pl, (p) => { p.outline.rankEvents = p.outline.rankEvents.slice(2); }), null, 'first rank event');
  breaks('story-palace', tweak(pl, (p) => { p.outline.rankEvents[2].to = '妃'; }), null, 'no low point');
  breaks('story-palace', tweak(pl, (p) => { p.outline.rankEvents.pop(); }), null, 'top rung');
  breaks('story-palace', tweak(pl, (p) => { p.outline.factions.pop(); }), null, 'factions');
  breaks('story-palace', tweak(pl, (p) => { p.outline.allegiance[0].foreshadowEp = 18; }), null, 'foreshadowing');
  breaks('story-palace', tweak(pl, (p) => { p.outline.schemes.push({ id: 'X6', schemer: 'C01', target: 'C03', stakes: 'minor', setupEp: 7, revealEp: 10, outcome: 'success' }); }), null, 'moral capital');

  // 修仙
  const cu = () => {
    const p = synth(['cultivation'], () => '打脸');
    p.outline.powerSystem = { realms: ['R1', 'R2', 'R3', 'R4', 'R5'].map((id) => ({ id, name: id, visual: 'glow' })) };
    p.outline.goldenFinger = { type: '系统', name: '签到系统', activationEp: 1, rules: ['每日签到'], costs: ['寿元'] };
    p.outline.startPower = '废柴';
    p.outline.upgrades = [3, 10, 18, 27].map((ep, i) => ({ ep, char: 'C01', to: `R${i + 2}`, cause: '丹药', cost: '重伤' }));
    p.outline.fights = [{ ep: 9, foe: 'C02', heroRealm: 'R2', foeRealm: 'R3', foeRevealedEp: 8, edge: '爆元丹' }];
    return p;
  };
  passes('story-cultivation', cu(), null);
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.goldenFinger.activationEp = 3; }), null, 'by E02');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.goldenFinger.costs = []; }), null, 'rules and costs');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.upgrades[1].ep = 16; p.outline.upgrades[2].ep = 17; }), null, 'more than 12 units');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.upgrades[1].to = 'R4'; }), null, 'one realm at a time');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.upgrades[3].ep = 21; }), null, 'hold it for the last 15 %');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.upgrades[0].cost = ''; }), null, 'a cause and a cost');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.fights[0].foeRevealedEp = 10; }), null, 'revealed after the fight');
  breaks('story-cultivation', tweak(cu, (p) => { p.outline.fights[0].foeRealm = 'R4'; }), null, 'at most one');
  breaks('story-cultivation', tweak(cu, (p) => { delete p.outline.fights[0].edge; }), null, 'needs an edge');
  const hidden = tweak(cu, (p) => { p.outline.startPower = '隐藏大佬'; p.outline.upgrades = []; });
  breaks('story-cultivation', hidden, null, 'layer of 身份揭露');
  const revealing = clone(hidden); for (const e of revealing.outline.episodes) if (e.ep % 8 === 0) e.satisfaction.type = '身份揭露';
  passes('story-cultivation', revealing, null);

  // 科幻
  const sf = () => {
    const p = synth(['scifi'], () => '智商碾压');
    p.outline.brief.novum = { statement: '三十天后寒潮降临', category: '末世', firstEp: 1 };
    p.outline.worldRules = [
      { id: 'W1', rule: '空间可存物资', kind: 'power', shownEp: 1, decidesEps: [5] },
      { id: 'W2', rule: '空间每天只能开一次', kind: 'limit', shownEp: 2 },
      { id: 'W3', rule: '寒潮后空间会冻结', kind: 'exception', shownEp: 14, decidesEps: [28] },
    ];
    p.outline.countdown = { label: '寒潮倒计时', zeroEp: 15, log: Array.from({ length: 24 }, (_, i) => ({ ep: i + 1, value: Math.max(0, 30 - i * 2) })) };
    p.outline.foreknowledge = [{ event: '邻居抢粮', plantedEp: 3, payoffEp: 8 }];
    return p;
  };
  passes('story-scifi', sf(), null);
  breaks('story-scifi', tweak(sf, (p) => { p.outline.brief.novum.firstEp = 2; }), null, 'on screen in E01');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.secondaryNovums = [{ id: 'a' }, { id: 'b' }]; }), null, "Wells' law");
  breaks('story-scifi', tweak(sf, (p) => { p.outline.worldRules[1].kind = 'power'; }), null, 'limit or cost per power');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.worldRules[0].shownEp = 6; }), null, 'before it decides');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.worldRules[2].shownEp = 24; }), null, 'before the climax');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.worldRules[1].brokenEp = 9; }), null, 'set-up exception');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.countdown.log[5].value = 99; }), null, 'only counts down');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.countdown.log = p.outline.countdown.log.slice(0, 5); }), null, '60 %');
  breaks('story-scifi', tweak(sf, (p) => { delete p.outline.countdown; }), null, 'runs on a countdown');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.loops = [{ n: 1, ep: 3, newInfo: '' }]; }), null, 'brings nothing new');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.loops = [{ n: 1, ep: 3, newInfo: 'a', changed: false }, { n: 2, ep: 4, newInfo: 'b', changed: false }]; }), null, 'changes nothing');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.foreknowledge[0].payoffEp = 20; }), null, 'within 10');
  breaks('story-scifi', tweak(sf, (p) => { p.outline.worldRules[2].shownEp = 8; p.outline.countdown.zeroEp = 22; }), null, 'no midpoint turn');

  // 恐怖
  const hr = () => {
    const p = synth(['horror'], () => '智商碾压');
    for (const e of p.outline.episodes) e.scares = e.ep === 7 ? ['假警报', '惊吓'] : ['惊吓'];
    p.outline.horror = { subgenre: '规则怪谈', threat: { nature: '夜班规则', firstSignEp: 1, glimpseEps: [5, 10], revealEp: 20, explanation: { type: '人为', revealEp: 26, clueEps: [8, 15] } } };
    p.outline.horrorRules = [
      { id: 'H1', text: '零点后不要回头', isTrue: true, shownEp: 1 }, { id: 'H2', text: '红衣店员不存在', isTrue: true, shownEp: 2, brokenEp: 6 },
      { id: 'H3', text: '不要接三点的电话', isTrue: true, shownEp: 3 }, { id: 'H4', text: '冰柜第三层是空的', isTrue: true, shownEp: 4 },
      { id: 'H5', text: '店长的话都可信', isTrue: false, shownEp: 12 },
    ];
    return p;
  };
  passes('story-horror', hr(), null);
  breaks('story-horror', tweak(hr, (p) => { for (const e of p.outline.episodes) if (e.ep <= 8) e.scares = ['氛围']; }), null, 'at least 80 %');
  breaks('story-horror', tweak(hr, (p) => { p.outline.episodes[6].scares = ['假警报']; }), null, 'set up the real one');
  breaks('story-horror', tweak(hr, (p) => { p.outline.episodes[7].scares = ['假警报', '惊吓']; }), null, 'two episodes running');
  breaks('story-horror', tweak(hr, (p) => { p.outline.episodes[0].scares = ['鬼']; }), null, 'is not one of');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horror.threat.firstSignEp = 2; }), null, 'first sign of the threat');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horror.threat.revealEp = 10; }), null, 'hold it past the half');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horror.threat.glimpseEps = [5]; }), null, 'two glimpses');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horrorRules[1].shownEp = 7; }), null, 'before the audience has seen it');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horrorRules.pop(); }), null, 'at least five');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horrorRules.push({ id: 'H6', text: 'x', isTrue: true, shownEp: 6 }); p.outline.horrorRules[4].isTrue = true; }), null, 'contaminated');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horror.threat.explanation.type = '超自然'; }), null, 'red lines');
  passes('story-horror', tweak(hr, (p) => { p.params.market = 'overseas'; p.outline.horror.threat.explanation.type = '超自然'; }), null);
  breaks('story-horror', tweak(hr, (p) => { p.outline.horror.threat.explanation.revealEp = 20; }), null, 'keep the dread');
  breaks('story-horror', tweak(hr, (p) => { p.outline.horror.threat.explanation.clueEps = [25]; }), null, 'at least two clues');
  eq(STORY_RULES.length, Object.values(STORY_GENRES).reduce((n, g) => n + g.rules.length, 0), 'every rule belongs to one genre');
  eq(new Set(STORY_RULES).size, STORY_RULES.length, 'rule ids are unique across genres');
}

{
  // Formats: short 短剧, medium 中剧, movie 电影 in parts — the same pipeline, the rhythm and the counts scaled.
  eq(paramsOf(PROJECT).format, 'short', 'short by default');
  eq(formatForGenre('悬疑电影', 5), 'movie', '电影 reads movie');
  eq(formatForGenre('都市', 5), 'medium', 'a 5-minute episode reads medium');
  eq(formatForGenre('都市', 2), 'short', 'a 2-minute episode reads short');
  const mi = initProject({ title: 't', episodes: 18, minutes: 5, genre: '复仇电影' }).params;
  eq(`${mi.format} ${mi.ratio}`, 'movie 16:9', 'init: a movie is 16:9 by default');
  eq(initProject({ title: 't', episodes: 30, minutes: 1, genre: 'g' }).params.ratio, '9:16', 'init: a short drama is 9:16');
  assert.throws(() => initProject({ title: 't', episodes: 1, minutes: 1, genre: 'g', format: 'tv' }), /--format/, 'init rejects an unknown format');
  const short = { format: 'short', episodes: 80, minutesPerEpisode: 1.5 };
  const medium = { format: 'medium', episodes: 24, minutesPerEpisode: 5 };
  const movie = { format: 'movie', episodes: 18, minutesPerEpisode: 5 };
  eq(span(short, 3, 0.2), 3, 'short keeps the count');
  eq(span(medium, 3, 0.2), 1, 'medium converts by runtime (3 × 1.5 min ≈ one 5-minute episode)');
  eq(span(medium, 12, 0.3), 4, 'medium: 12 short episodes ≈ 4 medium ones');
  eq(span(movie, 3, 0.2), 4, 'movie converts by share of the film');
  eq(span(movie, 3), 1, 'movie without a share falls back to runtime');
  ok(runsAtLeast(movie, 20) && !runsAtLeast({ format: 'short', episodes: 12 }, 20), 'run length by runtime outside short');
  const pm = clone(PROJECT); Object.assign(pm.params, { format: 'movie', minutesPerEpisode: 5 });
  const rm = paramsOf(pm);
  eq(`${rm.hookSeconds} ${rm.turnSeconds} ${rm.maxConsecutiveLines}`, '60 90 5', 'a movie takes the movie rhythm');
  const own = clone(pm); own.params.turnSeconds = 45;
  eq(paramsOf(own).turnSeconds, 45, 'an explicit param still wins');
  const off = clone(PROJECT); off.params.minutesPerEpisode = 5;
  breaks('params', off, E01, 'outside the short range');
  const badFmt = clone(PROJECT); badFmt.params.format = 'tv';
  breaks('params', badFmt, E01, 'params.format');
  // Movie parts: only the first part needs the cold-open hook.
  const late = clone(E01); late.ep = 2; late.hookBeat = [2, 5];
  const hookGate = GATES.find((g) => g.id === 'hook-cliff');
  ok(hookGate.run(makeContext(PROJECT, { 2: late })).some((m) => m.includes('cold open')), 'a short episode needs the cold open');
  ok(!hookGate.run(makeContext(pm, { 2: late })).some((m) => m.includes('cold open')), 'a later movie part does not');
  // A revenge movie of 18 parts: the first payback may come by part 4 (20 %), not part 3.
  const rv = clone(PROJECT);
  Object.assign(rv.params, { format: 'movie', episodes: 18, minutesPerEpisode: 5, story: ['revenge'] });
  rv.outline.structure = [{ phase: 'golden', episodes: [1, 4] }, { phase: 'escalation', episodes: [5, 14] }, { phase: 'climax', episodes: [15, 18] }];
  rv.outline.episodes = Array.from({ length: 18 }, (_, i) => ({ ep: i + 1, satisfaction: { type: i + 1 === 4 || i + 1 >= 8 ? '打脸' : '情感释放', action: 'x' }, hookType: '危机' }));
  ok(!failures('story-revenge', rv, null).some((m) => m.includes('units 1–')), 'a movie may land its first payback at 20 %');
  rv.outline.episodes[3].satisfaction.type = '情感释放';
  ok(failures('story-revenge', rv, null).some((m) => m.includes('units 1–4')), 'but not later');
  // Comedy density by the minute outside short.
  const pc = clone(PROJECT); Object.assign(pc.params, { story: ['comedy'], comedy: 'slapstick', format: 'medium', minutesPerEpisode: 5 });
  const two = clone(E01); two.scenes[1].flow[2].gag = 'setup'; two.scenes[1].flow[4].gag = 'punchline'; two.scenes[1].flow[9].gag = 'punchline';
  ok(failures('story-script', pc, two).some((m) => m.includes('at least 4')), 'a 5-minute slapstick episode lands at least 4');
}

// ── init & file IO ──────────────────────────────────────────────────────────
{
  const p = initProject({ title: 't', episodes: 4, minutes: 2, genre: 'g' });
  eq(p.params.episodes, 4, 'init stores numbers');
  eq(p.params.video, 'h3', 'init defaults video to h3');
  eq(p.params.register, '', 'init leaves the register empty (gated) unless given');
  eq(initProject({ title: 't', episodes: 4, minutes: 2, genre: 'g', register: '台灣國語' }).params.register, '台湾国语', 'init normalises a traditional register spelling');
  ok(p.outline.brief && p.outline.guideline && Array.isArray(p.outline.structure), 'init writes the brief / structure / guideline shapes');
  assert.throws(() => initProject({ title: 't' }), /--episodes/, 'init requires episodes');
  const dir = mkdtempSync(join(tmpdir(), 'sd-'));
  try {
    writeJsonFile(join(dir, 'project.json'), p);
    writeJsonFile(join(dir, 'episodes/E02.json'), { ep: 2 });
    const loaded = loadProject(dir);
    eq(loaded.project.title, 't', 'loadProject reads project.json');
    eq(Object.keys(loaded.episodes).join(','), '2', 'loadProject picks up episode files');
    eq(Object.keys(loadProject(join(dir, 'project.json'), { eps: [1] }).episodes).length, 0, 'loadProject honours --ep');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  eq(parseEpRange('1-3').join(','), '1,2,3', 'ep range');
  eq(parseEpRange('2,5').join(','), '2,5', 'ep list');
  assert.throws(() => parseEpRange('x'), /bad --ep/, 'ep range rejects junk');
  eq(slug('E01-01 便利店 / 夜班'), 'e01-01-便利店-夜班', 'slug keeps CJK, drops separators');
}

// ── gate inventory (crew engine) ────────────────────────────────────────────
{
  eq(GATES.length, 67, 'gate count');
  eq(GATES.filter((g) => !g.advisory).length, 61, 'hard gate count');
  eq(GATES.filter((g) => g.advisory).length, 6, 'advisory gate count');
  ok(!GATES.find((g) => g.id === 'boundary-contrast').advisory, 'boundary-contrast is hard');
  ok(GATES.find((g) => g.id === 'boundary-contrast-episode').advisory, 'boundary-contrast-episode is advisory');
  eq(DEFAULT_PARAMS.boundaryContrastCuts, 2, 'boundaryContrastCuts default');
}

// ── boundary-contrast (跨场边界) ─────────────────────────────────────────────
{
  passes('boundary-contrast', PROJECT, E01);
  // E01-01 is scene 1, E01-02 opens scene 2: copy scene 1's last cut signature onto scene 2's first cut
  const last = E01.storyboard.segments[0].cuts.at(-1);
  const same = (c) => Object.assign(c, { size: last.size, angle: last.angle, characters: [...last.characters] });
  const e = clone(E01); same(e.storyboard.segments[1].cuts[0]);
  breaks('boundary-contrast', PROJECT, e, 'across the scene 1→2 boundary');
  const e2 = clone(e); e2.storyboard.segments[1].cuts[0].note = 'match-cut on her hand';
  passes('boundary-contrast', PROJECT, e2);
  const e3 = clone(e); e3.storyboard.segments[0].cuts.at(-1).note = 'Match Cut';
  passes('boundary-contrast', PROJECT, e3);
  // K decides how deep the comparison reaches: a match one cut in only counts when K ≥ 2
  const e4 = clone(E01); same(e4.storyboard.segments[1].cuts[1]);
  breaks('boundary-contrast', PROJECT, e4, 'cut 2');
  const p1 = clone(PROJECT); p1.params.boundaryContrastCuts = 1;
  passes('boundary-contrast', p1, e4);
  const p9 = clone(PROJECT); p9.params.boundaryContrastCuts = 9;   // clamps to 3
  const e5 = clone(E01); same(e5.storyboard.segments[1].cuts[2]);
  breaks('boundary-contrast', p9, e5, 'cut 3');
  passes('boundary-contrast', PROJECT, e5);
  const pBad = clone(PROJECT); pBad.params.boundaryContrastCuts = 'lots';   // falls back to 2
  breaks('boundary-contrast', pBad, e4, 'cut 2');
  const e6 = clone(e); e6.storyboard.segments.forEach((s) => delete s.sceneIndex);
  passes('boundary-contrast', PROJECT, e6);
}

// ── boundary-contrast-episode (跨集边界, advisory) ───────────────────────────
{
  const e02 = clone(E01);
  e02.storyboard.segments.forEach((s, i) => { s.id = `E02-${String(i + 1).padStart(2, '0')}`; });
  const lastCut = E01.storyboard.segments.at(-1).cuts.at(-1);
  Object.assign(e02.storyboard.segments[0].cuts[0], { size: lastCut.size, angle: lastCut.angle, characters: [...lastCut.characters] });
  const g = GATES.find((x) => x.id === 'boundary-contrast-episode');
  const notes = g.run(makeContext(PROJECT, { 1: E01, 2: e02 }));
  ok(notes.length > 0 && notes.some((m) => m.includes('across episode E01→E02')), `episode boundary noted: ${notes.join(' | ')}`);
  const results = runGates(makeContext(PROJECT, { 1: E01, 2: e02 }), { only: ['storyboard'] });
  const r = results.find((x) => x.id === 'boundary-contrast-episode');
  ok(r.advisory && r.failures.length === 0 && r.warnings.length > 0, 'episode boundary is a warning, never a failure');
  e02.storyboard.segments[0].cuts[0].note = 'match-cut';
  eq(g.run(makeContext(PROJECT, { 1: E01, 2: e02 })).length, 0, 'match-cut exempts the episode boundary');
  eq(g.run(makeContext(PROJECT, { 1: E01 })).length, 0, 'one episode has no episode boundary');
}

// ── refOverride / faceOf (Director pins the picture references) ──────────────
{
  const sheets = clone(PROJECT); sheets.params.references = 'sheets';
  const e = clone(E01);
  const seg = e.storyboard.segments[1];   // S01 with C01 + C02 + P01
  const derived = segmentReferences(sheets, e, seg);
  eq(derived.filter((r) => r.kind === 'image').map((r) => r.entity).join(','), 'S01,C01,C02,P01', 'derived picture order: environment, people, props');
  seg.refOverride = [{ entity: 'C01', asset: 'headshot', faceOf: 'C01' }, { entity: 'S01' }];
  const refs = segmentReferences(sheets, e, seg);
  const pics = refs.filter((r) => r.kind === 'image');
  eq(pics.map((r) => `${r.entity}:${r.asset}:${r.label}`).join(' '), 'C01:headshot:@image1 S01:sheet:@image2', 'refOverride replaces the pictures, in its own order');
  eq(pics[0].faceOf, 'C01', 'faceOf rides along');
  eq(pics[1].why, 'S01:sheet', 'override defaults fill why');
  eq(refs.filter((r) => r.kind === 'audio').length, derived.filter((r) => r.kind === 'audio').length, 'voices are still appended after an override');
  const sk = promptSkeleton(sheets, e, 'E01-02');
  ok(sk.video.prompt.includes('the person in @image1'), 'the speaker binds to the headshot label');
  // A body sheet first, the headshot later: the headshot still wins the face binding
  seg.refOverride = [{ entity: 'C01', asset: 'sheet' }, { entity: 'C01', asset: 'headshot', faceOf: 'C01' }, { entity: 'S01' }];
  const sk2 = promptSkeleton(sheets, e, 'E01-02');
  ok(sk2.video.prompt.includes('the person in @image2'), 'headshot / faceOf beats an earlier body sheet');
  seg.refOverride = [];
  eq(segmentReferences(sheets, e, seg).filter((r) => r.kind === 'image')[0].entity, 'S01', 'an empty override falls back to the derived set');
}

// ── VO lines: off-screen, no @audio, every visible mouth closed ───────────────
{
  const vo = (project) => {
    const e = clone(E01);
    e.scenes[1].flow[2].speaker = 'VO';   // beat 3, claimed by E01-02 cut 3 where C01 and C02 are on screen
    const sk = promptSkeleton(project, e, 'E01-02');
    const line = sk.dialogue.flat().find((l) => l.speaker === 'VO');
    ok(line && /off-screen/.test(line.speakerRef), 'VO speaker is described as off-screen');
    ok(sk.video.prompt.includes('off-screen'), 'the prompt says the voice is off-screen');
    ok(sk.video.prompt.includes(`do not speak, ${LIPS_CLOSED}`), 'both visible people keep their lips closed under a VO');
    ok(audioReferences(project, e, e.storyboard.segments[1]).every((r) => r.entity !== 'VO'), 'VO gets no voice reference');
    eq(claimedLines(e.scenes[1], e.storyboard.segments[1].cuts).filter((l) => l.speaker === 'VO').length, 1, 'the VO line is still claimed by its cut');
    return e;
  };
  const eVo = vo(PROJECT);                                             // h3 / keyframes branch
  const sheets = clone(PROJECT); sheets.params.references = 'sheets'; vo(sheets);   // sheets branch
  const seedance = clone(PROJECT); seedance.params.video = 'seedance'; seedance.params.references = 'sheets'; vo(seedance);
  passes('beat-flow', PROJECT, eVo);
  const eBad = clone(E01); eBad.scenes[1].flow[2].speaker = 'C03';
  breaks('beat-flow', PROJECT, eBad, 'not in this scene (or VO)');
}

// ── one-episode structure ───────────────────────────────────────────────────
{
  const one = clone(PROJECT);
  one.params.episodes = 1;
  one.outline.episodes = one.outline.episodes.slice(0, 1);
  const golden = { ...one.outline.structure[0], episodes: [1, 1] };
  const climax = { ...one.outline.structure[2], episodes: [1, 1] };
  one.outline.structure = [golden, climax];
  passes('structure', one, null);
  const p2 = clone(one); p2.outline.structure = [golden];
  breaks('structure', p2, null, 'golden → climax');
  const p3 = clone(one); p3.outline.structure = [{ ...golden, episodes: [1, 2] }, climax];
  breaks('structure', p3, null, 'inside 1–1');
  const p4 = clone(one); p4.params.episodes = 2; p4.outline.episodes = PROJECT.outline.episodes.slice(0, 2);
  p4.outline.structure = [golden, { ...climax, episodes: [2, 2] }];
  passes('structure', p4, null);
  const p5 = clone(p4); p5.outline.structure = [{ ...golden, episodes: [1, 1] }, { ...climax, episodes: [1, 2] }];
  breaks('structure', p5, null, 'expected 2');
}

// ── formatGates (what the CLI prints and what wji-backend embeds) ─────────────
{
  const results = runGates(makeContext(PROJECT, { 1: E01 }));
  const rep = formatGates(results);
  eq(Object.keys(rep).sort().join(','), 'advisory,failed,hard,lines,notes,summary,text', 'formatGates shape');
  eq(rep.summary, '✓ 61 gate(s) passed, 6 advisory (1 note)', 'fixture summary');
  eq(rep.failed, 0, 'nothing failed'); eq(rep.hard, 61, 'hard count'); eq(rep.advisory, 6, 'advisory count');
  // The fixture now raises one advisory (E01-03 carries the 爽点 and is not cut as faceslap),
  // exactly as it does in the wji-cli copy — advisory lines print, failures still must not.
  eq(rep.lines.filter((l) => l.includes('✗')).length, 0, 'a green run prints no failed gates');
  eq(rep.lines.length, 2, 'a green run prints only the advisory and its note');
  ok(rep.text.endsWith(rep.summary), 'text ends with the summary');
  const staged = formatGates(runGates(makeContext(PROJECT, {}), { stage: 'art' }), { stage: 'art' });
  ok(staged.summary.includes('(through art)'), 'staged summary names the stage');
  const all = formatGates(results, { all: true });
  ok(all.lines.length >= 67 && all.lines.some((l) => l.includes('(advisory)')), '--all lists every gate');
  ok(formatGates(runGates(makeContext(PROJECT, {})), { all: true }).lines.some((l) => l.includes('(skipped: no episode files)')), '--all shows skipped gates');
  const bad = clone(PROJECT); bad.params.register = '';
  const red = formatGates(runGates(makeContext(bad, { 1: E01 })));
  ok(red.failed > 0 && red.summary.startsWith('✗') && red.text.includes('outline/params'), 'a broken register shows as a failed outline/params gate');
}

// ── names in the prompt-bound voice / delivery text; disguised characters ─────
{
  const p = clone(PROJECT);
  p.characters[1].voice.emotion += '，对小夏说话时放轻';
  breaks('voice', p, null, 'voice.emotion contains the name "小夏"');
  const p2 = clone(PROJECT);
  p2.characters[0].voice.sample.direction = '盯着老陈，压低声音';
  breaks('voice', p2, null, 'voice.sample.direction contains the name "老陈"');
  const p3 = clone(PROJECT);
  p3.characters[0].voice.prompt += ' Speaks softly to Chen.';
  passes('voice', p3);                                   // an English word that is no name of the cast
  p3.characters[1].aliases.push('Uncle Chen');
  p3.characters[0].voice.prompt += ' Warm with Uncle Chen.';
  breaks('voice', p3, null, 'voice.prompt contains the name "Uncle Chen"');

  const wan = clone(PROJECT); wan.params.video = 'wan';
  passes('beat-flow', wan, E01);
  const e = clone(E01);
  e.scenes[0].flow[1].delivery = '压着嗓子，盯着林小夏';
  breaks('beat-flow', wan, e, 'delivery names "林小夏"');
  passes('beat-flow', PROJECT, e);                       // an English (h3) prompt never carries a Chinese delivery
  const eEn = clone(E01);
  eEn.scenes[0].flow[1].delivery = 'hisses it at Uncle Chen';
  breaks('beat-flow', p3, eEn, 'delivery names "Uncle Chen"');

  const d = clone(PROJECT);
  d.characters[2].disguise = { name: '过路人', revealEpisode: 3 };
  passes('tiers', d);
  eq(displayName(d, 'C03', 1), '过路人', 'before the reveal the disguise name is shown');
  eq(displayName(d, 'C03', 3), '穿雨衣的男人', 'from the reveal episode on the real name is shown');
  eq(displayName(d, 'C03'), '穿雨衣的男人', 'without an episode the real name is shown');
  eq(displayName(d, 'C01', 1), '林小夏', 'undisguised characters keep their name');
  ok(forbiddenNames(d).includes('过路人'), 'a disguise name is a forbidden prompt name');
  const script = renderScript(d, E01);
  ok(script.includes('过路人（') && !script.includes('穿雨衣的男人（'), 'render script attributes lines to the disguise name');
  ok(/人物：[^\n]*过路人/.test(script), 'render script lists the disguise name in the scene cast');
  ok(renderDialogue(d, E01).includes('过路人（') && !renderDialogue(d, E01).includes('穿雨衣的男人（'), 'render dialogue uses the disguise name');
  eq(seedScript(d, 1).seedNote.speech.C03.name, '过路人', 'seed note uses the disguise name');
  const late = clone(E01); late.ep = 3;
  ok(renderScript(d, late).includes('穿雨衣的男人（'), 'after the reveal the script uses the real name');
  for (const [bad, needle] of [[{ name: '过路人', revealEpisode: 1 }, 'revealEpisode'], [{ name: '穿雨衣的男人', revealEpisode: 2 }, 'equals the real name'], [{ revealEpisode: 2 }, 'disguise.name is empty'], [{ name: '过路人', revealEpisode: 9 }, 'revealEpisode']]) {
    const x = clone(PROJECT); x.characters[2].disguise = bad;
    breaks('tiers', x, null, needle);
  }
}

// ── Chinese image prompts (params.imagePromptLang = zh) ──────────────────────
{
  // the fixture with its image prompts written in Chinese; C02 in 繁體 to prove the folding
  const zh = clone(PROJECT);
  zh.params.imagePromptLang = 'zh';
  const R = '半写实角色插画，绘画质感，笔触柔和融合并带可见的笔刷肌理，解剖结构扎实';
  const NEG = '眼神空洞、塑料皮肤、过度磨皮、完全对称的脸、死板发型、无纹理布料、标志、品牌名、文字、水印';
  const CH = {
    C01: ['二十四岁左右的东亚女性，当代中国，便利店夜班店员，短发齐耳，褪色的藏青夹克，眼下微青，四分之三侧身胸像，纯色中性背景，左上方柔和方向光',
      '单人角色设定图，一张 16:9 横版画布，纯白背景。' + R + '。左区一张正面胸像，右上三个全身像（正面、侧面、背面），右下四个细节特写；人物：二十四岁东亚女性，短发，藏青夹克。无文字、无水印。'],
    C02: ['六十歲出頭的東亞男性，當代中國，退休保安，矮壯微駝，花白平頭，洗舊的灰色夾克，指節粗大，四分之三側身胸像，純色中性背景，左上方柔和方向光',
      '單人角色設定圖，一張 16:9 橫版畫布，純白背景。半寫實角色插畫，繪畫質感，筆觸柔和。左區一張正面胸像，右上三個全身像，右下四個細節特寫；人物：六十歲東亞男性，花白平頭，灰夾克。無文字、無水印。'],
    C03: ['三十多岁的东亚男性，当代中国，穿深色连帽雨衣，帽檐压低，下巴有胡茬，身形瘦高，四分之三侧身胸像，纯色中性背景，右侧硬光',
      '单人角色设定图，一张 16:9 横版画布，纯白背景。' + R + '。左区一张正面胸像，右上三个全身像，右下四个细节特写；人物：三十多岁东亚男性，深色雨衣，瘦高。无文字、无水印。'],
  };
  for (const c of zh.characters) Object.assign(c.image, { prompt: CH[c.id][0], sheet: CH[c.id][1], negativePrompt: NEG });
  const SC = {
    S01: ['中国城市里一家小便利店的店内，空场景，没有人，从门口望向收银台，关东煮机的灯箱闪烁，绿色四格监控屏，夜晚冷白日光灯', { 凌晨冷白光: '凌晨，整片冷白日光灯，货架投下硬影', 监控回放绿: '只剩监控屏的绿光照亮收银台，其余沉在暗里' }],
    S02: ['便利店门口的条纹雨棚下，空场景，没有人，湿漉漉的地面反光，门口的垃圾桶，雨夜', { 雨夜冷白灯: '雨夜，雨棚下一盏冷白灯，雨丝在灯下发亮' }],
  };
  for (const sc of zh.scenes) {
    Object.assign(sc.image, { prompt: SC[sc.id][0], sheet: `环境设定图，一张 16:9 横版画布。${R}。主画面：${SC[sc.id][0]}；右侧与底部为锚点细节特写，所有格子是同一个空间。无文字、无水印。`, negativePrompt: '人、人物、人影、人群、手、标志、品牌名、文字、水印' });
    for (const l of sc.lighting) l.prompt = SC[sc.id][1][l.state];
  }
  const pr = zh.props[0];
  Object.assign(pr.image, { prompt: '一个旧的三点五寸监控硬盘，手持尺寸，金属外壳有划痕，贴着褪色的标签（不可辨读），纯白背景，没有人，没有手，柔和均匀的棚拍光',
    sheet: `道具设定图，一张 16:9 横版画布，纯白背景。${R}。主画面：旧监控硬盘，手持尺寸，四分之三视角；右侧与底部为细节特写。没有人、没有手。无文字、无水印。`,
    negativePrompt: '人、人物、手、手指、杂乱背景、标志、品牌名、文字、水印' });
  pr.states[0].prompt = '装在半透明的防静电袋里，袋口折起';
  pr.states[1].prompt = '接上一根灰色数据线，指示灯亮着';
  for (const g of ['params', 'char-prompts', 'distinct', 'scene-design', 'scene-prompts', 'prop-design']) passes(g, zh);
  ok(IMAGE_PROMPT_LANGS.includes('zh') && imagePromptKit(zh.params).zh, 'zh is an image-prompt language');
  eq(foldZh('真人實拍參考攝影'), '真人实拍参考摄影', 'traditional folds to simplified');

  const en = clone(PROJECT); en.params.imagePromptLang = 'zh';
  breaks('char-prompts', en, null, 'image.prompt must be Chinese');
  breaks('scene-prompts', en, null, 'must be Chinese');
  breaks('scene-design', en, null, 'prompt must be Chinese');
  breaks('prop-design', en, null, 'must be Chinese');
  const fr = clone(PROJECT); fr.params.imagePromptLang = 'fr';
  breaks('params', fr, null, 'imagePromptLang');

  const x = clone(zh);
  x.characters[0].image.prompt = x.characters[0].image.prompt.replace('东亚女性，当代中国', '女性，当代');
  breaks('char-prompts', x, null, 'ethnicity');
  const bright = clone(zh);
  bright.characters[1].image.prompt = '东亚男性，退休保安，明亮清晰的元素，矮壮微驼';     // 明 / 清 / 元 alone are no era
  breaks('char-prompts', bright, null, 'era');
  x.characters[1].image.prompt = x.characters[1].image.prompt.replace('當代中國，', '');
  breaks('char-prompts', x, null, 'era');
  x.characters[2].image.sheet = x.characters[2].image.sheet.replace(R, '写实风格');
  breaks('char-prompts', x, null, 'render phrase "半写实角色插画…"');
  x.characters[0].image.negativePrompt += '、照片級';
  breaks('char-prompts', x, null, 'must not ban "照片级"');
  x.characters[0].image.sheet = x.characters[0].image.sheet.replace('16:9', '横版');
  breaks('char-prompts', x, null, '16:9');
  const y = clone(zh);
  y.scenes[0].image.prompt = y.scenes[0].image.prompt.replace('空场景，没有人，', '');
  breaks('scene-prompts', y, null, 'empty');
  y.scenes[1].image.negativePrompt = '标志、文字、水印';
  breaks('scene-prompts', y, null, 'ban people');
  const z = clone(zh);
  z.props[0].image.prompt = z.props[0].image.prompt.replace('手持尺寸，', '');
  breaks('prop-design', z, null, 'must contain "手持尺寸"');
  z.props[0].image.sheet = z.props[0].image.sheet.replace('纯白背景', '灰色背景');
  breaks('prop-design', z, null, 'white background');
  z.props[0].image.negativePrompt = '人、标志、文字';
  breaks('prop-design', z, null, 'ban hands');
  const d = clone(zh);
  d.characters[2].image.prompt = d.characters[0].image.prompt;
  breaks('distinct', d, null, 'image prompts are 100% alike');   // CJK bigrams, not English words

  const head = imagePrompt(zh, 'C01', 'headshot');
  ok(head.prompt.endsWith('正面干净人像，纯色中性背景') && head.ratio === '1:1' && head.from === null && head.lang === 'zh', 'zh headshot prompt');
  const sheet = imagePrompt(zh, 'C01', 'sheet');
  ok(sheet.prompt.startsWith('@image1 是必须完全一致的脸') && sheet.ratio === '16:9' && sheet.from === 'headshot' && sheet.negative === NEG, 'zh character sheet references the headshot');
  const light = imagePrompt(zh, 'S01', 'lighting:监控回放绿');
  ok(light.prompt.includes('只改变光线：只剩监控屏的绿光') && light.prompt.endsWith('空场景，没有任何人，电影剧照') && light.from === 'sheet', 'zh lighting variant');
  ok(imagePrompt(zh, 'P01', 'state:接在主机上').prompt.startsWith('@image1 是要完全还原的同一件道具。接上一根灰色数据线'), 'zh prop state');
  eq(imagePrompt(zh, 'S02').prompt, zh.scenes[1].image.sheet, 'a scene sheet is its sheet prompt');
  ok(imagePrompt(PROJECT, 'C01', 'sheet').prompt.startsWith('@image1 is the face to match exactly'), 'en character sheet keeps the English prefix');
  ok(imagePrompt(zh, 'C02', 'sheet').prompt.startsWith('@image1 是必須完全一致的臉——五官與髮型相同。'), '繁體 prompts get the 繁體 prefix');
  ok(imagePrompt(zh, 'C02', 'headshot').prompt.endsWith('，正面乾淨人像，純色中性背景'), '繁體 headshot suffix');
  ok(imagePrompt(PROJECT, 'S01', 'lighting:凌晨冷白光').prompt.endsWith('Empty scene, no people, cinematic film still'), 'en lighting variant');
  assert.throws(() => imagePrompt(zh, 'S01', 'lighting:白天'), /no lighting state/, 'unknown lighting state refused');
  assert.throws(() => imagePrompt(zh, 'C01', 'lighting:x'), /headshot \| sheet/, 'a character has no lighting');
  assert.throws(() => imagePrompt(zh, 'X9'), /no character/, 'unknown id refused');
}

// ── the CLI entry point survives a symlink (realpath isMain) ──────────────────
{
  const dir = mkdtempSync(join(tmpdir(), 'sd-link-'));
  try {
    copyFileSync(join(here, 'short-drama.mjs'), join(dir, 'engine.mjs'));
    symlinkSync(join(dir, 'engine.mjs'), join(dir, 'sd'));
    const run = spawnSync(process.execPath, [join(dir, 'sd')], { encoding: 'utf8' });
    eq(run.status, 0, 'symlinked engine exits 0 with usage');
    ok(run.stdout.includes('short-drama — deterministic tooling'), 'symlinked engine prints usage (isMain resolved through realpath)');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(`✓ ${passed} assertions passed`);
