#!/usr/bin/env node
// short-drama — deterministic tooling for the WJI short-drama pipeline.
// Zero dependencies; Node >= 20. Every rule that can be checked by code lives
// here as a gate so the agent loops until green instead of trusting itself.
//
//   init <dir> --title … --episodes N --minutes M --genre G [--ratio 9:16]
//            [--video h3|seedance|seedance2|seedance2fast|wan]   (decides the segment length — see VIDEO_MODELS)
//            [--resolution 480P|…] [--accent "台灣口音國語"] [--style photoreal|realistic|ghibli]
//            [--references sheets|keyframes] [--duration auto|fixed] [--look "shallow depth of field"] [--lang zh] [--adapt 原創]
//            [--register 台湾国语]                                      (语体 — decides how lines are written and the accent spoken)
//            [--image-lang en|zh]                                       (language of the character / scene / prop image prompts)
//   validate <project> [--stage outline|characters|art|script|storyboard] [--ep 1-3]
//   checkup  <project> [--stage …] [--ep …]            every gate with ✓/✗, exit 0
//   seed     <project> script --ep N [--force]        episodes/E0N.json skeleton from the outline
//   seed     <project> storyboard --ep N [--force]    beat worksheet, visual-plan worksheet + empty segments from the script
//   render   <project> outline | guideline | character C01 | scene S01 | prop P01 | script --ep N | dialogue --ep N | segment E01-01
//   prompt   <project> segment E01-01                 derived video-prompt skeleton + keyframe reference plan
//   prompt   <project> voice C01                       the acted sample text for the voice node
//   prompt   <project> image C01|S01|P01 [--asset headshot|sheet|lighting:<state>|state:<state>] [--json]
//                                                      the image node's prompt, in params.imagePromptLang (+ negative, ratio, reference)
//   prompt   <project> audio E01-01 [--full]          the segment's Seed Audio soundtrack prompt (timecoded ambience / sfx / music, + lines with --full)
//   manifest <project> [--stage …] [--ep N]           unbound WJI objects, in execution order
//   bind     <project> [--ep N] <path> <value>        write a WJI id back (path segments may be entity ids)
//   slug     <name>

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── constants ───────────────────────────────────────────────────────────────

export const VERSION = 1;

export const DEFAULT_PARAMS = Object.freeze({
  ratio: '9:16',
  video: 'h3',
  style: 'realistic',
  adaptMode: '原创',
  charsPerSecond: 4.5,
  speechCharsPerSecond: 2.4,
  voiceSampleSeconds: [3, 5],
  actionSeconds: 2.5,
  tolerance: 0.15,
  maxLineChars: 35,
  hookWindow: 3,
  minSegmentSeconds: 5,
  maxSegmentSeconds: 15,
  maxAudioRefs: 3,
  maxVideoRefs: 3,
  videoReferences: 'none',
  videoResolution: '720P',
  speechAccent: '',
  // The production's camera package. Every frame prompt names it, so two shots cut together.
  camera: { body: 'ARRI ALEXA Mini LF', lens: 'Zeiss Supreme Prime', aperture: 'T1.5' },
  references: 'sheets',
  humanReferences: true,
  voiceSamples: true,
  videoDuration: 'auto',
  lookPhrase: '',
  lookPhraseZh: '',
  // The language of the character / scene / prop image prompts (sheets, headshots, lighting and
  // prop states): `en`, or `zh` when the image model takes Chinese and the crew wants to read them.
  imagePromptLang: 'en',
  minCutSeconds: 2,
  maxCutSeconds: 5,
  maxOnScreen: 3,
  // Screenplay craft: the rhythm a 短剧 episode is held to.
  register: '',
  hookSeconds: 15,
  turnSeconds: 30,
  maxConsecutiveLines: 3,
  minActionRatio: 0.35,
  maxNameCallsPerScene: 2,
  maxLineWords: 20,
  // Shot language.
  speechLeadSeconds: 0.5,
  subtitles: false,
  maxFrameChars: 900,
  // A Seed Audio node per segment: the soundtrack bed by default (ambience, sfx, timed music).
  audioTrack: 'bed',
  // Scene-boundary contrast: last K cuts of scene N vs first K of scene N+1 (gate boundary-contrast).
  boundaryContrastCuts: 2,
  thresholds: { maxLeads: 5, maxSupport: 10, maxFunctional: 10, maxBeatGap: 3, maxProps: 8 },
});

export const TIERS = ['lead', 'support', 'functional'];
export const ADAPT_MODES = ['原创', '忠实', '抽核', '借壳'];
export const VIDEO_MODES = ['h3', 'seedance', 'seedance2', 'seedance2fast', 'wan'];
/**
 * Per-mode video model + the provider's hard limits, read off the backend model forms.
 * `family` picks the prompt dialect (three of the five share Seedance's `@imageN` dialect), `min/maxSegmentSeconds`
 * is the duration range the provider accepts — **it is what decides how long a segment may be, so the
 * plot is cut to the model, not the other way round** — and every one of them takes whole seconds only.
 */
export const VIDEO_MODELS = {
  h3: {
    model: 'minimax-h3-ref', family: 'h3', promptLang: 'en',
    minSegmentSeconds: 5, maxSegmentSeconds: 15, maxRefs: 9, maxAudioRefs: 3, maxVideoRefs: 3, maxRefVideoSeconds: 15, autoDuration: false,
    resolutions: ['480P', '768P', '2K', '4K'],
  },
  seedance: {
    model: 'seedance-2.5-ref', family: 'seedance', promptLang: 'en',
    minSegmentSeconds: 4, maxSegmentSeconds: 30, maxRefs: 30, maxAudioRefs: 10, maxVideoRefs: 10, maxRefVideoSeconds: 30, autoDuration: true,
    resolutions: ['480p', '720p', '1080p'],
  },
  seedance2: {
    model: 'seedance-2.0-ref', family: 'seedance', promptLang: 'en',
    minSegmentSeconds: 4, maxSegmentSeconds: 15, maxRefs: 9, maxAudioRefs: 3, maxVideoRefs: 3, maxRefVideoSeconds: 15, autoDuration: true,
    resolutions: ['480p', '720p', '1080p', '4k'],
  },
  seedance2fast: {
    model: 'seedance-2.0-fast-ref', family: 'seedance', promptLang: 'en',
    minSegmentSeconds: 4, maxSegmentSeconds: 15, maxRefs: 9, maxAudioRefs: 3, maxVideoRefs: 3, maxRefVideoSeconds: 15, autoDuration: true,
    resolutions: ['480p', '720p'],
  },
  wan: {
    model: 'wan-3.0-ref', family: 'wan', promptLang: 'zh',
    minSegmentSeconds: 2, maxSegmentSeconds: 30, maxRefs: 10, maxAudioRefs: 5, maxVideoRefs: 5, maxRefVideoSeconds: 15, autoDuration: true,
    resolutions: ['480P', '720P', '1080P'],
  },
};
/** The mode's own table, defaulting to h3's — every lookup goes through this. */
export function videoModel(params) {
  return VIDEO_MODELS[params?.video] || VIDEO_MODELS.h3;
}
/** The provider's spelling of a resolution (480P vs 480p vs 4K), or null when the model has no such tier. */
export function videoResolutionFor(mode, wanted) {
  const want = String(wanted || '').toLowerCase();
  return (mode.resolutions || []).find((r) => r.toLowerCase() === want) || null;
}

/**
 * The tier to start a project on: the wanted one when the model has it, else the closest by height
 * (h3 has no 720P, and its 768P is far nearer than dropping to 480P). Named tiers like 2K/4K only
 * win when nothing numeric is on offer.
 */
export function nearestResolution(mode, wanted) {
  const exact = videoResolutionFor(mode, wanted);
  if (exact) return exact;
  const height = (r) => Number(String(r).match(/^(\d+)/)?.[1] ?? NaN);
  const want = height(wanted);
  const numeric = (mode.resolutions || []).filter((r) => Number.isFinite(height(r)));
  if (!numeric.length || !Number.isFinite(want)) return (mode.resolutions || [])[0];
  return numeric.reduce((best, r) => (Math.abs(height(r) - want) < Math.abs(height(best) - want) ? r : best));
}
/** What the video node references: one generated keyframe per cut, or the sheets themselves (no keyframe images). */
export const REFERENCE_MODES = ['keyframes', 'sheets'];
/** TTS model for the character voice sample; it takes the headshot as its one reference image. */
export const VOICE_MODEL = 'seed-audio-1.0';
/**
 * The same model is a full audio-scene generator, not a TTS: one prompt gives speech, sound effects,
 * ambience and music in one track, up to 120 s, and a `[start s:end s]` timecode in front of an
 * element pins it to that interval (100 ms precision). Up to 3 reference audios (`@Audio1..3`) or one
 * reference image — never both. Prompt ≤ 2048 characters.
 */
export const AUDIO_MODEL = VOICE_MODEL;
export const AUDIO_MAX_SECONDS = 120;
export const AUDIO_MAX_CHARS = 2048;
export const AUDIO_MAX_REFS = 3;
/** What the per-segment audio node generates: nothing, a bed (ambience + sfx + music) or the full track with the lines. */
export const AUDIO_TRACK_MODES = ['none', 'bed', 'full'];
/** What the music does at a cue point. */
export const MUSIC_CUES = ['enter', 'swell', 'duck', 'drop', 'silence', 'out'];
/** `fixed` passes `-d` = Σ cut seconds; `auto` leaves it off and lets the model match the prompt. */
export const DURATION_MODES = ['fixed', 'auto'];
/**
 * What a segment references as `@videoN`. `previous` hands the model the clip before it, which is
 * how a series of separate generations keeps one look: wardrobe, grade, lens feel and the way people
 * move carry over instead of being re-invented per clip. `none` leaves the sheets to do that alone.
 */
export const VIDEO_REFERENCE_MODES = ['none', 'previous'];
export const IMAGE_PROMPT_LANGS = ['en', 'zh'];

// ── screenplay craft (from the w-short-drama-editor / character-creator / dialogue-editor method) ──

/** 語體 — the spoken register of the drama. Simplified spellings are canonical; the traditional ones are accepted. */
export const REGISTERS = ['粤语', '大陆普通话', '台湾国语', '港式普通话', '古装', '年代', '英文美式', '英文英式'];
const REGISTER_ALIASES = { '粵語': '粤语', '大陸普通話': '大陆普通话', '台灣國語': '台湾国语', '港式普通話': '港式普通话', '古裝': '古装' };
/** The accent a video model is told to speak in, when `params.speechAccent` is left empty. */
export const REGISTER_ACCENT = {
  '粤语': { zh: '粤语', en: 'Cantonese' },
  '大陆普通话': { zh: '标准普通话', en: 'standard Mandarin' },
  '台湾国语': { zh: '台湾口音国语', en: 'Taiwanese-accented Mandarin' },
  '港式普通话': { zh: '港式普通话', en: 'Hong Kong-accented Mandarin' },
  '古装': { zh: '标准普通话', en: 'standard Mandarin' },
  '年代': { zh: '标准普通话', en: 'standard Mandarin' },
  '英文美式': { zh: '美式英语', en: 'American English' },
  '英文英式': { zh: '英式英语', en: 'British English' },
};
export function normalizeRegister(value) {
  const v = String(value || '').trim();
  return REGISTER_ALIASES[v] || v;
}
/** 本集功能 — what an episode is for in the run of the drama. */
export const EPISODE_FUNCTIONS = ['开局钩子', '冲突升级', '身份揭露', '情感推进', '大反转', '清算收束'];
/** 爽点类型库 — a 爽点 is done by a visible action of one of these kinds. */
export const SATISFACTION_TYPES = ['打脸', '复仇', '强宠', '身份揭露', '智商碾压', '情感释放'];
/** 钩子类型库 — what the last beat pushes into the next episode. */
export const HOOK_TYPES = ['身份', '危机', '结果', '情感', '反转', '道具'];
/** 三段结构 — 黄金窗口 / 发展升级 / 高潮收束, in this order. */
export const PHASES = ['golden', 'escalation', 'climax'];
export const PHASE_LABELS = { golden: '黄金窗口期', escalation: '发展升级期', climax: '高潮收束期' };
/** 剧情功能 of a character in the story (not their tier). */
export const CHARACTER_FUNCTIONS = ['主角', '共同主角', '反派', '爱情线', '导师', '盟友', '镜像', '压力测试者', '喜剧调节'];
/** The six stages of a character arc. */
export const ARC_STAGES = ['开场', '第一转折', '中段', '低谷', '高潮选择', '结局'];
/** Prose that cannot be filmed: thoughts, memories, feelings without a body. */
export const NOVELISTIC_WORDS = ['心想', '心里想', '心裏想', '内心', '內心', '她知道自己', '他知道自己', '回忆起', '回憶起', '脑海', '腦海', '感到无比', '感到無比', '多年的委屈', '说不出的', '說不出的', '难以言喻', '難以言喻', '无法言喻', '無法言喻'];
/** An emotion word on its own is not a direction an actor can play. */
export const EMOTION_ONLY = ['生气', '生氣', '伤心', '傷心', '激动', '激動', '开心', '開心', '难过', '難過', '害怕', '愤怒', '憤怒', '悲伤', '悲傷'];
/** Characters that only occur in written Cantonese — a line with one of these is Cantonese, whatever the register says. */
export const CANTONESE_MARKERS = ['咗', '嘅', '唔', '冇', '哋', '喺', '嚟', '嗰', '啲', '咁', '乜', '佢', '睇', '諗', '咩', '梗', '畀'];
/** Words that break a 古装 / 年代 world in one line. */
export const MODERN_WORDS = ['OK', '没问题', '沒問題', '搞定', '紧张', '緊張', '压力', '壓力', '约会', '約會', '上班', '项目', '項目', '团队', '團隊', '套路', '打卡', '拉黑'];
/** 网络用语 — fine on a twenty-year-old, wrong on a sixty-year-old or in 古装. */
export const NETSLANG = ['卧槽', '臥槽', '绝了', '絕了', '破防', 'emo', '整活', '麻了', '家人们', '家人們', '芭比Q', '笑死', '栓Q', '躺平', '内卷', '內卷', 'yyds', '绝绝子', '絕絕子'];
/** Inferred inner state — a camera cannot film "seems to". */
export const INFERENCE_WORDS = ['像是', '似乎', '仿佛', '彷彿', '忽然明白', '意识到', '意識到', 'seems to', 'seem to', 'as if', 'appears to', 'appear to', 'realizes', 'realises', 'realising', 'realizing'];
/** Hand verbs — more than three in one beat is choreography a video model will not perform. */
export const HAND_VERBS_ZH = ['拿', '放', '递', '遞', '接', '握', '翻', '扣', '推', '拉', '撕', '摸', '抓', '掏', '塞', '举', '舉', '捏', '拧', '擰'];
export const HAND_VERBS_EN = ['grab', 'grabs', 'take', 'takes', 'hand', 'hands', 'pass', 'passes', 'hold', 'holds', 'flip', 'flips', 'press', 'presses', 'push', 'pushes', 'pull', 'pulls', 'tear', 'tears', 'pick', 'picks', 'clutch', 'clutches', 'twist', 'twists'];

// ── shot language (from the short-drama-storyboard / short-drama-video-prompts method) ──

/** 镜头职责 — why this cut exists; a cut that changes nothing for the audience is not a cut. */
export const PURPOSE_KINDS = ['establish', 'reveal', 'evidence', 'reaction', 'pressure', 'decision', 'consequence', 'performance', 'transition'];
/** The kinds that can carry a turn, a 爽点 or the cliff on their own. */
export const TURN_KINDS = ['reveal', 'evidence', 'decision', 'consequence'];
export const CLIFF_KINDS = ['reveal', 'consequence', 'reaction', 'pressure'];
/** Horizontal angle — how much of the face the audience is allowed to read, and whose side they stand on. */
export const ANGLES = ['front', 'three-quarter', 'profile', 'rear-three-quarter', 'back'];
export const ANGLES_ZH = { front: '正面', 'three-quarter': '斜侧', profile: '正侧', 'rear-three-quarter': '后斜侧', back: '背面' };
/** Camera height — who is bigger than whom in this instant; `eye` is a choice, not an unset field. */
export const HEIGHTS = ['ground', 'low', 'eye', 'high', 'top'];
export const HEIGHTS_ZH = { ground: '地平', low: '低（仰）', eye: '平视', high: '高（俯）', top: '顶视' };
/** Which side of the 轴线 the camera is on. */
export const AXIS_SIDES = ['working', 'cross', 'neutral'];
/** Where a person faces, in screen terms — bare left / right always means the screen's. */
export const FACINGS = ['screen-left', 'screen-right', 'camera', 'away'];
/** Why the camera moves — or deliberately does not. */
export const CAMERA_MOTIVATIONS = ['reveal', 'pressure', 'alignment', 'relationship', 'transition', 'stillness'];
/** The size ladder, for "how many steps did this cut jump". */
export const SIZE_ORDER = ['extreme-wide', 'wide', 'medium', 'close', 'extreme-close'];
/** Words that describe a sequence, which a frozen frame cannot hold. */
export const SEQUENCE_WORDS_EN = ['then', 'before', 'after that', 'afterwards', 'begins to', 'starts to', 'next,', 'finally', 'first,'];
export const SEQUENCE_WORDS_ZH = ['先', '再', '随后', '隨後', '然后', '然後', '最终', '最終', '接着', '接著', '之后', '之後'];
/** Boundary fields a cut's start / end must carry per on-screen character. */
export const BOUNDARY_FIELDS = ['positions', 'facing', 'hands', 'heldProps'];
/** The subtitles-off sentence per prompt language — same-pass models render captions unless told not to. */
export const NO_SUBTITLES = { en: 'no subtitles, no captions, no on-screen dialogue text', zh: '全程无字幕' };
/** The H3 idiom for the person on screen who is not the one speaking. */
export const LIPS_CLOSED = 'lips remain completely closed';
export const WARNINGS = ['雨戏', '肢体接触', '人群', '手部特写'];
export const PROP_SCALES = { handheld: 'handheld scale', tabletop: 'tabletop scale', furniture: 'furniture scale' };
export const PROP_SCALES_ZH = { handheld: '手持尺寸', tabletop: '桌面尺寸', furniture: '大件尺寸' };
export const SIZES = {
  'extreme-wide': 'extreme wide shot',
  wide: 'wide shot',
  medium: 'medium shot',
  close: 'close-up',
  'extreme-close': 'extreme close-up',
};
/** Chinese shot-size words for `wan` prompts (Wan 3.0 is prompted in Chinese). */
export const SIZES_ZH = {
  'extreme-wide': '大远景',
  wide: '远景',
  medium: '中景',
  close: '特写',
  'extreme-close': '大特写',
};
/** Focal length a shot size is normally covered with, used when a cut does not name one. */
export const FOCAL_BY_SIZE = {
  'extreme-wide': '18mm',
  wide: '25mm',
  medium: '40mm',
  close: '75mm',
  'extreme-close': '100mm macro',
};
/**
 * Where the key light sits **relative to the camera**, not to the room — the same lamp is a rim
 * light from one side of the axis and a key from the other, so it has to be named per shot.
 */
export const LIGHT_DIRECTIONS = {
  frontal: 'keyed frontally from the camera axis',
  'front-left': 'keyed three-quarter from camera left',
  'front-right': 'keyed three-quarter from camera right',
  'side-left': 'keyed from hard camera left, across the face',
  'side-right': 'keyed from hard camera right, across the face',
  'back-left': 'rim-lit from behind camera left',
  'back-right': 'rim-lit from behind camera right',
  backlight: 'backlit from directly behind the subject',
  top: 'keyed from directly above',
  underlight: 'lit from below the eyeline',
  ambient: 'lit by soft ambient bounce with no single key',
};
export const LIGHT_DIRECTIONS_ZH = {
  frontal: '\u987a\u5149\uff0c\u5149\u6e90\u5728\u955c\u5934\u8f74\u4e0a',
  'front-left': '\u524d\u4fa7\u5149\uff0c\u6765\u81ea\u955c\u5934\u5de6\u524d\u65b9\u56db\u5341\u4e94\u5ea6',
  'front-right': '\u524d\u4fa7\u5149\uff0c\u6765\u81ea\u955c\u5934\u53f3\u524d\u65b9\u56db\u5341\u4e94\u5ea6',
  'side-left': '\u4fa7\u5149\uff0c\u6765\u81ea\u955c\u5934\u6b63\u5de6\u65b9',
  'side-right': '\u4fa7\u5149\uff0c\u6765\u81ea\u955c\u5934\u6b63\u53f3\u65b9',
  'back-left': '\u9006\u4fa7\u5149\uff0c\u6765\u81ea\u955c\u5934\u5de6\u540e\u65b9\u52fe\u8fb9',
  'back-right': '\u9006\u4fa7\u5149\uff0c\u6765\u81ea\u955c\u5934\u53f3\u540e\u65b9\u52fe\u8fb9',
  backlight: '\u6b63\u9006\u5149\uff0c\u5149\u6e90\u5728\u4e3b\u4f53\u6b63\u540e\u65b9',
  top: '\u9876\u5149\uff0c\u6765\u81ea\u6b63\u4e0a\u65b9',
  underlight: '\u5e95\u5149\uff0c\u4f4e\u4e8e\u89c6\u7ebf',
  ambient: '\u73af\u5883\u6f2b\u5c04\u5149\uff0c\u6ca1\u6709\u5355\u4e00\u4e3b\u5149',
};

/** The focal this cut is shot on — its own, or the one its shot size implies. */
export function focalOf(cut) {
  return String(cut?.focal || FOCAL_BY_SIZE[cut?.size] || '').trim();
}

/**
 * `shot on an ARRI ALEXA Mini LF with a Zeiss Supreme Prime 75mm at T1.5` — body, lens and stop in
 * one phrase, gated verbatim in the cut's frame prompt. The stop is what buys the shallow focus the
 * foreground blur depends on, so it travels with the lens rather than living in `lookPhrase`.
 */
export function cameraPhrase(cut, params, lang = 'en') {
  const kit = (params && params.camera) || DEFAULT_PARAMS.camera;
  const focal = focalOf(cut);
  const stop = String(cut?.aperture || kit.aperture || '').trim();
  if (lang === 'zh') return `${kit.body} \u914d ${kit.lens} ${focal}\uff0c${stop} \u5149\u5708`;
  return `shot on ${article(kit.body)} ${kit.body} with ${article(kit.lens)} ${kit.lens} ${focal} at ${stop}`;
}

function article(word) {
  return /^[aeiou]/i.test(String(word).trim()) ? 'an' : 'a';
}

/** `keyed three-quarter from camera left` + what the light does over the cut. */
export function lightPhrase(cut, lang = 'en') {
  const dir = cut?.light?.direction;
  const table = lang === 'zh' ? LIGHT_DIRECTIONS_ZH : LIGHT_DIRECTIONS;
  const head = table[dir] || '';
  const note = String(cut?.light?.note || '').trim();
  return [head, note].filter(Boolean).join(lang === 'zh' ? '\uff0c' : ', ');
}

/**
 * How this character speaks, for a video prompt's dialogue line: the compact English
 * `voice.videoDirection` (or the drama-language voice fields for a Chinese prompt), plus the beat's
 * own `delivery`. The video model gets the same performance note the voice sample was built from,
 * so a clip's reading matches the character rather than the model's default newsreader.
 */
/** A beat's acting note, but only when it is written in the language the prompt is written in. */
function beatDelivery(delivery, promptLang) {
  const text = String(delivery || '').trim();
  if (!text) return '';
  return promptLang === 'zh' || promptLang === 'zh-note' || isEnglish(text) ? text : '';
}

/**
 * `lang` null means: the character has already been described in this segment, so only the beat's
 * own note is added and the timbre is carried by the `@audioN` label.
 */
export function speechDirection(character, delivery, lang = 'en') {
  const v = character?.voice || {};
  const bits = [];
  // `lang === null`: this character was already described in this segment, so only the beat's own
  // note is added — the @audioN label carries the timbre.
  if (lang === null || lang === 'zh-note') return beatDelivery(delivery, lang === 'zh-note' ? 'zh' : 'en');
  if (lang === 'zh') {
    for (const key of ['timbre', 'pace', 'accent', 'emotion']) if (v[key]) bits.push(String(v[key]).trim());
  } else if (v.videoDirection) {
    bits.push(String(v.videoDirection).trim());
  }
  const extra = beatDelivery(delivery, lang);
  if (extra) bits.push(extra);
  return bits.join(lang === 'zh' ? '\uff0c' : ', ');
}

/**
 * The blurred thing between the lens and the subject. Depth needs something to be shallow against,
 * so a cut names one and the prompt says it is out of focus; an empty `foreground` is a deliberate
 * clean frame and the gate limits how many of those a segment may have.
 */
export function foregroundPhrase(cut, lang = 'en') {
  const fg = String(cut?.foreground || '').trim();
  if (!fg) return '';
  return lang === 'zh' ? ` \u524d\u666f\u6709${fg}\uff0c\u865a\u5316\u6210\u6a21\u7cca\u7684\u524d\u666f\u906e\u6321\u3002` : ` ${fg} sits in the immediate foreground, thrown well out of focus.`;
}

/**
 * `On <trigger>, <action>; <result>.` — the cut's 起点 → 唯一动作 → 终点 as one sentence, the part of
 * the prompt that says what happens over the seconds (the frame only says how it starts).
 */
export function motionSentence(cut, lang = 'en') {
  const m = isObject(cut?.motion) ? cut.motion : {};
  const t = String(m.trigger || '…').trim(), a = String(m.action || '…').trim(), r = String(m.result || '…').trim();
  if (lang === 'zh') return `触发：${t}；动作：${a}；终点：${r}。`;
  return `Cue: ${t}. Action: ${a}. End: ${r}.`;
}

/**
 * A lock-off is written (what still moves, held), a move is written (why, when, along what, ending
 * where) — an empty camera line is read by the model as permission to drift.
 */
export function cameraClause(cut, lang = 'en') {
  const cn = isObject(cut?.cameraNote) ? cut.cameraNote : {};
  const move = cut?.camera && cut.camera !== 'Static Shot';
  if (lang === 'zh') {
    if (!move) return `固定机位：${cn.hold || '…'}。`;
    return `${CAMERAS_ZH[cut.camera] || cut.camera}：${cn.trigger || '…'}时${cn.path || '…'}，止于${cn.endFraming || '…'}。`;
  }
  if (!move) return `The camera holds; ${cn.hold || '…'}.`;
  return `${cut.camera} (${cn.motivation || '\u2026'}), ${cn.trigger || '\u2026'}: ${cn.path || '\u2026'}, ending on ${cn.endFraming || '\u2026'}.`;
}

/** The name-free way a prompt refers to a person: their own short English identity. */
export function identityOf(character) {
  return String(character?.identityEn || '').trim() || 'the person in this shot';
}

export const CAMERAS = [
  'Static Shot', 'Push In', 'Pull Out', 'Zoom In', 'Zoom Out', 'Pan Left', 'Pan Right',
  'Truck Left', 'Truck Right', 'Tilt Up', 'Tilt Down', 'Pedestal Up', 'Pedestal Down',
  'Arc Shot', 'Tracking Shot', 'Shake Slightly', 'Shake Strongly', 'POV',
  'Roll Clockwise', 'Roll Counterclockwise',
];
/** Chinese camera words for `wan` prompts — same 20 moves, one canonical translation each. */
export const CAMERAS_ZH = {
  'Static Shot': '固定镜头', 'Push In': '推近', 'Pull Out': '拉远', 'Zoom In': '变焦推近',
  'Zoom Out': '变焦拉远', 'Pan Left': '向左摇镜', 'Pan Right': '向右摇镜', 'Truck Left': '向左平移',
  'Truck Right': '向右平移', 'Tilt Up': '上摇', 'Tilt Down': '下摇', 'Pedestal Up': '升镜',
  'Pedestal Down': '降镜', 'Arc Shot': '环绕', 'Tracking Shot': '跟拍', 'Shake Slightly': '轻微手持晃动',
  'Shake Strongly': '强烈晃动', 'POV': '主观视角', 'Roll Clockwise': '顺时针旋转',
  'Roll Counterclockwise': '逆时针旋转',
};

/** One style for the whole drama. `framePhrase` must be in every keyframe prompt; `render` in every sheet. */
export const STYLE_PRESETS = {
  realistic: {
    label: 'semi-realistic painterly',
    render: 'semi-realistic character illustration, painterly rendering with soft blended edges and visible brush texture, anatomically grounded',
    framePhrase: 'cinematic film still',
    videoPhrase: 'semi-realistic painterly cinematic footage',
    negativeMustNot: ['photorealistic', '3d render'],
    negativeMust: [],
    tags: ['semi-realistic', 'painterly', 'cinematic'],
    renderZh: '半写实角色插画，绘画质感，笔触柔和融合并带可见的笔刷肌理，解剖结构扎实',
    framePhraseZh: '电影剧照',
    negativeMustNotZh: ['照片级', '真人', '3d渲染'],
    negativeMustZh: [],
  },
  photoreal: {
    label: 'photographic live-action',
    render: 'photorealistic live-action reference photography, natural skin texture with visible pores and fine hair, fabric with real weave and wear, neutral film colour grade',
    framePhrase: 'photorealistic cinematic film still',
    videoPhrase: 'photorealistic live-action cinematography',
    negativeMustNot: ['photorealistic', 'film grain', 'skin texture'],
    negativeMust: ['illustration', 'anime', 'cartoon'],
    tags: ['photoreal', 'live action', 'cinematic'],
    renderZh: '真人实拍参考摄影，皮肤可见毛孔与细绒毛，布料有真实织纹与磨损，中性电影调色',
    framePhraseZh: '照片级写实电影剧照',
    negativeMustNotZh: ['照片级', '胶片颗粒', '皮肤纹理'],
    negativeMustZh: ['插画', '动漫', '卡通'],
  },
  soft3d: {
    label: 'soft clay-toy 3D animation',
    render: 'soft matte clay-toy 3D render, smooth poreless surfaces with a gentle waxy subsurface glow, hair sculpted as one solid rounded mass with simple carved shapes rather than individual strands, very simplified facial features with small dark oval or closed curved-line eyes, a tiny nose with no nostrils and a small simple mouth line, round soft blush patches on the cheeks, chunky rounded simplified limbs and mitten-like hands, toy-like proportions with a large head, soft global illumination with gentle ambient occlusion and almost no hard shadows, muted warm palette on a plain cream background',
    framePhrase: 'soft clay-toy 3d animated film still',
    videoPhrase: 'soft matte clay-toy 3D animated footage',
    negativeMustNot: ['3d render', 'cgi', 'stylized', 'clay', 'matte', 'toy', 'simplified'],
    negativeMust: ['photorealistic'],
    tags: ['3d animation', 'clay render', 'soft toy style', 'kids tv'],
    renderZh: '柔和哑光的黏土玩具风格三维渲染，表面光滑无毛孔，发型是一整块圆润的造型，五官极简，四肢圆胖，大头身比，柔和全局光',
    framePhraseZh: '黏土动画电影剧照',
    negativeMustNotZh: ['3d渲染', 'cg', '风格化', '黏土', '哑光', '玩具', '简化'],
    negativeMustZh: ['照片级'],
  },
  disney3d: {
    label: 'Disney/Pixar-style 3D animation',
    render: 'stylized 3D CG animation rendered in the look of a modern Disney and Pixar feature film, appealing rounded shape language, large expressive eyes, subsurface-scattering skin, soft cloth and hair simulation, clean physically-based shading with warm cinematic key light and rim light',
    framePhrase: 'stylized 3d animated film still',
    videoPhrase: 'stylized Disney and Pixar style 3D animated footage',
    negativeMustNot: ['3d render', 'cgi', 'stylized', 'cartoon'],
    negativeMust: ['photorealistic'],
    tags: ['3d animation', 'disney pixar style', 'family', 'cinematic'],
    renderZh: '迪士尼与皮克斯长片风格的三维动画，圆润讨喜的造型语言，大而传神的眼睛，次表面散射皮肤，温暖的电影主光与轮廓光',
    framePhraseZh: '三维动画电影剧照',
    negativeMustNotZh: ['3d渲染', 'cg', '风格化', '卡通'],
    negativeMustZh: ['照片级'],
  },
  ghibli: {
    label: 'hand-painted anime',
    render: 'hand-painted cel animation in the style of a classic Japanese animation film, clean line art, flat colour with soft watercolour backgrounds',
    framePhrase: 'hand-painted anime film still',
    videoPhrase: 'hand-painted anime footage',
    negativeMustNot: [],
    negativeMust: ['photorealistic'],
    tags: ['anime', 'cel shading', 'hand-painted'],
    renderZh: '日本经典动画电影风格的手绘赛璐璐动画，干净线稿，平涂色彩配柔和水彩背景',
    framePhraseZh: '手绘动画电影剧照',
    negativeMustNotZh: [],
    negativeMustZh: ['照片级'],
  },
};

// Traditional → simplified for the characters the Chinese image-prompt rules look for, so a crew
// writing 繁體 (真人實拍參考攝影, 純白背景, 東亞) passes the same checks as one writing 简体.
const ZH_T = '實參攝寫繪畫質膚絨織紋損調級動風簡賽顆東亞漢華國韓歐維紀時當現戰無場沒純圖臉須髮還間構變燈樣與體條機啞寬細電影剛劇個們來這為後從歲種頭於將兩裡進遠擊衛萬處滿點眾邊師張長門開關問員陽陰雲書幾話鐵號專業輕壓環題顏鏡區鬥創標誌劃會戲網際聲氣態網雜淺濃暗餘濕黃綠藍紅寫臨團鄉樓廳櫃燈廢廠館護殘獨帶膠鮮爾歷羅陸屬樂傳麗貴壯';
const ZH_S = '实参摄写绘画质肤绒织纹损调级动风简赛颗东亚汉华国韩欧维纪时当现战无场没纯图脸须发还间构变灯样与体条机哑宽细电影刚剧个们来这为后从岁种头于将两里进远击卫万处满点众边师张长门开关问员阳阴云书几话铁号专业轻压环题颜镜区斗创标志划会戏网际声气态网杂浅浓暗余湿黄绿蓝红写临团乡楼厅柜灯废厂馆护残独带胶鲜尔历罗陆属乐传丽贵壮';
const ZH_FOLD = new Map([...ZH_T].map((ch, i) => [ch, ZH_S[i]]));
export function foldZh(text) {
  return [...String(text ?? '')].map((ch) => ZH_FOLD.get(ch) || ch).join('').toLowerCase();
}

const ZH_ETHNICITY_RE = /(东亚|亚洲|亚裔|汉族|华人|中国|日本|韩国|朝鲜|欧洲|白人|黑人|非洲|拉丁|中东|阿拉伯|南亚|东南亚|混血|蒙古|藏族|维吾尔|鲜卑|匈奴|胡人|西域|印度)/;
// whole era words only — a bare 明 / 清 / 元 would match 明亮 / 清晰 / 元素
const ZH_ERA_RE = /(年代|世纪|时期|当代|现代|古代|近代|公元|未来|中世纪|维多利亚|民国|春秋|战国|先秦|秦朝|秦代|秦末|西汉|东汉|汉朝|汉代|汉初|汉末|三国|西晋|东晋|晋朝|南北朝|北魏|北齐|北周|南朝|隋朝|隋代|隋末|唐朝|唐代|初唐|盛唐|晚唐|五代|宋朝|宋代|北宋|南宋|元朝|元代|明朝|明代|明末|清朝|清代|晚清)/;

// the checked part of a Chinese render phrase: up to its first comma, at most 8 characters
const renderKeyZh = (preset) => preset.renderZh.split('，')[0].slice(0, 8);

/** The rules the image-prompt gates apply, in the project's image-prompt language. */
export function imagePromptKit(params) {
  const zh = params.imagePromptLang === 'zh';
  const preset = STYLE_PRESETS[params.style] || STYLE_PRESETS.realistic;
  const has = (text, word) => (zh ? foldZh(text).includes(foldZh(word)) : String(text ?? '').toLowerCase().includes(String(word).toLowerCase()));
  return {
    zh,
    label: zh ? 'Chinese' : 'English',
    inLang: (text) => (zh ? CJK_RE.test(String(text ?? '')) : isEnglish(text)),
    ethnicity: (text) => (zh ? ZH_ETHNICITY_RE.test(foldZh(text)) : ETHNICITY_RE.test(String(text ?? ''))),
    era: (text) => (zh ? ZH_ERA_RE.test(foldZh(text)) : ERA_RE.test(String(text ?? ''))),
    sheetRatio: (text) => /16\s*[:：]\s*9/.test(String(text ?? '')),
    // the style's render phrase — its first 30 characters in English, up to 8 before the first comma in Chinese
    render: zh ? preset.renderZh : preset.render,
    renderKey: zh ? renderKeyZh(preset) : preset.render.slice(0, 30),
    hasRender: (text) => has(text, zh ? renderKeyZh(preset) : preset.render.slice(0, 30)),
    framePhrase: zh ? preset.framePhraseZh : preset.framePhrase,
    negativeMust: zh ? preset.negativeMustZh : preset.negativeMust,
    negativeMustNot: zh ? preset.negativeMustNotZh : preset.negativeMustNot,
    has,
    bansPeople: (neg) => (zh ? /人/.test(foldZh(neg)) : /(people|person|figure|human|man|woman|crowd)/.test(String(neg).toLowerCase())),
    bansHands: (neg) => (zh ? /手/.test(foldZh(neg)) : /(hand|finger)/.test(String(neg).toLowerCase())),
    saysEmpty: (text) => (zh ? /(空场景|空无一人|没有人|没有任何人|无人|空景)/.test(foldZh(text)) : /(no people|empty|unpopulated|nobody|no one|no human)/i.test(String(text))),
    whiteBackground: (text) => (zh ? /(纯白背景|白色背景|白底)/.test(foldZh(text)) : /white background/i.test(String(text))),
    scalePhrase: (scale) => (zh ? PROP_SCALES_ZH[scale] : PROP_SCALES[scale]),
  };
}

const LANG_TAGS = { zh: 'Chinese', en: 'English', ja: 'Japanese', ko: 'Korean', fr: 'French', de: 'German', es: 'Spanish' };
const QUOTE_RE = /[「」『』“”]/;
const QUOTE_RE_G = /[「」『』“”"]/g;
const QUOTED_LINE_RE = /["“「『][^"”」』]{2,}["”」』]/;
const ETHNICITY_RE = /\b(asian|chinese|han|japanese|korean|caucasian|european|african|black|white|latino|latina|hispanic|middle[- ]eastern|arab|indian|south asian|southeast asian|mixed[- ]race|indigenous|slavic|nordic|mediterranean)\b/i;
const ERA_RE = /\b(1[0-9]{3}s?|20[0-9]{2}s?|century|era|contemporary|modern[- ]day|present[- ]day|republican|dynasty|medieval|victorian|edwardian|futuristic|ancient|post-war|prewar|wartime|1990s|2000s|2010s|2020s)\b/i;
const CJK_RE = /[㐀-鿿]/;

// ── small helpers ───────────────────────────────────────────────────────────

export const nonWhitespace = (s) => String(s ?? '').replace(/\s+/g, '').length;
export const lineSeconds = (line, params) => nonWhitespace(line) / params.charsPerSecond;
const round2 = (n) => Math.round(n * 100) / 100;
const pad2 = (n) => String(n).padStart(2, '0');
const uniq = (arr) => [...new Set(arr)];
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function slug(name) {
  return String(name ?? '')
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!'`@+=~^\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'untitled';
}

export function paramsOf(project) {
  const p = { ...DEFAULT_PARAMS, ...(project.params || {}) };
  p.thresholds = { ...DEFAULT_PARAMS.thresholds, ...(project.params?.thresholds || {}) };
  // The model decides how long a segment may be; an explicit param still wins, but it is then gated.
  const mode = videoModel(p);
  if (project.params?.maxSegmentSeconds == null) p.maxSegmentSeconds = mode.maxSegmentSeconds;
  if (project.params?.minSegmentSeconds == null) p.minSegmentSeconds = mode.minSegmentSeconds;
  if (project.params?.maxAudioRefs == null) p.maxAudioRefs = mode.maxAudioRefs;
  if (project.params?.maxVideoRefs == null) p.maxVideoRefs = mode.maxVideoRefs;
  // `auto` is the default, but a model without an autoDuration parameter has to be told a duration.
  if (project.params?.videoDuration == null && !mode.autoDuration) p.videoDuration = 'fixed';
  // The register is the drama's spoken 语体; the accent the video model is told to speak follows it.
  p.register = normalizeRegister(p.register);
  if (!String(p.speechAccent || '').trim() && REGISTER_ACCENT[p.register]) p.speechAccent = REGISTER_ACCENT[p.register][mode.promptLang === 'zh' ? 'zh' : 'en'];
  if (p.thresholds.maxPrimaryScenes == null) {
    const eps = Number(p.episodes) || 0;
    p.thresholds.maxPrimaryScenes = Math.min(15, Math.max(5, 4 + Math.ceil(eps / 10)));
  }
  return p;
}

export function langTag(lang) {
  return LANG_TAGS[String(lang || 'zh').toLowerCase()] || 'Chinese';
}

/** Names/aliases that must not appear in English prompts. */
export function forbiddenNames(project) {
  const out = [];
  for (const c of project.characters || []) {
    for (const n of [c.name, ...(c.aliases || []), c.disguise?.name]) if (n && String(n).trim().length >= 2) out.push(String(n).trim());
  }
  return uniq(out);
}

export function containsName(text, name) {
  if (!text || !name) return false;
  if (CJK_RE.test(name)) return text.includes(name);
  return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
}

function promptTokens(text) {
  const t = foldZh(text);
  const words = t.match(/[a-z0-9']+/g) || [];
  // Chinese has no spaces: compare character bigrams inside each run of CJK characters.
  const bigrams = [];
  for (const run of t.match(/[\u3400-\u9fff]+/g) || []) for (let i = 0; i + 1 < run.length; i++) bigrams.push(run.slice(i, i + 2));
  return new Set([...words, ...bigrams]);
}

export function jaccard(a, b) {
  const wa = promptTokens(a);
  const wb = promptTokens(b);
  if (wa.size < 8 || wb.size < 8) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter += 1;
  return inter / (wa.size + wb.size - inter);
}

export function isEnglish(text) {
  return !CJK_RE.test(String(text ?? ''));
}

function beatsOfEpisode(project, ep) {
  return (project.outline?.beats || []).filter((b) => Number(b.episode) === Number(ep));
}

function sceneById(project, id) {
  return (project.scenes || []).find((s) => s.id === id);
}
function characterById(project, id) {
  return (project.characters || []).find((c) => c.id === id);
}
/**
 * The name the drama's own documents use for a character in episode `ep`. A character with
 * `disguise: {name, revealEpisode}` goes by the disguise name before the reveal, so an episode's
 * script, polish sheet and segment sheet never spoil who they are. Without `ep` it is the real name.
 */
export function displayName(project, id, ep) {
  const c = characterById(project, id);
  if (!c) return id;
  const d = c.disguise;
  if (isObject(d) && String(d.name || '').trim() && ep != null && Number(ep) < Number(d.revealEpisode)) return String(d.name).trim();
  return c.name || id;
}
function propById(project, id) {
  return (project.props || []).find((p) => p.id === id);
}

// ── screenplay craft helpers ────────────────────────────────────────────────

/** Every beat of the episode with its cumulative start/end second, in order. */
export function beatOffsets(episode, params) {
  const out = [];
  let t = 0;
  (episode.scenes || []).forEach((sc, si) => {
    (sc.flow || []).forEach((b, bi) => {
      const secs = beatSeconds(b, params);
      out.push({ si: si + 1, bi: bi + 1, start: t, end: t + secs, beat: b });
      t += secs;
    });
  });
  return out;
}

/** The beat a `[sceneIndex, beatIndex]` pointer names, or null. */
export function beatAt(episode, ref) {
  if (!Array.isArray(ref) || ref.length !== 2) return null;
  const [si, bi] = ref.map(Number);
  return ((episode.scenes || [])[si - 1]?.flow || [])[bi - 1] || null;
}

/**
 * Where the episode turns: the hook, every beat marked `turn`, the 爽点 and the cliff (the end).
 * The 30-second rule is measured between consecutive points.
 */
export function turnPoints(episode, params) {
  const offsets = beatOffsets(episode, params);
  const points = [];
  const find = (ref) => offsets.find((o) => Array.isArray(ref) && o.si === Number(ref[0]) && o.bi === Number(ref[1]));
  const hook = find(episode.hookBeat);
  if (hook) points.push({ at: hook.start, what: 'hook' });
  for (const o of offsets) if (o.beat.turn === true) points.push({ at: o.start, what: `turn S${o.si} b${o.bi}` });
  const sat = find(episode.satisfactionBeat);
  if (sat) points.push({ at: sat.start, what: '爽点' });
  if (offsets.length) points.push({ at: offsets[offsets.length - 1].end, what: 'cliff' });
  return points.sort((a, b) => a.at - b.at);
}

const CN_DIGITS = { '零': 0, '〇': 0, '一': 1, '二': 2, '两': 2, '兩': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
/** A rough age from an `ageRange` string ("24 岁左右", "六十岁出头", "四十上下"); null when there is none. */
export function parseAge(text) {
  const t = String(text || '');
  const digits = t.match(/(\d{1,3})/);
  if (digits) return Number(digits[1]);
  const m = t.match(/([一二两兩三四五六七八九]?)十([一二三四五六七八九]?)|([一二两兩三四五六七八九])/);
  if (!m) return null;
  if (m[3] !== undefined) return CN_DIGITS[m[3]];
  const tens = m[1] ? CN_DIGITS[m[1]] : 1;
  const ones = m[2] ? CN_DIGITS[m[2]] : 0;
  return tens * 10 + ones;
}

/** Action vs line beats over the episode, and the longest run of lines with no action between. */
export function talkAndAction(episode) {
  let actions = 0, lines = 0, run = 0, longest = 0;
  for (const sc of episode.scenes || []) {
    run = 0;
    for (const b of sc.flow || []) {
      if (b.line !== undefined) { lines += 1; run += 1; longest = Math.max(longest, run); }
      else { actions += 1; run = 0; }
    }
  }
  return { actions, lines, longestLineRun: longest, ratio: lines ? actions / lines : Infinity };
}

const wordCount = (text) => (String(text || '').match(/[A-Za-z']+/g) || []).length;
const asList = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]);
const isEnglishRegister = (register) => /^英文/.test(String(register || ''));

// ── shot language helpers ────────────────────────────────────────────────────

const boundaryOf = (b) => (isObject(b) ? b : {});
const heldOf = (b, id) => asList(boundaryOf(b).heldProps?.[id]).map(String).sort();
/** A cut's start boundary: its own on a segment's first cut, else the previous cut's end. */
export function cutStart(seg, k) {
  const cuts = seg?.cuts || [];
  return k === 0 ? boundaryOf(cuts[0]?.start) : boundaryOf(cuts[k - 1]?.end);
}
/** Every character who appears in the segment, in first-appearance order. */
export function segmentCharacters(seg) {
  const out = [];
  for (const c of seg?.cuts || []) for (const id of c.characters || []) if (!out.includes(id)) out.push(id);
  return out;
}
const sizeIndex = (size) => SIZE_ORDER.indexOf(size);
/** Does this cut claim a beat that carries `ref` ([sceneIndex, beatIndex]) — same scene, in range. */
function cutClaims(seg, cut, ref) {
  if (!Array.isArray(ref) || ref.length !== 2 || !Array.isArray(cut.beats)) return false;
  return Number(ref[0]) === Number(seg.sceneIndex) && Number(ref[1]) >= Number(cut.beats[0]) && Number(ref[1]) <= Number(cut.beats[1]);
}
/** The beats a cut claims, with their index. */
function cutBeats(scene, cut) {
  const [from, to] = Array.isArray(cut.beats) ? cut.beats.map(Number) : [0, -1];
  const out = [];
  for (let i = from; i <= to; i++) { const b = (scene?.flow || [])[i - 1]; if (b) out.push({ bi: i, beat: b }); }
  return out;
}
/** The scenes that get a visual plan: the one with the 爽点 and the one with the cliff (the last). */
export function keyScenes(episode) {
  const out = new Set();
  if (Array.isArray(episode.satisfactionBeat)) out.add(Number(episode.satisfactionBeat[0]));
  if ((episode.scenes || []).length) out.add((episode.scenes || []).length);
  return [...out].filter((n) => n >= 1).sort((a, b) => a - b);
}

/** Per-shot text of a prompt, keyed by cut number, for every dialect. */
export function shotTexts(prompt, family, references) {
  const map = new Map();
  let re;
  if (family === 'h3') return shotParagraphs(prompt);
  if (family === 'wan') re = /镜头(\d+)（[\s\S]*?(?=\n镜头\d+（|\n\s*\n|$)/g;
  else if (references === 'sheets') re = /^Shot (\d+) \(([\s\S]*?)(?=\nShot \d+ \(|\n\s*\n|$)/gm;
  else return map;
  let m;
  while ((m = re.exec(prompt))) map.set(Number(m[1]), m[0].trim());
  return map;
}

/** `sound.music` as {intent, cues[]}: a string is an intent with no cues, `N/A` is no music. */
export function musicOf(sound) {
  const m = isObject(sound) ? sound.music : undefined;
  if (isObject(m)) return { intent: String(m.intent || '').trim(), cues: asList(m.cues) };
  const text = String(m || '').trim();
  return { intent: text === 'N/A' ? '' : text, cues: [] };
}
/** A cue's `at` — a cut number (its start) or "7.5s" — as seconds, or null. */
export function cueSeconds(at, cuts) {
  const starts = cutStarts(cuts || []);
  if (typeof at === 'number' && Number.isInteger(at) && at >= 1 && at <= starts.length) return starts[at - 1];
  const m = String(at ?? '').match(/^(\d+(?:\.\d+)?)\s*s$/);
  if (m) return Number(m[1]);
  if (typeof at === 'number') return at;
  return null;
}
const tc = (a, b) => `[${a.toFixed(1)}s:${b.toFixed(1)}s]`;

/**
 * The Seed Audio prompt for a segment's soundtrack, derived from `sound` and the cuts: every element
 * carries a `[start s:end s]` timecode so the bed lines up with the clip. `bed` = ambience + sfx +
 * music, no voices; `full` adds every line at its cut, read in the connected `@AudioN` voices.
 */
export function audioPrompt(project, episode, seg, opts = {}) {
  const params = paramsOf(project);
  const mode = opts.mode || params.audioTrack;
  const scene = (episode.scenes || [])[Number(seg.sceneIndex) - 1] || {};
  const cuts = seg.cuts || [];
  const starts = cutStarts(cuts);
  const total = cuts.reduce((sum, c) => sum + (Number(c.seconds) || 0), 0);
  const sound = isObject(seg.sound) ? seg.sound : {};
  const music = musicOf(sound);
  const lines = [];
  const references = [];
  lines.push(`${tc(0, total)} Ambience, continuous: ${sound.ambience || '…'}.`);
  for (const x of asList(sound.sfx)) {
    const k = Number(x?.cut);
    if (!(k >= 1 && k <= cuts.length)) continue;
    lines.push(`${tc(starts[k - 1], starts[k - 1] + (Number(cuts[k - 1].seconds) || 0))} SFX: ${x.event}.`);
  }
  if (music.intent) {
    // The cues cut the timeline into states: enter → (swell | duck | drop) → silence / out.
    const cues = music.cues.map((c) => ({ at: cueSeconds(c?.at, cuts), do: c?.do, note: c?.note })).filter((c) => c.at != null).sort((a, b) => a.at - b.at);
    if (!cues.length) lines.push(`${tc(0, total)} Music, instrumental, under everything: ${music.intent}.`);
    else {
      const verb = { enter: 'enters', swell: 'swells', duck: 'ducks under the voices', drop: 'drops low', silence: 'falls silent', out: 'fades out' };
      lines.push(`Music, instrumental: ${music.intent}.`);
      if (cues[0].at > 0) lines.push(`${tc(0, cues[0].at)} no music.`);
      cues.forEach((c, i) => {
        const end = i + 1 < cues.length ? cues[i + 1].at : total;
        lines.push(`${tc(c.at, end)} the music ${verb[c.do] || c.do}${c.note ? ` — ${c.note}` : ''}.`);
      });
    }
  } else lines.push('No music.');
  if (mode === 'full') {
    const voices = audioReferences(project, episode, seg);
    voices.forEach((r, i) => references.push({ label: `@Audio${i + 1}`, entity: r.entity, asset: r.asset, why: r.why }));
    const labelOf = new Map(references.map((r) => [r.entity, r.label]));
    cuts.forEach((c, k) => {
      let t = starts[k] + (Number(params.speechLeadSeconds) || 0);
      for (const l of claimedLines(scene, [c])) {
        const ch = characterById(project, l.speaker);
        const secs = lineSeconds(l.line, params);
        const who = l.speaker === 'VO' ? 'an off-screen inner voice' : labelOf.get(l.speaker) ? `${labelOf.get(l.speaker)} (${identityOf(ch)})` : identityOf(ch);
        const how = speechDirection(ch, l.delivery, 'en');
        lines.push(`${tc(t, Math.min(total, t + secs))} ${who}${how ? `, ${how},` : ''} says: ${l.line}`);
        t += secs;
      }
    });
    lines.push('Dialogue only from the lines above; no other voices.');
  } else lines.push('No dialogue, no vocals, no narration.');
  const prompt = lines.join('\n');
  return { segment: seg.id, mode, seconds: total, prompt, references, model: AUDIO_MODEL };
}

// ── gates ───────────────────────────────────────────────────────────────────
//
// A gate is {id, stage, label, run(ctx) -> string[]} where the strings are the
// failures. `ctx` = {project, params, episodes: Map<ep, episodeJson>, eps}.

// `advisory` gates print their findings as ⚠ and never fail `validate`: the rule is a strong default
// the writer may knowingly break (a 穿越 character speaking 古装 in a modern register is correct).
function gate(id, stage, label, run, opts = {}) {
  return { id, stage, label, run, advisory: opts.advisory === true };
}

export const GATES = [
  // ── outline ───────────────────────────────────────────────────────────
  gate('params', 'outline', 'params complete and valid', ({ project, params }) => {
    const out = [];
    if (!(Number(params.episodes) >= 1)) out.push('params.episodes must be a positive integer');
    if (!(Number(params.minutesPerEpisode) > 0)) out.push('params.minutesPerEpisode must be > 0');
    if (!params.genre) out.push('params.genre is required — it decides the beat types');
    if (!ADAPT_MODES.includes(params.adaptMode)) out.push(`params.adaptMode must be one of ${ADAPT_MODES.join(' / ')}`);
    if (!VIDEO_MODES.includes(params.video)) out.push(`params.video must be one of ${VIDEO_MODES.join(' / ')}`);
    if (!AUDIO_TRACK_MODES.includes(params.audioTrack)) out.push(`params.audioTrack must be one of ${AUDIO_TRACK_MODES.join(' / ')}`);
    if (!REGISTERS.includes(params.register)) out.push(`params.register (语体) must be one of ${REGISTERS.join(' / ')} — it decides how the lines are written and the accent the model speaks`);
    if (!REFERENCE_MODES.includes(params.references)) out.push(`params.references must be one of ${REFERENCE_MODES.join(' / ')}`);
    if (!DURATION_MODES.includes(params.videoDuration)) out.push(`params.videoDuration must be one of ${DURATION_MODES.join(' / ')}`);
    if (!VIDEO_REFERENCE_MODES.includes(params.videoReferences)) out.push(`params.videoReferences must be one of ${VIDEO_REFERENCE_MODES.join(' / ')}`);
    const mode = videoModel(params);
    if (params.videoDuration === 'auto' && !mode.autoDuration) out.push(`${mode.model} has no auto duration \u2014 set params.videoDuration = fixed and give every segment a whole-second total`);
    if (!(Number(params.minSegmentSeconds) >= mode.minSegmentSeconds && Number(params.maxSegmentSeconds) <= mode.maxSegmentSeconds && params.minSegmentSeconds <= params.maxSegmentSeconds)) {
      out.push(`params.min/maxSegmentSeconds = ${params.minSegmentSeconds}\u2013${params.maxSegmentSeconds} s, but ${mode.model} takes ${mode.minSegmentSeconds}\u2013${mode.maxSegmentSeconds} s \u2014 leave them out to follow the model`);
    }
    if (mode.family === 'seedance' && params.style === 'photoreal') {
      // BytePlus rejects photorealistic people in reference images ("input image may contain real person", HTTP 400).
      if (params.references !== 'sheets') out.push(`${mode.model} + photoreal: keyframes (photoreal people) are refused by the provider's real-person check \u2014 set params.references = sheets`);
      if (project.params?.humanReferences === undefined) out.push(`${mode.model} + photoreal: the provider's real-person check refuses character sheets unless the account has the real-person permission \u2014 set params.humanReferences explicitly (false: describe people in the prompt; true: the permission is enabled)`);
    }
    if (params.videoResolution && !videoResolutionFor(mode, params.videoResolution)) out.push(`params.videoResolution ${params.videoResolution} is not a tier of ${mode.model} \u2014 it takes ${mode.resolutions.join(' / ')}`);
    if (!STYLE_PRESETS[params.style]) out.push(`params.style must be one of ${Object.keys(STYLE_PRESETS).join(' / ')}`);
    if (!IMAGE_PROMPT_LANGS.includes(params.imagePromptLang)) out.push(`params.imagePromptLang must be one of ${IMAGE_PROMPT_LANGS.join(' / ')} (the language of the character / scene / prop image prompts)`);
    if (!/^\d+:\d+$/.test(String(params.ratio))) out.push('params.ratio must look like 9:16');
    if (!project.title) out.push('title is required');
    return out;
  }),
  gate('adaptation', 'outline', 'adaptation decisions recorded', ({ project, params }) => {
    const o = project.outline || {};
    const out = [];
    if (!o.core) out.push('outline.core (one-sentence core) is required');
    if (params.adaptMode !== '原创' && !(o.keep || []).length) out.push('outline.keep needs at least one entry when adapting a source');
    if (!['原创', '忠实'].includes(params.adaptMode) && !(o.cut || []).length) out.push(`adaptMode ${params.adaptMode} must cut something — outline.cut is empty`);
    for (const [key, list] of [['keep', o.keep], ['cut', o.cut], ['merge', o.merge]]) {
      for (const it of list || []) if (!it.what || !it.why) out.push(`outline.${key}: every entry needs what + why`);
    }
    for (const it of o.risks || []) if (!it.what || !it.plan) out.push('outline.risks: every entry needs what + plan');
    for (const key of ['cutNote', 'mergeNote']) if (key in o && !String(o[key]).trim()) out.push(`outline.${key} is present but empty`);
    return out;
  }),
  gate('tiers', 'outline', 'character tiers within caps', ({ project, params }) => {
    const t = params.thresholds;
    const out = [];
    const seen = new Set();
    const count = { lead: 0, support: 0, functional: 0 };
    for (const c of project.characters || []) {
      if (!/^C\d{2,}$/.test(String(c.id))) out.push(`character id "${c.id}" must look like C01`);
      if (seen.has(c.id)) out.push(`duplicate character id ${c.id}`);
      seen.add(c.id);
      if (!c.name) out.push(`${c.id}: name is required`);
      if (!TIERS.includes(c.tier)) out.push(`${c.id}: tier must be one of ${TIERS.join(' / ')}`);
      else count[c.tier] += 1;
      if (!c.role) out.push(`${c.id}: role is required`);
      if (['lead', 'support'].includes(c.tier) && !c.arc) out.push(`${c.id}: ${c.tier} characters need an arc`);
      if (!Array.isArray(c.from) || !c.from.length) out.push(`${c.id}: from[] must record where the character comes from (or ["原创"])`);
      if (c.disguise !== undefined) {
        const d = isObject(c.disguise) ? c.disguise : {};
        const rev = Number(d.revealEpisode);
        if (!String(d.name || '').trim()) out.push(`${c.id}: disguise.name is empty — the name this character goes by before the reveal`);
        else if (String(d.name).trim() === c.name) out.push(`${c.id}: disguise.name equals the real name`);
        if (!(Number.isInteger(rev) && rev >= 2 && rev <= Number(params.episodes))) out.push(`${c.id}: disguise.revealEpisode must be an episode in 2–${params.episodes} (the first episode that uses the real name)`);
      }
    }
    if (count.lead < 1 || count.lead > t.maxLeads) out.push(`lead characters: ${count.lead}, must be 1–${t.maxLeads}`);
    if (count.support > t.maxSupport) out.push(`support characters: ${count.support}, max ${t.maxSupport}`);
    if (count.functional > t.maxFunctional) out.push(`functional characters: ${count.functional}, max ${t.maxFunctional}`);
    return out;
  }),
  gate('scenes', 'outline', 'scenes registered, primary cap, reuse plans', ({ project, params }) => {
    const out = [];
    const seen = new Set();
    let primary = 0;
    const usage = new Map();
    for (const e of project.outline?.episodes || []) for (const id of e.sceneIds || []) usage.set(id, (usage.get(id) || 0) + 1);
    for (const s of project.scenes || []) {
      if (!/^S\d{2,}$/.test(String(s.id))) out.push(`scene id "${s.id}" must look like S01`);
      if (seen.has(s.id)) out.push(`duplicate scene id ${s.id}`);
      seen.add(s.id);
      if (!s.name) out.push(`${s.id}: name is required`);
      if (typeof s.primary !== 'boolean') out.push(`${s.id}: primary must be true/false`);
      if (s.primary) primary += 1;
      if ((usage.get(s.id) || 0) === 1 && !s.reusePlan && !s.variantOf) out.push(`${s.id}: used in only one episode — add a reusePlan (or make it a variantOf)`);
    }
    if (primary > params.thresholds.maxPrimaryScenes) out.push(`primary scenes: ${primary}, max ${params.thresholds.maxPrimaryScenes} for ${params.episodes} episodes`);
    return out;
  }),
  gate('props-cap', 'outline', 'narrative props ≤ cap, each with a function', ({ project, params }) => {
    const out = [];
    const props = project.props || [];
    if (props.length > params.thresholds.maxProps) out.push(`props: ${props.length}, max ${params.thresholds.maxProps} — the rest is set dressing`);
    const beatIds = new Set((project.outline?.beats || []).map((b) => b.id));
    const seen = new Set();
    for (const p of props) {
      if (!/^P\d{2,}$/.test(String(p.id))) out.push(`prop id "${p.id}" must look like P01`);
      if (seen.has(p.id)) out.push(`duplicate prop id ${p.id}`);
      seen.add(p.id);
      if (!p.name) out.push(`${p.id}: name is required`);
      if (!p.function) out.push(`${p.id}: function is required — if you cannot say what it carries, it is not a narrative prop`);
      for (const b of p.beatIds || []) if (!beatIds.has(b)) out.push(`${p.id}: beatIds references unknown beat ${b}`);
    }
    return out;
  }),
  gate('beats', 'outline', 'beat rhythm: gap ≤ N, first-episode hook, major timing', ({ project, params }) => {
    const out = [];
    const beats = project.outline?.beats || [];
    const eps = Number(params.episodes) || 0;
    if (!beats.length) return ['outline.beats is empty'];
    const seen = new Set();
    for (const b of beats) {
      if (!/^B\d{2,}$/.test(String(b.id))) out.push(`beat id "${b.id}" must look like B01`);
      if (seen.has(b.id)) out.push(`duplicate beat id ${b.id}`);
      seen.add(b.id);
      if (!b.type) out.push(`${b.id}: type is required`);
      if (!['major', 'minor'].includes(b.weight || 'minor')) out.push(`${b.id}: weight must be major or minor`);
      if (!(Number(b.episode) >= 1 && Number(b.episode) <= eps)) out.push(`${b.id}: episode ${b.episode} is outside 1–${eps}`);
      if (!b.setup || !b.payoff) out.push(`${b.id}: setup and payoff are required`);
    }
    const positions = uniq(beats.map((b) => Number(b.episode)).filter((n) => n >= 1)).sort((a, b) => a - b);
    if (positions.length) {
      if (positions[0] > 1) out.push(`no beat in episode 1 — the first episode needs a hook beat`);
      const gap = params.thresholds.maxBeatGap;
      let prev = 0;
      for (const p of positions) {
        if (p - prev > gap) out.push(`beat gap: nothing between episode ${prev} and ${p} (max gap ${gap})`);
        prev = p;
      }
      if (prev !== eps) out.push(`the finale (episode ${eps}) has no beat — the last beat sits on episode ${prev}`);
    }
    const majors = beats.filter((b) => b.weight === 'major').map((b) => Number(b.episode));
    if (!majors.length) out.push('at least one major beat is required');
    else if (Math.min(...majors) >= eps && eps > 1) out.push('the first major beat cannot sit on the last episode');
    return out;
  }),
  gate('episodes', 'outline', 'every episode has synopsis / hook / suspense, narrative only', ({ project, params }) => {
    const out = [];
    const eps = project.outline?.episodes || [];
    const n = Number(params.episodes) || 0;
    if (eps.length !== n) out.push(`outline.episodes has ${eps.length} entries, params.episodes is ${n}`);
    eps.forEach((e, i) => {
      if (Number(e.ep) !== i + 1) out.push(`outline.episodes[${i}].ep should be ${i + 1}`);
      for (const key of ['synopsis', 'hook', 'suspense']) {
        if (!String(e[key] || '').trim()) out.push(`ep ${e.ep}: ${key} is empty`);
        else if (QUOTE_RE.test(e[key])) out.push(`ep ${e.ep}: ${key} contains dialogue quotes — synopses are narrative`);
      }
      if ((e.characterIds || []).length >= 3 && !String(e.crowdPlan || '').trim()) out.push(`ep ${e.ep}: ${e.characterIds.length} characters need a crowdPlan (how the group is staged)`);
      for (const w of e.warnings || []) if (!WARNINGS.includes(w)) out.push(`ep ${e.ep}: unknown warning "${w}" (use ${WARNINGS.join(' / ')})`);
    });
    return out;
  }),
  gate('refs', 'outline', 'episode references resolve; no idle character / scene / prop', ({ project }) => {
    const out = [];
    const chars = new Set((project.characters || []).map((c) => c.id));
    const scenes = new Set((project.scenes || []).map((s) => s.id));
    const props = new Set((project.props || []).map((p) => p.id));
    const used = { c: new Set(), s: new Set(), p: new Set() };
    for (const e of project.outline?.episodes || []) {
      if (!(e.sceneIds || []).length) out.push(`ep ${e.ep}: sceneIds is empty`);
      if (!(e.characterIds || []).length) out.push(`ep ${e.ep}: characterIds is empty`);
      for (const id of e.sceneIds || []) (scenes.has(id) ? used.s.add(id) : out.push(`ep ${e.ep}: unknown scene ${id}`));
      for (const id of e.characterIds || []) (chars.has(id) ? used.c.add(id) : out.push(`ep ${e.ep}: unknown character ${id}`));
      for (const id of e.propIds || []) (props.has(id) ? used.p.add(id) : out.push(`ep ${e.ep}: unknown prop ${id}`));
    }
    if ((project.outline?.episodes || []).length) {
      for (const id of chars) if (!used.c.has(id)) out.push(`character ${id} appears in no episode`);
      for (const id of scenes) if (!used.s.has(id)) out.push(`scene ${id} is used in no episode`);
      for (const id of props) if (!used.p.has(id)) out.push(`prop ${id} appears in no episode`);
    }
    return out;
  }),

  gate('brief', 'outline', '创作简报: the six judgements, in the drama language', ({ project }) => {
    const out = [];
    const b = project.outline?.brief;
    if (!isObject(b)) return ['outline.brief is missing — the 创作简报 (logline, audience, satisfactionEngine, mainHook, protagonistPressure, antagonistPressure, emotionalLine, promise) comes before any episode'];
    for (const key of ['logline', 'audience', 'satisfactionEngine', 'mainHook', 'protagonistPressure', 'antagonistPressure', 'emotionalLine', 'promise']) {
      const v = String(b[key] || '').trim();
      if (!v) out.push(`outline.brief.${key} is empty`);
      else if (QUOTE_RE.test(v)) out.push(`outline.brief.${key} contains dialogue quotes — the brief is narrative`);
    }
    const engine = String(b.satisfactionEngine || '');
    if (engine && !SATISFACTION_TYPES.some((t) => engine.includes(t))) out.push(`outline.brief.satisfactionEngine must name one of ${SATISFACTION_TYPES.join(' / ')} (it can add how it varies)`);
    return out;
  }),
  gate('structure', 'outline', '三段结构: golden → escalation → climax tiling every episode', ({ project, params }) => {
    const out = [];
    const phases = project.outline?.structure;
    const n = Number(params.episodes) || 0;
    if (!Array.isArray(phases) || !phases.length) return ['outline.structure is missing — three phases (golden / escalation / climax) with episode ranges'];
    // Single-episode dramas: golden + climax both cover ep 1 (retention and payoff in the same 集).
    const expect = n === 1 ? ['golden', 'climax'] : n >= 3 ? PHASES : PHASES.filter((p) => p !== 'escalation');
    const got = phases.map((p) => p.phase);
    if (got.join(',') !== expect.join(',')) out.push(`outline.structure phases must be ${expect.join(' → ')} in that order (got ${got.join(', ') || 'none'})`);
    let cursor = 1;
    phases.forEach((p, i) => {
      const [a, b] = Array.isArray(p.episodes) ? p.episodes.map(Number) : [NaN, NaN];
      if (!(a >= 1 && b >= a && b <= n)) { out.push(`outline.structure[${i}] (${p.phase}): episodes must be [from, to] inside 1–${n}`); return; }
      if (n === 1) {
        if (!(a === 1 && b === 1)) out.push(`outline.structure[${i}] (${p.phase}): for a 1-episode drama both phases must be [1, 1]`);
      } else {
        if (a !== cursor) out.push(`outline.structure[${i}] (${p.phase}) starts at ${a}, expected ${cursor} — the phases must tile the episodes without gaps`);
        cursor = b + 1;
      }
      for (const key of ['task', 'satisfactionPlan', 'hookPlan']) if (!String(p[key] || '').trim()) out.push(`outline.structure[${i}] (${p.phase}): ${key} is empty`);
      if (p.phase === 'golden') {
        // 黄金窗口 is the first ~20 % — and never less than the first three episodes of a long run.
        const cap = Math.max(Math.ceil(n * 0.2), n >= 6 ? 3 : 1);
        if (b > cap) out.push(`golden window ends at episode ${b}; for ${n} episodes it must end by ${cap} (the first ~20 %)`);
        if (n >= 6 && b < 3) out.push(`golden window ends at episode ${b}; with ${n} episodes the first three episodes are the retention window`);
      }
    });
    if (n !== 1 && phases.length && cursor - 1 !== n && !out.some((m) => m.includes('inside 1'))) out.push(`outline.structure ends at episode ${cursor - 1}, the drama has ${n}`);
    return out;
  }),
  gate('guideline', 'outline', '创作指引: tone, dialogue, visuals, limits, ≥3 forbidden, 3–5 priorities', ({ project }) => {
    const out = [];
    const g = project.outline?.guideline;
    if (!isObject(g)) return ['outline.guideline is missing — the 创作指引 is re-read before every stage'];
    for (const key of ['tone', 'emotionalIntensity', 'dialogueStyle', 'visualStyle', 'productionLimits']) if (!String(g[key] || '').trim()) out.push(`outline.guideline.${key} is empty`);
    const forbidden = asList(g.forbidden).filter((x) => String(x).trim());
    if (forbidden.length < 3) out.push(`outline.guideline.forbidden has ${forbidden.length} rules, needs at least 3 (what this drama must never do)`);
    const priorities = asList(g.priorities).filter((x) => String(x).trim());
    if (priorities.length < 3 || priorities.length > 5) out.push(`outline.guideline.priorities has ${priorities.length} entries, needs 3–5 不可偏离重点`);
    if (/\{\{|\}\}/.test(JSON.stringify(g))) out.push('outline.guideline still contains {{placeholders}}');
    return out;
  }),
  gate('episode-design', 'outline', '分集目录: every episode has function / task / change / 爽点 / 钩子, and the first three build retention', ({ project, params }) => {
    const out = [];
    const eps = project.outline?.episodes || [];
    const n = Number(params.episodes) || 0;
    const engine = String(project.outline?.brief?.satisfactionEngine || '');
    const fnOf = (e) => asList(e.function).map(String);
    eps.forEach((e) => {
      const where = `ep ${e.ep}`;
      const fns = fnOf(e);
      if (!fns.length) out.push(`${where}: function is empty (${EPISODE_FUNCTIONS.join(' / ')})`);
      for (const f of fns) if (!EPISODE_FUNCTIONS.includes(f)) out.push(`${where}: function "${f}" is not one of ${EPISODE_FUNCTIONS.join(' / ')}`);
      const task = isObject(e.task) ? e.task : {};
      for (const key of ['goal', 'obstacle', 'stake']) if (!String(task[key] || '').trim()) out.push(`${where}: task.${key} is empty (本集任务: 目标 / 阻力 / 代价)`);
      if (!String(e.change || '').trim()) out.push(`${where}: change is empty — 这一集改变了什么? if only a conversation happened, the episode is not strong enough`);
      const sat = isObject(e.satisfaction) ? e.satisfaction : {};
      if (!SATISFACTION_TYPES.includes(sat.type)) out.push(`${where}: satisfaction.type must be one of ${SATISFACTION_TYPES.join(' / ')}`);
      if (!String(sat.action || '').trim()) out.push(`${where}: satisfaction.action is empty — a 爽点 is done by a visible action, not a feeling`);
      if (!HOOK_TYPES.includes(e.hookType)) out.push(`${where}: hookType must be one of ${HOOK_TYPES.join(' / ')}`);
      for (const key of ['change']) if (QUOTE_RE.test(String(e[key] || ''))) out.push(`${where}: ${key} contains dialogue quotes`);
    });
    const byEp = (k) => eps.find((e) => Number(e.ep) === k);
    const e1 = byEp(1);
    if (e1 && fnOf(e1).length && !fnOf(e1).includes('开局钩子')) out.push('ep 1: function must include 开局钩子 — the first episode grabs');
    if (n >= 3) {
      const e2 = byEp(2), e3 = byEp(3);
      if (e2 && engine && e2.satisfaction?.type && !engine.includes(e2.satisfaction.type)) out.push(`ep 2: satisfaction.type "${e2.satisfaction.type}" must be the brief's engine (${engine}) — episode two proves the 爽点`);
      if (e3 && fnOf(e3).length && !fnOf(e3).some((f) => ['冲突升级', '身份揭露', '大反转'].includes(f))) out.push('ep 3: function must include 冲突升级 / 身份揭露 / 大反转 — episode three widens the main line');
    }
    const last = byEp(n);
    if (last && n > 1 && fnOf(last).length && !fnOf(last).some((f) => ['清算收束', '大反转'].includes(f))) out.push(`ep ${n}: the finale's function must include 清算收束 or 大反转`);
    let same = 1;
    for (let i = 1; i < eps.length; i++) {
      same = eps[i].hookType && eps[i].hookType === eps[i - 1].hookType ? same + 1 : 1;
      if (same === 4) out.push(`ep ${eps[i].ep}: the same hookType "${eps[i].hookType}" four episodes in a row — vary the hook`);
    }
    return out;
  }),

  // ── characters ────────────────────────────────────────────────────────
  gate('profile', 'characters', 'profiles complete in the drama language, each with a distinct name-free English identity', ({ project }) => {
    const out = [];
    for (const c of project.characters || []) {
      if (!String(c.oneLiner || '').trim()) out.push(`${c.id}: oneLiner is empty`);
      const p = c.profile || {};
      for (const key of ['gender', 'ageRange', 'identity', 'appearance', 'temperament', 'motivation']) {
        if (!String(p[key] || '').trim()) out.push(`${c.id}: profile.${key} is empty`);
      }
      if (!Array.isArray(p.personality) || p.personality.length < 3 || p.personality.length > 5) out.push(`${c.id}: profile.personality needs 3–5 words`);
      if (!Array.isArray(p.evidence)) out.push(`${c.id}: profile.evidence must be an array (empty is fine)`);
      // How a prompt says "this person" without saying who they are.
      const identity = String(c.identityEn || '').trim();
      if (!identity) out.push(`${c.id}: identityEn is empty — a short English identity with no name ("the woman in her mid thirties"), used wherever a prompt has to attribute a line`);
      else {
        if (!isEnglish(identity)) out.push(`${c.id}: identityEn must be English`);
        if (identity.length > 80) out.push(`${c.id}: identityEn is ${identity.length} chars, max 80`);
        for (const nm of forbiddenNames(project)) if (containsName(identity, nm)) out.push(`${c.id}: identityEn contains the name "${nm}"`);
      }
    }
    const seenIdentity = new Map();
    for (const c of project.characters || []) {
      const key = String(c.identityEn || '').trim().toLowerCase();
      if (!key) continue;
      if (seenIdentity.has(key)) out.push(`${c.id}: identityEn is the same as ${seenIdentity.get(key)}'s — two people a prompt cannot tell apart`);
      else seenIdentity.set(key, c.id);
    }
    return out;
  }),
  gate('char-prompts', 'characters', 'image prompts in params.imagePromptLang (English by default), no names, ethnicity + era stated', ({ project, params }) => {
    const out = [];
    const names = forbiddenNames(project);
    const kit = imagePromptKit(params);
    for (const c of project.characters || []) {
      const img = c.image || {};
      for (const key of ['prompt', 'negativePrompt', 'sheet']) {
        const text = String(img[key] || '');
        if (!text.trim()) { out.push(`${c.id}: image.${key} is empty`); continue; }
        if (!kit.inLang(text)) out.push(`${c.id}: image.${key} must be ${kit.label} (params.imagePromptLang = ${params.imagePromptLang})`);
        for (const n of names) if (containsName(text, n)) out.push(`${c.id}: image.${key} contains the name "${n}" — describe, don't name`);
      }
      if (!Array.isArray(img.tags) || !img.tags.length) out.push(`${c.id}: image.tags is empty`);
      if (img.prompt && !kit.ethnicity(img.prompt)) out.push(`${c.id}: image.prompt must state ethnicity / facial heritage${kit.zh ? '（如 东亚、汉族）' : ''}`);
      if (img.prompt && !kit.era(img.prompt)) out.push(`${c.id}: image.prompt must state the era${kit.zh ? '（如 当代、秦末汉初、唐代）' : ''}`);
      if (img.sheet && !kit.sheetRatio(img.sheet)) out.push(`${c.id}: image.sheet must specify the 16:9 canvas`);
      if (img.sheet && !kit.hasRender(img.sheet)) out.push(`${c.id}: image.sheet must contain the ${params.style} render phrase "${kit.renderKey}…" (see STYLE_PRESETS${kit.zh ? '.renderZh' : ''})`);
      const neg = String(img.negativePrompt || '');
      for (const word of kit.negativeMustNot) if (kit.has(neg, word)) out.push(`${c.id}: style ${params.style} must not ban "${word}" in the negative prompt`);
      for (const word of kit.negativeMust) if (!kit.has(neg, word)) out.push(`${c.id}: style ${params.style} must ban "${word}" in the negative prompt`);
    }
    return out;
  }),
  gate('voice', 'characters', 'voice: six local fields, a 3–5 s acted sample line, a compact English video direction, prompt ≤ 400 chars, no quoted lines', ({ project, params }) => {
    const out = [];
    for (const c of project.characters || []) {
      const v = c.voice || {};
      for (const key of ['timbre', 'pitch', 'pace', 'accent', 'emotion']) {
        const text = String(v[key] || '');
        if (!text.trim()) { out.push(`${c.id}: voice.${key} is empty`); continue; }
        // pasted verbatim beside the character's first line in every Chinese segment prompt, and into the voice-sample prompt
        const nm = forbiddenNames(project).find((n) => containsName(text, n));
        if (nm) out.push(`${c.id}: voice.${key} contains the name "${nm}" — it is pasted into prompts; say 对她 / 对他 or describe the person`);
      }
      if (params.voiceSamples !== false) {
        const sample = v.sample || {};
        const line = String(sample.line || '').trim();
        const direction = String(sample.direction || '').trim();
        if (!line) out.push(`${c.id}: voice.sample.line is empty — one short acted line for the voice reference`);
        else {
          const [lo, hi] = params.voiceSampleSeconds || [3, 5];
          const secs = voiceSampleSeconds(c, params);
          if (secs < lo || secs > hi) out.push(`${c.id}: voice.sample.line runs ≈${round2(secs)} s at ${params.speechCharsPerSecond} chars/s, must be ${lo}–${hi} s (about ${Math.ceil(lo * params.speechCharsPerSecond)}–${Math.floor(hi * params.speechCharsPerSecond)} characters)`);
          if (QUOTE_RE.test(line)) out.push(`${c.id}: voice.sample.line must not carry quote marks — the engine reads them`);
        }
        if (!direction) out.push(`${c.id}: voice.sample.direction is empty — say how it is acted; it becomes the parenthetical the model obeys`);
        else {
          const nm = forbiddenNames(project).find((n) => containsName(direction, n));
          if (nm) out.push(`${c.id}: voice.sample.direction contains the name "${nm}" — it goes into the voice-sample prompt`);
        }
      }
      // The compact form the video prompt puts beside every line this character speaks.
      const vd = String(v.videoDirection || '').trim();
      if (!vd) out.push(`${c.id}: voice.videoDirection is empty — one short English clause (how they speak: pace, where the voice sits, what it does at the end of a phrase, accent) that goes beside every line they say in a video prompt`);
      else {
        if (!isEnglish(vd)) out.push(`${c.id}: voice.videoDirection must be English — it goes into an English video prompt`);
        if (vd.length > 160) out.push(`${c.id}: voice.videoDirection is ${vd.length} chars, max 160 — it is repeated on every line, so compress voice.prompt`);
        if (QUOTED_LINE_RE.test(vd)) out.push(`${c.id}: voice.videoDirection contains a quoted line`);
        for (const nm of forbiddenNames(project)) if (containsName(vd, nm)) out.push(`${c.id}: voice.videoDirection contains the name "${nm}"`);
      }
      const prompt = String(v.prompt || '');
      if (!prompt.trim()) out.push(`${c.id}: voice.prompt is empty`);
      else {
        if (!isEnglish(prompt)) out.push(`${c.id}: voice.prompt must be English`);
        if (prompt.length > 400) out.push(`${c.id}: voice.prompt is ${prompt.length} chars, max 400 — write a parameter string, not prose`);
        if (QUOTED_LINE_RE.test(prompt)) out.push(`${c.id}: voice.prompt contains a quoted line — engines read it aloud`);
        const nm = forbiddenNames(project).find((n) => containsName(prompt, n));
        if (nm) out.push(`${c.id}: voice.prompt contains the name "${nm}"`);
      }
    }
    return out;
  }),
  gate('distinct', 'characters', 'characters are distinguishable (prompt similarity < 75 %)', ({ project }) => {
    const out = [];
    const chars = project.characters || [];
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        const a = chars[i], b = chars[j];
        const img = jaccard(a.image?.prompt, b.image?.prompt);
        const voice = jaccard(a.voice?.prompt, b.voice?.prompt);
        if (img > 0.75) out.push(`${a.id} and ${b.id}: image prompts are ${Math.round(img * 100)}% alike — differentiate face, build, clothing`);
        if (voice > 0.75) out.push(`${a.id} and ${b.id}: voice prompts are ${Math.round(voice * 100)}% alike`);
      }
    }
    return out;
  }),

  gate('bible', 'characters', '人物圣经: function, hook line, want ≠ need, misbelief, contradiction, speech, arc — by tier', ({ project, params }) => {
    const out = [];
    const n = Number(params.episodes) || 0;
    for (const c of project.characters || []) {
      const b = isObject(c.bible) ? c.bible : null;
      if (!b) { out.push(`${c.id}: bible is missing (剧情功能 at least; the full 人物圣经 for leads and support)`); continue; }
      const need = (key, label = key) => { if (!String(b[key] || '').trim()) out.push(`${c.id}: bible.${label} is empty`); };
      if (!CHARACTER_FUNCTIONS.includes(b.function)) out.push(`${c.id}: bible.function must be one of ${CHARACTER_FUNCTIONS.join(' / ')}`);
      if (c.tier === 'functional') continue;
      for (const key of ['hookLine', 'want', 'need', 'misbelief', 'contradiction', 'pressureResponse']) need(key);
      const speech = isObject(b.speech) ? b.speech : {};
      for (const key of ['rhythm', 'silence']) if (!String(speech[key] || '').trim()) out.push(`${c.id}: bible.speech.${key} is empty (说话节奏 / 沉默方式 — the dialogue is written from this)`);
      if (speech.register && !REGISTERS.includes(normalizeRegister(speech.register))) out.push(`${c.id}: bible.speech.register "${speech.register}" is not one of ${REGISTERS.join(' / ')}`);
      const want = String(b.want || '').replace(/\s+/g, ''), needV = String(b.need || '').replace(/\s+/g, '');
      if (want && want === needV) out.push(`${c.id}: bible.want and bible.need are the same sentence — Want is the goal they chase, Need is the truth they must face`);
      if (c.tier !== 'lead') continue;
      for (const key of ['wound', 'firstImpression', 'finalUnderstanding']) need(key);
      const choices = asList(b.pastChoices);
      if (choices.length < 2) out.push(`${c.id}: bible.pastChoices needs at least 2 past choices (when / pressure / choice / gained / lost / residue)`);
      choices.forEach((ch, i) => { for (const key of ['when', 'pressure', 'choice', 'gained', 'lost', 'residue']) if (!String(ch?.[key] || '').trim()) out.push(`${c.id}: bible.pastChoices[${i}].${key} is empty`); });
      for (const key of ['forbidden', 'mustFace']) {
        const items = asList(b[key]).map((x) => String(x).trim());
        if (items.length !== 3) out.push(`${c.id}: bible.${key} needs exactly 3 entries (got ${items.length})`);
        for (const it of items) if (it.length < 6) out.push(`${c.id}: bible.${key} entry "${it}" is too short to be a rule`);
      }
      const arc = asList(b.arc);
      if (arc.length < 3) out.push(`${c.id}: bible.arc needs at least 3 stages (${ARC_STAGES.join(' / ')})`);
      arc.forEach((st, i) => {
        if (!ARC_STAGES.includes(st?.stage)) out.push(`${c.id}: bible.arc[${i}].stage must be one of ${ARC_STAGES.join(' / ')}`);
        if (!(Number(st?.episode) >= 1 && Number(st?.episode) <= n)) out.push(`${c.id}: bible.arc[${i}].episode ${st?.episode} is outside 1–${n}`);
        for (const key of ['state', 'change']) if (!String(st?.[key] || '').trim()) out.push(`${c.id}: bible.arc[${i}].${key} is empty`);
      });
      if (arc.length && !arc.some((st) => st?.stage === '高潮选择')) out.push(`${c.id}: bible.arc has no 高潮选择 stage — where Want and Need collide`);
    }
    return out;
  }),
  gate('relationships', 'characters', '人物关系网: leads have relationships with surface / real / power; a secret somewhere in the cast', ({ project, params }) => {
    const out = [];
    const n = Number(params.episodes) || 0;
    const ids = new Set((project.characters || []).map((c) => c.id));
    let secrets = 0;
    for (const c of project.characters || []) {
      const rels = asList(c.profile?.relationships);
      rels.forEach((r, i) => {
        if (r?.id && !ids.has(r.id)) out.push(`${c.id}: relationships[${i}].id ${r.id} is not a character`);
        if (r?.turnEpisode != null && !(Number(r.turnEpisode) >= 1 && Number(r.turnEpisode) <= n)) out.push(`${c.id}: relationships[${i}].turnEpisode ${r.turnEpisode} is outside 1–${n}`);
        if (String(r?.secret || '').trim()) secrets += 1;
      });
      if (c.tier !== 'lead') continue;
      const full = rels.filter((r) => r?.id && ids.has(r.id) && ['surface', 'real', 'power'].every((k) => String(r[k] || '').trim()));
      if (!full.length) out.push(`${c.id}: a lead needs at least one relationship with id + surface (表面关系) + real (真正关系) + power (权力差)`);
    }
    if ((project.characters || []).some((c) => c.tier === 'lead') && !secrets) out.push('no relationship in the cast carries a secret — 秘密与谎言 is where the reversals come from');
    return out;
  }),

  // ── art ───────────────────────────────────────────────────────────────
  gate('scene-design', 'art', 'scenes: intent, 3–5 anchors, ≥1 lighting state in params.imagePromptLang', ({ project, params }) => {
    const out = [];
    const kit = imagePromptKit(params);
    for (const s of project.scenes || []) {
      if (!String(s.summary || '').trim()) out.push(`${s.id}: summary (design intent) is empty`);
      const anchors = s.anchors || [];
      if (anchors.length < 3 || anchors.length > 5) out.push(`${s.id}: ${anchors.length} anchors, need 3–5`);
      for (const a of anchors) if (!a.name || !a.desc) out.push(`${s.id}: every anchor needs name + desc`);
      const lighting = s.lighting || [];
      if (!lighting.length) out.push(`${s.id}: at least one lighting state is required`);
      for (const l of lighting) {
        if (!l.state || !l.prompt) out.push(`${s.id}: every lighting state needs state + prompt`);
        else if (!kit.inLang(l.prompt)) out.push(`${s.id}: lighting "${l.state}" prompt must be ${kit.label}`);
      }
      if (s.variantOf) {
        if (!sceneById(project, s.variantOf)) out.push(`${s.id}: variantOf ${s.variantOf} does not exist`);
        if (!String(s.changes || '').trim()) out.push(`${s.id}: variantOf needs changes (what differs from the parent)`);
      }
    }
    return out;
  }),
  gate('scene-prompts', 'art', 'scene prompts in params.imagePromptLang, empty of people, no names, style-consistent', ({ project, params }) => {
    const out = [];
    const names = forbiddenNames(project);
    const kit = imagePromptKit(params);
    for (const s of project.scenes || []) {
      const img = s.image || {};
      for (const key of ['prompt', 'negativePrompt', 'sheet']) {
        const text = String(img[key] || '');
        if (!text.trim()) { out.push(`${s.id}: image.${key} is empty`); continue; }
        if (!kit.inLang(text)) out.push(`${s.id}: image.${key} must be ${kit.label}`);
        for (const n of names) if (containsName(text, n)) out.push(`${s.id}: image.${key} contains the character name "${n}"`);
      }
      const neg = String(img.negativePrompt || '');
      if (neg && !kit.bansPeople(neg)) out.push(`${s.id}: negativePrompt must ban people — environments are a separate asset layer`);
      if (img.prompt && !kit.saysEmpty(img.prompt)) out.push(`${s.id}: image.prompt must say the scene is empty (${kit.zh ? '空场景，没有人' : 'no people'})`);
      if (img.sheet && !kit.hasRender(img.sheet)) out.push(`${s.id}: image.sheet must contain the ${params.style} render phrase "${kit.renderKey}…"`);
    }
    return out;
  }),
  gate('prop-design', 'art', 'props: scale phrase, 3–5 anchors, ≥1 state, white background, no hands', ({ project, params }) => {
    const out = [];
    const names = forbiddenNames(project);
    const kit = imagePromptKit(params);
    for (const p of project.props || []) {
      if (!PROP_SCALES[p.scale]) out.push(`${p.id}: scale must be one of ${Object.keys(PROP_SCALES).join(' / ')}`);
      if (!String(p.summary || '').trim()) out.push(`${p.id}: summary (dramatic function) is empty`);
      const anchors = p.anchors || [];
      if (anchors.length < 3 || anchors.length > 5) out.push(`${p.id}: ${anchors.length} anchors, need 3–5`);
      const states = p.states || [];
      if (!states.length) out.push(`${p.id}: at least one state is required`);
      for (const st of states) {
        if (!st.state || !st.prompt) out.push(`${p.id}: every state needs state + prompt`);
        else if (!kit.inLang(st.prompt)) out.push(`${p.id}: state "${st.state}" prompt must be ${kit.label}`);
      }
      for (const id of p.relatedScenes || []) if (!sceneById(project, id)) out.push(`${p.id}: relatedScenes references unknown scene ${id}`);
      const img = p.image || {};
      for (const key of ['prompt', 'negativePrompt', 'sheet']) {
        const text = String(img[key] || '');
        if (!text.trim()) { out.push(`${p.id}: image.${key} is empty`); continue; }
        if (!kit.inLang(text)) out.push(`${p.id}: image.${key} must be ${kit.label}`);
        for (const n of names) if (containsName(text, n)) out.push(`${p.id}: image.${key} contains the character name "${n}"`);
      }
      const phrase = kit.scalePhrase(p.scale);
      if (phrase) {
        for (const key of ['prompt', 'sheet']) if (img[key] && !kit.has(img[key], phrase)) out.push(`${p.id}: image.${key} must contain "${phrase}"`);
      }
      const neg = String(img.negativePrompt || '');
      if (neg && !kit.bansHands(neg)) out.push(`${p.id}: negativePrompt must ban hands — a hand holding the prop is the usual contamination`);
      if (neg && !(kit.zh ? kit.bansPeople(neg) : /(people|person|figure|human)/.test(neg.toLowerCase()))) out.push(`${p.id}: negativePrompt must ban people`);
      for (const key of ['prompt', 'sheet']) if (img[key] && !kit.whiteBackground(img[key])) out.push(`${p.id}: image.${key} must specify a pure white background${kit.zh ? '（纯白背景）' : ''}`);
    }
    return out;
  }),

  // ── script (per episode) ──────────────────────────────────────────────
  gate('script-shape', 'script', 'episode file shape and upstream references', (ctx) => {
    const { project } = ctx;
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      if (Number(e.ep) !== Number(ep)) out.push(`E${pad2(ep)}: ep field is ${e.ep}`);
      if (!(Number(e.targetSeconds) > 0)) out.push(`E${pad2(ep)}: targetSeconds missing (run seed script)`);
      if (!String(e.hook || '').trim()) out.push(`E${pad2(ep)}: hook is empty — describe the opening image (seed leaves it for you; the outline's hook is the cliff)`);
      if (!String(e.cliff || '').trim()) out.push(`E${pad2(ep)}: cliff is empty`);
      if (!Array.isArray(e.beatsClaimed)) out.push(`E${pad2(ep)}: beatsClaimed must be an array`);
      if (!Array.isArray(e.scenes) || !e.scenes.length) { out.push(`E${pad2(ep)}: scenes is empty`); continue; }
      e.scenes.forEach((sc, i) => {
        const scene = sceneById(project, sc.sceneId);
        const where = `E${pad2(ep)} scene ${i + 1}`;
        if (!scene) out.push(`${where}: unknown scene ${sc.sceneId}`);
        else if (sc.lighting && !(scene.lighting || []).some((l) => l.state === sc.lighting)) out.push(`${where}: lighting "${sc.lighting}" is not a state of ${sc.sceneId} — add it to the scene first`);
        for (const id of sc.characters || []) if (!characterById(project, id)) out.push(`${where}: unknown character ${id}`);
        for (const id of sc.props || []) if (!propById(project, id)) out.push(`${where}: unknown prop ${id}`);
        if (!Array.isArray(sc.flow) || !sc.flow.length) out.push(`${where}: flow is empty`);
      });
    }
    return out;
  }),
  gate('beat-flow', 'script', 'beats: action ⇄ line, one kind each, no quotes in actions, speakers legal, line ≤ N chars, no names in a delivery the video prompt carries', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const names = forbiddenNames(project);
    const promptLang = videoModel(params).promptLang;
    for (const [ep, e] of ctx.episodes) {
      (e.scenes || []).forEach((sc, i) => {
        const where = `E${pad2(ep)} scene ${i + 1}`;
        let actions = 0;
        (sc.flow || []).forEach((b, k) => {
          const isAction = b.action !== undefined;
          const isLine = b.line !== undefined || b.speaker !== undefined;
          if (isAction && isLine) out.push(`${where} beat ${k + 1}: a beat is either an action or a line, not both`);
          if (!isAction && !isLine) out.push(`${where} beat ${k + 1}: empty beat`);
          if (isAction) {
            actions += 1;
            if (!String(b.action).trim()) out.push(`${where} beat ${k + 1}: action is empty`);
            if (QUOTE_RE.test(b.action)) out.push(`${where} beat ${k + 1}: action contains dialogue quotes — make it a line beat`);
          }
          if (isLine) {
            if (!String(b.line || '').trim()) out.push(`${where} beat ${k + 1}: line is empty`);
            if (nonWhitespace(b.line) > params.maxLineChars) out.push(`${where} beat ${k + 1}: line has ${nonWhitespace(b.line)} chars, max ${params.maxLineChars}`);
            if (b.speaker !== 'VO' && !(sc.characters || []).includes(b.speaker)) out.push(`${where} beat ${k + 1}: speaker ${b.speaker} is not in this scene (or VO)`);
            // speechDirection pastes the delivery beside the line in a Chinese (wan) prompt, and an English
            // delivery into any prompt — where a name fails the storyboard's no-names check much later.
            const delivery = String(b.delivery || '');
            if (delivery && beatDelivery(delivery, promptLang)) {
              const nm = names.find((n) => containsName(delivery, n));
              if (nm) out.push(`${where} beat ${k + 1}: delivery names "${nm}" — it goes into the video prompt beside the line; say 她 / 他 / 对方 or describe them`);
            }
          }
        });
        if ((sc.flow || []).length && actions === 0) out.push(`${where}: no action beat — a scene of pure dialogue is a radio play`);
      });
    }
    return out;
  }),
  gate('duration', 'script', 'episode duration within target ± tolerance', (ctx) => {
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const est = episodeSeconds(e, ctx.params);
      const target = Number(e.targetSeconds) || 0;
      if (!target) continue;
      const lo = target * (1 - ctx.params.tolerance), hi = target * (1 + ctx.params.tolerance);
      if (est < lo || est > hi) out.push(`E${pad2(ep)}: estimated ${round2(est)} s, target ${target} s (allowed ${round2(lo)}–${round2(hi)})`);
    }
    return out;
  }),
  gate('hook-cliff', 'script', 'hook lands within the first N beats; last beat is the cliff', (ctx) => {
    const { params } = ctx;
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const hb = e.hookBeat;
      if (!Array.isArray(hb) || hb.length !== 2) { out.push(`E${pad2(ep)}: hookBeat must be [sceneIndex, beatIndex]`); continue; }
      const [si, bi] = hb.map(Number);
      const scene = (e.scenes || [])[si - 1];
      if (!scene || !(scene.flow || [])[bi - 1]) { out.push(`E${pad2(ep)}: hookBeat [${si}, ${bi}] does not point at a beat`); continue; }
      let offset = 0;
      for (let i = 0; i < si - 1; i++) offset += ((e.scenes[i] || {}).flow || []).length;
      const position = offset + bi;
      if (position > params.hookWindow) out.push(`E${pad2(ep)}: hook lands at beat ${position}, must be within the first ${params.hookWindow} (cold open)`);
    }
    return out;
  }),
  gate('beats-claimed', 'script', 'claimed beats are exactly the outline beats of this episode', (ctx) => {
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const expected = beatsOfEpisode(ctx.project, ep).map((b) => b.id).sort();
      const claimed = [...(e.beatsClaimed || [])].sort();
      const missing = expected.filter((id) => !claimed.includes(id));
      const extra = claimed.filter((id) => !expected.includes(id));
      if (missing.length) out.push(`E${pad2(ep)}: outline beats not claimed: ${missing.join(', ')}`);
      if (extra.length) out.push(`E${pad2(ep)}: beatsClaimed lists beats that are not in this episode: ${extra.join(', ')}`);
    }
    return out;
  }),

  gate('script-design', 'script', 'episode design carried into the script: function / task / change / hookType match the outline, 爽点 lands on an action', (ctx) => {
    const { project } = ctx;
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const E = `E${pad2(ep)}`;
      const outlineEp = (project.outline?.episodes || []).find((x) => Number(x.ep) === Number(ep)) || {};
      const fns = asList(e.function).map(String), want = asList(outlineEp.function).map(String);
      if (!fns.length) out.push(`${E}: function is empty (seed script copies it from the outline)`);
      else if (want.length && fns.join('|') !== want.join('|')) out.push(`${E}: function [${fns.join(', ')}] differs from the outline's [${want.join(', ')}] — change the outline first`);
      if (e.hookType && outlineEp.hookType && e.hookType !== outlineEp.hookType) out.push(`${E}: hookType ${e.hookType} differs from the outline's ${outlineEp.hookType}`);
      if (!HOOK_TYPES.includes(e.hookType)) out.push(`${E}: hookType must be one of ${HOOK_TYPES.join(' / ')}`);
      const task = isObject(e.task) ? e.task : {};
      for (const key of ['goal', 'obstacle', 'stake']) if (!String(task[key] || '').trim()) out.push(`${E}: task.${key} is empty`);
      if (!String(e.change || '').trim()) out.push(`${E}: change is empty — what is different when this episode ends?`);
      const sat = e.satisfactionBeat;
      const beat = beatAt(e, sat);
      if (!beat) { out.push(`${E}: satisfactionBeat must point at a beat [sceneIndex, beatIndex] — the 爽点 has to be on screen`); continue; }
      if (beat.line !== undefined) {
        const [si, bi] = sat.map(Number);
        const flow = (e.scenes[si - 1] || {}).flow || [];
        const near = [flow[bi - 2], flow[bi]].some((b) => b && b.action !== undefined);
        if (!near) out.push(`${E}: satisfactionBeat [${si}, ${bi}] is a line with no action beat beside it — a 爽点 is done by a visible action`);
      }
    }
    return out;
  }),
  gate('rhythm', 'script', '短剧节奏: hook by 15 s, a turn every 30 s, 爽点 between hook and cliff, no 4 lines in a row, action ≥ 35 % of lines', (ctx) => {
    const { params } = ctx;
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const E = `E${pad2(ep)}`;
      const offsets = beatOffsets(e, params);
      if (!offsets.length) continue;
      const total = offsets[offsets.length - 1].end;
      const hook = offsets.find((o) => Array.isArray(e.hookBeat) && o.si === Number(e.hookBeat[0]) && o.bi === Number(e.hookBeat[1]));
      if (hook && hook.start > params.hookSeconds + 1e-9) out.push(`${E}: the hook image lands at ${round2(hook.start)} s, must be on screen by ${params.hookSeconds} s`);
      const points = turnPoints(e, params);
      for (let i = 1; i < points.length; i++) {
        const gap = points[i].at - points[i - 1].at;
        if (gap > params.turnSeconds + 1e-9) out.push(`${E}: ${round2(gap)} s from ${points[i - 1].what} (${round2(points[i - 1].at)} s) to ${points[i].what} (${round2(points[i].at)} s) with no turn — mark a beat that brings new information, an obstacle, a counter or a choice with \`turn: true\` (max ${params.turnSeconds} s)`);
      }
      const sat = offsets.find((o) => Array.isArray(e.satisfactionBeat) && o.si === Number(e.satisfactionBeat[0]) && o.bi === Number(e.satisfactionBeat[1]));
      if (sat) {
        if (hook && sat.start <= hook.start) out.push(`${E}: the 爽点 lands before or on the hook — the hook opens, the 爽点 pays`);
        if (sat.end >= total - 1e-9) out.push(`${E}: the 爽点 is the last beat — the last beat is the cliff`);
      }
      const ta = talkAndAction(e);
      if (ta.longestLineRun > params.maxConsecutiveLines) out.push(`${E}: ${ta.longestLineRun} line beats in a row — insert an action (谈话+行动) at least every ${params.maxConsecutiveLines} lines`);
      if (ta.lines >= 5 && ta.ratio < params.minActionRatio) out.push(`${E}: ${ta.actions} action beats to ${ta.lines} lines (${Math.round(ta.ratio * 100)} %) — dialogue needs visible action alongside it (≥ ${Math.round(params.minActionRatio * 100)} %)`);
    }
    return out;
  }),
  gate('filmable', 'script', '可拍摄: action beats carry no thoughts, memories or inferred states', (ctx) => {
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      (e.scenes || []).forEach((sc, i) => {
        (sc.flow || []).forEach((b, k) => {
          if (b.action === undefined) return;
          const where = `E${pad2(ep)} scene ${i + 1} beat ${k + 1}`;
          const text = String(b.action);
          const hits = NOVELISTIC_WORDS.filter((w) => text.includes(w));
          if (hits.length) out.push(`${where}: "${hits.join('、')}" is novel prose, not a picture — write what the camera sees`);
          const inferred = INFERENCE_WORDS.filter((w) => (CJK_RE.test(w) ? text.includes(w) : new RegExp(`\\b${w}\\b`, 'i').test(text)));
          if (inferred.length) out.push(`${where}: "${inferred.join(' / ')}" infers an inner state — replace it with a visible action`);
          const hands = CJK_RE.test(text) ? HAND_VERBS_ZH.filter((v) => text.includes(v)).length : (text.toLowerCase().match(/[a-z]+/g) || []).filter((w) => HAND_VERBS_EN.includes(w)).length;
          if (hands > 3) out.push(`${where}: ${hands} hand verbs in one beat — a video model performs one or two; split the beat or hand the change to an object`);
        });
      });
    }
    return out;
  }),
  gate('dialogue-register', 'script', '语体: lines match the drama’s register (advisory — a 穿越 character may break it on purpose)', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const names = forbiddenNames(project);
    for (const [ep, e] of ctx.episodes) {
      (e.scenes || []).forEach((sc, i) => {
        let cantonese = 0, total = 0;
        const calls = new Map();
        (sc.flow || []).forEach((b, k) => {
          if (b.line === undefined) return;
          const where = `E${pad2(ep)} scene ${i + 1} beat ${k + 1}`;
          const ch = characterById(project, b.speaker);
          const register = normalizeRegister(ch?.bible?.speech?.register || params.register);
          const line = String(b.line);
          total += 1;
          const marks = CANTONESE_MARKERS.filter((m) => line.includes(m));
          if (marks.length) cantonese += 1;
          if (register && register !== '粤语' && marks.length) out.push(`${where}: "${truncateLine(line)}" has Cantonese ${marks.join('')} in a ${register} drama`);
          if (['古装', '年代'].includes(register)) {
            const modern = MODERN_WORDS.filter((w) => line.includes(w));
            if (modern.length) out.push(`${where}: "${modern.join('、')}" is modern speech in a ${register} line`);
          }
          if (['古装', '年代', '大陆普通话', '台湾国语', '港式普通话'].includes(register)) {
            const slang = NETSLANG.filter((w) => line.toLowerCase().includes(w.toLowerCase()));
            const age = parseAge(ch?.profile?.ageRange);
            if (slang.length && (register === '古装' || register === '年代' || (age != null && age >= 40))) out.push(`${where}: 网络用语 "${slang.join('、')}" on ${ch?.name || b.speaker}${age != null ? ` (${age})` : ''} in ${register}`);
          }
          if (isEnglishRegister(register)) {
            const words = wordCount(line);
            if (words > params.maxLineWords) out.push(`${where}: ${words} words — English screen lines run 7–12, over ${params.maxLineWords} needs a reason`);
            if (/\b(I am|do not|cannot|going to|it is|you are|we are|they are|did not|is not|are not|will not)\b/.test(line)) out.push(`${where}: uncontracted "${line.match(/\b(I am|do not|cannot|going to|it is|you are|we are|they are|did not|is not|are not|will not)\b/)[0]}" — contractions are the default; leave it only for emphasis or threat`);
            for (const nm of names) if (nm !== ch?.name && containsName(line, nm)) calls.set(nm, (calls.get(nm) || 0) + 1);
          }
          const delivery = String(b.delivery || '').trim();
          if (delivery && EMOTION_ONLY.includes(delivery)) out.push(`${where}: delivery "${delivery}" is an emotion, not a playable action — 逼 / 哄 / 避 / 试探 / 压着嗓子`);
        });
        const register = normalizeRegister(params.register);
        if (register === '粤语' && total >= 4 && cantonese * 2 < total) out.push(`E${pad2(ep)} scene ${i + 1}: only ${cantonese} of ${total} lines read as Cantonese — 书面中文硬转 (written Chinese with a few 啦 is not 粤语)`);
        for (const [nm, count] of calls) if (count > params.maxNameCallsPerScene) out.push(`E${pad2(ep)} scene ${i + 1}: "${nm}" is addressed by name ${count} times — in English a name is a heavy word; ${params.maxNameCallsPerScene} per scene`);
      });
    }
    return out;
  }, { advisory: true }),

  // ── storyboard (per episode) ──────────────────────────────────────────
  gate('segments', 'storyboard', 'segments: ids sequential, one scene each, cuts claim every beat once in order', (ctx) => {
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const segs = e.storyboard?.segments || [];
      if (!segs.length) { out.push(`E${pad2(ep)}: no segments`); continue; }
      const claims = new Map(); // sceneIndex -> [[from,to]...]
      segs.forEach((seg, i) => {
        const expectId = `E${pad2(ep)}-${pad2(i + 1)}`;
        if (seg.id !== expectId) out.push(`segment ${seg.id || '?'}: expected id ${expectId} (sequential in file order)`);
        const si = Number(seg.sceneIndex);
        const scene = (e.scenes || [])[si - 1];
        if (!scene) { out.push(`${seg.id}: sceneIndex ${seg.sceneIndex} does not exist`); return; }
        if (!Array.isArray(seg.cuts) || !seg.cuts.length) { out.push(`${seg.id}: cuts is empty`); return; }
        for (const c of seg.cuts) {
          if (!Array.isArray(c.beats) || c.beats.length !== 2) { out.push(`${seg.id}: every cut needs beats [from, to]`); continue; }
          if (!claims.has(si)) claims.set(si, []);
          claims.get(si).push([Number(c.beats[0]), Number(c.beats[1])]);
        }
      });
      (e.scenes || []).forEach((sc, i) => {
        const n = (sc.flow || []).length;
        const ranges = claims.get(i + 1) || [];
        let expect = 1;
        for (const [from, to] of ranges) {
          if (from !== expect) { out.push(`E${pad2(ep)} scene ${i + 1}: beat ${expect} is ${from > expect ? 'unclaimed' : 'claimed twice'} (cut claims [${from}, ${to}])`); }
          if (to < from) out.push(`E${pad2(ep)} scene ${i + 1}: cut range [${from}, ${to}] is reversed`);
          expect = Math.max(expect, to + 1);
        }
        if (expect - 1 < n) out.push(`E${pad2(ep)} scene ${i + 1}: beats ${expect}–${n} are unclaimed`);
        if (expect - 1 > n) out.push(`E${pad2(ep)} scene ${i + 1}: claims run past the last beat (${n})`);
      });
    }
    return out;
  }),
  gate('timing', 'storyboard', 'cut 2–5 s, dialogue fits, segment inside the model\u2019s duration range, reference caps, episode within target ± tolerance', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      let total = 0;
      for (const seg of e.storyboard?.segments || []) {
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1];
        let segSeconds = 0;
        (seg.cuts || []).forEach((c, k) => {
          const s = Number(c.seconds);
          if (!(s >= params.minCutSeconds && s <= params.maxCutSeconds)) out.push(`${seg.id} cut ${k + 1}: ${c.seconds} s, must be ${params.minCutSeconds}–${params.maxCutSeconds}`);
          segSeconds += s || 0;
          if (scene && Array.isArray(c.beats)) {
            const talk = dialogueSeconds(scene, c.beats, params);
            // A line needs a beat to open the mouth before it and lands after it; the lead is charged here.
            const lead = talk ? Number(params.speechLeadSeconds) || 0 : 0;
            if (talk + lead > s + 1e-9) out.push(`${seg.id} cut ${k + 1}: ${round2(talk)} s of dialogue plus a ${lead} s lead-in does not fit in ${s} s`);
          }
        });
        const mode = videoModel(params);
        // The model's duration range is what a segment must fit — this is the rule that decides where the plot is cut.
        if (!(segSeconds >= params.minSegmentSeconds && segSeconds <= params.maxSegmentSeconds)) out.push(`${seg.id}: ${round2(segSeconds)} s total, must be ${params.minSegmentSeconds}–${params.maxSegmentSeconds} s (${mode.model})`);
        if (params.videoDuration === 'fixed' && !Number.isInteger(round2(segSeconds))) out.push(`${seg.id}: ${round2(segSeconds)} s \u2014 ${mode.model} only takes whole seconds; make the cuts sum to an integer`);
        if (params.references === 'keyframes' && (seg.cuts || []).length > mode.maxRefs) out.push(`${seg.id}: ${(seg.cuts || []).length} keyframes, but ${mode.model} takes at most ${mode.maxRefs} references`);
        // Voices are audio references and have their own, much smaller cap.
        const voices = audioReferences(project, e, seg).length;
        if (voices > params.maxAudioRefs) out.push(`${seg.id}: ${voices} people speak, so ${voices} voice references, but ${mode.model} takes at most ${params.maxAudioRefs} — split the segment or drop a speaker from it`);
        const clips = videoReferences(project, e, seg).length;
        if (clips > params.maxVideoRefs) out.push(`${seg.id}: ${clips} clip references, but ${mode.model} takes at most ${params.maxVideoRefs}`);
        // A reference video has its own length limit, and the previous segment is a whole clip.
        if (clips && params.videoReferences === 'previous') {
          const all = e.storyboard?.segments || [];
          const prev = all[all.findIndex((x) => x.id === seg.id) - 1];
          const prevSeconds = (prev?.cuts || []).reduce((sum, c) => sum + (Number(c.seconds) || 0), 0);
          if (prevSeconds > mode.maxRefVideoSeconds) out.push(`${seg.id}: ${prev.id} runs ${round2(prevSeconds)} s but ${mode.model} takes reference videos of at most ${mode.maxRefVideoSeconds} s — set params.videoReferences = none, or shorten ${prev.id}`);
        }
        total += segSeconds;
      }
      const target = Number(e.targetSeconds) || 0;
      if (target && (e.storyboard?.segments || []).length) {
        const lo = target * (1 - params.tolerance), hi = target * (1 + params.tolerance);
        if (total < lo || total > hi) out.push(`E${pad2(ep)}: storyboard totals ${round2(total)} s, target ${target} s (allowed ${round2(lo)}–${round2(hi)})`);
      }
    }
    return out;
  }),
  gate('cut-content', 'storyboard', 'cuts: size + camera vocab, on-screen cap, people/props ⊆ scene, style phrase, no names', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const names = forbiddenNames(project);
    const preset = STYLE_PRESETS[params.style] || STYLE_PRESETS.realistic;
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1] || {};
        (seg.cuts || []).forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          if (!SIZES[c.size]) out.push(`${where}: size must be one of ${Object.keys(SIZES).join(' / ')}`);
          if (!CAMERAS.includes(c.camera)) out.push(`${where}: camera "${c.camera}" is not in the vocabulary`);
          const chars = c.characters || [];
          for (const id of chars) if (!(scene.characters || []).includes(id)) out.push(`${where}: ${id} is not in this scene`);
          for (const id of c.props || []) if (!(scene.props || []).includes(id)) out.push(`${where}: prop ${id} is not in this scene`);
          if (chars.length > params.maxOnScreen && !String(c.note || '').trim()) out.push(`${where}: ${chars.length} people on screen — add a note on how they are staged`);
          const frame = String(c.frame || '');
          if (!frame.trim()) { out.push(`${where}: frame prompt is empty`); return; }
          if (!isEnglish(frame)) out.push(`${where}: frame prompt must be English`);
          if (SIZES[c.size] && !frame.toLowerCase().includes(SIZES[c.size])) out.push(`${where}: frame prompt must contain "${SIZES[c.size]}"`);
          if (params.references === 'keyframes' && !frame.toLowerCase().includes(preset.framePhrase)) out.push(`${where}: frame prompt must contain "${preset.framePhrase}" (style ${params.style})`);
          for (const n of names) if (containsName(frame, n)) out.push(`${where}: frame prompt contains the name "${n}"`);
        });
      }
    }
    return out;
  }),
  gate('photography', 'storyboard', 'every cut names its lens and stop, its key-light direction, and enough foreground', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const kit = params.camera || DEFAULT_PARAMS.camera;
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const cuts = seg.cuts || [];
        let withForeground = 0;
        cuts.forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          const frame = String(c.frame || '');
          // Lens and stop: the shot's own focal, or the one its size implies, plus the package's body.
          const focal = focalOf(c);
          if (!focal) out.push(`${where}: no focal length — set cut.focal, or a size that implies one`);
          const stop = String(c.aperture || kit.aperture || '').trim();
          if (!stop) out.push(`${where}: no aperture — set cut.aperture or params.camera.aperture`);
          if (frame.trim()) {
            for (const token of [kit.body, focal, stop].filter(Boolean)) {
              if (!frame.includes(token)) out.push(`${where}: frame prompt must name "${token}" — paste the whole phrase: ${cameraPhrase(c, params)}`);
            }
          }
          // Key light, named relative to the camera, and what it does over the cut.
          const dir = c.light?.direction;
          if (!dir) out.push(`${where}: light.direction is required — one of ${Object.keys(LIGHT_DIRECTIONS).join(' / ')} (relative to the camera, not the room)`);
          else if (!LIGHT_DIRECTIONS[dir]) out.push(`${where}: light.direction "${dir}" is not in the vocabulary (${Object.keys(LIGHT_DIRECTIONS).join(' / ')})`);
          if (!String(c.light?.note || '').trim()) out.push(`${where}: light.note is required — say what the light does over the cut (what it rims, what fills the shadow side, how it changes as the camera or subject moves)`);
          if (frame.trim() && dir && LIGHT_DIRECTIONS[dir] && !frame.includes(LIGHT_DIRECTIONS[dir])) out.push(`${where}: frame prompt must contain "${LIGHT_DIRECTIONS[dir]}"`);
          // Foreground.
          const fg = String(c.foreground || '').trim();
          if (fg) {
            withForeground += 1;
            if (frame.trim() && !frame.includes(fg)) out.push(`${where}: frame prompt must name the foreground "${fg}"`);
            if (frame.trim() && !/out of focus|foreground blur|defocus|bokeh|soft foreground/i.test(frame)) out.push(`${where}: the foreground is named but never said to be out of focus`);
          }
          if (c.foreground === undefined) out.push(`${where}: foreground is required — name what sits between the lens and the subject, or "" for a deliberately clean frame`);
        });
        // "Reasonably" means most of them: a segment of clean frames is flat.
        if (cuts.length && withForeground * 2 < cuts.length) out.push(`${seg.id}: only ${withForeground} of ${cuts.length} cuts have a foreground element — at least half must, or the segment has no depth`);
      }
    }
    return out;
  }),
  gate('video-prompt', 'storyboard', 'video prompt matches the storyboard (H3 alignment / Seedance keyframes / Wan legend), dialogue points at its @audioN', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const names = forbiddenNames(project);
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1];
        if (!scene || !(seg.cuts || []).length) continue;
        const prompt = String(seg.prompt || '');
        if (!prompt.trim()) { out.push(`${seg.id}: prompt is empty (run \`prompt segment ${seg.id}\` for the skeleton)`); continue; }
        const lines = claimedLines(scene, seg.cuts);
        const family = videoModel(params).family;
        const refs = segmentReferences(project, e, seg);
        const sheetCount = refs.filter((r) => r.kind === 'image').length;
        if (family === 'h3') out.push(...checkH3Prompt(seg, prompt, lines, project, names, params, sheetCount, refs));
        else if (family === 'wan') out.push(...checkWanPrompt(seg, prompt, lines, names, params, project, refs));
        else out.push(...checkSeedancePrompt(seg, prompt, lines, names, params, sheetCount, project, refs));
        const accent = String(params.speechAccent || '').trim();
        if (accent && params.video !== 'wan' && lines.length && !prompt.toLowerCase().includes(accent.toLowerCase())) out.push(`${seg.id}: prompt must name the accent "${accent}" (params.speechAccent) — the model speaks the lines`);
        // `lookPhrase` is English; a Chinese prompt carries `lookPhraseZh` instead, when there is one.
        const look = String(videoModel(params).promptLang === 'zh' ? params.lookPhraseZh || '' : params.lookPhrase || '').trim();
        if (look && !prompt.toLowerCase().includes(look.toLowerCase())) out.push(`${seg.id}: prompt must carry the look phrase "${look}" (params.${videoModel(params).promptLang === 'zh' ? 'lookPhraseZh' : 'lookPhrase'})`);
        if (params.references === 'sheets' && params.video !== 'wan') {
          const preset = STYLE_PRESETS[params.style] || STYLE_PRESETS.realistic;
          if (!prompt.toLowerCase().includes(preset.videoPhrase)) out.push(`${seg.id}: prompt must contain "${preset.videoPhrase}" (style ${params.style}) — there are no keyframes to carry the style`);
        }
      }
    }
    return out;
  }),

  // ── shot language (per episode) ───────────────────────────────────────
  gate('shot-purpose', 'storyboard', '镜头职责: every cut says what it changes; adjacent cuts differ; a turn / 爽点 is a reveal-class cut or is followed by a reaction; the cliff cut leaves the audience hanging', (ctx) => {
    const out = [];
    for (const [, e] of ctx.episodes) {
      const segs = e.storyboard?.segments || [];
      const lastScene = (e.scenes || []).length;
      const lastBeat = ((e.scenes || [])[lastScene - 1]?.flow || []).length;
      for (const seg of segs) {
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1];
        const cuts = seg.cuts || [];
        cuts.forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          const pk = c.purpose?.kind;
          if (!PURPOSE_KINDS.includes(pk)) out.push(`${where}: purpose.kind must be one of ${PURPOSE_KINDS.join(' / ')}`);
          if (!String(c.purpose?.change || '').trim()) out.push(`${where}: purpose.change is empty — what does the audience know, or who holds power, when this cut ends?`);
          if (k > 0) {
            const p = cuts[k - 1];
            const same = p.size === c.size && p.angle === c.angle && [...(p.characters || [])].sort().join() === [...(c.characters || [])].sort().join();
            if (same) out.push(`${where}: same size, angle and people as cut ${k} — a cut has to change at least one of them, or merge the two`);
          }
          // A turn or the 爽点 lands as a reveal-class cut, or the next cut reads the reaction to it.
          const turnBeats = cutBeats(scene, c).filter(({ bi, beat }) => beat.turn === true || cutClaims(seg, c, e.satisfactionBeat) && Number(e.satisfactionBeat[1]) === bi);
          if (turnBeats.length && !TURN_KINDS.includes(pk)) {
            const next = cuts[k + 1];
            const speakers = turnBeats.map(({ beat }) => beat.speaker).filter(Boolean);
            const reacts = next && next.purpose?.kind === 'reaction' && (next.characters || []).some((id) => !speakers.includes(id));
            if (!reacts) out.push(`${where}: claims a turn / 爽点 (beat ${turnBeats.map((t) => t.bi).join(', ')}) but is "${pk || '?'}" — make it reveal / evidence / decision / consequence, or follow it with a reaction cut on someone who did not speak it`);
          }
          if (Number(seg.sceneIndex) === lastScene && Array.isArray(c.beats) && Number(c.beats[1]) === lastBeat && lastBeat > 0 && !CLIFF_KINDS.includes(pk)) out.push(`${where}: holds the episode's last beat (the cliff) but is "${pk || '?'}" — the cliff cut is ${CLIFF_KINDS.join(' / ')}`);
        });
      }
    }
    return out;
  }),
  gate('boundary-contrast', 'storyboard', '跨场边界: last K cuts of scene N must not match first K of scene N+1 in size+angle+people (params.boundaryContrastCuts, default 2); note "match-cut" to exempt', (ctx) => {
    const out = [];
    const Kraw = Number(ctx.params.boundaryContrastCuts);
    const K = Number.isFinite(Kraw) && Kraw >= 1 ? Math.min(3, Math.floor(Kraw)) : 2;
    const isMatchCut = (c) => /match[\s-]?cut/i.test(String(c?.note || ''));
    const signature = (c) => `${c?.size || ''}|${c?.angle || ''}|${[...(c?.characters || [])].map(String).sort().join(',')}`;
    for (const [, e] of ctx.episodes) {
      const segs = e.storyboard?.segments || [];
      const byScene = new Map();
      for (const seg of segs) {
        const si = Number(seg.sceneIndex);
        if (!Number.isFinite(si)) continue;
        if (!byScene.has(si)) byScene.set(si, []);
        byScene.get(si).push(seg);
      }
      const sceneIds = [...byScene.keys()].sort((a, b) => a - b);
      for (let i = 0; i < sceneIds.length - 1; i++) {
        const aSegs = byScene.get(sceneIds[i]);
        const bSegs = byScene.get(sceneIds[i + 1]);
        const lastSeg = aSegs[aSegs.length - 1];
        const firstSeg = bSegs[0];
        const aCuts = lastSeg.cuts || [];
        const bCuts = firstSeg.cuts || [];
        if (!aCuts.length || !bCuts.length) continue;
        const tail = aCuts.slice(-K);
        const head = bCuts.slice(0, K);
        tail.forEach((tc, ti) => {
          head.forEach((hc, hi) => {
            if (isMatchCut(tc) || isMatchCut(hc)) return;
            if (signature(tc) !== signature(hc)) return;
            const aIdx = aCuts.length - tail.length + ti + 1;
            out.push(`${firstSeg.id} cut ${hi + 1}: same size, angle and people as ${lastSeg.id} cut ${aIdx} across the scene ${sceneIds[i]}→${sceneIds[i + 1]} boundary — change at least one, or mark note "match-cut" if intentional`);
          });
        });
      }
    }
    return out;
  }),
  gate('boundary-contrast-episode', 'storyboard', '跨集边界 (advisory): last K cuts of episode E should not match first K of E+1 in size+angle+people', (ctx) => {
    const out = [];
    const Kraw = Number(ctx.params.boundaryContrastCuts);
    const K = Number.isFinite(Kraw) && Kraw >= 1 ? Math.min(3, Math.floor(Kraw)) : 2;
    const isMatchCut = (c) => /match[\s-]?cut/i.test(String(c?.note || ''));
    const signature = (c) => `${c?.size || ''}|${c?.angle || ''}|${[...(c?.characters || [])].map(String).sort().join(',')}`;
    const eps = [...ctx.episodes.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
    for (let i = 0; i < eps.length - 1; i++) {
      const [epA, eA] = eps[i];
      const [epB, eB] = eps[i + 1];
      const segsA = eA.storyboard?.segments || [];
      const segsB = eB.storyboard?.segments || [];
      if (!segsA.length || !segsB.length) continue;
      const lastSeg = segsA[segsA.length - 1];
      const firstSeg = segsB[0];
      const aCuts = lastSeg.cuts || [];
      const bCuts = firstSeg.cuts || [];
      if (!aCuts.length || !bCuts.length) continue;
      const tail = aCuts.slice(-K);
      const head = bCuts.slice(0, K);
      tail.forEach((tc, ti) => {
        head.forEach((hc, hi) => {
          if (isMatchCut(tc) || isMatchCut(hc)) return;
          if (signature(tc) !== signature(hc)) return;
          const aIdx = aCuts.length - tail.length + ti + 1;
          out.push(`${firstSeg.id} cut ${hi + 1}: same size, angle and people as ${lastSeg.id} cut ${aIdx} across episode E${String(epA).padStart(2, '0')}→E${String(epB).padStart(2, '0')} — change at least one for a fresher open, or mark note "match-cut" if the echo is intentional`);
        });
      });
    }
    return out;
  }, { advisory: true }),
  gate('framing-axis', 'storyboard', '角度 / 机位高度 / 轴线: three separate fields; a two-person segment declares its axis; reverse shots face opposite ways', (ctx) => {
    const out = [];
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1] || {};
        const cuts = seg.cuts || [];
        cuts.forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          if (!ANGLES.includes(c.angle)) out.push(`${where}: angle must be one of ${ANGLES.join(' / ')} (horizontal — how much face the audience reads)`);
          if (!HEIGHTS.includes(c.height)) out.push(`${where}: height must be one of ${HEIGHTS.join(' / ')} (eye is a choice, not an unset field)`);
          if (!AXIS_SIDES.includes(c.axisSide)) out.push(`${where}: axisSide must be one of ${AXIS_SIDES.join(' / ')}`);
          if (c.axisSide === 'cross' && !String(c.note || '').trim()) out.push(`${where}: crossing the axis needs a note — the neutral shot, the in-shot crossing or the re-established geography`);
        });
        const people = segmentCharacters(seg);
        const axis = isObject(seg.axis) ? seg.axis : null;
        if (people.length >= 2) {
          if (!axis) { out.push(`${seg.id}: ${people.length} people appear — declare axis { between: [a, b], workingSide, screenLeft, screenRight }`); continue; }
          const between = asList(axis.between);
          if (between.length !== 2 || between.some((id) => !(scene.characters || []).includes(id))) out.push(`${seg.id}: axis.between must name two characters of this scene`);
          if (!String(axis.workingSide || '').trim()) out.push(`${seg.id}: axis.workingSide is empty — where the camera lives (e.g. "the counter side, camera toward the aisle")`);
          if (!between.includes(axis.screenLeft) || !between.includes(axis.screenRight) || axis.screenLeft === axis.screenRight) out.push(`${seg.id}: axis.screenLeft / screenRight must be the two axis characters, one each`);
          // Reverse shots: a single on A then a single on B must face opposite screen directions.
          for (let k = 1; k < cuts.length; k++) {
            const a = cuts[k - 1], b = cuts[k];
            if ((a.characters || []).length !== 1 || (b.characters || []).length !== 1) continue;
            const ca = a.characters[0], cb = b.characters[0];
            if (ca === cb || !between.includes(ca) || !between.includes(cb)) continue;
            if (a.axisSide === 'cross' || b.axisSide === 'cross') continue;
            // A person who entered on this cut has no start facing; their end facing stands in.
            const facingOf = (cut, idx, id) => boundaryOf(cutStart(seg, idx)).facing?.[id] ?? boundaryOf(cut.end).facing?.[id];
            const fa = facingOf(a, k - 1, ca), fb = facingOf(b, k, cb);
            const lr = ['screen-left', 'screen-right'];
            if (lr.includes(fa) && lr.includes(fb) && fa === fb) out.push(`${seg.id} cuts ${k}–${k + 1}: reverse shots on ${ca} and ${cb} both face ${fa} — two people looking the same way read as looking at a third party; one faces screen-left, the other screen-right`);
          }
        }
      }
    }
    return out;
  }),
  gate('continuity', 'storyboard', '起点 → 终点: boundaries per on-screen person, end feeds the next start, props change hands only on an action, the frame is one frozen instant', (ctx) => {
    const { project } = ctx;
    const out = [];
    for (const [, e] of ctx.episodes) {
      const segs = e.storyboard?.segments || [];
      segs.forEach((seg, si) => {
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1];
        const cuts = seg.cuts || [];
        const checkBoundary = (b, c, where, label) => {
          const bo = boundaryOf(b);
          for (const id of c.characters || []) {
            for (const f of BOUNDARY_FIELDS) {
              const v = bo[f]?.[id];
              if (f === 'heldProps' ? !Array.isArray(v) : !String(v || '').trim()) out.push(`${where}: ${label}.${f}.${id} is missing — every person on screen has a position, a facing, hands and held props at both ends`);
            }
            if (bo.facing?.[id] && !FACINGS.includes(bo.facing[id])) out.push(`${where}: ${label}.facing.${id} must be one of ${FACINGS.join(' / ')} (screen terms)`);
            for (const pid of asList(bo.heldProps?.[id])) if (!(scene?.props || []).includes(pid)) out.push(`${where}: ${label}.heldProps.${id} names ${pid}, which is not a prop of this scene`);
          }
        };
        cuts.forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          if (k === 0) {
            if (!isObject(c.start)) out.push(`${where}: start boundary is required on a segment's first cut`);
            else checkBoundary(c.start, c, where, 'start');
          } else if (c.start !== undefined) out.push(`${where}: only the first cut of a segment carries a start — later cuts begin where the previous cut ended`);
          if (!isObject(c.end)) { out.push(`${where}: end boundary is required`); return; }
          checkBoundary(c.end, c, where, 'end');
          // A prop changing hands is an action; it cannot happen between two lines.
          const start = cutStart(seg, k);
          for (const id of c.characters || []) {
            if (start.heldProps?.[id] === undefined) continue;   // entered this cut: no prior state to compare
            const a = heldOf(start, id), b = heldOf(c.end, id);
            if (a.join() !== b.join() && !cutBeats(scene, c).some(({ beat }) => beat.action !== undefined)) out.push(`${where}: ${id} holds [${a.join(', ')}] at the start and [${b.join(', ')}] at the end, but the cut claims no action beat — a hand-over is an action`);
          }
          // Keyframe drift: the frame freezes the start; a state that only exists at the end may not be in it.
          const frame = String(c.frame || '');
          const startStates = asList(start.state).map(String);
          for (const st of asList(c.end?.state).map(String)) if (st && !startStates.includes(st) && frame.includes(st)) out.push(`${where}: frame names "${st}", a state that only exists at the end of the cut — the frame is the start instant`);
          // Static test: a frame holds one instant, never a sequence.
          const seq = [...SEQUENCE_WORDS_EN.filter((w) => (w.endsWith(',') ? new RegExp(`\\b${w}`, 'i') : new RegExp(`\\b${w}\\b`, 'i')).test(frame)), ...SEQUENCE_WORDS_ZH.filter((w) => frame.includes(w))];
          if (seq.length) out.push(`${where}: frame contains "${seq.join(' / ')}" — a keyframe is one freezeable instant; ordered action belongs in motion`);
        });
        // Segment k+1 in the same scene starts where segment k ended.
        const prev = segs[si - 1];
        if (prev && Number(prev.sceneIndex) === Number(seg.sceneIndex) && cuts.length && (prev.cuts || []).length) {
          const a = boundaryOf(prev.cuts[prev.cuts.length - 1].end), b = boundaryOf(cuts[0].start);
          for (const id of cuts[0].characters || []) {
            if (!(prev.cuts[prev.cuts.length - 1].characters || []).includes(id)) continue;
            if (String(a.positions?.[id] || '') !== String(b.positions?.[id] || '')) out.push(`${seg.id} cut 1: ${id} starts at "${b.positions?.[id]}" but ${prev.id} left them at "${a.positions?.[id]}" — same scene, the boundary carries over`);
            if (heldOf(a, id).join() !== heldOf(b, id).join()) out.push(`${seg.id} cut 1: ${id} starts holding [${heldOf(b, id).join(', ')}] but ${prev.id} ended with [${heldOf(a, id).join(', ')}]`);
          }
        }
      });
    }
    return out;
  }),
  gate('motion', 'storyboard', '唯一动作: trigger → action → result per cut; the camera says why it moves and where it ends, or what still moves while it holds', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const names = forbiddenNames(project);
    const zh = videoModel(params).promptLang === 'zh';
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        (seg.cuts || []).forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          const m = isObject(c.motion) ? c.motion : {};
          for (const key of ['trigger', 'action', 'result']) {
            const v = String(m[key] || '').trim();
            if (!v) out.push(`${where}: motion.${key} is empty (起点 → 唯一动作 → 终点: what cues it, the one visible state chain, where it lands — or "hold")`);
            else if (!zh && !isEnglish(v)) out.push(`${where}: motion.${key} must be English — it goes into the video prompt`);
          }
          const action = String(m.action || '');
          for (const nm of names) if (containsName(action, nm)) out.push(`${where}: motion.action contains the name "${nm}" — use the identity or the reference label`);
          const inferred = INFERENCE_WORDS.filter((w) => (CJK_RE.test(w) ? action.includes(w) : new RegExp(`\\b${w}\\b`, 'i').test(action)));
          if (inferred.length) out.push(`${where}: motion.action infers an inner state ("${inferred.join(' / ')}") — write the visible action`);
          const hands = CJK_RE.test(action) ? HAND_VERBS_ZH.filter((v) => action.includes(v)).length : (action.toLowerCase().match(/[a-z]+/g) || []).filter((w) => HAND_VERBS_EN.includes(w)).length;
          if (hands > 3) out.push(`${where}: motion.action has ${hands} hand verbs — choreography a video model will not perform; hand the change to an object, split the cut, or end on a hold`);
          const cn = isObject(c.cameraNote) ? c.cameraNote : {};
          if (c.camera && c.camera !== 'Static Shot') {
            if (!CAMERA_MOTIVATIONS.includes(cn.motivation)) out.push(`${where}: ${c.camera} needs cameraNote.motivation (${CAMERA_MOTIVATIONS.join(' / ')}) — a move without a reason is decoration`);
            if (!String(cn.endFraming || '').trim()) out.push(`${where}: ${c.camera} needs cameraNote.endFraming — where the move stops`);
          } else if (!String(cn.hold || '').trim()) out.push(`${where}: a Static Shot needs cameraNote.hold — what still moves in the frame while the camera does not (an empty camera line is read as "free to drift")`);
        });
      }
    }
    return out;
  }),
  gate('sound', 'storyboard', '声音时间线: ambience per segment, chained across a scene; sfx pinned to a cut; music declared', (ctx) => {
    const out = [];
    for (const [, e] of ctx.episodes) {
      const segs = e.storyboard?.segments || [];
      segs.forEach((seg, i) => {
        const sd = isObject(seg.sound) ? seg.sound : null;
        if (!sd) { out.push(`${seg.id}: sound { ambience, sfx: [{cut, event}], music } is required — a same-pass model fills silence with sound of its own`); return; }
        if (!String(sd.ambience || '').trim()) out.push(`${seg.id}: sound.ambience is empty`);
        asList(sd.sfx).forEach((x, j) => {
          const cut = Number(x?.cut);
          if (!(cut >= 1 && cut <= (seg.cuts || []).length)) out.push(`${seg.id}: sound.sfx[${j}].cut must be a cut number of this segment`);
          if (!String(x?.event || '').trim()) out.push(`${seg.id}: sound.sfx[${j}].event is empty`);
        });
        const mu = sd.music;
        if (isObject(mu)) {
          if (!String(mu.intent || '').trim()) out.push(`${seg.id}: sound.music.intent is empty`);
          asList(mu.cues).forEach((c, j) => {
            if (!MUSIC_CUES.includes(c?.do)) out.push(`${seg.id}: sound.music.cues[${j}].do must be one of ${MUSIC_CUES.join(' / ')}`);
            const at = cueSeconds(c?.at, seg.cuts);
            const total = (seg.cuts || []).reduce((sum, x) => sum + (Number(x.seconds) || 0), 0);
            if (at == null || at < 0 || at > total + 1e-9) out.push(`${seg.id}: sound.music.cues[${j}].at must be a cut number or "12.5s" inside the segment`);
          });
        } else if (!String(mu || '').trim()) out.push(`${seg.id}: sound.music must be "N/A", the music's intent, or { intent, cues: [{ at, do }] }`);
        const prev = segs[i - 1];
        if (prev && Number(prev.sceneIndex) === Number(seg.sceneIndex) && isObject(prev.sound) && String(prev.sound.ambience || '').trim() && String(sd.ambience || '').trim() && prev.sound.ambience !== sd.ambience) out.push(`${seg.id}: ambience differs from ${prev.id} in the same scene — separately generated clips each invent their own room tone; keep the string identical across the scene`);
      });
    }
    return out;
  }),
  gate('visual-plan', 'storyboard', '场次视觉计划 for the key scenes (the 爽点 scene and the cliff scene)', (ctx) => {
    const out = [];
    for (const [ep, e] of ctx.episodes) {
      const key = keyScenes(e);
      const plans = asList(e.storyboard?.visualPlans);
      for (const si of key) {
        const plan = plans.find((pl) => Number(pl?.sceneIndex) === si);
        if (!plan) { out.push(`E${pad2(ep)} scene ${si}: no visual plan — it carries the ${Array.isArray(e.satisfactionBeat) && Number(e.satisfactionBeat[0]) === si ? '爽点' : 'cliff'}; answer 戏剧转向 / 观众立场 / 空间压力 / 视觉推进 / 摄影节奏 / 反应落点 / 声音策略 before cutting it`); continue; }
        for (const key of ['turn', 'alignment', 'pressure', 'progression', 'rhythm', 'landing', 'sound']) {
          const v = String(plan[key] || '').trim();
          if (!v) out.push(`E${pad2(ep)} scene ${si}: visualPlan.${key} is empty`);
          else if (QUOTE_RE.test(v)) out.push(`E${pad2(ep)} scene ${si}: visualPlan.${key} contains dialogue quotes`);
        }
      }
    }
    return out;
  }),
  gate('text-policy', 'storyboard', 'on-screen text: a readable prop’s text is exact in every frame that shows it; symbolic / blank props carry none', (ctx) => {
    const { project } = ctx;
    const out = [];
    const policies = new Map();
    for (const p of project.props || []) {
      if (!isObject(p.textPolicy)) continue;
      const tp = p.textPolicy;
      if (!['readable', 'symbolic', 'blank'].includes(tp.mode)) out.push(`${p.id}: textPolicy.mode must be readable / symbolic / blank`);
      if (tp.mode === 'readable' && !String(tp.text || '').trim()) out.push(`${p.id}: textPolicy.mode readable needs the exact text`);
      policies.set(p.id, tp);
    }
    if (!policies.size) return out;
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const shown = new Set();
        (seg.cuts || []).forEach((c, k) => {
          const frame = String(c.frame || '');
          for (const pid of c.props || []) {
            const tp = policies.get(pid);
            if (!tp) continue;
            shown.add(pid);
            const where = `${seg.id} cut ${k + 1}`;
            if (tp.mode === 'readable') {
              if (!frame.includes(String(tp.text))) out.push(`${where}: shows ${pid}, whose text "${tp.text}" must be in the frame verbatim`);
              if (/\bno text\b/i.test(frame)) out.push(`${where}: says "no text" while showing readable ${pid} — the global no-text overrides the evidence`);
            } else if (QUOTED_LINE_RE.test(frame)) out.push(`${where}: ${pid} is ${tp.mode}, but the frame quotes text on it`);
          }
        });
        for (const pid of shown) {
          const tp = policies.get(pid);
          if (tp.mode === 'readable' && String(seg.prompt || '').trim() && !String(seg.prompt).includes(String(tp.text))) out.push(`${seg.id}: prompt must carry the readable text "${tp.text}" of ${pid}`);
        }
      }
    }
    return out;
  }),
  gate('prompt-hygiene', 'storyboard', 'delivery text: filled, no ids / paths / notes, subtitles off, every on-screen person bound in their own shot, the non-speaker’s lips closed (H3)', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    const mode = videoModel(params);
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const prompt = String(seg.prompt || '');
        if (!prompt.trim()) continue;
        const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1];
        if (/…|…/.test(prompt)) out.push(`${seg.id}: prompt still has an unfilled "…" from the skeleton`);
        const ids = uniq([...prompt.matchAll(/\b([CSPB]\d{2,}|E\d{2}-\d{2})\b/g)].map((m) => m[1]));
        if (ids.length) out.push(`${seg.id}: prompt contains ids (${ids.join(', ')}) — the model renders them as text; describe, or use the @image label`);
        if (/\.(png|jpe?g|webp|mp4|mov|wav|mp3)\b/i.test(prompt)) out.push(`${seg.id}: prompt contains a file name — delivery text carries only what is to be filmed`);
        if (/\bTODO\b|\bnote:/i.test(prompt)) out.push(`${seg.id}: prompt contains a workflow note (TODO / note:) — keep it outside the prompt`);
        if (!params.subtitles) {
          const need = NO_SUBTITLES[mode.promptLang === 'zh' ? 'zh' : 'en'];
          if (!prompt.toLowerCase().includes(need.toLowerCase())) out.push(`${seg.id}: prompt must say "${need}" — same-pass models add captions unless told not to (params.subtitles: true to allow)`);
        }
        const texts = shotTexts(prompt, mode.family, params.references);
        const refs = segmentReferences(project, e, seg);
        const sheetOf = params.references === 'sheets'
          ? (() => {
              const m = new Map();
              for (const r of refs.filter((x) => x.kind === 'image')) {
                const who = r.faceOf || (r.asset === 'sheet' || r.asset === 'headshot' ? r.entity : null);
                if (who && !m.has(who)) m.set(who, r.label);
              }
              // Prefer explicit headshot / faceOf over later body sheets
              for (const r of refs.filter((x) => x.kind === 'image' && (x.asset === 'headshot' || x.faceOf))) {
                const who = r.faceOf || r.entity;
                m.set(who, r.label);
              }
              return m;
            })()
          : null;
        (seg.cuts || []).forEach((c, k) => {
          const text = texts.get(k + 1);
          if (!text) return;   // the dialect gate reports the missing shot
          const lines = claimedLines(scene, [c]);
          if (mode.family === 'h3' && lines.length && (c.characters || []).length >= 2 && !/does not speak|lips remain completely closed/.test(text)) out.push(`${seg.id} [Shot ${k + 1}]: two people on screen while one speaks — say the other "does not speak; ${LIPS_CLOSED}" or the lip-sync lands on the more visible face (measured 3/3 vs 2/3)`);
          if (sheetOf) for (const id of c.characters || []) {
            const label = sheetOf.get(id);
            if (label && !text.includes(label)) out.push(`${seg.id} shot ${k + 1}: ${characterById(project, id)?.identityEn || id} is on screen but the shot never binds ${label} — a person bound in one shot and unbound in the next becomes two people`);
          }
        });
        if (mode.family === 'h3') for (const m of prompt.matchAll(/<d>\[[^\]]+\]\s*([^<]*)<\/d>/g)) if (/[()（）]/.test(m[1])) out.push(`${seg.id}: <d> holds only the line — "${truncateLine(m[1])}" carries a parenthetical; put the direction outside <d>`);
      }
    }
    return out;
  }),
  gate('audio-track', 'storyboard', 'Seed Audio node per segment: the derived prompt fits the model (≤ 120 s, ≤ 2048 chars, ≤ 3 voices in full mode)', (ctx) => {
    const { project, params } = ctx;
    const out = [];
    if (params.audioTrack === 'none') return out;
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        if (!(seg.cuts || []).length || !isObject(seg.sound)) continue;
        const a = audioPrompt(project, e, seg);
        if (a.seconds > AUDIO_MAX_SECONDS) out.push(`${seg.id}: ${round2(a.seconds)} s, but ${AUDIO_MODEL} generates at most ${AUDIO_MAX_SECONDS} s`);
        if (a.prompt.length > AUDIO_MAX_CHARS) out.push(`${seg.id}: the audio prompt is ${a.prompt.length} chars, max ${AUDIO_MAX_CHARS} — shorten sound.ambience / sfx / music.intent`);
        if (a.mode === 'full' && a.references.length > AUDIO_MAX_REFS) out.push(`${seg.id}: ${a.references.length} speakers, but ${AUDIO_MODEL} takes at most ${AUDIO_MAX_REFS} reference voices — set params.audioTrack = bed or split the segment`);
      }
    }
    return out;
  }),
  gate('storyboard-advice', 'storyboard', 'shot craft advice: 9:16 wides need depth, size jumps, a segment that only tightens, long frames, negative-form motion (advisory)', (ctx) => {
    const { params } = ctx;
    const out = [];
    const vertical = (() => { const [w, h] = String(params.ratio).split(':').map(Number); return h > w; })();
    for (const [, e] of ctx.episodes) {
      for (const seg of e.storyboard?.segments || []) {
        const cuts = seg.cuts || [];
        let ups = 0, downs = 0;
        cuts.forEach((c, k) => {
          const where = `${seg.id} cut ${k + 1}`;
          if (vertical && ['wide', 'extreme-wide'].includes(c.size) && !String(c.background || '').trim() && !String(c.note || '').trim()) out.push(`${where}: a ${c.size} on 9:16 has a third of the width — carry the geography in depth (background) or say why the wide is needed (note)`);
          if (k > 0) {
            const d = sizeIndex(c.size) - sizeIndex(cuts[k - 1].size);
            if (Math.abs(d) > 2 && !String(c.note || '').trim()) out.push(`${where}: jumps ${Math.abs(d)} size steps from cut ${k} — the ladder moves a step or two; a bigger jump needs an attention reason (say it in note)`);
            if (d > 0) ups += 1; else if (d < 0) downs += 1;
          }
          if (String(c.frame || '').length > params.maxFrameChars) out.push(`${where}: frame is ${c.frame.length} chars — past ~${params.maxFrameChars} the rest is padding the model pays for; delete any sentence whose absence changes nothing`);
          const action = String(c.motion?.action || '');
          if (/\b(does not|doesn't|never)\b/i.test(action) || /没有|不去|不[看说动]/.test(action)) out.push(`${where}: motion.action is phrased as what does not happen — a model cannot film an absence; write the action that happens instead (a hold, a hand that stays)`);
        });
        if (cuts.length >= 4 && ups >= 2 && downs === 0) out.push(`${seg.id}: every cut tightens — by mid-segment there is nowhere left to go; step back out once or hold the working size`);
      }
    }
    return out;
  }, { advisory: true }),
];

export const STAGES = ['outline', 'characters', 'art', 'script', 'storyboard'];

// ── derived values ──────────────────────────────────────────────────────────

export function episodeSeconds(episode, params) {
  let total = 0;
  for (const sc of episode.scenes || []) for (const b of sc.flow || []) total += beatSeconds(b, params);
  return total;
}

export function beatSeconds(beat, params) {
  return beat.line !== undefined ? lineSeconds(beat.line, params) : params.actionSeconds;
}

export function dialogueSeconds(scene, [from, to], params) {
  let total = 0;
  for (let i = from - 1; i < to; i++) {
    const b = (scene.flow || [])[i];
    if (b && b.line !== undefined) total += lineSeconds(b.line, params);
  }
  return total;
}

/** Dialogue lines claimed by a segment, in order. */
export function claimedLines(scene, cuts) {
  const lines = [];
  for (const c of cuts) {
    const [from, to] = c.beats || [0, -1];
    for (let i = from - 1; i < to; i++) {
      const b = (scene.flow || [])[i];
      if (b && b.line !== undefined) lines.push({ speaker: b.speaker, line: String(b.line), delivery: b.delivery });
    }
  }
  return lines;
}

/** Cumulative start second of every cut. */
export function cutStarts(cuts) {
  const starts = [];
  let t = 0;
  for (const c of cuts) {
    starts.push(t);
    t += Number(c.seconds) || 0;
  }
  return starts;
}

export function timestamp(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${pad2(m)}:${s.toFixed(3).padStart(6, '0')}`;
}

export function h3AlignmentLine(cuts) {
  if (cuts.length === 1) {
    return 'For the target video, at 0.00 seconds into the target video, @image1 (from [Shot 1]) is fully referenced.';
  }
  const starts = cutStarts(cuts);
  const parts = cuts.map((_, i) => `@image${i + 1} (from Shot ${i + 1}) aligns with the ${starts[i].toFixed(2)}-second mark of the target video`);
  return `How the reference pictures align with the target video — ${parts.join('; ')}.`;
}

function checkH3Prompt(seg, prompt, lines, project, names, params = {}, sheetCount = 0, refs = []) {
  const out = [];
  const cuts = seg.cuts;
  const firstLine = prompt.split('\n')[0].trim();
  if (params.references === 'sheets') {
    // H3 ref addresses its references as "Image 1 / Image 2"; there are no keyframes to align.
    const imageNs = [...prompt.matchAll(/@image(\d+)/g)].map((m) => Number(m[1]));
    for (let k = 1; k <= sheetCount; k++) if (!imageNs.includes(k)) out.push(`${seg.id}: @image${k} (a sheet this segment references) is never mentioned — say what it is`);
    for (const r of uniq(refs)) if (r > sheetCount) out.push(`${seg.id}: @image${r} but the segment references ${sheetCount} sheet(s)`);
    if (/aligns with the|is fully referenced/.test(prompt)) out.push(`${seg.id}: keyframe alignment wording found — in sheets mode the references are sheets, not shots`);
  } else {
    const expected = h3AlignmentLine(cuts);
    if (firstLine !== expected) out.push(`${seg.id}: first line must be the alignment line derived from the cuts:\n      ${expected}`);
  }
  const idx = ['integrated_multimodal_description:', 'overall_soundscape:', 'non_diegetic_music:'].map((f) => prompt.indexOf(f));
  if (idx.some((i) => i < 0)) out.push(`${seg.id}: prompt needs integrated_multimodal_description:, overall_soundscape:, non_diegetic_music:`);
  else if (!(idx[0] < idx[1] && idx[1] < idx[2])) out.push(`${seg.id}: the three fields must be in order`);
  const starts = cutStarts(cuts);
  const paragraphs = shotParagraphs(prompt);
  cuts.forEach((c, k) => {
    const para = paragraphs.get(k + 1);
    if (!para) { out.push(`${seg.id}: missing [Shot ${k + 1}] paragraph`); return; }
    if (k > 0) {
      const at = `At ${timestamp(starts[k])},`;
      if (!para.startsWith(at)) out.push(`${seg.id}: [Shot ${k + 1}] must start with "${at}" (cumulative cut seconds)`);
    }
    if (c.camera && !para.toLowerCase().includes(String(c.camera).toLowerCase())) out.push(`${seg.id}: [Shot ${k + 1}] must mention its camera move "${c.camera}"`);
    // Keyframe k belongs to shot k: the alignment line says so, and the paragraph has to use it.
    if (params.references !== 'sheets' && !para.includes(`@image${k + 1}`)) out.push(`${seg.id}: [Shot ${k + 1}] must anchor on @image${k + 1} — that is the keyframe aligned to it`);
  });
  const tag = langTag(project.lang);
  for (const l of lines) {
    if (!prompt.includes(`<d>[${tag}] ${l.line}</d>`)) out.push(`${seg.id}: dialogue must appear verbatim as <d>[${tag}] ${l.line}</d>`);
  }
  out.push(...checkSpeechDirections(seg, prompt, lines, project, 'en', refs));
  const outside = prompt.replace(/<d>[\s\S]*?<\/d>/g, '');
  for (const n of names) if (containsName(outside, n)) out.push(`${seg.id}: prompt contains the name "${n}" outside <d> — use a generic identity`);
  if (!isEnglish(outside)) out.push(`${seg.id}: prompt must be English outside <d> blocks`);
  return out;
}

/**
 * Every character who speaks in this segment must have their delivery in the prompt: the video model
 * reads a line the way the prompt tells it to, and left alone it reads everyone the same. The
 * character bible already decided how this person sounds — the same words that built their voice
 * sample — so the clip inherits it instead of inventing a new reading per segment.
 */
/** How far before a line the prompt may name its voice reference — room for a sentence of action. */
const ATTRIBUTION_WINDOW = 400;

function truncateLine(text, max = 24) {
  const t = String(text);
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function checkSpeechDirections(seg, prompt, lines, project, lang, refs = []) {
  const out = [];
  const voiceOf = new Map(refs.filter((r) => r.kind === 'audio').map((r) => [r.entity, r.label]));
  const seen = new Set();
  for (const l of lines) {
    if (seen.has(l.speaker)) continue;
    seen.add(l.speaker);
    const ch = characterById(project, l.speaker);
    if (!ch) continue;
    const direction = speechDirection(ch, '', lang);
    if (direction && !prompt.includes(direction)) out.push(`${seg.id}: ${l.speaker} speaks here, so the prompt must carry their delivery verbatim: "${direction}"`);
  }
  // Every single line has to be attributed to its voice reference, not just mentioned once: the model
  // decides per line which voice to read in, and an unattributed line is read in a default voice.
  for (const l of lines) {
    const voice = voiceOf.get(l.speaker);
    if (!voice) continue;
    const at = prompt.indexOf(l.line);
    if (at < 0) continue;   // the verbatim check reports a missing line
    const lead = prompt.slice(Math.max(0, at - ATTRIBUTION_WINDOW), at);
    if (!lead.includes(voice)) out.push(`${seg.id}: the line "${truncateLine(l.line)}" is not attributed to ${voice} — every line this character speaks must name their voice reference (\`${voice} says: …\`), not only the legend`);
  }
  const audio = refs.filter((r) => r.kind === 'audio');
  for (const r of audio) {
    if (!prompt.includes(r.label)) out.push(`${seg.id}: ${r.label} (${r.why}) is connected to the node but never mentioned`);
  }
  const used = uniq([...prompt.matchAll(/@audio(\d+)/g)].map((m) => Number(m[1])));
  for (const k of used) if (k > audio.length) out.push(`${seg.id}: @audio${k} but only ${audio.length} voice reference(s) are connected`);
  // Same rule for the clip references: connected means used, and used means connected.
  const clips = refs.filter((r) => r.kind === 'video');
  for (const r of clips) {
    if (!prompt.includes(r.label)) out.push(`${seg.id}: ${r.label} (${r.why}) is connected to the node but never mentioned — say what to carry over from it`);
  }
  const usedVideo = uniq([...prompt.matchAll(/@video(\d+)/g)].map((m) => Number(m[1])));
  for (const k of usedVideo) if (k > clips.length) out.push(`${seg.id}: @video${k} but only ${clips.length} clip reference(s) are connected`);
  return out;
}

function shotParagraphs(prompt) {
  const map = new Map();
  const re = /\[Shot (\d+)\]\s*([\s\S]*?)(?=\n\[Shot \d+\]|\n\s*\n|$)/g;
  let m;
  while ((m = re.exec(prompt))) map.set(Number(m[1]), m[2].trim());
  return map;
}

export function seedanceAnchors(n) {
  const lines = [];
  if (n >= 2) lines.push(`Use @image1 through @image${n} as keyframes in that order.`);
  lines.push('Use @image1 as the first frame.');
  if (n >= 2) lines.push(`Use @image${n} as the last frame.`);
  return lines;
}

/** Wan 3.0 Ref is prompted in Chinese, but its references keep WJI's own @image1… labels. */
/** Sheets mode: the references are sheets, not keyframes, so the legend says what each one is. */
export function wanSheetLegendLine(refs) {
  const parts = refs.map((r) => `${r.label}=${r.zh || r.use}`);
  return `\u53c2\u8003\u56fe\u8bf4\u660e\uff1a${parts.join('\uff1b')}\u3002\u4e25\u683c\u6309\u53c2\u8003\u56fe\u8fd8\u539f\u573a\u666f\u3001\u4eba\u7269\u4e0e\u9053\u5177\u3002`;
}

export function wanLegendLine(cuts, refs = []) {
  const parts = cuts.map((_, i) => `@image${i + 1}=\u955c\u5934${i + 1}\u5173\u952e\u5e27`);
  // The voices are their own @audioN series, appended to the same legend.
  for (const r of refs.filter((x) => x.kind !== 'image')) parts.push(`${r.label}=${r.zh || r.use}`);
  return `\u53c2\u8003\u56fe\u8bf4\u660e\uff1a${parts.join('\uff1b')}\u3002\u6309\u987a\u5e8f\u8fd8\u539f\u6bcf\u4e2a\u955c\u5934\u7684\u6784\u56fe\u3001\u4eba\u7269\u5916\u5f62\u4e0e\u573a\u666f\u3002`;
}

/** `镜头k（0.0–3.0秒，中景，推近）：` — every part derived from the cut, so it is checkable. */
export function wanShotHeader(cuts, k) {
  const starts = cutStarts(cuts);
  const c = cuts[k];
  const end = starts[k] + (Number(c.seconds) || 0);
  const size = SIZES_ZH[c.size] || c.size;
  const cam = CAMERAS_ZH[c.camera] || c.camera;
  return `\u955c\u5934${k + 1}\uff08${starts[k].toFixed(1)}\u2013${end.toFixed(1)}\u79d2\uff0c${size}\uff0c${cam}\uff09\uff1a`;
}

function checkWanPrompt(seg, prompt, lines, names, params, project, sheetRefs = []) {
  const out = [];
  const cuts = seg.cuts;
  const firstLine = prompt.split('\n')[0].trim();
  const expected = params.references === 'sheets' ? wanSheetLegendLine(sheetRefs) : wanLegendLine(cuts, sheetRefs);
  if (firstLine !== expected) out.push(`${seg.id}: first line must be the reference legend derived from the ${params.references === 'sheets' ? 'sheets' : 'cuts'}:\n      ${expected}`);
  cuts.forEach((c, k) => {
    const head = wanShotHeader(cuts, k);
    if (!prompt.includes(head)) out.push(`${seg.id}: prompt must contain verbatim "${head}"`);
  });
  if (lines.length && !prompt.includes('\u53f0\u8bcd')) out.push(`${seg.id}: spoken cuts need 台词（图k中的…）：「…」 blocks`);
  for (const l of lines) if (!prompt.includes(l.line)) out.push(`${seg.id}: dialogue "${l.line}" must appear verbatim`);
  if (!prompt.includes('\u97f3\u9891\uff1a')) out.push(`${seg.id}: prompt needs an 音频： line (Wan 3.0 generates the sound with the picture)`);
  const accent = String(params.speechAccent || '').trim();
  if (accent && !prompt.includes(accent)) out.push(`${seg.id}: 音频 line must name the accent "${accent}" (params.speechAccent)`);
  out.push(...checkSpeechDirections(seg, prompt, lines, project, 'zh', sheetRefs));
  const outside = lines.reduce((p, l) => p.split(l.line).join(''), prompt);
  for (const n of names) if (outside.includes(n)) out.push(`${seg.id}: prompt contains the name "${n}" outside dialogue — identify people by @imagek`);
  if (prompt.length > 20000) out.push(`${seg.id}: prompt is ${prompt.length} chars, max 20,000`);
  return out;
}

function checkSeedancePrompt(seg, prompt, lines, names, params = {}, sheetCount = 0, project = {}, refs = []) {
  const out = [];
  const sheets = params.references === 'sheets';
  const n = sheets ? sheetCount : seg.cuts.length;
  const imageNs = [...prompt.matchAll(/@image(\d+)/g)].map((m) => Number(m[1]));
  if (sheets) {
    for (let k = 1; k <= n; k++) if (!imageNs.includes(k)) out.push(`${seg.id}: @image${k} (a sheet this segment references) is never mentioned — say what it is`);
    for (const r of uniq(imageNs)) if (r > n) out.push(`${seg.id}: @image${r} but the segment references ${n} sheet(s)`);
    for (const sentence of seedanceAnchors(seg.cuts.length)) if (prompt.includes(sentence)) out.push(`${seg.id}: "${sentence}" is a keyframe anchor — in sheets mode the references are sheets, not frames`);
  } else {
    for (const sentence of seedanceAnchors(n)) if (!prompt.includes(sentence)) out.push(`${seg.id}: prompt must contain verbatim "${sentence}"`);
    for (const r of uniq(imageNs)) if (r > n) out.push(`${seg.id}: @image${r} but the segment has ${n} keyframe(s)`);
    // The anchors only name the first and the last; every keyframe in between needs its own state.
    for (let k = 1; k <= n; k++) if (!imageNs.includes(k)) out.push(`${seg.id}: @image${k} (keyframe ${k}) is never mentioned — say what that frame defines`);
  }
  for (const c of seg.cuts) if (c.camera && !prompt.toLowerCase().includes(String(c.camera).toLowerCase())) out.push(`${seg.id}: prompt must mention the camera move "${c.camera}"`);
  for (const l of lines) if (!prompt.includes(l.line)) out.push(`${seg.id}: dialogue "${l.line}" must appear verbatim`);
  out.push(...checkSpeechDirections(seg, prompt, lines, project, 'en', refs));
  const outsideLines = lines.reduce((p, l) => p.split(l.line).join(''), prompt);
  for (const nm of names) if (containsName(outsideLines, nm)) out.push(`${seg.id}: prompt contains the name "${nm}" — use a generic identity`);
  if (!isEnglish(outsideLines)) out.push(`${seg.id}: prompt must be English apart from dialogue`);
  if (prompt.length > 10000) out.push(`${seg.id}: prompt is ${prompt.length} chars, max 10,000`);
  return out;
}

// ── validation driver ───────────────────────────────────────────────────────

export function parseEpRange(text) {
  if (!text) return null;
  const out = new Set();
  for (const part of String(text).split(',')) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`bad --ep "${text}" (use 1, 1-3 or 1,3)`);
    const a = Number(m[1]), b = Number(m[2] ?? m[1]);
    for (let i = a; i <= b; i++) out.add(i);
  }
  return [...out].sort((a, b) => a - b);
}

export function makeContext(project, episodes, opts = {}) {
  const params = paramsOf(project);
  const map = new Map();
  const wanted = opts.eps ? new Set(opts.eps) : null;
  for (const [ep, data] of Object.entries(episodes || {})) {
    if (!wanted || wanted.has(Number(ep))) map.set(Number(ep), data);
  }
  return { project, params, episodes: map };
}

export function runGates(ctx, opts = {}) {
  const stage = opts.stage;
  const stages = stage ? STAGES.slice(0, STAGES.indexOf(stage) + 1) : STAGES;
  const only = opts.only ? new Set(opts.only) : null;
  const results = [];
  for (const g of GATES) {
    if (!stages.includes(g.stage)) continue;
    if (only && !only.has(g.stage)) continue;
    if (['script', 'storyboard'].includes(g.stage) && !ctx.episodes.size) {
      results.push({ id: g.id, stage: g.stage, label: g.label, skipped: 'no episode files', failures: [] });
      continue;
    }
    let findings;
    try {
      findings = g.run(ctx);
    } catch (err) {
      findings = [`gate crashed: ${err.message}`];
    }
    if (g.advisory) results.push({ id: g.id, stage: g.stage, label: g.label, advisory: true, failures: [], warnings: findings });
    else results.push({ id: g.id, stage: g.stage, label: g.label, failures: findings });
  }
  return results;
}

// ── seed ────────────────────────────────────────────────────────────────────

export function seedScript(project, ep) {
  const params = paramsOf(project);
  const outlineEp = (project.outline?.episodes || []).find((e) => Number(e.ep) === Number(ep));
  if (!outlineEp) throw new Error(`outline has no episode ${ep}`);
  const beats = beatsOfEpisode(project, ep);
  const prev = (project.outline?.episodes || []).find((e) => Number(e.ep) === Number(ep) - 1);
  // Everyone in this episode, with the speech rules the bible set for them — the writer reads these
  // at the point of writing instead of paging back to the character datasets.
  const speech = {};
  for (const id of outlineEp.characterIds || []) {
    const c = characterById(project, id);
    const sp = c?.bible?.speech || {};
    if (c) speech[id] = { name: displayName(project, id, ep), rhythm: sp.rhythm || '', silence: sp.silence || '', catchphrase: sp.catchphrase || '', forbiddenWords: sp.forbiddenWords || [], register: sp.register || '', voice: c.voice?.pace || '' };
  }
  return {
    ep: Number(ep),
    targetSeconds: Math.round(Number(params.minutesPerEpisode) * 60),
    // The episode design from the outline's 分集目录 — gated against it in the script stage.
    function: asList(outlineEp.function),
    task: isObject(outlineEp.task) ? { ...outlineEp.task } : { goal: '', obstacle: '', stake: '' },
    change: outlineEp.change || '',
    hookType: outlineEp.hookType || '',
    hook: '',
    cliff: outlineEp.hook || '',
    beatsClaimed: beats.map((b) => b.id),
    hookBeat: [1, 1],
    satisfactionBeat: null,
    scenes: [],
    seedNote: {
      synopsis: outlineEp.synopsis || '',
      openingHook: `write \`hook\` yourself: the concrete image, in motion, that opens the episode (on screen within the first ${params.hookWindow} beats and by ${params.hookSeconds} s). \`cliff\` is seeded from the outline's hook — the question that makes them tap the next episode`,
      suspense: outlineEp.suspense || '',
      satisfaction: isObject(outlineEp.satisfaction) ? { ...outlineEp.satisfaction } : { type: '', action: '' },
      register: params.register,
      guidelinePriorities: asList(project.outline?.guideline?.priorities),
      guidelineForbidden: asList(project.outline?.guideline?.forbidden),
      speech,
      rhythm: `hook image by ${params.hookSeconds} s · a turn (new information / obstacle / counter / choice, \`turn: true\`) at least every ${params.turnSeconds} s · 爽点 (satisfactionBeat) on a visible action after the hook and before the cliff · no more than ${params.maxConsecutiveLines} lines in a row`,
      sceneIds: outlineEp.sceneIds || [],
      characterIds: outlineEp.characterIds || [],
      propIds: outlineEp.propIds || [],
      crowdPlan: outlineEp.crowdPlan || '',
      warnings: outlineEp.warnings || [],
      beats: beats.map((b) => ({ id: b.id, type: b.type, weight: b.weight || 'minor', setup: b.setup, payoff: b.payoff })),
      previousCliff: prev?.hook || '',
      budget: `${Math.round(Number(params.minutesPerEpisode) * 60)} s ≈ ${Math.round((Number(params.minutesPerEpisode) * 60) / 3.3)} beats; lines at ${params.charsPerSecond} chars/s, actions ${params.actionSeconds} s each`,
    },
    storyboard: { segments: [] },
    wji: { screenplayDatasetId: '', canvasId: '', shotFolderId: '', displayNodes: {} },
  };
}

export function seedStoryboard(project, episode) {
  const params = paramsOf(project);
  const seedScenes = (episode.scenes || []).map((sc, i) => ({
    sceneIndex: i + 1,
    sceneId: sc.sceneId,
    lighting: sc.lighting || '',
    characters: sc.characters || [],
    props: sc.props || [],
    beats: (sc.flow || []).map((b, k) => ({
      n: k + 1,
      kind: b.line !== undefined ? 'line' : 'action',
      seconds: round2(beatSeconds(b, params)),
      speaker: b.speaker,
      text: b.line !== undefined ? b.line : b.action,
    })),
  }));
  // The key scenes (the 爽点 scene, the cliff scene) get a visual-plan worksheet; every scene an axis hint.
  const key = keyScenes(episode);
  const visualPlans = key.map((si) => ({ sceneIndex: si, turn: '', alignment: '', pressure: '', progression: '', rhythm: '', landing: '', sound: '' }));
  seedScenes.forEach((sc) => {
    const pairs = [];
    const chars = sc.characters || [];
    for (let i = 0; i < chars.length; i++) for (let j = i + 1; j < chars.length; j++) pairs.push([chars[i], chars[j]]);
    sc.axisHint = pairs.length ? `declare segment.axis for ${pairs.map((p) => p.join(' ↔ ')).join(', ')}: who is screen-left, who is screen-right, which side the camera lives on` : 'single person — no axis needed';
  });
  return {
    ...episode,
    storyboard: { plan: segmentPlan(project, episode), seedScenes, visualPlans, segments: [] },
  };
}

/**
 * How the episode has to be cut up for THIS model. A segment is one video generation, so its length is
 * the provider's duration range — 15 s on minimax-h3-ref and the Seedance 2.0 pair, 30 s on
 * seedance-2.5-ref and wan-3.0-ref. The same 90-second episode is therefore 3 segments on one model and
 * 7 on another, and the split has to follow the model rather than the writer's instinct.
 * A segment never spans two scenes, so each scene is divided on its own.
 */
export function segmentPlan(project, episode) {
  const params = paramsOf(project);
  const mode = videoModel(params);
  const lo = params.minSegmentSeconds, hi = params.maxSegmentSeconds;
  const scenes = (episode.scenes || []).map((sc, i) => {
    const seconds = round2((sc.flow || []).reduce((sum, b) => sum + beatSeconds(b, params), 0));
    // As few generations as the model allows, then spread the seconds evenly so no segment is under the floor.
    const count = Math.max(1, Math.ceil(seconds / hi));
    const each = seconds / count;
    return {
      sceneIndex: i + 1,
      sceneId: sc.sceneId,
      seconds,
      segments: count,
      secondsPerSegment: round2(each),
      note: each < lo ? `under ${mode.model}'s ${lo} s floor — merge this scene with the next or lengthen it` : '',
    };
  });
  return {
    model: mode.model,
    segmentSeconds: [lo, hi],
    wholeSecondsOnly: true,
    duration: params.videoDuration,
    maxReferences: mode.maxRefs,
    episodeSeconds: round2(scenes.reduce((sum, sc) => sum + sc.seconds, 0)),
    segments: scenes.reduce((sum, sc) => sum + sc.segments, 0),
    scenes,
  };
}

/**
 * The text sent to the voice model: a parenthetical acting direction followed by the line.
 * Measured on Seed Audio 1.0: the parenthetical is obeyed, not spoken (a 12-character line ran
 * 5.17 s plain and 4.88 s with the direction), so it costs nothing in the sample's length.
 */
/**
 * The full prompt of one image node on the characters / scenes / props canvas, in the project's
 * image-prompt language: the headshot (1:1), the sheet (16:9; a character's references its headshot
 * as @image1), a scene's lighting variant and a prop's state (both reference the sheet as @image1).
 * The Operator pastes `prompt` and `negative` as they are — no hand-assembled prefixes.
 */
export function imagePrompt(project, id, asset) {
  const params = paramsOf(project);
  const kit = imagePromptKit(params);
  const zh = kit.zh;
  const c = characterById(project, id), sc = sceneById(project, id), pr = propById(project, id);
  const entity = c || sc || pr;
  if (!entity) throw new Error(`no character / scene / prop ${id}`);
  const img = entity.image || {};
  const out = (prompt, ratio, from) => ({ entity: id, asset, lang: params.imagePromptLang, prompt, negative: String(img.negativePrompt || ''), ratio, from });
  const kind = asset || 'sheet';
  if (c) {
    if (kind === 'headshot') return out(zh ? `${img.prompt}，正面干净人像，纯色中性背景` : `${img.prompt}, clean front-facing portrait, plain neutral background`, '1:1', null);
    if (kind === 'sheet') return out(`${zh ? '@image1 是必须完全一致的脸——五官与发型相同。' : '@image1 is the face to match exactly — same features, same hairstyle. '}${img.sheet}`, '16:9', 'headshot');
    throw new Error(`a character has --asset headshot | sheet, not ${kind}`);
  }
  if (kind === 'sheet') return out(String(img.sheet || ''), '16:9', null);
  if (sc && kind.startsWith('lighting:')) {
    const state = kind.slice('lighting:'.length);
    const l = (sc.lighting || []).find((x) => x.state === state);
    if (!l) throw new Error(`${id} has no lighting state "${state}" (${(sc.lighting || []).map((x) => x.state).join(' / ')})`);
    return out(zh
      ? `@image1 是同一个空间；结构、材质与磨损完全一致，只改变光线：${l.prompt}。空场景，没有任何人，${kit.framePhrase}`
      : `@image1 is this exact space; keep structure, materials and wear identical; change only the lighting: ${l.prompt}. Empty scene, no people, ${kit.framePhrase}`, '16:9', 'sheet');
  }
  if (pr && kind.startsWith('state:')) {
    const state = kind.slice('state:'.length);
    const st = (pr.states || []).find((x) => x.state === state);
    if (!st) throw new Error(`${id} has no state "${state}" (${(pr.states || []).map((x) => x.state).join(' / ')})`);
    return out(zh
      ? `@image1 是要完全还原的同一件道具。${st.prompt}。纯白背景，没有人，没有手`
      : `@image1 is the prop to reproduce exactly. ${st.prompt}, pure white background, no people, no hands`, '16:9', 'sheet');
  }
  throw new Error(sc ? `a scene has --asset sheet | lighting:<state>` : `a prop has --asset sheet | state:<state>`);
}

export function voiceSamplePrompt(character, params = {}) {
  const v = character?.voice || {};
  const pf = character?.profile || {};
  const sample = v.sample || {};
  const line = String(sample.line || '').trim();
  const bits = [];
  const who = [pf.ageRange, pf.gender].filter(Boolean).join('');
  if (who) bits.push(who);
  if (pf.identity) bits.push(String(pf.identity));
  const personality = (pf.personality || []).filter(Boolean).join('\u3001');
  if (personality) bits.push(`\u6027\u683c${personality}`);
  for (const key of ['timbre', 'pitch', 'pace', 'accent', 'emotion']) {
    if (v[key]) bits.push(String(v[key]).trim());
  }
  // `voice.accent` is the drama-language wording and wins; speechAccent only fills a gap.
  const accent = String(params.speechAccent || '').trim();
  if (accent && !v.accent) bits.push(accent);
  if (sample.direction) bits.push(`\u6b64\u523b${String(sample.direction).trim()}`);
  // Seed Audio will happily add a room, music and sfx; a timbre reference has to be a dry voice.
  bits.push('\u5e72\u58f0\uff0c\u65e0\u914d\u4e50\u65e0\u97f3\u6548');
  // Quote marks inside the direction get read aloud; the parenthetical is an instruction, not text.
  const brief = bits.join('\uff1b').replace(QUOTE_RE_G, '');
  return brief ? `\uff08${brief}\uff09${line}` : line;
}

/** How long the voice model will take over the sample line (its speech rate, not the reading rate). */
export function voiceSampleSeconds(character, params) {
  return nonWhitespace(character?.voice?.sample?.line) / (Number(params.speechCharsPerSecond) || 2.4);
}

/** Sheets a segment needs, in reference order: environment [+ lighting state], each person (first appearance), each prop. */
export function segmentReferences(project, episode, seg) {
  const scene = (episode.scenes || [])[Number(seg.sceneIndex) - 1] || {};
  const sceneEntity = sceneById(project, scene.sceneId) || {};
  const params = paramsOf(project);
  const refs = [];
  // Optional per-segment image ref plan (Director Strategy B etc.) — pictures only; voices/video still appended below.
  if (Array.isArray(seg.refOverride) && seg.refOverride.length) {
    for (const r of seg.refOverride) {
      refs.push({
        entity: r.entity,
        asset: r.asset || 'sheet',
        why: r.why || `${r.entity}:${r.asset || 'sheet'}`,
        use: r.use || 'a reference image for this segment',
        zh: r.zh || '',
        kind: 'image',
        faceOf: r.faceOf || null,
      });
    }
  } else {
    refs.push({ entity: scene.sceneId, asset: 'sheet', why: `environment: ${sceneEntity.name || scene.sceneId}${scene.lighting ? ` (${scene.lighting})` : ''}`, use: 'the environment \u2014 match its layout, materials and wear exactly', zh: '环境，严格还原布局、材质与旧痕' });
    if (scene.lighting && sceneEntity.wji?.assets?.lighting?.[scene.lighting]) refs.push({ entity: scene.sceneId, asset: `lighting:${scene.lighting}`, why: `lighting state ${scene.lighting}`, use: 'the same environment in the lighting state to use', zh: '同一场景的光线状态' });
    const seen = new Set();
    if (params.humanReferences !== false) for (const c of seg.cuts || []) for (const id of c.characters || []) if (!seen.has(id)) { seen.add(id); refs.push({ entity: id, asset: 'sheet', why: `face and clothes of ${characterById(project, id)?.name || id}`, use: 'the character sheet of one person in this segment \u2014 match face, hair and clothes exactly', zh: '人物三视图，严格还原面容、发型与服装' }); }
    for (const c of seg.cuts || []) for (const id of c.props || []) if (!seen.has(id)) { seen.add(id); refs.push({ entity: id, asset: 'sheet', why: `prop ${propById(project, id)?.name || id}`, use: 'the prop to reproduce exactly', zh: '需要严格还原的道具' }); }
    refs.forEach((r) => (r.kind = 'image'));
  }
  // The clip before this one, when the project asks for it: the cheapest continuity there is — the
  // model sees what the last generation actually produced, not a description of it.
  if (params.videoReferences === 'previous') {
    const all = episode.storyboard?.segments || [];
    const at = all.findIndex((x) => x.id === seg.id);
    const prev = at > 0 ? all[at - 1] : null;
    if (prev) refs.push({ entity: prev.id, asset: 'video', kind: 'video', why: `the clip before this one (${prev.id})` });
  }
  // The voice of everyone who SPEAKS in this segment: an audio reference, so the clip is read in the
  // timbre the character bible fixed rather than whatever the video model invents per segment.
  if (params.voiceSamples !== false) {
    const speakers = [];
    for (const c of seg.cuts || []) {
      for (const l of claimedLines(scene, [c])) if (!speakers.includes(l.speaker)) speakers.push(l.speaker);
    }
    for (const id of speakers) {
      const ch = characterById(project, id);
      if (!ch) continue;
      refs.push({ entity: id, asset: 'voice', kind: 'audio', why: `voice of ${ch.name || id}` });
    }
  }
  // WJI numbers connected references PER TYPE, in connection order — @image1…, @video1…, @audio1…
  // (frontend referenceOrder.ts) — so the voices restart at 1 rather than continuing the images.
  const next = { image: 0, video: 0, audio: 0 };
  refs.forEach((r) => (r.label = `@${r.kind}${(next[r.kind] += 1)}`));
  // A voice is only useful if the prompt says WHOSE it is — by their sheet label when one is
  // connected, otherwise by their name-free identity.
  // Only in sheets mode do the @imageN labels belong to the sheets; in keyframes mode they are the
  // keyframes, so a voice must be tied to its person by description instead.
  for (const r of refs) {
    if (r.kind !== 'video') continue;
    r.use = `the clip immediately before this one — continue its look, wardrobe, lighting and camera language, and pick up where it left off; do not repeat its action`;
    r.zh = `\u4e0a\u4e00\u6bb5\u7684\u6210\u7247\uff0c\u5ef6\u7eed\u5b83\u7684\u8d28\u611f\u3001\u670d\u88c5\u3001\u5149\u7ebf\u4e0e\u955c\u5934\u8bed\u8a00\uff0c\u63a5\u7740\u5b83\u5f80\u4e0b\u6f14\uff0c\u4e0d\u8981\u91cd\u590d\u5b83\u7684\u52a8\u4f5c`;
  }
  const sheetOf = params.references === 'sheets'
    ? (() => {
        const m = new Map();
        for (const r of refs.filter((x) => x.kind === 'image')) {
          const who = r.faceOf || (r.asset === 'sheet' || r.asset === 'headshot' ? r.entity : null);
          if (who && !m.has(who)) m.set(who, r.label);
        }
        // Prefer explicit headshot / faceOf over later body sheets
        for (const r of refs.filter((x) => x.kind === 'image' && (x.asset === 'headshot' || x.faceOf))) {
          const who = r.faceOf || r.entity;
          m.set(who, r.label);
        }
        return m;
      })()
    : new Map();
  for (const r of refs) {
    if (r.kind !== 'audio') continue;
    const ch = characterById(project, r.entity);
    const who = sheetOf.get(r.entity) ? `the person in ${sheetOf.get(r.entity)}` : identityOf(ch);
    // The Chinese legend uses the drama-language identity — an English phrase inside a wan prompt
    // is both ugly and one more thing for the content filter to chew on.
    const whoZh = sheetOf.get(r.entity) ? `${sheetOf.get(r.entity)}\u4e2d\u4eba\u7269` : (ch?.profile?.identity || identityOf(ch));
    r.use = `the voice of ${who} — speak their lines in it, matching its timbre, pitch, pace and accent`;
    r.zh = `${whoZh}\u7684\u58f0\u7ebf\uff0c\u53f0\u8bcd\u7528\u8fd9\u4e2a\u58f0\u97f3\u8bf4`;
  }
  return refs;
}

/** Just the picture references — what `@imageN` counts, whatever else is connected. */
export function imageReferences(project, episode, seg) {
  return segmentReferences(project, episode, seg).filter((r) => r.kind === 'image');
}

/** The voice references, in `@audioN` order. */
export function audioReferences(project, episode, seg) {
  return segmentReferences(project, episode, seg).filter((r) => r.kind === 'audio');
}

/** The clip references, in `@videoN` order. */
export function videoReferences(project, episode, seg) {
  return segmentReferences(project, episode, seg).filter((r) => r.kind === 'video');
}

// \u2500\u2500 prompt skeleton ─────────────────────────────────────────────────────────

export function promptSkeleton(project, episode, segmentId) {
  const params = paramsOf(project);
  const seg = (episode.storyboard?.segments || []).find((s) => s.id === segmentId);
  if (!seg) throw new Error(`no segment ${segmentId} in E${pad2(episode.ep)}`);
  const scene = (episode.scenes || [])[Number(seg.sceneIndex) - 1];
  if (!scene) throw new Error(`${segmentId}: sceneIndex ${seg.sceneIndex} does not exist`);
  const cuts = seg.cuts || [];
  const starts = cutStarts(cuts);
  const tag = langTag(project.lang);
  const total = cuts.reduce((s, c) => s + (Number(c.seconds) || 0), 0);

  // A prompt never carries a name: the speaker is their reference label (sheets mode) or their
  // short generic identity, and it carries the delivery the character bible set for that voice.
  const allRefs = segmentReferences(project, episode, seg);
  const sheetLabels = new Map(allRefs.filter((r) => r.kind === 'image' && r.asset === 'sheet').map((r) => [r.entity, r.label]));
  const voiceLabels = new Map(allRefs.filter((r) => r.kind === 'audio').map((r) => [r.entity, r.label]));
  const promptLang = videoModel(params).promptLang;
  const described = new Set();
  const dialogue = cuts.map((c, k) => claimedLines(scene, [c]).map((l) => {
    const ch = characterById(project, l.speaker);
    const voice = voiceLabels.get(l.speaker);
    const sheet = params.references === 'sheets' ? sheetLabels.get(l.speaker) : undefined;
    // The full voice description goes on this character's FIRST line in the segment; after that the
    // @audioN label carries it, and only the beat's own delivery is added. Repeating 60 characters of
    // timbre on every line buys nothing and lengthens a prompt the content filter judges by length.
    const first = !described.has(l.speaker);
    described.add(l.speaker);
    // A line is attributed by the reference that carries the voice — that is what the model has to
    // read it in. The sheet label rides along so the picture and the voice are tied to one person.
    // VO has no character / no @audio: never fall through identityOf(null) → "the person in this shot"
    // (that wrongly lip-syncs the line onto whoever is on camera).
    const who = l.speaker === 'VO'
      ? 'an off-screen booth-edge friend voiceover'
      : ([voice, sheet].filter(Boolean).join(' / ') || identityOf(ch));
    return {
      ...l,
      cut: k + 1,
      name: ch?.name || l.speaker,
      speakerRef: who,
      voiceRef: voice,
      // The beat's own `delivery` is script prose in the drama's language; it only goes into a prompt
      // written in that language. An English prompt carries the character's English videoDirection,
      // and the author adds a per-line acting note in English if they want one.
      direction: speechDirection(ch, l.delivery, first ? promptLang : (promptLang === 'zh' ? 'zh-note' : null)),
    };
  }));

  const mode = videoModel(params);
  const preset = STYLE_PRESETS[params.style] || STYLE_PRESETS.realistic;
  const accent = String(params.speechAccent || '').trim();
  const sound = isObject(seg.sound) ? seg.sound : {};
  const sfxOf = (k) => asList(sound.sfx).filter((x) => Number(x?.cut) === k + 1).map((x) => String(x.event)).join('; ');
  // Who else is on screen while `speaker` has a line: the H3 idiom keeps the lip-sync off them.
  // In keyframes mode the @imageN labels are frames, so a person is named by identity instead.
  const othersOnScreen = (c, speaker) => (c.characters || []).filter((id) => id !== speaker).map((id) => (params.references === 'sheets' && sheetLabels.get(id) ? `the person in ${sheetLabels.get(id)}` : identityOf(characterById(project, id))));
  let video;
  if (mode.family === 'h3') {
    const sheets = params.references === 'sheets';
    const shots = cuts.map((c, k) => {
      // Every line names who else is on screen and keeps their lips closed — measured on H3: without
      // it the lip-sync lands on the more visible face.
      const d = dialogue[k].map((l) => {
        const others = othersOnScreen(c, l.speaker);
        return `${l.speakerRef}${l.direction ? `, ${l.direction},` : ''} says <d>[${tag}] ${l.line}</d>${others.length ? ` while ${others.join(' and ')} ${others.length > 1 ? 'do' : 'does'} not speak, ${LIPS_CLOSED}` : ''}`;
      }).join(' ');
      const lips = '';
      const head = k === 0 ? `[Shot 1] ` : `[Shot ${k + 1}] At ${timestamp(starts[k])}, `;
      // In sheets mode the cut's own `frame` goes into the prompt and already carries the lens, the
      // light and the foreground (gated there), so only the shot size and camera move are added.
      const body = sheets
        ? `${c.frame || '…'} ${SIZES[c.size] || c.size}, ${c.camera}.`
        : `… anchor on @image${k + 1} · ${SIZES[c.size] || c.size}, ${c.camera}, ${cameraPhrase(c, params)}. ${lightPhrase(c)}.${foregroundPhrase(c)}`;
      return `${head}${body} ${motionSentence(c)} ${cameraClause(c)} ${d}${lips}`.replace(/\s+/g, ' ').trim();
    });
    // Keyframes are aligned by the alignment line; the voices are named either way.
    const voiceLegend = allRefs.filter((r) => r.kind !== 'image').map((r) => `${r.label} is ${r.use}.`);
    const lead = sheets
      ? allRefs.map((r) => `${r.label} is ${r.use}.`)
      : [h3AlignmentLine(cuts), ...voiceLegend];
    const look = sheets ? [`Look: ${preset.videoPhrase}${params.lookPhrase ? `, ${params.lookPhrase}` : ''}.`, ''] : [];
    const soundscape = [sound.ambience || '…', ...cuts.map((c, k) => (sfxOf(k) ? `at [Shot ${k + 1}] ${sfxOf(k)}` : '')).filter(Boolean)].join('; ');
    video = [...lead, '', ...look, 'integrated_multimodal_description:', ...shots, '', `overall_soundscape: ${soundscape}.${accent && dialogue.flat().length ? ` All dialogue in ${accent}.` : ''}${params.subtitles ? '' : ` ${NO_SUBTITLES.en[0].toUpperCase()}${NO_SUBTITLES.en.slice(1)}.`}`, '', `non_diegetic_music: ${musicOf(sound).intent || 'N/A'}`].join('\n');
  } else if (mode.family === 'wan') {
    const blocks = cuts.map((c, k) => {
      const talk = dialogue[k].map((l) => `台词（${l.speakerRef}，${l.direction || '…'}）：「${l.line}」`);
      // Wan's prompt is Chinese: the lens and the light direction translate, the note and the
      // foreground are the author's English prose, so they are left as blanks to write in Chinese.
      const shot = `${cameraPhrase(c, params, 'zh')}。${LIGHT_DIRECTIONS_ZH[c.light?.direction] || '…'}，…。前景：${c.foreground ? '…（虚化）' : '无'}。`;
      return [`${wanShotHeader(cuts, k)}…${shot}${motionSentence(c, 'zh')}${cameraClause(c, 'zh')}`, ...talk].join('\n');
    });
    const sfxAll = cuts.map((c, k) => (sfxOf(k) ? `镜头${k + 1}：${sfxOf(k)}` : '')).filter(Boolean).join('；');
    video = [
      params.references === 'sheets' ? wanSheetLegendLine(allRefs) : wanLegendLine(cuts, allRefs), '',
      ...blocks.flatMap((b) => [b, '']),
      `音频：对白为${accent || '…'}，环境音${sound.ambience || '…'}${sfxAll ? `；${sfxAll}` : ''}${musicOf(sound).intent ? `；配乐：${musicOf(sound).intent}` : ''}。${params.subtitles ? '' : `${NO_SUBTITLES.zh}。`}`,
    ].join('\n');
  } else if (params.references === 'sheets') {
    const legend = allRefs.map((r) => `${r.label} is ${r.use}.`);
    const shots = cuts.map((c, k) => {
      const talk = dialogue[k].map((l) => {
        const base = `${l.speakerRef}${l.direction ? `, ${l.direction},` : ''} says: ${l.line}`;
        // VO is off-screen: keep every on-screen mouth closed so the cheer never lands on the visible face.
        if (l.speaker !== 'VO') return base;
        const others = othersOnScreen(c, l.speaker);
        if (!others.length) return base;
        return `${base} while ${others.join(' and ')} ${others.length > 1 ? 'do' : 'does'} not speak, ${LIPS_CLOSED}`;
      }).join(' ');
      // The frame already carries the lens, the light and the foreground — do not repeat them.
      return `Shot ${k + 1} (${starts[k].toFixed(1)}–${(starts[k] + Number(c.seconds)).toFixed(1)} s, ${SIZES[c.size] || c.size}, ${c.camera}): ${c.frame || '…'} ${motionSentence(c)} ${cameraClause(c)} ${talk}`.replace(/\s+/g, ' ').trim();
    });
    const sfxAll = cuts.map((c, k) => (sfxOf(k) ? `shot ${k + 1}: ${sfxOf(k)}` : '')).filter(Boolean).join('; ');
    video = [...legend, '', ...shots, '', `Look: ${preset.videoPhrase}${params.lookPhrase ? `, ${params.lookPhrase}` : ''}. Maintain continuity in character identities, clothing, prop ownership, scene layout and the camera axis across every shot.`, `Sound: ${sound.ambience || '…'}${sfxAll ? `; ${sfxAll}` : ''}.${accent && dialogue.flat().length ? ` All dialogue in ${accent}.` : ''}${musicOf(sound).intent ? ` Music: ${musicOf(sound).intent}.` : ' No music.'}${params.subtitles ? '' : ` ${NO_SUBTITLES.en[0].toUpperCase()}${NO_SUBTITLES.en.slice(1)}.`}`].join('\n');
  } else {
    const anchors = [...seedanceAnchors(cuts.length), ...allRefs.filter((r) => r.kind !== 'image').map((r) => `${r.label} is ${r.use}.`)];
    const shotOf = (c) => `${SIZES[c.size] || c.size}, ${c.camera}, ${cameraPhrase(c, params)}; ${lightPhrase(c)}${foregroundPhrase(c)}`;
    const states = cuts.map((c, k) => (k === 0 ? `This first frame defines … (${shotOf(c)}).` : k === cuts.length - 1 && cuts.length >= 2 ? `This last frame defines … (${shotOf(c)}).` : `@image${k + 1} defines keyframe ${k + 1}: … (${shotOf(c)}).`));
    const script = cuts.map((c, k) => {
      const talk = dialogue[k].map((l) => {
        const base = `${l.speakerRef}${l.direction ? `, ${l.direction},` : ''} says: ${l.line}`;
        if (l.speaker !== 'VO') return base;
        const others = othersOnScreen(c, l.speaker);
        if (!others.length) return base;
        return `${base} while ${others.join(' and ')} ${others.length > 1 ? 'do' : 'does'} not speak, ${LIPS_CLOSED}`;
      }).join(' ');
      return `From @image${k + 1} (${starts[k].toFixed(1)}–${(starts[k] + Number(c.seconds)).toFixed(1)} s): ${motionSentence(c)} ${cameraClause(c)} ${talk}`.replace(/\s+/g, ' ').trim();
    });
    const sfxAll = cuts.map((c, k) => (sfxOf(k) ? `from @image${k + 1}: ${sfxOf(k)}` : '')).filter(Boolean).join('; ');
    video = [...anchors, ...states, '', ...script, '', 'Maintain continuity in character identities, clothing, prop ownership, scene layout and the camera axis.', `Sound: ${sound.ambience || '…'}${sfxAll ? `; ${sfxAll}` : ''}.${accent && dialogue.flat().length ? ` All dialogue in ${accent}.` : ''}${musicOf(sound).intent ? ` Music: ${musicOf(sound).intent}.` : ' No music.'}${params.subtitles ? '' : ` ${NO_SUBTITLES.en[0].toUpperCase()}${NO_SUBTITLES.en.slice(1)}.`}`].join('\n');
  }

  const sceneEntity = sceneById(project, scene.sceneId) || {};
  const keyframes = params.references === 'sheets' ? [] : cuts.map((c, k) => {
    // `why` is for people (may carry names); `use` goes into the prompt and must stay generic.
    const refs = [];
    refs.push({ entity: scene.sceneId, asset: 'sheet', why: `environment: ${sceneEntity.name || scene.sceneId}${scene.lighting ? ` (${scene.lighting})` : ''}`, use: 'the environment — match its layout, materials and wear exactly', zh: '环境，严格还原布局、材质与旧痕' });
    if (scene.lighting && sceneEntity.wji?.assets?.lighting?.[scene.lighting]) refs.push({ entity: scene.sceneId, asset: `lighting:${scene.lighting}`, why: `lighting state ${scene.lighting}`, use: 'the same environment in the lighting state to use', zh: '同一场景的光线状态' });
    for (const id of c.characters || []) refs.push({ entity: id, asset: 'sheet', why: `face and clothes of ${characterById(project, id)?.name || id}`, use: 'the character sheet of one person in this frame — match face, hair and clothes exactly', zh: '人物三视图，严格还原面容、发型与服装' });
    for (const id of c.props || []) refs.push({ entity: id, asset: 'sheet', why: `prop ${propById(project, id)?.name || id}`, use: 'the prop to reproduce exactly', zh: '需要严格还原的道具' });
    refs.forEach((r, i) => (r.label = `@image${i + 1}`));
    const prefix = refs.map((r) => `${r.label} is ${r.use}`).join('; ');
    return { cut: k + 1, name: `${seg.id} f${k + 1}`, ratio: params.ratio, references: refs, prompt: `${prefix}. ${c.frame}` };
  });

  return {
    segment: seg.id,
    video: {
      model: mode.model, ratio: params.ratio,
      duration: params.videoDuration === 'auto' ? null : total, plannedSeconds: total,
      resolution: videoResolutionFor(mode, params.videoResolution) || params.videoResolution,
      // keyframes (or sheets) first, then the voices — the order the video node must be connected in.
      references: [
        ...(params.references === 'sheets' ? allRefs.filter((r) => r.kind === 'image').map((r) => `${r.entity}:${r.asset}`) : keyframes.map((k) => k.name)),
        ...allRefs.filter((r) => r.kind === 'video').map((r) => `${r.entity}:${r.asset}`),
        ...allRefs.filter((r) => r.kind === 'audio').map((r) => `${r.entity}:${r.asset}`),
      ],
      prompt: video,
    },
    keyframes,
    dialogue: dialogue.flat(),
  };
}

// ── render (markdown for dataset content) ───────────────────────────────────

function mdTable(headers, rows) {
  const esc = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n');
}

export function renderOutline(project) {
  const o = project.outline || {};
  const params = paramsOf(project);
  const lines = [`# ${project.title} · 改编大纲`, '', `${params.episodes} 集 × ${params.minutesPerEpisode} 分钟 · ${params.genre} · ${params.adaptMode}${params.register ? ` · ${params.register}` : ''}`, '', `**核心**：${o.core || ''}`, ''];
  const block = (title, items, fmt) => {
    if (!(items || []).length) return;
    lines.push(`## ${title}`, '');
    for (const it of items) lines.push(`- ${fmt(it)}`);
    lines.push('');
  };
  block('保留', o.keep, (it) => `**${it.what}** — ${it.why}${it.evidence ? `（原文：${it.evidence}）` : ''}`);
  block('砍掉', o.cut, (it) => `**${it.what}** — ${it.why}`);
  if (o.cutNote) lines.push(`> ${o.cutNote}`, '');
  block('合并', o.merge, (it) => `**${it.what}** — ${it.why}`);
  if (o.mergeNote) lines.push(`> ${o.mergeNote}`, '');
  block('风险', o.risks, (it) => `**${it.what}** → ${it.plan}`);
  if (isObject(o.brief)) {
    const b = o.brief;
    lines.push('## 创作简报', '', mdTable(['项', '内容'], [
      ['一句话卖点', b.logline], ['目标观众', b.audience], ['核心爽点引擎', b.satisfactionEngine], ['最大钩子', b.mainHook],
      ['主角压力', b.protagonistPressure], ['反派压力', b.antagonistPressure], ['情感主线', b.emotionalLine], ['情绪承诺', b.promise],
    ]), '');
  }
  if (Array.isArray(o.structure) && o.structure.length) {
    lines.push('## 全剧结构', '', mdTable(['阶段', '集数', '创作任务', '爽点策略', '钩子策略'], o.structure.map((ph) => [PHASE_LABELS[ph.phase] || ph.phase, `第 ${(ph.episodes || [])[0]}–${(ph.episodes || [])[1]} 集`, ph.task, ph.satisfactionPlan, ph.hookPlan])), '');
  }
  if ((o.episodes || []).some((e) => e.function || e.task)) {
    lines.push('## 分集目录', '', mdTable(['集', '功能', '任务（目标／阻力／代价）', '改变', '爽点', '钩子'], (o.episodes || []).map((e) => [
      e.ep, asList(e.function).join('、'), e.task ? `${e.task.goal || ''}／${e.task.obstacle || ''}／${e.task.stake || ''}` : '', e.change || '',
      e.satisfaction ? `${e.satisfaction.type || ''}：${e.satisfaction.action || ''}` : '', e.hookType || '',
    ])), '');
  }
  lines.push('## 人物表', '', mdTable(['ID', '姓名', '档', '定位', '人物弧', '来源'], (project.characters || []).map((c) => [c.id, c.name, c.tier, c.role, c.arc || '', (c.from || []).join('、')])), '');
  lines.push('## 场景', '', mdTable(['ID', '场景', '主场景', '复用方案'], (project.scenes || []).map((s) => [s.id, s.name, s.primary ? '是' : '', s.variantOf ? `变体 ← ${s.variantOf}` : s.reusePlan || ''])), '');
  if ((project.props || []).length) lines.push('## 叙事道具', '', mdTable(['ID', '道具', '承载', '爽点'], project.props.map((p) => [p.id, p.name, p.function, (p.beatIds || []).join('、')])), '');
  lines.push('## 爽点表', '', mdTable(['ID', '集', '类型', '权重', '铺垫', '兑现'], (o.beats || []).map((b) => [b.id, b.episode, b.type, b.weight || 'minor', b.setup, b.payoff])), '');
  lines.push('## 分集梗概', '');
  for (const e of o.episodes || []) {
    lines.push(`### 第 ${e.ep} 集`, '', e.synopsis || '', '', `- **钩子**：${e.hook || ''}`, `- **悬念**：${e.suspense || ''}`, `- 场景：${(e.sceneIds || []).join('、')} · 人物：${(e.characterIds || []).join('、')}${(e.propIds || []).length ? ` · 道具：${e.propIds.join('、')}` : ''}`);
    if (e.crowdPlan) lines.push(`- 同框方案：${e.crowdPlan}`);
    if ((e.warnings || []).length) lines.push(`- ⚠️ ${e.warnings.join('、')}`);
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * The 创作指引 — the top-level rule document of the drama, in the reference skill's shape. It is the
 * thing to re-read before writing any character, episode or storyboard, so it is its own dataset.
 */
export function renderGuideline(project) {
  const o = project.outline || {};
  const params = paramsOf(project);
  const b = isObject(o.brief) ? o.brief : {};
  const g = isObject(o.guideline) ? o.guideline : {};
  const lines = [`# 《${project.title}》创作指引`, '', '> 本文件是本短剧项目的最高创作指引。每次分析、创作、修改、续写、重写、格式检查或输出前，必须先阅读本文件，再阅读相关数据集。若本文件与单集临时想法冲突，除非用户明确更新创作指引，否则以创作指引为准。', ''];
  lines.push('## 1. 项目基本信息', '', mdTable(['项目', '内容'], [
    ['剧名', project.title], ['类型定位', params.genre], ['改编方式', params.adaptMode], ['语言与语体', `${langTag(project.lang)} · ${params.register || ''}${params.speechAccent ? `（${params.speechAccent}）` : ''}`],
    ['总集数', `${params.episodes} 集`], ['单集时长', `${params.minutesPerEpisode} 分钟（目标 ${Math.round(Number(params.minutesPerEpisode) * 60)} 秒，±${Math.round(params.tolerance * 100)}%）`],
    ['画幅与模型', `${params.ratio} · ${videoModel(params).model}${params.videoResolution ? ` ${params.videoResolution}` : ''} · ${params.style}`],
  ]), '');
  lines.push('## 2. 一句话卖点与核心观众承诺', '', `**一句话卖点**：${b.logline || ''}`, '', `**观众承诺**：${b.promise || ''}`, '', `**核心爽点引擎**：${b.satisfactionEngine || ''}`, '', `**最大钩子**：${b.mainHook || ''}`, '');
  lines.push('## 3. 风格、类型与语气规则', '', mdTable(['维度', '创作规则'], [
    ['整体风格', g.tone], ['情绪强度', g.emotionalIntensity], ['对白风格', g.dialogueStyle], ['视觉风格', g.visualStyle], ['禁忌', asList(g.forbidden).join('；')],
  ]), '');
  lines.push('## 4. 压力、情感线与制作边界', '', `**主角压力**：${b.protagonistPressure || ''}`, '', `**反派压力**：${b.antagonistPressure || ''}`, '', `**情感主线**：${b.emotionalLine || ''}`, '', `**制作边界**：${g.productionLimits || ''}`, '', `**单集节奏规格**：开头 ${params.hookSeconds} 秒内钩子画面上屏；每 ${params.turnSeconds} 秒一次推进（新信息／新阻碍／新反击／新选择）；每集一个由可见行动完成的爽点；结尾停在钩子上；对白不超过 ${params.maxLineChars} 字一口气，连续对白不超过 ${params.maxConsecutiveLines} 句。`, '');
  lines.push('## 5. 角色创作与人物连续性重点', '', mdTable(['角色', '剧情功能', 'Want vs Need', '核心矛盾', '声音与行为规则', '禁止偏离'], (project.characters || []).map((c) => {
    const bb = isObject(c.bible) ? c.bible : {};
    const sp = isObject(bb.speech) ? bb.speech : {};
    return [c.name, bb.function || '', bb.want || bb.need ? `${bb.want || ''}／${bb.need || ''}` : '', bb.contradiction || '', [sp.rhythm, sp.silence, bb.pressureResponse].filter(Boolean).join('；'), asList(bb.forbidden).join('；')];
  })), '', '角色详细资料以各人物数据集为准；如创作指引与人物圣经不一致，先更新其中一份。', '');
  if (Array.isArray(o.structure) && o.structure.length) {
    lines.push('## 6. 主线结构、阶段任务与分集策略', '', mdTable(['阶段', '集数范围', '创作任务', '爽点策略', '钩子策略'], o.structure.map((ph) => [PHASE_LABELS[ph.phase] || ph.phase, `第 ${(ph.episodes || [])[0]}–${(ph.episodes || [])[1]} 集`, ph.task, ph.satisfactionPlan, ph.hookPlan])), '');
  }
  const beats = o.beats || [];
  lines.push('## 7. 爽点、钩子与反转设计规则', '', `**核心爽点库**：${uniq(beats.map((x) => x.type)).join('、') || SATISFACTION_TYPES.join('、')}`, '', `**核心钩子库**：${uniq((o.episodes || []).map((e) => e.hookType).filter(Boolean)).join('、') || HOOK_TYPES.join('、')}`, '', '**反转规则**：反转必须改变权力关系、信息关系或情感关系；不能只靠一句台词宣布，要有可见行动、道具、证据或人物选择支撑。', '');
  const w = project.wji || {};
  lines.push('## 8. 参考数据集', '', mdTable(['数据集', '位置', '使用时机'], [
    ['故事大纲', w.outlineDatasetId ? `story/ · ${w.outlineDatasetId}` : 'story/ 大纲', '调整主线、阶段节奏、高潮或结局前必读'],
    ['人物圣经', 'character/ 每人一个数据集', '涉及角色语气、关系、动机、秘密、道具或弧线时必读'],
    ['场景与道具', 'location/ · prop/', '写分镜前确认锚点、光态与道具状态'],
    ['分集剧本', 'story/ E0N 剧本', '写作或修改任何一集前重读前后集的钩子与悬念'],
    ['分镜', 'shot/E0N/ 每段一个数据集', '生成前核对镜头职责、起止状态与提示词'],
  ]), '');
  lines.push('## 9. 本项目绝对要注意的重点', '', ...asList(g.priorities).map((x, i) => `${i + 1}. ${x}`), '');
  return lines.join('\n');
}

/**
 * The 创作自检 of one episode — the eight questions of the reference episode template, answered from
 * the same helpers the gates use, so a green episode scores 16/16 by construction.
 */
export function scriptSelfCheck(project, episode) {
  const params = paramsOf(project);
  const offsets = beatOffsets(episode, params);
  const total = offsets.length ? offsets[offsets.length - 1].end : 0;
  const find = (ref) => offsets.find((o) => Array.isArray(ref) && o.si === Number(ref[0]) && o.bi === Number(ref[1]));
  const hook = find(episode.hookBeat), sat = find(episode.satisfactionBeat);
  const points = turnPoints(episode, params);
  let worst = 0;
  for (let i = 1; i < points.length; i++) worst = Math.max(worst, points[i].at - points[i - 1].at);
  const ta = talkAndAction(episode);
  const task = isObject(episode.task) ? episode.task : {};
  const novel = (episode.scenes || []).some((sc) => (sc.flow || []).some((b) => b.action !== undefined && NOVELISTIC_WORDS.some((w) => String(b.action).includes(w))));
  const rows = [
    [`开头 ${params.hookSeconds} 秒是否有冲突、羞辱、危机、秘密或反转？`, !!hook && hook.start <= params.hookSeconds + 1e-9, hook ? `钩子画面在 ${round2(hook.start)} s` : '未标 hookBeat'],
    ['本集任务、阻力与代价是否清楚？', ['goal', 'obstacle', 'stake'].every((k) => String(task[k] || '').trim()), [task.goal, task.obstacle, task.stake].filter(Boolean).join('／')],
    [`中段是否每 ${params.turnSeconds} 秒有新信息、新阻碍、新反击或新选择？`, points.length >= 2 && worst <= params.turnSeconds + 1e-9, `最长间隔 ${round2(worst)} s（${points.map((p) => p.what).join(' → ')}）`],
    ['本集结束时主线是否有实质改变？', !!String(episode.change || '').trim(), episode.change || ''],
    ['是否有明确【爽点标记】？', !!sat && (!hook || sat.start > hook.start) && sat.end < total - 1e-9, sat ? `${round2(sat.start)} s` : '未标 satisfactionBeat'],
    ['结尾是否有明确【钩子标记】？', !!String(episode.cliff || '').trim() && !!episode.hookType, `${episode.hookType || ''}：${episode.cliff || ''}`],
    ['对白是否符合「谈话 + 行动」？', ta.longestLineRun <= params.maxConsecutiveLines && (ta.lines < 5 || ta.ratio >= params.minActionRatio), `${ta.actions} 动作 / ${ta.lines} 台词，最长连续 ${ta.longestLineRun} 句`],
    ['人物行为是否可拍摄，没有小说式心理描写？', !novel, novel ? '动作里有心理词' : ''],
  ];
  return { rows, score: rows.filter((r) => r[1]).length * 2, max: rows.length * 2 };
}

/** The 对白校对 worksheet: one row per line, 原句 filled, the rest for the polish pass. */
export function renderDialogue(project, episode) {
  const params = paramsOf(project);
  const lines = [`# ${project.title} · 第 ${episode.ep} 集对白校对`, '', mdTable(['项目', '判断'], [
    ['语体', params.register || ''], ['场面目标', ''], ['主要冲突', ''], ['潜台词核心', ''], ['角色声音问题', ''], ['节奏问题', ''], ['建议修改幅度', '轻修／中修／重修'],
  ]), ''];
  (episode.scenes || []).forEach((sc, i) => {
    const scene = sceneById(project, sc.sceneId);
    lines.push(`## ${i + 1}. ${scene?.name || sc.sceneId}`, '');
    const rows = [];
    (sc.flow || []).forEach((b) => {
      if (b.line === undefined) return;
      const ch = characterById(project, b.speaker);
      const sp = ch?.bible?.speech || {};
      const who = b.speaker === 'VO' ? 'VO' : displayName(project, b.speaker, episode.ep);
      const hint = [sp.rhythm, sp.silence ? `沉默：${sp.silence}` : '', (sp.forbiddenWords || []).length ? `禁用：${sp.forbiddenWords.join('、')}` : ''].filter(Boolean).join('；');
      rows.push([`${who}${b.delivery ? `（${b.delivery}）` : ''}：${b.line}`, '', '', '', hint]);
    });
    lines.push(mdTable(['原句', '问题', '修改句', '修改理由', '导演／演员提示'], rows), '');
  });
  lines.push('> 每句检查：有没有戏剧功能？遮住名字还认得出是谁在说？真正想说的有没有藏起来？熟人有没有互相解释已知的事？导演提示用可演动词（逼、哄、避、试探），不用情绪形容词。', '');
  return lines.join('\n');
}

export function renderCharacter(project, id) {
  const c = characterById(project, id);
  if (!c) throw new Error(`no character ${id}`);
  const p = c.profile || {};
  const lines = [`# ${c.name}${(c.aliases || []).length ? `（${c.aliases.join('、')}）` : ''}`, '', `${c.id} · ${c.tier} · ${c.role}`, '', c.oneLiner || '', ''];
  lines.push('## 画像', '', mdTable(['项', '内容'], [['性别', p.gender], ['年龄', p.ageRange], ['身份', p.identity], ['外貌', p.appearance], ['性格', (p.personality || []).join('、')], ['气质', p.temperament], ['动机', p.motivation], ['人物弧', c.arc || ''], ['提示词称呼（英，不带名字）', c.identityEn || '']]), '');
  const bb = isObject(c.bible) ? c.bible : null;
  if (bb) {
    const sp = isObject(bb.speech) ? bb.speech : {};
    lines.push('## 人物圣经', '', mdTable(['项', '内容'], [
      ['剧情功能', bb.function], ['一句话人物钩子', bb.hookLine], ['外在想要 Want', bb.want], ['真正需要 Need', bb.need], ['核心误信', bb.misbelief], ['核心矛盾', bb.contradiction],
      ['观众第一印象', bb.firstImpression], ['观众最后理解', bb.finalUnderstanding], ['受压反应', bb.pressureResponse],
      ['说话节奏', sp.rhythm], ['口头禅', sp.catchphrase], ['沉默方式', sp.silence], ['禁用词', asList(sp.forbiddenWords).join('、')], ['语体', sp.register || ''],
    ].filter((r) => String(r[1] ?? '').trim())), '');
    if (bb.wound) lines.push('### 核心创伤', '', bb.wound, '');
    if (asList(bb.pastChoices).length) lines.push('### 过去的关键选择', '', mdTable(['时间点', '情境压力', '当时的选择', '得到', '失去', '今日残留'], asList(bb.pastChoices).map((ch) => [ch.when, ch.pressure, ch.choice, ch.gained, ch.lost, ch.residue])), '');
    if (asList(bb.arc).length) lines.push('### 角色弧线', '', mdTable(['阶段', '集', '角色状态', '内在变化'], asList(bb.arc).map((st) => [st.stage, st.episode, st.state, st.change])), '');
    if (asList(bb.forbidden).length || asList(bb.mustFace).length) lines.push('### 写作备忘', '', ...asList(bb.forbidden).map((x) => `- 不能做：${x}`), ...asList(bb.mustFace).map((x) => `- 必须面对：${x}`), '');
  }
  if ((p.relationships || []).length) {
    const rich = p.relationships.some((r) => r.surface || r.real || r.power);
    if (rich) lines.push('## 人物关系网', '', mdTable(['对象', '表面关系', '真正关系', '权力差', '秘密／谎言', '转折集'], p.relationships.map((r) => [r.name || r.id, r.surface || r.relation || '', r.real || '', r.power || '', r.secret || '', r.turnEpisode ? `第 ${r.turnEpisode} 集` : ''])), '');
    else lines.push('## 关系', '', ...p.relationships.map((r) => `- **${r.name}**：${r.relation || r.surface || ''}`), '');
  }
  if ((p.evidence || []).length) lines.push('## 原文依据', '', ...p.evidence.map((q) => `> ${q}`), '');
  const v = c.voice || {};
  const params = paramsOf(project);
  const sample = v.sample || {};
  lines.push('## 声线', '', mdTable(['项', '内容'], [
    ['音色', v.timbre], ['音高', v.pitch], ['语速', v.pace], ['口音', v.accent],
    ['默认情绪', v.emotion], ['参考提示', v.referenceHint || ''],
  ]), '');
  // The clause every video prompt pastes beside this character's lines.
  if (v.videoDirection) lines.push(`视频提示词讲话方式（英）：${v.videoDirection}`, '');
  if (sample.line) {
    lines.push(`试音台词（${round2(voiceSampleSeconds(c, params))} s）：${sample.line}`, '');
    if (sample.direction) lines.push(`表演指示：${sample.direction}`, '');
    lines.push(`声音提示词（${VOICE_MODEL}，参考头像生成）`, '', '```', voiceSamplePrompt(c, params), '```', '');
  }
  if (v.prompt) lines.push('英文声线参数串（给其他引擎）', '', '```', v.prompt, '```', '');
  lines.push('## 出图提示词', '', '**Portrait**', '', '```', c.image?.prompt || '', '```', '', '**Negative**', '', '```', c.image?.negativePrompt || '', '```', '', '**Character sheet (16:9)**', '', '```', c.image?.sheet || '', '```', '');
  return lines.join('\n');
}

export function renderScene(project, id) {
  const s = sceneById(project, id);
  if (!s) throw new Error(`no scene ${id}`);
  const lines = [`# ${s.name}`, '', `${s.id}${s.primary ? ' · 主场景' : ''}${s.variantOf ? ` · 变体 ← ${s.variantOf}（${s.changes || ''}）` : ''}`, '', s.summary || '', ''];
  lines.push('## 一致性锚点', '', ...(s.anchors || []).map((a) => `- **${a.name}**：${a.desc}`), '');
  lines.push('## 光照状态', '', mdTable(['状态', 'Prompt'], (s.lighting || []).map((l) => [l.state, l.prompt])), '');
  if (s.reusePlan) lines.push(`复用方案：${s.reusePlan}`, '');
  lines.push('## 出图提示词', '', '**Master view (empty scene)**', '', '```', s.image?.prompt || '', '```', '', '**Negative**', '', '```', s.image?.negativePrompt || '', '```', '', '**Environment sheet (16:9)**', '', '```', s.image?.sheet || '', '```', '');
  return lines.join('\n');
}

export function renderProp(project, id) {
  const p = propById(project, id);
  if (!p) throw new Error(`no prop ${id}`);
  const lines = [`# ${p.name}`, '', `${p.id} · ${p.scale || ''}${(p.carriedBy || []).length ? ` · 随身：${p.carriedBy.join('、')}` : ''}`, '', `**承载**：${p.function || ''}`, '', p.summary || '', ''];
  lines.push('## 锚点', '', ...(p.anchors || []).map((a) => `- **${a.name}**：${a.desc}`), '');
  lines.push('## 状态变体', '', mdTable(['状态', 'Prompt'], (p.states || []).map((s) => [s.state, s.prompt])), '');
  if ((p.relatedScenes || []).length) lines.push(`场景：${p.relatedScenes.join('、')}`, '');
  lines.push('## 出图提示词', '', '**Master view (white background)**', '', '```', p.image?.prompt || '', '```', '', '**Negative**', '', '```', p.image?.negativePrompt || '', '```', '', '**Prop sheet (16:9)**', '', '```', p.image?.sheet || '', '```', '');
  return lines.join('\n');
}

/**
 * The screenplay in the reference 短剧 episode format: `△（from-to秒）` action lines with the seconds
 * derived from the beat timing, `角色（delivery）：line`, 【爽点标记】 after the 爽点 beat, 【钩子标记】 after
 * the last beat, and the 创作自检 table filled from the gates.
 */
export function renderScript(project, episode) {
  const params = paramsOf(project);
  const est = episodeSeconds(episode, params);
  const offsets = beatOffsets(episode, params);
  const at = (si, bi) => offsets.find((o) => o.si === si && o.bi === bi);
  const task = isObject(episode.task) ? episode.task : {};
  const outlineEp = (project.outline?.episodes || []).find((x) => Number(x.ep) === Number(episode.ep)) || {};
  const sat = isObject(outlineEp.satisfaction) ? outlineEp.satisfaction : {};
  const lines = [`# 第 ${episode.ep} 集｜${project.title}`, '', `目标 ${episode.targetSeconds} s · 预估 ${round2(est)} s${params.register ? ` · ${params.register}` : ''}`, ''];
  lines.push('## 本集功能', '', asList(episode.function).join('／') || '—', '');
  lines.push('## 本集任务', '', `- **目标**：${task.goal || ''}`, `- **阻力**：${task.obstacle || ''}`, `- **代价**：${task.stake || ''}`, `- **改变**：${episode.change || ''}`, `- **钩子**：${episode.hook || ''}`, `- **悬念**：${episode.cliff || ''}${episode.hookType ? `（${episode.hookType}钩子）` : ''}`, `- 爽点：${(episode.beatsClaimed || []).join('、') || '—'}${sat.type ? ` · ${sat.type}` : ''}`, '');
  const satRef = Array.isArray(episode.satisfactionBeat) ? episode.satisfactionBeat.map(Number) : null;
  (episode.scenes || []).forEach((sc, i) => {
    const scene = sceneById(project, sc.sceneId);
    lines.push(`## ${i + 1}. ${scene?.name || sc.sceneId}${sc.lighting ? ` · ${sc.lighting}` : ''}`, '', `人物：${(sc.characters || []).map((id) => displayName(project, id, episode.ep)).join('、')}${(sc.props || []).length ? ` · 道具：${sc.props.map((id) => propById(project, id)?.name || id).join('、')}` : ''}`, '');
    (sc.flow || []).forEach((b, k) => {
      const o = at(i + 1, k + 1);
      const span = o ? `（${Math.round(o.start)}-${Math.round(o.end)}秒）` : '';
      if (b.line !== undefined) {
        const who = b.speaker === 'VO' ? 'VO' : displayName(project, b.speaker, episode.ep);
        lines.push(`${who}${b.delivery ? `（${b.delivery}）` : ''}：${b.line}`);
      } else lines.push(`△${span}${b.action}${b.turn ? '　⟲' : ''}`);
      if (satRef && satRef[0] === i + 1 && satRef[1] === k + 1) lines.push('', `【爽点标记】${sat.action || sat.type || ''}`);
      lines.push('');
    });
  });
  lines.push(`【钩子标记】${episode.cliff || ''}`, '');
  const check = scriptSelfCheck(project, episode);
  lines.push('## 创作自检', '', mdTable(['检查项', '结论', '依据'], check.rows.map((r) => [r[0], r[1] ? '是' : '否', r[2]])), '', `${check.score}/${check.max}${check.score >= 12 ? '' : ' — 未达 12，先修再交付'}`, '');
  return lines.join('\n');
}

export function renderSegment(project, episode, segmentId) {
  const seg = (episode.storyboard?.segments || []).find((s) => s.id === segmentId);
  if (!seg) throw new Error(`no segment ${segmentId}`);
  const scene = (episode.scenes || [])[Number(seg.sceneIndex) - 1] || {};
  const params = paramsOf(project);
  const cuts = seg.cuts || [];
  const starts = cutStarts(cuts);
  const total = cuts.reduce((s, c) => s + (Number(c.seconds) || 0), 0);
  const nameOf = (id) => displayName(project, id, episode.ep);
  const lines = [`# ${seg.id}`, '', `${sceneById(project, scene.sceneId)?.name || scene.sceneId || ''}${scene.lighting ? ` · ${scene.lighting}` : ''} · ${round2(total)} s · ${params.video}`, ''];
  const kit = params.camera || DEFAULT_PARAMS.camera;
  lines.push(`镜头：${kit.body} + ${kit.lens}`, '');
  if (isObject(seg.axis)) lines.push(`轴线：${asList(seg.axis.between).map(nameOf).join(' ↔ ')} · 机位常驻：${seg.axis.workingSide || ''} · 画面左 ${nameOf(seg.axis.screenLeft)} / 画面右 ${nameOf(seg.axis.screenRight)}`, '');
  if (isObject(seg.sound)) lines.push(`声音：${seg.sound.ambience || ''}${asList(seg.sound.sfx).length ? ` · 音效：${asList(seg.sound.sfx).map((x) => `镜${x.cut} ${x.event}`).join('；')}` : ''} · 配乐：${musicOf(seg.sound).intent || 'N/A'}${musicOf(seg.sound).cues.length ? `（${musicOf(seg.sound).cues.map((c) => `${typeof c.at === 'number' ? `镜${c.at}` : c.at} ${c.do}`).join('，')}）` : ''}`, '');
  lines.push('## 分镜', '', mdTable(['#', '起', '秒', '职责', '景别', '角度·高度', '轴线', '运镜', '焦段/光圈', '光位', '前景', '人物', '节拍'], cuts.map((c, k) => [
    k + 1, timestamp(starts[k]), c.seconds, c.purpose?.kind || '', c.size, `${ANGLES_ZH[c.angle] || c.angle || ''}·${HEIGHTS_ZH[c.height] || c.height || ''}`, c.axisSide || '', c.camera,
    `${focalOf(c)} ${c.aperture || kit.aperture}`,
    [c.light?.direction, c.light?.note].filter(Boolean).join(' — '),
    c.foreground || '—',
    (c.characters || []).map(nameOf).join('、'),
    `${c.beats?.[0]}–${c.beats?.[1]}`,
  ])), '');
  // One block per cut in the reference 分镜 shape: 职责 · 来源 · 时长 · 起点 · 唯一动作 · 终点 · 摄影机 · 声音 · 视觉依据.
  const refs = segmentReferences(project, episode, seg);
  const boundaryText = (b, c) => (c.characters || []).map((id) => {
    const bo = boundaryOf(b);
    if (bo.positions?.[id] === undefined) return `${nameOf(id)}：入画（上一镜不在画内）`;
    const held = asList(bo.heldProps?.[id]).map((pid) => propById(project, pid)?.name || pid);
    return `${nameOf(id)}：${bo.positions?.[id] || ''}；朝向 ${bo.facing?.[id] || ''}；视线 ${bo.gaze?.[id] || ''}；手 ${bo.hands?.[id] || ''}${held.length ? `；持 ${held.join('、')}` : ''}`;
  }).concat(asList(boundaryOf(b).state).length ? [`状态：${asList(boundaryOf(b).state).join('；')}`] : []).join('<br>');
  cuts.forEach((c, k) => {
    const beats = cutBeats(scene, c);
    const source = beats.map(({ bi, beat }) => `${bi}. ${beat.line !== undefined ? `${nameOf(beat.speaker)}：${beat.line}` : beat.action}`).join('<br>');
    const cn = isObject(c.cameraNote) ? c.cameraNote : {};
    const cam = c.camera === 'Static Shot' ? `固定机位 — ${cn.hold || ''}` : `${c.camera}（${cn.motivation || ''}）— ${cn.trigger || ''}：${cn.path || ''}，止于 ${cn.endFraming || ''}`;
    const sfx = asList(seg.sound?.sfx).filter((x) => Number(x?.cut) === k + 1).map((x) => x.event).join('；');
    const dialogue = claimedLines(scene, [c]);
    const soundText = [dialogue.length ? `对白 ${dialogue.map((l) => `${nameOf(l.speaker)}「${l.line}」`).join(' ')}` : '无对白', sfx ? `音效 ${sfx}` : ''].filter(Boolean).join('；');
    const basis = refs.filter((r) => r.kind === 'image' && (r.entity === scene.sceneId || (c.characters || []).includes(r.entity) || (c.props || []).includes(r.entity))).map((r) => `${r.label} ${r.why}`).join('；');
    lines.push(`### SHOT ${k + 1} · ${c.purpose?.kind || ''}`, '', mdTable(['项', '内容'], [
      ['职责', c.purpose?.change || ''],
      ['来源', source],
      ['时长', `${timestamp(starts[k])} 起 · ${c.seconds} s`],
      ['景别／角度／高度／焦段', `${c.size} · ${ANGLES_ZH[c.angle] || c.angle || ''} · ${HEIGHTS_ZH[c.height] || c.height || ''} · ${focalOf(c)} ${c.aperture || kit.aperture} · 轴线 ${c.axisSide || ''}`],
      ['起点', boundaryText(cutStart(seg, k), c)],
      ['唯一动作', `${c.motion?.trigger || ''} → ${c.motion?.action || ''} → ${c.motion?.result || ''}`],
      ['终点', boundaryText(c.end, c)],
      ['摄影机', cam],
      ['光与前景', `${[c.light?.direction, c.light?.note].filter(Boolean).join(' — ')}${c.foreground ? ` · 前景 ${c.foreground}` : ''}${c.background ? ` · 背景 ${c.background}` : ''}`],
      ['声音', soundText],
      ['视觉依据', basis || '无'],
      ...(c.note ? [['备注', c.note]] : []),
    ]), '');
  });
  lines.push('## 画面提示词（起始瞬间）', '', ...cuts.flatMap((c, k) => [`**${k + 1}.** ${c.frame || ''}`, '']));
  if (seg.note) lines.push(`> ${seg.note}`, '');
  lines.push('## 视频提示词', '', '```', seg.prompt || '', '```', '');
  if (params.audioTrack !== 'none' && isObject(seg.sound)) {
    const a = audioPrompt(project, episode, seg);
    lines.push(`## 音轨提示词（${AUDIO_MODEL} · ${a.mode} · ${round2(a.seconds)} s）`, '', '```', a.prompt, '```', '');
  }
  return lines.join('\n');
}

// ── manifest & bind ─────────────────────────────────────────────────────────

export function manifest(project, episodes, opts = {}) {
  const items = [];
  const w = project.wji || {};
  const add = (stage, entity, item, hint) => items.push({ stage, entity, item, hint });
  if (!w.workspaceId) add('setup', 'workspace', 'wji.workspaceId', `wji ws create "${project.title}" -a dataset -a canvas -r ${paramsOf(project).ratio}`);
  for (const key of ['story', 'character', 'location', 'prop', 'shot']) {
    if (!w.datasetFolders?.[key]) add('setup', 'datasetFolders', `wji.datasetFolders.${key}`, 'wji --json ws fs --app <Dataset app id> | jq … select(.content.semanticKey)');
  }
  const stages = opts.stage ? STAGES.slice(0, STAGES.indexOf(opts.stage) + 1) : STAGES;

  if (stages.includes('outline') && !w.outlineDatasetId) add('outline', 'outline', 'wji.outlineDatasetId', 'wji dataset new <story> "<title> 大纲" -t outline');
  if (stages.includes('outline') && isObject(project.outline?.guideline) && !w.guidelineDatasetId) add('outline', 'guideline', 'wji.guidelineDatasetId', 'wji dataset new <story> "<title> 创作指引" -t outline  (content = render guideline)');

  if (stages.includes('characters') && (project.characters || []).length) {
    if (!w.canvases?.characters) add('characters', 'canvas', 'wji.canvases.characters', 'wji canvas create characters');
    for (const c of project.characters) {
      const cw = c.wji || {};
      if (!cw.datasetId) add('characters', c.id, `characters.${c.id}.wji.datasetId`, `wji dataset new <character> "${c.name}" -t character`);
      for (const key of ['headshot', 'sheet']) if (!cw.nodes?.[key]) add('characters', c.id, `characters.${c.id}.wji.nodes.${key}`, `wji canvas add image -c <characters> -n "${c.id} ${key}"`);
      for (const key of ['headshot', 'sheet']) if (cw.nodes?.[key] && !cw.assets?.[key]) add('characters', c.id, `characters.${c.id}.wji.assets.${key}`, `wji canvas gen ${cw.nodes[key]} → asset`);
      if (paramsOf(project).voiceSamples !== false) {
        if (!cw.nodes?.voice) add('characters', c.id, `characters.${c.id}.wji.nodes.voice`, `wji canvas add audio -c <characters> -n "${c.id} voice" --from <${c.id} headshot node> -m ${VOICE_MODEL}`);
        else if (!cw.assets?.voice) add('characters', c.id, `characters.${c.id}.wji.assets.voice`, `wji canvas gen ${cw.nodes.voice} → asset → fs set <dataset> --set primaryAudio=<asset>`);
      }
    }
  }
  if (stages.includes('art')) {
    if ((project.scenes || []).length && !w.canvases?.scenes) add('art', 'canvas', 'wji.canvases.scenes', 'wji canvas create scenes');
    // Props get their own canvas: white-background sheets and state variants, one row per prop.
    if ((project.props || []).length && !w.canvases?.props) add('art', 'canvas', 'wji.canvases.props', 'wji canvas create props');
    for (const s of project.scenes || []) {
      const sw = s.wji || {};
      if (!sw.datasetId) add('art', s.id, `scenes.${s.id}.wji.datasetId`, `wji dataset new <location> "${s.name}" -t location`);
      if (!sw.nodes?.sheet) add('art', s.id, `scenes.${s.id}.wji.nodes.sheet`, `wji canvas add image -c <scenes> -n "${s.id} sheet" -r 16:9`);
      else if (!sw.assets?.sheet) add('art', s.id, `scenes.${s.id}.wji.assets.sheet`, `wji canvas gen ${sw.nodes.sheet} → asset`);
    }
    for (const p of project.props || []) {
      const pw = p.wji || {};
      if (!pw.datasetId) add('art', p.id, `props.${p.id}.wji.datasetId`, `wji dataset new <prop> "${p.name}" -t prop`);
      if (!pw.nodes?.sheet) add('art', p.id, `props.${p.id}.wji.nodes.sheet`, `wji canvas add image -c <props> -n "${p.id} sheet" -r 16:9`);
      else if (!pw.assets?.sheet) add('art', p.id, `props.${p.id}.wji.assets.sheet`, `wji canvas gen ${pw.nodes.sheet} → asset`);
    }
  }
  for (const [ep, e] of Object.entries(episodes || {})) {
    if (opts.ep && Number(ep) !== Number(opts.ep)) continue;
    const ew = e.wji || {};
    const E = `E${pad2(ep)}`;
    if (stages.includes('script') && (e.scenes || []).length && !ew.screenplayDatasetId) add('script', E, `wji.screenplayDatasetId`, `wji dataset new <story> "${E} 剧本" -t screenplay`);
    if (!stages.includes('storyboard')) continue;
    const segs = e.storyboard?.segments || [];
    if (!segs.length) continue;
    if (!ew.canvasId) add('storyboard', E, 'wji.canvasId', `wji canvas create ${E}`);
    if (!ew.shotFolderId) add('storyboard', E, 'wji.shotFolderId', `wji fs mkdir <shot> ${E}`);
    const needed = new Set();
    const voices = new Set();
    for (const seg of segs) {
      const scene = (e.scenes || [])[Number(seg.sceneIndex) - 1] || {};
      needed.add(`${scene.sceneId}:sheet`);
      for (const c of seg.cuts || []) {
        for (const id of c.characters || []) needed.add(`${id}:sheet`);
        for (const id of c.props || []) needed.add(`${id}:sheet`);
      }
      // Whoever speaks needs their voice on the canvas: it is the `@audioN` the prompt points at.
      for (const r of audioReferences(project, e, seg)) voices.add(`${r.entity}:voice`);
    }
    for (const key of needed) if (!ew.displayNodes?.[key]) add('storyboard', E, `wji.displayNodes.${key}`, `wji canvas add image -c <${E}> --asset <${key} asset> -n "${key}"`);
    for (const key of voices) if (!ew.displayNodes?.[key]) add('storyboard', E, `wji.displayNodes.${key}`, `wji canvas add audio -c <${E}> --asset <${key.split(':')[0]} voice asset> -n "${key}"`);
    for (const seg of segs) {
      const sw = seg.wji || {};
      const n = (seg.cuts || []).length;
      if (!sw.datasetId) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.datasetId`, `wji dataset new <shot/${E}> "${seg.id}" -t shot`);
      for (let k = 0; k < (paramsOf(project).references === 'sheets' ? 0 : n); k++) {
        if (!sw.nodes?.keyframes?.[k]) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.nodes.keyframes.${k}`, `wji canvas add image -c <${E}> -n "${seg.id} f${k + 1}" --from <display nodes>`);
        else if (!sw.assets?.keyframes?.[k]) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.assets.keyframes.${k}`, `wji canvas gen ${sw.nodes.keyframes[k]} → asset`);
      }
      if (paramsOf(project).audioTrack !== 'none' && isObject(seg.sound)) {
        const full = paramsOf(project).audioTrack === 'full';
        if (!sw.nodes?.track) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.nodes.track`, `wji canvas add audio -c <${E}> -n "${seg.id} track" -m ${AUDIO_MODEL}${full ? ' --from <voice display nodes, speaking order>' : ''} --prompt-file <prompt audio ${seg.id}>`);
        else if (!sw.assets?.track) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.assets.track`, `wji canvas gen ${sw.nodes.track} → asset → fs set <shot dataset> --add-images <asset>`);
      }
      if (!sw.nodes?.video) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.nodes.video`, `wji canvas add video -c <${E}> -n "${seg.id}" --from <${paramsOf(project).references === 'sheets' ? 'sheet display nodes' : 'keyframes'}>`);
      else if (!sw.assets?.video) add('storyboard', seg.id, `storyboard.segments.${seg.id}.wji.assets.video`, `wji canvas gen ${sw.nodes.video} (video — ask first) → asset`);
    }
  }
  return items;
}

/** Resolve a dotted path; a segment that does not exist as a key may be an entity id inside an array. */
export function bindPath(root, path, value) {
  const parts = String(path).split('.');
  let cursor = root;
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i];
    const last = i === parts.length - 1;
    if (Array.isArray(cursor)) {
      let idx = /^\d+$/.test(seg) ? Number(seg) : cursor.findIndex((it) => it && it.id === seg);
      if (idx === -1) throw new Error(`no element with id "${seg}" at ${parts.slice(0, i).join('.')}`);
      if (last) { cursor[idx] = value; return root; }
      if (cursor[idx] == null) cursor[idx] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cursor = cursor[idx];
      continue;
    }
    if (!isObject(cursor)) throw new Error(`cannot descend into "${parts.slice(0, i).join('.')}"`);
    if (last) { cursor[seg] = value; return root; }
    if (cursor[seg] == null) cursor[seg] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cursor = cursor[seg];
  }
  return root;
}

// ── init ────────────────────────────────────────────────────────────────────

export function initProject(opts) {
  const required = ['title', 'episodes', 'minutes', 'genre'];
  for (const key of required) if (opts[key] == null || opts[key] === '') throw new Error(`--${key} is required`);
  const video = opts.video || DEFAULT_PARAMS.video;
  if (!VIDEO_MODELS[video]) throw new Error(`--video must be one of ${VIDEO_MODES.join(' / ')}`);
  const mode = VIDEO_MODELS[video];
  return {
    version: VERSION,
    title: String(opts.title),
    lang: opts.lang || 'zh',
    params: {
      episodes: Number(opts.episodes),
      minutesPerEpisode: Number(opts.minutes),
      genre: String(opts.genre),
      adaptMode: opts.adapt || DEFAULT_PARAMS.adaptMode,
      ratio: opts.ratio || DEFAULT_PARAMS.ratio,
      video,
      // Store the provider's own spelling, and fall back to the nearest tier this model has.
      videoResolution: nearestResolution(mode, opts.resolution || DEFAULT_PARAMS.videoResolution),
      speechAccent: opts.accent || DEFAULT_PARAMS.speechAccent,
      references: opts.references || DEFAULT_PARAMS.references,
      // `auto` unless this model has no autoDuration parameter.
      videoDuration: opts.duration || (mode.autoDuration ? DEFAULT_PARAMS.videoDuration : 'fixed'),
      lookPhrase: opts.look || DEFAULT_PARAMS.lookPhrase,
      style: opts.style || DEFAULT_PARAMS.style,
      imagePromptLang: opts.imageLang || DEFAULT_PARAMS.imagePromptLang,
      register: normalizeRegister(opts.register || DEFAULT_PARAMS.register),
    },
    source: { kind: opts.source || 'original', path: opts.sourcePath || '', note: '' },
    outline: {
      core: '',
      brief: { logline: '', audience: '', satisfactionEngine: '', mainHook: '', protagonistPressure: '', antagonistPressure: '', emotionalLine: '', promise: '' },
      structure: [],
      guideline: { tone: '', emotionalIntensity: '', dialogueStyle: '', visualStyle: '', productionLimits: '', forbidden: [], priorities: [] },
      keep: [], cut: [], merge: [], risks: [], beats: [], episodes: [],
    },
    characters: [],
    scenes: [],
    props: [],
    wji: { workspaceId: '', datasetFolders: {}, canvases: { episodes: {} } },
  };
}

// ── file IO ─────────────────────────────────────────────────────────────────

export function projectPaths(input) {
  const abs = resolve(input);
  const dir = basename(abs) === 'project.json' ? dirname(abs) : abs;
  return { dir, project: join(dir, 'project.json'), episodes: join(dir, 'episodes') };
}

export function readJsonFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeJsonFile(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function loadProject(input, opts = {}) {
  const paths = projectPaths(input);
  if (!existsSync(paths.project)) throw new Error(`no project.json in ${paths.dir}`);
  const project = readJsonFile(paths.project);
  const episodes = {};
  const wanted = opts.eps ? new Set(opts.eps) : null;
  const n = Number(project.params?.episodes) || 0;
  for (let ep = 1; ep <= Math.max(n, 99); ep++) {
    if (wanted && !wanted.has(ep)) continue;
    const file = join(paths.episodes, `E${pad2(ep)}.json`);
    if (existsSync(file)) episodes[ep] = readJsonFile(file);
    else if (ep > n) break;
  }
  return { paths, project, episodes };
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function flag(args, name, fallback) {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) return true;
  return v;
}

function positional(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith('--')) i += 1;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}

/**
 * The gate report as text. One writer for every surface: the CLI prints it, the
 * WJI tool returns it. `all` keeps the passing and skipped rows (checkup).
 */
export function formatGates(results, { all, stage } = {}) {
  const lines = [];
  let failed = 0;
  let notes = 0;
  for (const r of results) {
    if (r.skipped) { if (all) lines.push(`  – ${r.stage}/${r.id} · ${r.label} (skipped: ${r.skipped})`); continue; }
    if (r.advisory) {
      const warnings = r.warnings || [];
      notes += warnings.length;
      if (all || warnings.length) lines.push(`  ${warnings.length ? '⚠' : '✓'} ${r.stage}/${r.id} · ${r.label} (advisory)`);
      for (const w of warnings) lines.push(`      ⚠ ${w}`);
      continue;
    }
    const ok = !r.failures.length;
    if (!ok) failed += 1;
    if (all || !ok) lines.push(`  ${ok ? '✓' : '✗'} ${r.stage}/${r.id} · ${r.label}`);
    for (const f of r.failures) lines.push(`      - ${f}`);
  }
  const hard = results.filter((r) => !r.skipped && !r.advisory).length;
  const advisory = results.filter((r) => !r.skipped && r.advisory).length;
  const tail = advisory ? `, ${advisory} advisory (${notes} note${notes === 1 ? '' : 's'})` : '';
  const summary = failed
    ? `✗ ${failed}/${hard} gate(s) failed${tail}`
    : `✓ ${hard} gate(s) passed${stage ? ` (through ${stage})` : ''}${tail}`;
  return { lines, text: [...lines, summary].join('\n'), summary, failed, notes, hard, advisory };
}

function printGates(results, opts) {
  const out = formatGates(results, opts);
  for (const line of out.lines) console.log(line);
  return out;
}

function main(argv) {
  const [cmd, ...rest] = argv;
  const pos = positional(rest);
  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 16).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }

  if (cmd === 'slug') {
    console.log(slug(pos[0]));
    return 0;
  }

  if (cmd === 'init') {
    const dir = pos[0];
    if (!dir) throw new Error('usage: init <dir> --title … --episodes N --minutes M --genre G');
    const project = initProject({
      title: flag(rest, '--title'), episodes: flag(rest, '--episodes'), minutes: flag(rest, '--minutes'), genre: flag(rest, '--genre'),
      adapt: flag(rest, '--adapt'), ratio: flag(rest, '--ratio'), video: flag(rest, '--video'), style: flag(rest, '--style'), lang: flag(rest, '--lang'),
      resolution: flag(rest, '--resolution'), accent: flag(rest, '--accent'),
      references: flag(rest, '--references'), duration: flag(rest, '--duration'), look: flag(rest, '--look'),
      register: flag(rest, '--register'), imageLang: flag(rest, '--image-lang'),
      source: flag(rest, '--source'), sourcePath: flag(rest, '--source-path'),
    });
    const paths = projectPaths(dir);
    if (existsSync(paths.project) && !flag(rest, '--force')) throw new Error(`${paths.project} exists (pass --force to overwrite)`);
    writeJsonFile(paths.project, project);
    mkdirSync(paths.episodes, { recursive: true });
    console.log(`✓ ${paths.project}`);
    return 0;
  }

  const input = pos[0];
  if (!input) throw new Error(`usage: ${cmd} <project> …`);
  const eps = parseEpRange(flag(rest, '--ep'));

  if (cmd === 'validate' || cmd === 'checkup') {
    const stage = flag(rest, '--stage');
    if (stage && !STAGES.includes(stage)) throw new Error(`--stage must be one of ${STAGES.join(' / ')}`);
    const { project, episodes } = loadProject(input, { eps });
    const ctx = makeContext(project, episodes, { eps });
    const results = runGates(ctx, { stage });
    const { failed, summary } = printGates(results, { all: cmd === 'checkup', stage });
    console.log(summary);
    return cmd === 'validate' && failed ? 1 : 0;
  }

  if (cmd === 'seed') {
    const what = pos[1];
    const ep = Number(flag(rest, '--ep'));
    if (!['script', 'storyboard'].includes(what) || !ep) throw new Error('usage: seed <project> script|storyboard --ep N [--force]');
    const { paths, project, episodes } = loadProject(input);
    const file = join(paths.episodes, `E${pad2(ep)}.json`);
    if (what === 'script') {
      if (existsSync(file) && !flag(rest, '--force')) throw new Error(`${file} exists (pass --force to overwrite)`);
      const seeded = seedScript(project, ep);
      // --force re-seeds the script, never the bindings: ids created on WJI stay bound.
      if (episodes[ep]?.wji) seeded.wji = { ...seeded.wji, ...episodes[ep].wji };
      writeJsonFile(file, seeded);
    } else {
      const episode = episodes[ep];
      if (!episode) throw new Error(`${file} does not exist — seed the script first`);
      if ((episode.storyboard?.segments || []).length && !flag(rest, '--force')) throw new Error(`${file} already has segments (pass --force to reset them)`);
      writeJsonFile(file, seedStoryboard(project, episode));
    }
    console.log(`✓ ${file}`);
    return 0;
  }

  if (cmd === 'render') {
    const what = pos[1];
    const { project, episodes } = loadProject(input);
    const needEp = () => {
      const ep = Number(flag(rest, '--ep'));
      if (!ep || !episodes[ep]) throw new Error(`--ep N with an existing episodes/E0N.json is required`);
      return episodes[ep];
    };
    if (what === 'outline') console.log(renderOutline(project));
    else if (what === 'guideline') console.log(renderGuideline(project));
    else if (what === 'dialogue') console.log(renderDialogue(project, needEp()));
    else if (what === 'character') console.log(renderCharacter(project, pos[2]));
    else if (what === 'scene') console.log(renderScene(project, pos[2]));
    else if (what === 'prop') console.log(renderProp(project, pos[2]));
    else if (what === 'script') console.log(renderScript(project, needEp()));
    else if (what === 'segment') {
      const id = pos[2];
      const ep = Number((id || '').match(/^E(\d+)-/)?.[1]);
      if (!ep || !episodes[ep]) throw new Error(`segment id like E01-01 whose episode file exists is required`);
      console.log(renderSegment(project, episodes[ep], id));
    } else throw new Error('usage: render <project> outline | guideline | character C01 | scene S01 | prop P01 | script --ep N | dialogue --ep N | segment E01-01');
    return 0;
  }

  if (cmd === 'prompt' && pos[1] === 'audio') {
    const id = pos[2];
    const ep = Number((id || '').match(/^E(\d+)-/)?.[1]);
    const { project, episodes } = loadProject(input);
    if (!ep || !episodes[ep]) throw new Error('usage: prompt <project> audio E01-01 [--full|--bed]');
    const seg = (episodes[ep].storyboard?.segments || []).find((x) => x.id === id);
    if (!seg) throw new Error(`no segment ${id}`);
    const mode = flag(rest, '--full') ? 'full' : flag(rest, '--bed') ? 'bed' : undefined;
    const out = audioPrompt(project, episodes[ep], seg, mode ? { mode } : {});
    if (flag(rest, '--json')) console.log(JSON.stringify(out, null, 2));
    else {
      console.log(`# ${out.segment} · audio ${out.model} · ${out.mode} · ${round2(out.seconds)}s${out.references.length ? ` · refs: ${out.references.map((r) => `${r.label} ← ${r.entity}:${r.asset}`).join(', ')}` : ''}`);
      console.log('');
      console.log(out.prompt);
    }
    return 0;
  }

  if (cmd === 'prompt' && pos[1] === 'image') {
    const { project } = loadProject(input);
    if (!pos[2]) throw new Error('usage: prompt <project> image C01|S01|P01 [--asset headshot|sheet|lighting:<state>|state:<state>] [--json]');
    const out = imagePrompt(project, pos[2], flag(rest, '--asset') || 'sheet');
    if (flag(rest, '--json')) console.log(JSON.stringify(out, null, 2));
    else console.log(out.prompt);
    return 0;
  }

  if (cmd === 'prompt' && pos[1] === 'voice') {
    const { project } = loadProject(input);
    const c = characterById(project, pos[2]);
    if (!c) throw new Error(`no character ${pos[2]}`);
    console.log(voiceSamplePrompt(c, paramsOf(project)));
    return 0;
  }

  if (cmd === 'prompt') {
    const id = pos[2];
    const ep = Number((id || '').match(/^E(\d+)-/)?.[1]);
    const { project, episodes } = loadProject(input);
    if (pos[1] !== 'segment' || !ep || !episodes[ep]) throw new Error('usage: prompt <project> segment E01-01');
    const out = promptSkeleton(project, episodes[ep], id);
    if (flag(rest, '--json')) console.log(JSON.stringify(out, null, 2));
    else {
      // `duration: null` means auto — say so, and say what the clip was planned at.
      const dur = out.video.duration == null ? `auto (planned ${out.video.plannedSeconds}s — pass no -d)` : `${out.video.duration}s`;
      console.log(`# ${out.segment} · video ${out.video.model} · ${out.video.ratio} · ${out.video.resolution} · ${dur} · refs: ${out.video.references.join(', ')}`);
      console.log('');
      console.log(out.video.prompt);
      console.log('');
      for (const k of out.keyframes) {
        console.log(`## keyframe ${k.name} (${k.ratio})`);
        for (const r of k.references) console.log(`   ${r.label} ← ${r.entity}:${r.asset}  (${r.why})`);
        console.log(`   ${k.prompt}`);
        console.log('');
      }
    }
    return 0;
  }

  if (cmd === 'manifest') {
    const stage = flag(rest, '--stage');
    const { project, episodes } = loadProject(input);
    const items = manifest(project, episodes, { stage, ep: flag(rest, '--ep') });
    if (flag(rest, '--json')) console.log(JSON.stringify(items, null, 2));
    else if (!items.length) console.log('✓ nothing unbound');
    else {
      for (const it of items) console.log(`  [${it.stage}] ${it.entity.padEnd(8)} ${it.item}\n      ${it.hint}`);
      console.log(`${items.length} unbound item(s)`);
    }
    return items.length ? 2 : 0;
  }

  if (cmd === 'bind') {
    const path = pos[1], value = pos[2];
    if (!path || value === undefined) throw new Error('usage: bind <project> [--ep N] <path> <value>');
    const { paths, project, episodes } = loadProject(input);
    const ep = Number(flag(rest, '--ep'));
    let target = project, file = paths.project;
    if (ep) {
      if (!episodes[ep]) throw new Error(`episodes/E${pad2(ep)}.json does not exist`);
      target = episodes[ep];
      file = join(paths.episodes, `E${pad2(ep)}.json`);
    }
    let v = value;
    if (v === 'null') v = null;
    else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    else if (v.startsWith('{') || v.startsWith('[')) v = JSON.parse(v);
    bindPath(target, path, v);
    writeJsonFile(file, target);
    console.log(`✓ ${path} = ${typeof v === 'string' ? v : JSON.stringify(v)}${ep ? ` (E${pad2(ep)})` : ''}`);
    return 0;
  }

  throw new Error(`unknown command "${cmd}" — run with --help`);
}

const isMain = process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (err) {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
  }
}
