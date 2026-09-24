# Project schema

A project is a directory:

```
<project>/
├── project.json          title, params, outline, characters, scenes, props, WJI bindings
└── episodes/
    ├── E01.json          script + storyboard of episode 1 (+ its WJI bindings)
    └── E02.json …
```

`project.json` is the machine-checked source of truth; WJI datasets and canvases
are the published store and work area. Every WJI id the pipeline creates is
written back into the `wji` blocks so a run can resume. **The model fills the
design fields; the script (`scripts/short-drama.mjs`) fills or derives the
rest** — target seconds, beat timing, prompt skeletons, bindings.

All commands accept either the directory or the `project.json` path.

## project.json

```json
{
  "version": 1,
  "title": "夜班便利店",
  "lang": "zh",
  "params": {
    "episodes": 3, "minutesPerEpisode": 1, "genre": "都市悬疑", "adaptMode": "原创",
    "ratio": "9:16", "video": "h3", "videoResolution": "768P", "speechAccent": "", "style": "realistic", "register": "大陆普通话",
    "references": "sheets", "videoDuration": "auto", "lookPhrase": "",
    "camera": { "body": "ARRI ALEXA Mini LF", "lens": "Zeiss Supreme Prime", "aperture": "T1.5" },
    "charsPerSecond": 4.5, "actionSeconds": 2.5, "tolerance": 0.15,
    "maxLineChars": 35, "hookWindow": 3,
    "minSegmentSeconds": 5, "maxSegmentSeconds": 15, "minCutSeconds": 2, "maxCutSeconds": 5, "maxOnScreen": 3,
    "thresholds": { "maxLeads": 5, "maxSupport": 10, "maxFunctional": 10, "maxBeatGap": 3, "maxProps": 8 }
  },
  "source": { "kind": "original", "path": "", "note": "" },
  "outline":    { "core": "…", "brief": {}, "structure": [], "guideline": {}, "keep": [], "cut": [], "merge": [], "risks": [], "beats": [], "episodes": [] },
  "characters": [],
  "scenes":     [],
  "props":      [],
  "wji":        { "workspaceId": "", "datasetFolders": {}, "canvases": { "episodes": {} } }
}
```

### params

| Field | Default | Meaning |
| --- | --- | --- |
| `episodes` | required | total episode count; `outline.episodes` must have exactly this many |
| `minutesPerEpisode` | required | target length; `targetSeconds = minutes × 60` |
| `genre` | required | decides the beat (爽点) types |
| `adaptMode` | `原创` | `原创` / `忠实` / `抽核` / `借壳`. Anything but `原创`/`忠实` requires a non-empty `outline.cut` |
| `ratio` | `9:16` | keyframe and video ratio; sheets are always 16:9 |
| `video` | `h3` | one of `h3` / `seedance` / `seedance2` / `seedance2fast` / `wan` — see the model table below. **It decides the segment length, so it decides how the plot is cut up.** |
| `videoResolution` | `720P` | passed to the video node as `--resolution`; it drives the price per second. The tiers are **per model** and so is the spelling — `validate` rejects one the model does not have (h3 has 768P and no 720P; the Seedance models are lowercase). `init` writes the nearest tier the chosen model has, in that model's spelling, so h3 projects start at `768P` |
| `speechAccent` | empty | e.g. `台湾口音国语` / `Taiwanese-accented Mandarin`. Any segment with dialogue must name it in its prompt (the video model speaks the lines) |
| `references` | `sheets` | `sheets` (**the default — no storyboard images**): the video node references the scene / character / prop sheets directly (`segmentReferences` order: environment, people, props) and the prompt describes each shot. `keyframes`: one generated image per cut, the video node references them in cut order — more images to pay for and approve, worth it when a shot has to be composed exactly. Works with every mode; H3 in sheets mode opens with an `Image k is …` legend instead of the alignment line |
| `humanReferences` | `true` | `false` drops character sheets from the video node's references (people are described in the prompt's Cast line instead). Any Seedance mode + `photoreal` requires it to be set explicitly: BytePlus refuses photorealistic people as reference images (`input image may contain real person`, HTTP 400) unless the account has the real-person permission enabled |
| `boundaryContrastCuts` | `2` | how many cuts on each side of a scene boundary the `boundary-contrast` gate compares (1–3); the last K cuts of a scene must not repeat the size + angle + people of the first K of the next scene. Mark a deliberate one with `note: "match-cut"`. The same check across episodes is the advisory `boundary-contrast-episode` |
| `videoDuration` | `auto` | `auto` (**the default**) passes no `-d` and lets the model's `autoDuration` match the clip to the prompt; the cut seconds are then the *planned* timing. `fixed` passes `-d` = Σ cut seconds, and is what `init`/`paramsOf` fall back to on a model with no `autoDuration` parameter (today: `minimax-h3-ref`). Asking for `auto` on such a model is a gate failure, not a silent downgrade |
| `camera` | ARRI ALEXA Mini LF / Zeiss Supreme Prime / T1.5 | the production's camera package: `{ body, lens, aperture }`. Every cut's `frame` names it verbatim, so the whole drama looks shot on one rig. A cut may override `focal` and `aperture` |
| `videoReferences` | `none` | `previous` hands each segment the clip before it as `@video1` (continuity of grade, wardrobe and camera language); `none` leaves the sheets to carry it. Opt-in, because it chains the segments: regenerating one invalidates the reference of every segment after it |
| `maxVideoRefs` / `maxAudioRefs` | per mode | how many clip / voice references the model takes; set them lower to tighten, never higher |
| `lookPhraseZh` | empty | the same look phrase in the drama's language, gated in a **Chinese** prompt (`wan`) where the English `lookPhrase` would be both out of place and extra length for the content filter to judge |
| `speechLeadSeconds` | 0.5 | added to a cut's dialogue seconds before the fit check — the mouth opens after the cut starts; also where a line starts in the `full` soundtrack prompt |
| `audioTrack` | `bed` | the Seed Audio node per segment: `bed` (ambience + sfx + timed music, no voices), `full` (the bed plus every line in the connected `@Audio1..3` voices — at most three speakers), `none` |
| `subtitles` | false | `true` drops the subtitles-off sentence requirement from the prompts |
| `maxFrameChars` | 900 | frames longer than this are flagged as padding (advisory) |
| `lookPhrase` | empty | a lens / look phrase (e.g. `wide-aperture lens, shallow depth of field, creamy background bokeh and soft out-of-focus foreground elements`) that every segment prompt must carry verbatim |
| `imagePromptLang` | `en` | the language of every character / scene / prop image prompt (portrait, sheet, negative, lighting states, prop states): `en`, or `zh` when the image model takes Chinese — 简体 or 繁體, gated in that language (`init --image-lang zh`). Video prompts follow `params.video`; `identityEn`, `voice.prompt` and `videoDirection` stay English. `prompt <project> image C01 --asset headshot\|sheet\|lighting:<state>\|state:<state>` prints a node's full prompt in it |
| `style` | `realistic` | `photoreal` (live action), `realistic` (semi-realistic painterly) or `ghibli`; one style for the whole drama (see stage-characters) |
| `register` | required | the 语体 the lines are written in: `粤语` / `大陆普通话` / `台湾国语` / `港式普通话` / `古装` / `年代` / `英文美式` / `英文英式` (traditional spellings accepted). When `speechAccent` is empty it is derived from this in the prompt's language (`standard Mandarin` / `标准普通话`). A character may override it in `bible.speech.register`. The `dialogue-register` gate is **advisory** — it notes lines that break the register and never fails `validate` |
| `hookSeconds` | 15 | the hook image (`hookBeat`) must be on screen by this cumulative second |
| `turnSeconds` | 30 | the longest stretch allowed between turn points — the hook, every beat marked `turn: true`, the 爽点 and the cliff |
| `maxConsecutiveLines` | 3 | line beats in a row without an action beat between them |
| `minActionRatio` | 0.35 | action beats ÷ line beats over an episode with ≥ 5 lines (谈话+行动) |
| `maxLineWords` / `maxNameCallsPerScene` | 20 / 2 | English registers only: words per line, and how often another character is addressed by name in one scene (advisory) |
| `charsPerSecond` / `actionSeconds` | 4.5 / 2.5 | script duration math: a line takes `nonWhitespaceChars ÷ charsPerSecond` s, an action beat takes `actionSeconds` |
| `tolerance` | 0.15 | ±15 % for episode duration gates |
| `maxLineChars` | 35 | one line must be sayable in one breath |
| `hookWindow` | 3 | the hook's concrete image must land within the first N beats of the episode |
| `min` / `maxSegmentSeconds` | per mode | the duration range of one video generation, taken from `params.video` when not set. **Every ref model takes whole seconds only**, so in `fixed` mode a segment's cuts must sum to an integer. Setting them by hand cannot widen the model's own range |

| `minCutSeconds` / `maxCutSeconds` | 2 / 5 | cut length band |
| `maxOnScreen` | 3 | more people in one cut needs a `note` explaining the staging |
| `thresholds.maxPrimaryScenes` | derived | `4 + ⌈episodes/10⌉` clamped to 5–15; set explicitly to override |

**Video models.** Read off the backend model forms; `VIDEO_MODELS` in `scripts/short-drama.mjs` is
the single source and every gate reads it:

| `video` | model | segment | images | clips | voices | auto duration | resolutions | prompt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `h3` | `minimax-h3-ref` | 5–15 s | 9 | 3 (≤ 15 s) | 3 | ✗ | `480P` `768P` `2K` `4K` | English, keyframe-pinned |
| `seedance` | `seedance-2.5-ref` | 4–30 s | 30 | 10 (≤ 30 s) | 10 | ✓ | `480p` `720p` `1080p` | English, `@imageN` |
| `seedance2` | `seedance-2.0-ref` | 4–15 s | 9 | 3 (≤ 15 s) | 3 | ✓ | `480p` `720p` `1080p` `4k` | English, `@imageN` |
| `seedance2fast` | `seedance-2.0-fast-ref` | 4–15 s | 9 | 3 (≤ 15 s) | 3 | ✓ | `480p` `720p` | English, `@imageN` |
| `wan` | `wan-3.0-ref` | 2–30 s | 10 | 5 (≤ 15 s) | 5 | ✓ | `480P` `720P` `1080P` | Chinese prose, `@imageN`, speaks the dialogue |

The three Seedance entries share one prompt dialect (`family: 'seedance'`), so 2.0 and 2.0 Fast are
written exactly like 2.5 — they differ only in the ceiling (15 s, not 30) and the reference cap
(9, not 30)

### outline

| Field | Required | Notes |
| --- | --- | --- |
| `core` | yes | one sentence |
| `keep[]` | ≥1 unless `adaptMode` is `原创` | `{what, why, evidence?}` — `evidence` is a verbatim quote from the source |
| `cut[]` | non-empty when `adaptMode` ∉ {`原创`,`忠实`} | `{what, why}` |
| `merge[]`, `risks[]` | no | `{what, why}` / `{what, plan}` |
| `cutNote`, `mergeNote` | no | decision summaries shown to the user at sign-off |
| `brief` | yes | the 创作简报 — `{logline, audience, satisfactionEngine, mainHook, protagonistPressure, antagonistPressure, emotionalLine, promise}`, drama language, no quotes; `satisfactionEngine` names one of `打脸 / 复仇 / 强宠 / 身份揭露 / 智商碾压 / 情感释放` (and may say how it varies) |
| `structure[]` | yes | the three phases `{phase: "golden"|"escalation"|"climax", episodes: [from, to], task, satisfactionPlan, hookPlan}` in that order, tiling `1..episodes`; golden ends within the first ~20 % (and never before episode 3 when there are ≥ 6). Two episodes: golden + climax only. **One episode**: golden + climax, both `[1, 1]` (retention and payoff in the same 集) |
| `guideline` | yes | the 创作指引 — `{tone, emotionalIntensity, dialogueStyle, visualStyle, productionLimits, forbidden[] (≥3), priorities[] (3–5)}`; `render guideline` publishes it as its own dataset and it is re-read before every stage |
| `beats[]` | ≥1 | `{id:"B01", type, weight:"major"|"minor", episode, setup, payoff}`; `episode` is the only place a beat's position lives |
| `episodes[]` | exactly `params.episodes` | `{ep, function[], task: {goal, obstacle, stake}, change, satisfaction: {type, action}, hookType, synopsis, hook, suspense, sceneIds[], characterIds[], propIds[], crowdPlan?, warnings[]}` — narrative prose, **no dialogue quotes** (`「」『』“”`). `function` ⊆ `开局钩子 / 冲突升级 / 身份揭露 / 情感推进 / 大反转 / 清算收束`; `satisfaction.type` ∈ the six 爽点 types and `action` is the visible action that does it; `hookType` ∈ `身份 / 危机 / 结果 / 情感 / 反转 / 道具`. Episode 1 includes 开局钩子; with ≥ 3 episodes, episode 2's 爽点 type is the brief's engine and episode 3 includes 冲突升级 / 身份揭露 / 大反转; the finale includes 清算收束 or 大反转 |

`warnings` values: `雨戏`, `肢体接触`, `人群`, `手部特写` (generation hazards).

### characters[]

Outline stage fills the first block; the characters stage fills the rest.

```json
{
  "id": "C01", "name": "林小夏", "aliases": ["小夏"],
  "tier": "lead", "role": "女主·夜班店员", "arc": "从躲着不问到主动追问", "from": ["原创"],

  "oneLiner": "夜班便利店店员，眼神总在监控屏和门口之间来回。",
  "identityEn": "the young woman in the faded navy jacket",
  "profile": {
    "gender": "女", "ageRange": "24 岁左右", "identity": "便利店夜班店员",
    "appearance": "…", "personality": ["警觉", "嘴硬", "心软"], "temperament": "…",
    "motivation": "…", "relationships": [{ "id": "C02", "name": "老陈", "surface": "夜班常客", "real": "…", "power": "…", "secret": "…", "turnEpisode": 2 }], "evidence": []
  },
  "image": { "prompt": "…", "negativePrompt": "…", "sheet": "…", "tags": [] },
  "voice":  { "timbre": "…", "pitch": "…", "pace": "…", "accent": "…", "emotion": "…", "prompt": "…",
              "videoDirection": "quiet and slightly fast, clipping the ends of phrases, flat and guarded",
              "sample": { "line": "…", "direction": "…" } },
  "bible": {
    "function": "主角", "hookLine": "身份 + 核心矛盾 + 外在欲望 + 风险", "want": "…", "need": "…", "misbelief": "…", "contradiction": "…",
    "wound": "150–250 字", "pastChoices": [{ "when": "…", "pressure": "…", "choice": "…", "gained": "…", "lost": "…", "residue": "…" }],
    "firstImpression": "…", "finalUnderstanding": "…", "pressureResponse": "…",
    "speech": { "rhythm": "…", "catchphrase": "", "silence": "…", "forbiddenWords": [], "register": "" },
    "forbidden": ["…", "…", "…"], "mustFace": ["…", "…", "…"],
    "arc": [{ "stage": "开场", "episode": 1, "state": "…", "change": "…" }]
  },

  "wji": { "datasetId": "", "nodes": { "title": "", "headshot": "", "sheet": "", "voice": "" },
           "assets": { "headshot": "", "sheet": "", "voice": "" } }
}
```

| Field | Language | Rules |
| --- | --- | --- |
| `tier` | — | `lead` (1–5, `arc` required) / `support` (≤10, `arc` required) / `functional` (≤10, `name` is a role label such as 急诊医生, `arc` optional) |
| `from[]` | — | change record: source character, merges, or `["原创"]` |
| `disguise` | `lang` | optional `{ name, revealEpisode }` for a character who hides who they are (a villain under a false name, a secret identity): before `revealEpisode` every episode document — `render script` / `dialogue` / `segment`, the seed note — calls them `name` so the crew's scripts do not spoil the reveal. `name` is treated as an alias by the name gates. Gate `tiers`: `name` set and ≠ the real name, `revealEpisode` in 2–episodes |
| `oneLiner`, `profile.*`, `voice.timbre…emotion` | `lang` | human-readable. **No names or aliases**: in a Chinese (`wan`) prompt `timbre / pace / accent / emotion` are pasted beside the character's first line, and all six go into the voice-sample prompt — gate `voice` |
| `profile.evidence[]` | source | verbatim quotes, never translated |
| `image.prompt` | **`params.imagePromptLang`** (English by default) | portrait prompt; **no names or aliases**; must state ethnicity and era |
| `image.negativePrompt` | `imagePromptLang` | style-dependent, see stage-characters |
| `image.sheet` | `imagePromptLang` | 16:9 three-zone sheet prompt; no names; contains the style's render phrase (`STYLE_PRESETS[style].render`, or `.renderZh` in Chinese) |
| `voice.prompt` | English | ≤400 characters, a static voice identity, **no quoted lines** |
| `voice.videoDirection` | **English** | ≤160 characters, one clause: how they speak (pace, where the voice sits, what it does at the end of a phrase, accent). It is pasted beside **every line this character says** in a video prompt, and gated there — compress `voice.prompt`, do not repeat it |
| `identityEn` | **English** | ≤80 characters, the name-free way a prompt refers to this person (`the woman in her mid thirties in headphones`). Distinct per character; no names. Used to attribute dialogue in `keyframes` mode and anywhere a `@imageK` label is not available |
| `bible` | `lang` | the 人物圣经 (gate `bible`), required by tier — **functional**: `function` (∈ `主角 / 共同主角 / 反派 / 爱情线 / 导师 / 盟友 / 镜像 / 压力测试者 / 喜剧调节`) only; **support**: also `hookLine`, `want`, `need` (≠ want), `misbelief`, `contradiction`, `pressureResponse`, `speech.rhythm`, `speech.silence`; **lead**: also `wound`, `firstImpression`, `finalUnderstanding`, `pastChoices` (≥ 2, each with when / pressure / choice / gained / lost / residue), exactly three `forbidden` and three `mustFace`, `arc` (≥ 3 stages from `开场 / 第一转折 / 中段 / 低谷 / 高潮选择 / 结局`, episodes in range, `高潮选择` present). `speech.register` overrides `params.register` for this character |
| `profile.relationships[]` | `lang` | `{id, name, surface, real, power, secret, turnEpisode}` (gate `relationships`): every lead has one whose `id` resolves with `surface` + `real` + `power`; at least one relationship in the cast carries a `secret`. The old `{name, relation}` shape is still read (`relation` = surface) |

### scenes[]

```json
{
  "id": "S01", "name": "便利店店内", "primary": true, "reusePlan": "",
  "summary": "设计意图…", "anchors": [{ "name": "闪烁的关东煮灯箱", "desc": "…" }],
  "lighting": [{ "state": "凌晨冷白光", "prompt": "…" }],
  "image": { "prompt": "…", "negativePrompt": "…", "sheet": "…", "tags": [] },
  "variantOf": "", "changes": "",
  "wji": { "datasetId": "", "nodes": { "sheet": "", "lighting": {} }, "assets": { "sheet": "", "lighting": {} } }
}
```

Outline stage: `id`, `name`, `primary`, `reusePlan` (required for a scene used in
only one episode). Art stage: `summary` (design intent), `anchors` (3–5,
paintable and checkable), `lighting` (≥1, prompts in `imagePromptLang`, derived from the
episodes it appears in), `image.*` (`imagePromptLang`, **empty scene — negative prompt
must ban people**), `variantOf` + `changes` for variants of a parent scene.
`wji.nodes.lighting` / `wji.assets.lighting` are keyed by lighting `state`.

### props[]

```json
{
  "id": "P01", "name": "旧监控硬盘", "function": "全剧悬念核心：里面到底录了什么",
  "beatIds": ["B02"], "scale": "handheld", "summary": "…",
  "anchors": [{ "name": "…", "desc": "…" }], "states": [{ "state": "封在防静电袋里", "prompt": "…" }],
  "relatedScenes": ["S01"], "carriedBy": ["林小夏"],
  "image": { "prompt": "…", "negativePrompt": "…", "sheet": "…", "tags": [] },
  "wji": { "datasetId": "", "nodes": { "sheet": "", "states": {} }, "assets": { "sheet": "", "states": {} } }
}
```

Outline stage: `id`, `name`, `function` (what it carries in the story —
if you cannot fill it, it is set dressing, not a prop), `beatIds`. Art stage:
`scale` (`handheld` / `tabletop` / `furniture` — the matching phrase
`handheld scale` etc. must appear in `image.prompt` and `image.sheet`),
`anchors` 3–5, `states` ≥1, `image.*` (**white background, no people, negative
prompt bans hands**). At most `thresholds.maxProps` (8).

### wji (project level)

```json
{
  "endpoint": "https://api.wji.ai", "workspaceId": "…",
  "datasetFolders": { "story": "…", "character": "…", "location": "…", "prop": "…", "shot": "…" },
  "canvases": { "characters": "…", "scenes": "…", "props": "…", "episodes": { "1": "…" } },
  "outlineDatasetId": "…", "guidelineDatasetId": "…"
}
```

## episodes/E<nn>.json

```json
{
  "ep": 1, "targetSeconds": 60,
  "function": ["开局钩子"], "task": { "goal": "…", "obstacle": "…", "stake": "…" }, "change": "…", "hookType": "身份",
  "hook": "…", "cliff": "…", "beatsClaimed": ["B01"], "hookBeat": [1, 1], "satisfactionBeat": [2, 9],
  "scenes": [
    { "sceneId": "S01", "lighting": "凌晨冷白光", "characters": ["C01", "C02"], "props": ["P01"],
      "flow": [
        { "action": "林小夏抱着纸箱推开员工通道的门，箱子一角磕在货架上。", "turn": true },
        { "speaker": "C02", "line": "又是你值夜班。", "delivery": "没抬头，手里翻着报纸" }
      ] }
  ],
  "storyboard": {
    "segments": [
      { "id": "E01-01", "sceneIndex": 1,
        "cuts": [
          { "beats": [1, 1], "seconds": 3, "size": "medium", "camera": "Tracking Shot",
            "focal": "40mm",
            "light": { "direction": "back-left", "note": "the store light rims her shoulder; the street stays unlit" },
            "foreground": "the dripping edge of the striped awning",
            "characters": ["C01"], "props": ["P01"], "frame": "medium shot of …, cinematic film still", "note": "" }
        ],
        "prompt": "…",
        "wji": { "datasetId": "", "nodes": { "keyframes": [], "video": "", "track": "", "prompt": "" },
                 "assets": { "keyframes": [], "video": "" } } }
    ]
  },
  "wji": { "screenplayDatasetId": "", "canvasId": "", "shotFolderId": "", "displayNodes": {} }
}
```

### Script (filled by the script stage)

| Field | Rules |
| --- | --- |
| `targetSeconds` | seeded from `params`; the episode estimate must be within `± tolerance` |
| `hook` / `cliff` | descriptions of the opening hook and closing suspense, not lines. `seed script` leaves `hook` empty (the writer describes the opening image) and fills `cliff` from the outline episode's `hook` |
| `beatsClaimed[]` | outline beat ids this episode realises; must equal the beats whose `episode` is this one |
| `hookBeat` | `[sceneIndex, beatIndex]` (1-based) where the hook's concrete image lands — within the first `hookWindow` beats of the episode and by `hookSeconds` of cumulative time |
| `function` / `task` / `change` / `hookType` | seeded from the outline episode and gated equal to it (`script-design`) |
| `satisfactionBeat` | `[sceneIndex, beatIndex]` of the 爽点 — an action beat, or a line with an action beat beside it; after the hook, before the last beat |
| `flow[].turn` | `true` on a beat that brings new information, an obstacle, a counter or a choice; the `rhythm` gate measures hook → turns → 爽点 → cliff against `turnSeconds` |
| `scenes[].sceneId` / `lighting` / `characters` / `props` | must exist in `project.json`; `lighting` must be a state of that scene |
| `flow[]` | alternating **action beats** `{action}` (narrative, one thing per beat, **common actions only**, no quotes) and **line beats** `{speaker, line, delivery?}`; `speaker` ∈ scene `characters` or `VO` (an off-screen voice: it gets no `@audio` reference, the prompt calls it off-screen and keeps every visible mouth closed while it speaks); `line` ≤ `maxLineChars` non-whitespace characters; `delivery` names nobody when the video prompt carries it (a Chinese `wan` prompt, or an English delivery) — gate `beat-flow` |

Duration: `Σ lines (chars ÷ charsPerSecond) + Σ actions × actionSeconds`.

### Storyboard (filled by the storyboard stage)

| Field | Rules |
| --- | --- |
| `segments[].id` | `E<ep>-<nn>`, sequential in file order; also the name of the shot dataset and canvas group |
| `sceneIndex` | 1-based index into `scenes[]`; a segment never crosses scenes |
| `cuts[].beats` | `[from, to]` inclusive, 1-based within that scene's `flow`; every beat of every scene is claimed exactly once, in order |
| `cuts[].seconds` | `minCutSeconds`–`maxCutSeconds`; ≥ the dialogue seconds of the claimed beats; `minSegmentSeconds ≤ Σ cuts ≤ maxSegmentSeconds` — **the model's range**, and a whole number in `fixed` duration mode |
| `size` | `extreme-wide` / `wide` / `medium` / `close` / `extreme-close`; its English phrase must be in `frame` |
| `camera` | one of the H3 vocabulary: `Static Shot` `Push In` `Pull Out` `Zoom In` `Zoom Out` `Pan Left` `Pan Right` `Truck Left` `Truck Right` `Tilt Up` `Tilt Down` `Pedestal Up` `Pedestal Down` `Arc Shot` `Tracking Shot` `Shake Slightly` `Shake Strongly` `POV` `Roll Clockwise` `Roll Counterclockwise` |
| `characters` / `props` | ⊆ the scene's; `characters.length > maxOnScreen` needs `note` |
| `focal` / `aperture` | optional per-cut overrides of the lens; left out, `FOCAL_BY_SIZE` picks the focal from the shot size (extreme-wide 18mm, wide 25mm, medium 40mm, close 75mm, extreme-close 100mm macro) and `params.camera.aperture` the stop |
| `light` | `{ direction, note }`. `direction` ∈ `frontal` `front-left` `front-right` `side-left` `side-right` `back-left` `back-right` `backlight` `top` `underlight` `ambient` — **relative to the camera, not the room**; `note` says what the key picks out, what fills the shadow side and how it changes over the cut. Both required |
| `foreground` | what sits between the lens and the subject, to be thrown out of focus. `""` is a deliberately clean frame; at least half the cuts of a segment must have one |
| `background` | optional — the third depth layer behind the subject; expected (or a `note`) on a 9:16 wide |
| `purpose` | `{ kind, change }` — `kind` ∈ `establish / reveal / evidence / reaction / pressure / decision / consequence / performance / transition`; `change` says what the audience knows or who holds power when the cut ends (gate `shot-purpose`) |
| `angle` / `height` / `axisSide` | `front / three-quarter / profile / rear-three-quarter / back` · `ground / low / eye / high / top` · `working / cross / neutral` (`cross` needs `note`) — gate `framing-axis` |
| `start` / `end` | boundaries `{ positions: {C01: …}, facing: {C01: screen-left\|screen-right\|camera\|away}, gaze, hands, heldProps: {C01: [P01]}, state: [] }` for every person on screen; `start` only on a segment's first cut (later cuts inherit the previous `end`); a prop changes hands only on an action beat; `state` items that exist only in `end` may not appear in `frame` — gate `continuity` |
| `motion` | `{ trigger, action, result }` — cue, one visible state chain, landing (or `hold`); English unless the prompt language is Chinese; no names, no inferred states, ≤ 3 hand verbs — gate `motion` |
| `cameraNote` | `{ motivation, trigger, path, endFraming }` on any move (`motivation` ∈ `reveal / pressure / alignment / relationship / transition / stillness`), `{ hold }` on a `Static Shot` — gate `motion` |
| `frame` | English prompt for the moment: composition, this moment's positions and poses, the size phrase, the style's `framePhrase` (`photorealistic cinematic film still` / `cinematic film still` / `hand-painted anime film still`), **and verbatim** the camera phrase (`shot on an ARRI ALEXA Mini LF with a Zeiss Supreme Prime 75mm at T1.5`), the light-direction phrase and the foreground; **no names** — identity comes from the sheet references |
| `prompt` | the video prompt, shape by `params.video` (below); gate `prompt-hygiene` (no `…`, no ids / paths / notes, subtitles off unless `params.subtitles`, H3 lips-closed clause, sheets-mode `@imageK` per shot) |
| `segments[].axis` | `{ between: [C01, C02], workingSide, screenLeft, screenRight }`, required when two or more people appear in the segment |
| `segments[].sound` | `{ ambience, sfx: [{ cut, event }], music }` — ambience identical across a scene's segments; `music` is `N/A`, an intent string, or `{ intent, cues: [{ at: <cut number \| "10.5s">, do: enter \| swell \| duck \| drop \| silence \| out, note }] }` — gate `sound`. `prompt audio E01-01` derives the segment's Seed Audio soundtrack prompt from it (timecoded `[start s:end s]` ambience / sfx / music, plus the lines with `--full`) — gate `audio-track` |
| `segments[].refOverride[]` | optional — the Director pins this segment's **picture** references instead of the derived set (environment, people, props): `[{ entity, asset?: "sheet" \| "headshot" \| "lighting:<state>", faceOf?, why?, use?, zh? }]` in the order they will be connected (`@image1…`). `faceOf: "C01"` says this picture supplies that character's face, so their lines bind to it even when a body sheet of theirs comes later. Voices and the previous clip are still appended after the pictures. An empty array means "derived" |
| `storyboard.visualPlans[]` | `{ sceneIndex, turn, alignment, pressure, progression, rhythm, landing, sound }` for the 爽点 scene and the cliff scene (seeded) — gate `visual-plan` |
| `props[].textPolicy` | optional `{ mode: readable \| symbolic \| blank, text }` — gate `text-policy` |

`seed storyboard` also writes a **`plan`** block — the segmentation the chosen model forces, before
any prose is written:

```json
"plan": { "model": "minimax-h3-ref", "segmentSeconds": [5, 15], "wholeSecondsOnly": true,
          "duration": "fixed", "maxReferences": 9, "episodeSeconds": 90, "segments": 7,
          "scenes": [ { "sceneIndex": 1, "sceneId": "S01", "seconds": 28.5,
                        "segments": 2, "secondsPerSegment": 14.25, "note": "" } ] }
```

`segments` per scene is `⌈scene seconds ÷ maxSegmentSeconds⌉` — the fewest generations the model
allows — and the seconds are then spread evenly so none falls under the floor; a scene too short
for the floor gets a `note` telling you to merge or lengthen it. Swapping `params.video` changes
this and nothing else about the script, which is the point: the same 90-second episode is 7
segments on a 15-second model and 3 on a 30-second one. Delete `plan` with `seedScenes` once the
segments are written.

**References on the video node.** WJI numbers connected references **per type, in connection
order**, and the prompt addresses them by those labels:

- `@image1…N` — the keyframes in cut order, or in `sheets` mode the environment sheet, the lighting
  state, one sheet per person and one per prop, in that order.
- `@video1…` — with `params.videoReferences: "previous"`, the **clip of the segment before this
  one**, for continuity of grade, wardrobe and camera language. Off by default. Capped by
  `params.maxVideoRefs`, and the referenced clip may itself be no longer than the model's
  `maxRefVideoSeconds`.
- `@audio1…M` — the **voice sample of every character who speaks in that segment**, in speaking
  order. Their own series: a voice connected after three sheets is `@audio1`, not `@image4`.
  `params.voiceSamples: false` drops them; `params.maxAudioRefs` (default: the model's) caps them.

Each label is then used wherever it applies, and all of it is gated: `@imageK` **in the shot
paragraph that anchors on it** (keyframe modes) or somewhere in the prompt (sheets mode), `@videoK`
in the sentence saying what to carry over, `@audioK` **beside every line that character speaks**.
`segmentReferences()` builds the list; `prompt segment` prints it in connection order — pictures,
then clips, then voices — which is the order the video node must be `--from`'d.

**H3 prompt** (`params.video = "h3"`), checked verbatim where stated:

```
How the reference pictures align with the target video — @image1 (from Shot 1) aligns with the 0.00-second mark of the target video; @image2 (from Shot 2) aligns with the 3.00-second mark of the target video.
                                             ← derived from cut seconds; single-cut segments use:
For the target video, at 0.00 seconds into the target video, @image1 (from [Shot 1]) is fully referenced.

integrated_multimodal_description:
[Shot 1] … (anchor on @image1, then action, the camera word, the lens phrase, the light direction and
         what the light does, the foreground; then <speaker>, <voice.videoDirection>, says
         <d>[Chinese] 台词</d>)
[Shot 2] At 00:03.000, … (every k ≥ 2 starts with the cumulative timestamp)

overall_soundscape: …

non_diegetic_music: … (or N/A)
```

Gates: alignment line verbatim; the three field names in order; `[Shot k]`
present for every cut, with `At mm:ss.mmm,` equal to the cumulative seconds for
k ≥ 2; every claimed line verbatim inside `<d>[<Language>] …</d>`; the cut's
camera word inside its own `[Shot k]` paragraph; every speaker's `voice.videoDirection`
verbatim; no names outside `<d>`.

**Seedance prompt** (any Seedance mode — `seedance`, `seedance2`, `seedance2fast`), following `sd25-pe`:

```
Use @image1 through @imageN as keyframes in that order.      ← only when N ≥ 2
Use @image1 as the first frame.
This first frame defines …
@image2 defines the second keyframe: …
Use @imageN as the last frame.                                 ← only when N ≥ 2
…event script…, dialogue lines verbatim, sound.
```

Gates: `Use @image1 as the first frame.` verbatim; with N ≥ 2 the keyframe-order
and last-frame sentences verbatim; no `@imageK` with K > N; every claimed line
verbatim; camera words present; no names; ≤ 10,000 characters.

**H3 prompt in sheets mode** (`params.video = "h3"`, `params.references = "sheets"`): the alignment
line and its frame anchors are replaced by one `@imagek is …` line per referenced sheet (every
k ≤ N mentioned, none above N, no alignment wording). The rest is unchanged: `Look:` line (style
`videoPhrase` + `lookPhrase`), `integrated_multimodal_description:` with `[Shot k] At mm:ss.mmm,`
paragraphs carrying the cut's `frame`, camera word and `<d>[Chinese] …</d>`, then
`overall_soundscape:` (name `speechAccent` here) and `non_diegetic_music:`. H3 has no auto
duration: `videoDuration` must be `fixed` (gated).

**Seedance prompt in sheets mode** (any Seedance mode, `params.references = "sheets"` — the default):
`@image1…N` are the **sheets** the segment references, not frames, so the keyframe anchor
sentences (`Use @image1 as the first frame.` …) are forbidden. The skeleton from `prompt segment`:

```
@image1 is the environment — …            ← one line per referenced sheet, every @imageK must be mentioned
@image2 is the character sheet of …
Shot 1 (0.0–5.0 s, wide shot, Push In, shot on an ARRI ALEXA Mini LF with a Zeiss Supreme Prime 25mm at T1.5): <frame>
  rim-lit from behind camera left, <light.note>. <foreground> sits in the immediate foreground, thrown well out of focus.
  @image2, <voice.videoDirection>, says: 台词原文
Shot 2 (5.0–10.0 s, …): …
Look: <style videoPhrase>, <params.lookPhrase>. Maintain continuity …
Sound: … <params.speechAccent> …
```

Gates: every `@imageK` for K ≤ N mentioned, none above N, no keyframe anchors, camera words, lines
verbatim, no names outside the lines (say `@image2`, or the character's `identityEn`), every
speaker's `voice.videoDirection` present verbatim, the style's `videoPhrase` and `lookPhrase`
present, English apart from dialogue.

**Wan prompt** (`params.video = "wan"`), for `wan-3.0-ref`. Wan is an Alibaba
model: it is prompted in Chinese, it addresses its reference images as
图1…图10, and it generates the **sound with the picture**, so the dialogue and
the accent live in the prompt and no separate voice model is needed.

```
参考图说明：图1=镜头1关键帧；图2=镜头2关键帧。按顺序还原每个镜头的构图、人物外形与场景。

镜头1（0.0–5.0秒，中景，推近）：…描述…          ← header derived from the cut
台词（图1中的短发女子）：「…台词原文…」      ← speakers identified by 图N, never by name

镜头2（5.0–10.0秒，大特写，固定镜头）：…

整体：…色调、情绪、跨镜头一致性…
音频：对白为<params.speechAccent>，…环境音…
```

Gates: the legend line verbatim as the first line; every `镜头k（start–end秒，
size，camera）：` header verbatim (Chinese size and camera words come from
`SIZES_ZH` / `CAMERAS_ZH`); a `台词` block when the segment has dialogue; every
claimed line verbatim; an `音频：` line naming `params.speechAccent`; no character
name outside the dialogue; ≤ 20,000 characters.

Node settings: `-m wan-3.0-ref -r <ratio> -d <Σ cut seconds> --resolution
<params.videoResolution>`. Passing `-d` sets `autoDuration=false`, which is what
pins the clip to the storyboard; leave it off and the model picks its own length.

### wji (episode level)

`displayNodes` maps `"<entityId>:<asset>"` (`C01:sheet`, `C01:voice`,
`S01:sheet`, `S01:lighting:<state>`, `P01:sheet`) to the display node on the
episode canvas that shows that asset — keyframe nodes reference those.

## Id formats

`C01` characters, `S01` scenes, `P01` props, `B01` beats, `E01-01` segments.
Ids are stable once assigned; never renumber after a dataset is bound.
