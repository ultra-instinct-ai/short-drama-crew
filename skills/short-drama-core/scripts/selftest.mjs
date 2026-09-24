#!/usr/bin/env node
// short-drama selftest: no model calls, no credits. Every gate gets a breaking
// case — a gate that cannot fail is not a gate.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAMERAS, GATES, STAGES, STYLE_PRESETS,
  bindPath, claimedLines, containsName, cutStarts, dialogueSeconds, episodeSeconds,
  forbiddenNames, h3AlignmentLine, initProject, jaccard, lineSeconds, loadProject, makeContext, manifest,
  paramsOf, parseEpRange, promptSkeleton, renderCharacter, renderOutline, renderProp, renderScene, renderScript,
  renderSegment, runGates, seedScript, seedStoryboard, seedanceAnchors, slug, timestamp, writeJsonFile,
  wanLegendLine, wanSheetLegendLine, wanShotHeader, segmentReferences, imageReferences, audioReferences, voiceSamplePrompt, voiceSampleSeconds, nonWhitespace,
  speechDirection, cameraPhrase, lightPhrase, foregroundPhrase, focalOf, LIGHT_DIRECTIONS, identityOf, isEnglish,
  renderGuideline, renderDialogue, scriptSelfCheck, beatOffsets, turnPoints, parseAge, talkAndAction, normalizeRegister, REGISTERS, REGISTER_ACCENT,
  cutStart, segmentCharacters, keyScenes, shotTexts, motionSentence, cameraClause, PURPOSE_KINDS, ANGLES, HEIGHTS, NO_SUBTITLES, LIPS_CLOSED,
  audioPrompt, musicOf, cueSeconds, AUDIO_MODEL, AUDIO_MAX_CHARS,
  VIDEO_MODELS, VIDEO_MODES, DEFAULT_PARAMS, videoModel, videoResolutionFor, nearestResolution, segmentPlan, videoReferences,
  formatGates, displayName,
} from './short-drama.mjs';
import { spawnSync } from 'node:child_process';
import { copyFileSync, symlinkSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(here, '../examples/night-shift');
const PROJECT = JSON.parse(readFileSync(join(FIXTURE, 'project.json'), 'utf8'));
const E01 = JSON.parse(readFileSync(join(FIXTURE, 'episodes/E01.json'), 'utf8'));
const clone = (x) => structuredClone(x);

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
  // Foreground: named in the frame, said to be out of focus, and present on at least half the cuts.
  ok(foregroundPhrase(cut).includes('out of focus'), 'the foreground phrase says it is defocused');
  eq(foregroundPhrase({ foreground: '' }), '', 'a clean frame adds nothing');
  ok(foregroundPhrase({ foreground: '\u6536\u94f6\u53f0' }, 'zh').includes('\u524d\u666f'), 'the Chinese foreground phrase says 前景');
  const noFg = clone(E01); noFg.storyboard.segments[0].cuts.forEach((c) => { c.foreground = ''; });
  breaks('photography', PROJECT, noFg, 'no depth');
  const missingFg = clone(E01); delete missingFg.storyboard.segments[0].cuts[0].foreground;
  breaks('photography', PROJECT, missingFg, 'foreground is required');
  const unsaidFg = clone(E01); unsaidFg.storyboard.segments[0].cuts[0].frame = unsaidFg.storyboard.segments[0].cuts[0].frame.replace('the dripping edge of the striped awning', 'a wall');
  breaks('photography', PROJECT, unsaidFg, 'must name the foreground');
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
  const bed = audioPrompt(PROJECT, E01, seg5);
  eq(bed.mode, 'bed', 'the default track is a bed');
  eq(bed.model, AUDIO_MODEL, 'the soundtrack node is Seed Audio');
  ok(bed.prompt.startsWith('[0.0s:11.0s] Ambience, continuous: the low hum'), 'the bed opens with the timecoded ambience');
  ok(bed.prompt.includes('[6.0s:9.0s] SFX: a single ring of the brass wind chimes'), 'sfx are timecoded to their cut');
  ok(bed.prompt.includes('[6.0s:10.5s] the music swells — on the chime.') && bed.prompt.includes('[10.5s:11.0s] the music falls silent'), 'music cues become timecoded states');
  ok(bed.prompt.includes('No dialogue, no vocals, no narration.'), 'a bed carries no voices');
  eq(bed.references.length, 0, 'a bed references no voices');
  const full = audioPrompt(PROJECT, E01, E01.storyboard.segments[1], { mode: 'full' });
  eq(full.references.map((r) => r.label).join(','), '@Audio1,@Audio2', 'full mode references the speakers as @AudioN');
  ok(full.prompt.includes('[5.5s:7.1s] @Audio1 (the stocky man in his sixties with a grey crew cut), slow and gravelly'), 'a line is timecoded into its cut after the lead-in, in its voice and direction');
  ok(full.prompt.includes('says: 又是你值夜班。'), 'the line is verbatim');
  const noMusic = audioPrompt(PROJECT, E01, E01.storyboard.segments[0]);
  ok(noMusic.prompt.includes('No music.'), 'N/A music is stated');
  const md = renderSegment(PROJECT, E01, 'E01-05');
  ok(md.includes('## 音轨提示词（seed-audio-1.0 · bed · 11 s）') && md.includes('配乐：the low cello note（镜1 enter，镜3 swell，10.5s silence）'), 'segment markdown carries the soundtrack prompt and the cues');
  // gates
  const e = clone(E01); e.storyboard.segments[4].sound.music = { intent: '', cues: [] };
  breaks('sound', PROJECT, e, 'music.intent');
  const e2 = clone(E01); e2.storyboard.segments[4].sound.music.cues[0].do = 'explode';
  breaks('sound', PROJECT, e2, 'cues[0].do');
  const e3 = clone(E01); e3.storyboard.segments[4].sound.music.cues[0].at = '40s';
  breaks('sound', PROJECT, e3, 'inside the segment');
  const e4 = clone(E01); e4.storyboard.segments[4].sound.ambience = 'x'.repeat(AUDIO_MAX_CHARS);
  breaks('audio-track', PROJECT, e4, 'max 2048');
  const p = clone(PROJECT); p.params.audioTrack = 'full';
  p.characters.push({ id: 'C04', name: '路人', tier: 'functional', role: 'r', from: ['原创'], identityEn: 'a passer-by in a wet coat', voice: { videoDirection: 'flat' } });
  const e5 = clone(E01); e5.scenes[1].characters.push('C03', 'C04');
  e5.scenes[1].flow[9].speaker = 'C03'; e5.scenes[1].flow[10].speaker = 'C04';   // E01-03 now has four speakers
  ok(failures('audio-track', p, e5).some((m) => m.includes('at most 3 reference voices')), 'full mode refuses more than three speakers');
  const p2 = clone(PROJECT); p2.params.audioTrack = 'none';
  eq(failures('audio-track', p2, E01).length, 0, 'audioTrack none skips the gate');
  const p3 = clone(PROJECT); p3.params.audioTrack = 'stems';
  breaks('params', p3, null, 'audioTrack');
  const items = manifest(PROJECT, { 1: E01 });
  ok(items.some((i) => i.item === 'storyboard.segments.E01-01.wji.nodes.track'), 'manifest asks for the soundtrack node');
  ok(!manifest(p2, { 1: E01 }).some((i) => i.item.includes('.nodes.track')), 'audioTrack none asks for no soundtrack node');
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
  eq(GATES.length, 47, 'gate count');
  eq(GATES.filter((g) => !g.advisory).length, 44, 'hard gate count');
  eq(GATES.filter((g) => g.advisory).length, 3, 'advisory gate count');
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
  eq(rep.summary, '✓ 44 gate(s) passed, 3 advisory (0 notes)', 'fixture summary');
  eq(rep.failed, 0, 'nothing failed'); eq(rep.hard, 44, 'hard count'); eq(rep.advisory, 3, 'advisory count');
  eq(rep.lines.length, 0, 'a green run prints no gate lines');
  ok(rep.text.endsWith(rep.summary), 'text ends with the summary');
  const staged = formatGates(runGates(makeContext(PROJECT, {}), { stage: 'art' }), { stage: 'art' });
  ok(staged.summary.includes('(through art)'), 'staged summary names the stage');
  const all = formatGates(results, { all: true });
  ok(all.lines.length >= 47 && all.lines.some((l) => l.includes('(advisory)')), '--all lists every gate');
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
