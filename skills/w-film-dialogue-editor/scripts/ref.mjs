#!/usr/bin/env node
// ref.mjs — 對白語料庫查詢／驗證工具（香港粵語及其他語體）
// 用法：node scripts/ref.mjs <command> [flags]
// 文件：references/data/README.md

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'references', 'data');

const ENUMS = {
  age: ['kid', 'teen', 'young', 'mid', 'senior', 'elder'],
  archetype: ['student', 'slacker', 'office', 'boss', 'client', 'craftsman', 'waitress',
    'shopkeeper', 'security', 'housewife', 'designer', 'street', 'elder', 'trainer',
    'mum', 'dad', 'kid', 'teacher', 'sales', 'delivery'],
  tone: ['sassy', 'blunt', 'cold', 'warm', 'complain', 'threat', 'whiny', 'helpless',
    'gossip', 'funny', 'polite', 'angry', 'sarcastic', 'worried', 'proud', 'shy', 'flirty', 'surprised'],
  function: ['greet', 'farewell', 'praise', 'insult', 'refuse', 'question', 'urge', 'comfort',
    'bargain', 'gossip', 'joke', 'warn', 'threaten', 'dismiss', 'agree', 'disagree',
    'complain', 'tease', 'flirt', 'apology', 'thanks', 'challenge', 'boast', 'surprise',
    'encourage', 'refuse-soft'],
  register: ['everyday', 'slang', 'internet', 'proverb', 'idiom', 'professional', 'english-mix', 'profanity'],
  socialDistance: ['family', 'friend', 'colleague', 'client', 'stranger', 'conflict'],
};
const AGE_LABEL = { kid: '6-12', teen: '13-19', young: '20-29', mid: '30-44', senior: '45-59', elder: '60+' };

const LANG_LABEL = { 'zh-hk': '香港粵語', 'zh-cn': '大陸普通話', 'zh-tw': '台灣國語', 'zh-hk-mandarin': '港式普通話', 'zh-period': '古裝／年代戲普通話', en: '美式英文', ko: '韓文', ja: '日文' };
function langLabel(lang) { return LANG_LABEL[lang] || lang; }

// 自由標籤（跨維度）。新增標籤可以自由加，但最好保持呢個受控詞表，方便檢索。
const TAGS = [
  // 場景／領域（粵語用前 10 個；其他語體用後半）
  '裝修', '地盤', '茶記', '街市', '飲茶', '公司', '學校', '家庭', '大廈', '店舖',
  '工地', '餐廳', '菜市場', '茶樓', '小區', '社區',
  // 角色
  '師傅', '師奶', '長輩', '後生', '老細', '客戶', '伙記', '管理員', '學生', 'OL', '外賣',
  '大媽', '阿姨', '大叔', '老闆', '老闆娘', '服務員', '店員', '保安', '警衛',
  '外賣員', '外送員', '司機', '白領', '上班族', '老師', '年輕人',
  // 對白用途
  '開場', '收尾', '拒絕', '讚', '踩', '八卦', '講價', '關心', '抱怨', '客套', '日常', '面試', '投訴',
  // 語感
  '直球', '冷面', '惜字如金', '潮語', '老派', '中英夾雜', '網絡用語',
  // 圳景／角色補充（en／ko／ja 用）
  '便利店', '地鐵', '居酒屋', '街頭', '酒吧', '咖啡廳', '校園', '職場',
  '情侶', '上司', '下屬', '同事', '敬語', '半語', '方言', '黑話', '戀愛', '動漫', '遊戲', '外來語',
];

function parseArgs(argv) {
  const flags = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-n') { flags.limit = argv[++i]; continue; }
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--') || next === '-n') flags[key] = true;
      else { flags[key] = next; i++; }
    } else pos.push(a);
  }
  return { flags, pos };
}

function langDirs() {
  if (!existsSync(DATA)) return [];
  return readdirSync(DATA, { withFileTypes: true }).filter(function (d) { return d.isDirectory(); })
    .map(function (d) { return d.name; }).sort();
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (e) { throw new Error('JSON 解析失敗：' + file + ' — ' + e.message); }
}

function shardFiles(lang) {
  const dir = join(DATA, lang);
  if (!existsSync(dir)) throw new Error('冇呢個語言目錄：references/data/' + lang + '（可用：' + (langDirs().join(', ') || '未有') + '）');
  return readdirSync(dir).filter(function (f) { return f.endsWith('.json') && !f.endsWith('.all.json'); }).sort()
    .map(function (f) { return join(dir, f); });
}

function loadLang(lang) {
  const entries = [];
  const files = [];
  const list = shardFiles(lang);
  for (let i = 0; i < list.length; i++) {
    const doc = readJson(list[i]);
    if (!doc || !Array.isArray(doc.entries)) throw new Error(list[i] + '：缺少 entries 陣列');
    files.push({ file: basename(list[i]), count: doc.entries.length });
    for (let j = 0; j < doc.entries.length; j++) {
      const e = doc.entries[j];
      e._shard = basename(list[i], '.json');
      entries.push(e);
    }
  }
  return { entries: entries, files: files };
}

function w(str) {
  let n = 0;
  const s = String(str === undefined || str === null ? '' : str);
  for (const ch of s) n += /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(ch) ? 2 : 1;
  return n;
}
function pad(str, n) { const s = String(str === undefined || str === null ? '' : str); return s + ' '.repeat(Math.max(0, n - w(s))); }
function clip(str, n) {
  const s = String(str === undefined || str === null ? '' : str);
  if (w(s) <= n) return s;
  let out = '', c = 0;
  for (const ch of s) { const d = w(ch); if (c + d > n - 1) break; out += ch; c += d; }
  return out + '…';
}

function table(rows, headers) {
  const widths = headers.map(function (h, i) {
    return Math.max.apply(null, [w(h)].concat(rows.map(function (r) { return w(r[i]); })));
  });
  function line(cells) { return cells.map(function (c, i) { return pad(c, widths[i]); }).join('  '); }
  const head = line(headers);
  const sep = line(widths.map(function (x) { return '─'.repeat(x); }));
  return [head, sep].concat(rows.map(line)).join('\n');
}

function csv(v) {
  if (v === undefined || v === true) return null;
  const parts = String(v).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  return parts.length ? parts : null;
}

function test(allowed, actual) {
  if (!allowed) return true;
  if (!actual || !actual.length) return false;
  return actual.some(function (a) { return allowed.indexOf(a) !== -1; });
}

function matches(entry, f) {
  const c = entry.categories || {};
  if (!test(csv(f.age), c.age)) return false;
  if (!test(csv(f.archetype), c.archetype)) return false;
  if (!test(csv(f.tone), c.tone)) return false;
  if (!test(csv(f.function), c.function)) return false;
  if (!test(csv(f.sd), c.socialDistance)) return false;
  const entryTags = entry.tags || [];
  const wantTags = csv(f.tag);
  if (wantTags && !wantTags.every(function (t) { return entryTags.indexOf(t) !== -1; })) return false;
  const anyTags = csv(f['any-tag']);
  if (anyTags && !anyTags.some(function (t) { return entryTags.indexOf(t) !== -1; })) return false;
  if (f.shard && f.shard !== true && entry._shard !== String(f.shard)) return false;
  if (f.register && f.register !== true && (c.register || '') !== String(f.register)) return false;
  const maxProf = f['max-prof'] === undefined ? Infinity : Number(f['max-prof']);
  if (!Number.isNaN(maxProf) && (c.profanity || 0) > maxProf) return false;
  const q = f.q || (f.search && f.search !== true ? f.search : null);
  if (q) {
    const hay = [entry.phrase].concat(entry.variants || [], [entry.meaning, entry.literal, entry.example, entry.situation, entry.note])
      .filter(Boolean).join(' ').toLowerCase();
    if (hay.indexOf(String(q).toLowerCase()) === -1) return false;
  }
  return true;
}

const REQUIRED = ['id', 'phrase', 'meaning', 'example', 'situation'];
function validateEntries(entries) {
  const errors = [];
  const warnings = [];
  const ids = {};
  const phrases = {};

  for (const e of entries) {
    const where = e._shard + ':' + (e.id || '?');
    for (const k of REQUIRED) if (!e[k] || typeof e[k] !== 'string') errors.push(where + ' 缺少／非字串欄位 ' + k);
    if (e.id && !/^[a-z0-9-]+$/.test(e.id)) errors.push(where + ' id 只准細楷英數及連字符');
    if (e.id) {
      if (ids[e.id]) errors.push('重複 id：' + e.id + '（' + ids[e.id] + ' 及 ' + e._shard + '）');
      else ids[e.id] = e._shard;
    }
    const p = (e.phrase || '').trim();
    if (p) {
      const k = p.toLowerCase();
      if (phrases[k]) warnings.push('重複 phrase：' + p + '（' + phrases[k] + ' 及 ' + e._shard + '）');
      else phrases[k] = e._shard;
    }
    const c = e.categories;
    if (!c || typeof c !== 'object') { errors.push(where + ' 缺少 categories'); continue; }
    ['tone', 'function'].forEach(function (key) {
      if (!Array.isArray(c[key]) || c[key].length === 0) errors.push(where + ' categories.' + key + ' 必須是非空陣列');
    });
    ['age', 'archetype', 'tone', 'function', 'socialDistance'].forEach(function (key) {
      if (c[key] === undefined) return;
      if (!Array.isArray(c[key])) { errors.push(where + ' categories.' + key + ' 必須是陣列'); return; }
      c[key].forEach(function (v) {
        if (ENUMS[key].indexOf(v) === -1) errors.push(where + ' categories.' + key + ' 有未知值「' + v + '」');
      });
    });
    if (ENUMS.register.indexOf(c.register) === -1) errors.push(where + ' categories.register 無效：' + c.register);
    if (e.tags !== undefined) {
      if (!Array.isArray(e.tags)) errors.push(where + ' tags 必須是字串陣列');
      else {
        const seen = {};
        for (const t of e.tags) {
          if (typeof t !== 'string' || !t.trim()) errors.push(where + ' tags 有空白或非字串值');
          else if (seen[t]) errors.push(where + ' tags 重複：' + t);
          else { seen[t] = true; if (TAGS.indexOf(t) === -1) warnings.push(where + ' 未知 tag「' + t + '」（唔在受控詞表，可接受但要一致）'); }
        }
      }
    }
    if (typeof c.profanity !== 'number' || !Number.isInteger(c.profanity) || c.profanity < 0 || c.profanity > 3) {
      errors.push(where + ' categories.profanity 必須是 0-3 整數');
    }
    if (c.profanity >= 2 && c.register !== 'profanity' && c.register !== 'slang') {
      warnings.push(where + ' profanity>=2 但 register=' + c.register);
    }
    if (c.profanity >= 2 && !(e.avoid && e.avoid.length)) warnings.push(where + ' profanity>=2 但冇寫 avoid');
    if (e.example && e.phrase && e.example.indexOf(e.phrase.slice(0, 2)) === -1 && !(e.variants || []).some(function (v) { return e.example.indexOf(v.slice(0, 2)) !== -1; })) {
      warnings.push(where + ' example 同 phrase 關聯弱');
    }
  }
  return { entries: entries, errors: errors, warnings: warnings };
}

function validateLang(lang) {
  return validateEntries(loadLang(lang).entries);
}

function cmdCheck(file) {
  const doc = readJson(file);
  if (!doc || !Array.isArray(doc.entries)) throw new Error(file + ': 缺少 entries 陣列');
  const shard = basename(file, '.json');
  const entries = doc.entries.map(function (e) { e._shard = shard; return e; });
  const res = validateEntries(entries);
  console.log('檢查 ' + file + '：' + res.entries.length + ' 條　錯誤 ' + res.errors.length + '　警告 ' + res.warnings.length);
  res.errors.forEach(function (e) { console.log('  ✗ ' + e); });
  res.warnings.forEach(function (e) { console.log('  ! ' + e); });
  process.exitCode = res.errors.length ? 1 : 0;
}

function row(e) {
  const c = e.categories || {};
  return [e.id, e.phrase, clip(e.meaning, 34), clip((e.tags || []).join('/'), 16), (c.tone || []).join('/'), c.register, 'p' + c.profanity];
}

function printEntries(list, json) {
  if (json) {
    console.log(JSON.stringify(list.map(function (e) {
      const o = JSON.parse(JSON.stringify(e)); delete o._shard; return o;
    }), null, 2));
    return;
  }
  if (!list.length) { console.log('（冇結果）'); return; }
  console.log(table(list.map(row), ['id', 'phrase', 'meaning', '標籤', 'tone', 'reg', 'prof']));
}

function printFull(e) {
  const c = e.categories || {};
  const lines = [];
  lines.push('● ' + e.phrase + (e.variants && e.variants.length ? '  （亦作：' + e.variants.join('、') + '）' : '') + '   [' + e.id + ']');
  lines.push('  意思：' + e.meaning);
  if (e.literal) lines.push('  字面：' + e.literal);
  if (e.jyutping) lines.push('  粵拼：' + e.jyutping);
  if (e.romanization) lines.push('  羅馬字：' + e.romanization);
  lines.push('  年齡：' + ((c.age || []).map(function (a) { return a + '(' + AGE_LABEL[a] + ')'; }).join('、') || '任何'));
  lines.push('  角色：' + ((c.archetype || []).join('、') || '任何'));
  lines.push('  語氣：' + ((c.tone || []).join('、')));
  lines.push('  功能：' + ((c.function || []).join('、')));
  lines.push('  語體：' + c.register + '／粗口級別 ' + c.profanity);
  if (c.socialDistance) lines.push('  對象：' + c.socialDistance.join('、'));
  if (e.tags && e.tags.length) lines.push('  標籤：' + e.tags.join('、'));
  lines.push('  例：' + e.example);
  lines.push('  場口：' + (e.situation || ''));
  if (e.avoid && e.avoid.length) lines.push('  小心：' + e.avoid.join('；'));
  if (e.note) lines.push('  註：' + e.note);
  if (e.source && e.source !== 'general') lines.push('  來源：' + e.source);
  console.log(lines.join('\n'));
}

function cmdStats(lang) {
  const data = loadLang(lang);
  const entries = data.entries;
  console.log('語言：' + lang + '　總數：' + entries.length + ' 條');
  console.log('shards：' + data.files.map(function (f) { return f.file + '(' + f.count + ')'; }).join(', '));
  const keys = ['age', 'archetype', 'tone', 'function', 'register', 'profanity'];
  for (const key of keys) {
    const m = {};
    for (const e of entries) {
      const c = e.categories || {};
      const vals = key === 'register' ? [c.register] : key === 'profanity' ? ['p' + c.profanity] : (c[key] || ['(未標)']);
      for (const v of vals) m[v] = (m[v] || 0) + 1;
    }
    const parts = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).map(function (k) { return k + '=' + m[k]; });
    console.log('\n[' + key + ']  ' + parts.join('  '));
  }
}

function cmdMarkdown(lang, by) {
  const data = loadLang(lang);
  const entries = data.entries;
  const key = by && by !== true ? String(by) : 'age';
  const order = ENUMS[key] || [];
  const out = [];
  for (const v of order) {
    const list = entries.filter(function (e) { return (e.categories[key] || []).indexOf(v) !== -1; });
    if (!list.length) continue;
    out.push('#### ' + v + '（' + list.length + '）');
    out.push('');
    out.push('| 講法 | 意思 | 語氣 | 例子 |');
    out.push('|---|---|---|---|');
    for (const e of list) {
      const c = e.categories;
      const label = e.phrase + (c.profanity ? ' (p' + c.profanity + ')' : '');
      out.push('| ' + label + ' | ' + (e.meaning || '').replace(/\|/g, '\\|') + ' | ' + (c.tone || []).join('/') + ' | ' + (e.example || '').replace(/\|/g, '\\|') + ' |');
    }
    out.push('');
  }
  console.log(out.join('\n'));
}

function cmdIndex(lang) {
  const entries = loadLang(lang).entries;
  const ALL_AGES = ENUMS.age.slice();
  const isUniversal = function (e) {
    const c = e.categories || {};
    const ages = c.age || [];
    return ages.length >= 5 && !(c.archetype && c.archetype.length);
  };
  function tbl(list) {
    const rows = list.map(function (e) {
      const c = e.categories || {};
      const phrase = e.phrase + (c.profanity ? " (p" + c.profanity + ")" : "");
      const tg = (e.tags || []).slice(0, 3).join("／");
      return "| " + phrase + " | " + (e.meaning || "").replace(/\|/g, "\\|") + " | " + (e.example || "").replace(/\|/g, "\\|") + " | " + tg + " |";
    });
    return ["| 講法 | 意思 | 例子 | 標籤 |", "|---|---|---|---|"].concat(rows).join("\n");
  }
  const out = [];
  out.push("# " + langLabel(lang) + "語料庫索引（自動生成，唔好手改）");
  out.push("");
  out.push("生成：node scripts/ref.mjs index > references/zh-hk-index.md");
  out.push("");
  out.push("查詢：" + String.fromCharCode(96) + "node scripts/ref.mjs list/search/show" + String.fromCharCode(96) + "；schema：" + String.fromCharCode(96) + "references/data/README.md" + String.fromCharCode(96));
  out.push("");

  const universal = entries.filter(isUniversal);
  out.push("## 一、核心萬用（跨年齡、跨角色）  " + universal.length + " 條");
  out.push("");
  out.push(tbl(universal));
  out.push("");

  out.push("## 二、按年齡");
  out.push("");
  for (const age of ENUMS.age) {
    const list = entries.filter(function (e) { return (e.categories.age || []).indexOf(age) !== -1 && !isUniversal(e); });
    if (!list.length) continue;
    out.push("### " + age + "（" + AGE_LABEL[age] + "）  " + list.length + " 條");
    out.push("");
    out.push(tbl(list));
    out.push("");
  }

  out.push("## 三、按角色類型");
  out.push("");
  for (const arch of ENUMS.archetype) {
    const list = entries.filter(function (e) { return (e.categories.archetype || []).indexOf(arch) !== -1; });
    if (!list.length) continue;
    out.push("### " + arch + "  " + list.length + " 條");
    out.push("");
    out.push(tbl(list));
    out.push("");
  }
  console.log(out.join("\n"));
}

function csvCell(v) {
  const t = String(v === undefined || v === null ? '' : v);
  return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
}

function cmdSentences(lang, json, csv) {
  const entries = loadLang(lang).entries;
  if (csv) {
    const rows = [['id', 'shard', 'sentence', 'phrase', 'meaning', 'tags', 'register', 'profanity', 'tone', 'function']];
    entries.forEach(function (e) {
      const c = e.categories || {};
      rows.push([e.id, e._shard, e.example, e.phrase, e.meaning, (e.tags || []).join('/'),
        c.register, c.profanity, (c.tone || []).join('/'), (c.function || []).join('/')]);
    });
    console.log('\uFEFF' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n'));
    return;
  }
  if (json) {
    console.log(JSON.stringify(entries.map(function (e) {
      const c = e.categories || {};
      return { id: e.id, shard: e._shard, phrase: e.phrase, sentence: e.example, meaning: e.meaning,
               tone: c.tone, function: c.function, register: c.register, profanity: c.profanity, tags: e.tags || [] };
    }), null, 2));
    return;
  }
  const order = ["core", "rough", "older", "workplace", "gen-z"];
  const shards = {};
  entries.forEach(function (e) { (shards[e._shard] = shards[e._shard] || []).push(e); });
  const out = [];
  out.push("# " + langLabel(lang) + "對白句庫（全部 " + entries.length + " 句，自動生成）");
  out.push("");
  out.push("每句＝語料庫一條 entry 嘅 example。格式：句子 ｜ 講法 ｜ 意思 ｜ 標籤");
  out.push("");
  const names = Object.keys(shards).sort(function (a, b) {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  names.forEach(function (name) {
    const list = shards[name].slice().sort(function (a, b) { return a.id.localeCompare(b.id); });
    out.push("## " + name + "  " + list.length + " 句");
    out.push("");
    list.forEach(function (e) {
      const c = e.categories || {};
      out.push("- " + e.example + " ｜ " + e.phrase + " ｜ " + e.meaning + (e.tags && e.tags.length ? " ｜ " + e.tags.join("/") : ""));
    });
    out.push("");
  });
  console.log(out.join("\n"));
}

function cmdBuild(lang) {
  const data = loadLang(lang);
  const sorted = data.entries.map(function (e) {
    const o = JSON.parse(JSON.stringify(e)); delete o._shard; return o;
  }).sort(function (a, b) { return a.id.localeCompare(b.id); });
  const doc = { lang: lang, count: sorted.length, generatedAt: new Date().toISOString().slice(0, 10), enums: ENUMS, entries: sorted };
  const file = join(DATA, lang + '.all.json');
  writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
  console.log('已寫出 ' + file + '（' + sorted.length + ' 條）');
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const flags = parsed.flags;
  const pos = parsed.pos;
  const cmd = pos[0];
  const lang = flags.lang && flags.lang !== true ? String(flags.lang) : 'zh-hk';
  const json = Boolean(flags.json);

  if (!cmd) {
    console.log('用法：node scripts/ref.mjs <command> [--lang zh-hk]');
    console.log('  list      [--age teen] [--archetype office] [--tone sassy] [--function insult]');
    console.log('            [--sd friend] [--register slang] [--tag 裝修,地盤] [--any-tag 踩,讚]');
    console.log('            [--max-prof 0] [--q 字] [--limit 20] [--json]');
    console.log('  search <字>        全文搜尋（講法／意思／例子）');
    console.log('  show <id>          睇一條詳細');
    console.log('  random  [-n 5]     隨機抽（可加 filter）');
    console.log('  stats              統計分佈');
    console.log('  tags               列出所有可用標籤（--values 睇實際 tag 分佈）');
    console.log('  validate           驗證整個語言語料庫');
    console.log('  check <file>       驗證單一 shard（寫稿時用）');
    console.log('  build              合併成 <lang>.all.json');
    console.log('  index              生成人讀索引（可 redirect 成 .md）');
    console.log('  sentences          列出所有對白句（--json／--csv；可 redirect 成檔案）');
    console.log('  markdown --by age  生成 markdown 表（age/archetype/tone/function）');
    console.log('  langs              列出所有語言語料庫');
    return;
  }

  if (cmd === 'langs') {
    const langs = langDirs();
    if (!langs.length) { console.log('（未有語料庫）'); return; }
    for (const l of langs) {
      let n = 0;
      try { n = loadLang(l).entries.length; } catch (e) { n = -1; }
      console.log(l + '\t' + n + ' 條');
    }
    return;
  }
  if (cmd === 'tags') {
    if (flags.values) {
      const all = loadLang(lang).entries;
      const m = {};
      all.forEach(function (e) { (e.tags || []).forEach(function (t) { m[t] = (m[t] || 0) + 1; }); });
      const parts = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).map(function (k) { return k + '=' + m[k]; });
      console.log('實際 tag（' + all.length + ' 條）：');
      console.log(parts.join('  '));
      return;
    }
    Object.keys(ENUMS).forEach(function (key) { console.log(pad(key, 15) + ENUMS[key].join(', ')); });
    console.log(pad('age-label', 15) + Object.keys(AGE_LABEL).map(function (k) { return k + '=' + AGE_LABEL[k]; }).join(', '));
    console.log(pad('tag-vocab', 15) + TAGS.join(', '));
    return;
  }
  if (cmd === 'stats') return cmdStats(lang);
  if (cmd === 'build') return cmdBuild(lang);
  if (cmd === 'index') return cmdIndex(lang);
  if (cmd === 'sentences') return cmdSentences(lang, json, Boolean(flags.csv));
  if (cmd === 'markdown') return cmdMarkdown(lang, flags.by);

  if (cmd === 'check') {
    if (!pos[1]) throw new Error('用法：ref.mjs check references/data/zh-hk/xxx.json');
    return cmdCheck(pos[1]);
  }

  if (cmd === 'validate') {
    const res = validateLang(lang);
    console.log('驗證 ' + lang + '：' + res.entries.length + ' 條　錯誤 ' + res.errors.length + '　警告 ' + res.warnings.length);
    res.errors.forEach(function (e) { console.log('  ✗ ' + e); });
    res.warnings.forEach(function (e) { console.log('  ! ' + e); });
    process.exitCode = res.errors.length ? 1 : 0;
    return;
  }

  if (cmd === 'show') {
    if (!pos[1]) throw new Error('用法：ref.mjs show <id>');
    const hits = loadLang(lang).entries.filter(function (e) { return e.id === pos[1]; });
    if (!hits.length) { console.log('搵唔到 id：' + pos[1]); process.exitCode = 1; return; }
    hits.forEach(printFull);
    return;
  }

  if (cmd === 'search') {
    if (!pos[1]) throw new Error('用法：ref.mjs search <字詞>');
    const f = Object.assign({}, flags, { q: pos[1] });
    printEntries(loadLang(lang).entries.filter(function (e) { return matches(e, f); }), json);
    return;
  }

  if (cmd === 'random') {
    const pool = loadLang(lang).entries.filter(function (e) { return matches(e, flags); });
    const n = Number(flags.limit || 5);
    const picked = pool.map(function (e) { return [Math.random(), e]; }).sort(function (a, b) { return a[0] - b[0]; })
      .slice(0, n).map(function (p) { return p[1]; });
    printEntries(picked, json);
    return;
  }

  if (cmd !== 'list') throw new Error('未知指令：' + cmd + '（可用：list search show random stats tags validate build markdown langs）');

  const hits = loadLang(lang).entries.filter(function (e) { return matches(e, flags); });
  const limit = Number(flags.limit || 0);
  printEntries(limit ? hits.slice(0, limit) : hits, json);
  if (!json) console.log('\n（' + hits.length + ' 條' + (limit && hits.length > limit ? '，顯示首 ' + limit : '') + '）');
}

try { main(); } catch (e) { console.error('錯誤：' + e.message); process.exitCode = 1; }
