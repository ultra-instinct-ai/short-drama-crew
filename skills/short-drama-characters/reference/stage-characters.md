# Stage 2 — Characters

Turn every `characters[]` entry into a reusable asset: a profile people read, an English portrait
prompt, a 16:9 character-sheet prompt, and a voice prompt — then the three assets WJI needs for a
character to hold across shots: **headshot** (icon), **sheet**, **voice** (`primaryAudio`).

## Profile (drama language)

`oneLiner`, `profile.gender/ageRange/identity/appearance/personality(3–5 words)/temperament/
motivation/relationships/evidence`. Inferred facts are fine when marked (`（推断）`); `evidence`
holds verbatim quotes only, or stays empty. Keep the tier from the outline — if it looks wrong,
change the outline, not this stage.

### `identityEn` — the name-free handle

One short English phrase, ≤ 80 characters, distinct per character: `the woman in her mid thirties in
headphones`, `the stocky man in his sixties with a grey crew cut`. Prompts may never carry a name,
but they constantly have to say *who* — who speaks this line, who turns — and this is the words
they use. Pick something visible and permanent (age, build, the thing they always wear), not a
plot role: the model can see a grey crew cut, it cannot see "the retired security guard". Gated:
present, English, name-free, no two characters alike.

## The bible — `bible` and `profile.relationships` (gates `bible`, `relationships`)

A profile says what they look like; the bible says how they got here, how they act now and what
the story will make them pay. Method in `craft-story.md` §7. By tier:

- every character: `bible.function` — 主角 / 共同主角 / 反派 / 爱情线 / 导师 / 盟友 / 镜像 / 压力测试者 /
  喜剧调节 (the dramatic job, independent of the tier);
- `support` and `lead`: `hookLine` (身份 + 核心矛盾 + 外在欲望 + 风险), `want` and `need` (not the same
  sentence), `misbelief`, `contradiction`, `pressureResponse`, `speech.rhythm` and `speech.silence`
  (plus `catchphrase`, `forbiddenWords`, an optional `register` override);
- `lead`: also `wound` (150–250 字, the choice and what they believed after), ≥ 2 `pastChoices`,
  `firstImpression` → `finalUnderstanding`, exactly three `forbidden` and three `mustFace`, and an
  `arc` of ≥ 3 stages with the 高潮选择 among them, each bound to an episode.

`profile.relationships[]` becomes the 关系网: `{id, name, surface, real, power, secret, turnEpisode}`.
Every lead has at least one with `surface` + `real` + `power`, and somewhere in the cast a
relationship carries a `secret` — that is where the reversals come from.

**`bible.speech` is the source of the voice.** `voice.pace` / `videoDirection` and every line's
`delivery` are written from `rhythm`, `silence` and `forbiddenWords`; `seed script` prints them in
the `seedNote` and `render dialogue` puts them beside each line for the polish pass.

## Image prompts (English by default; Chinese with `params.imagePromptLang: zh`)

`image.prompt`, `image.negativePrompt` and `image.sheet` are written in `params.imagePromptLang`
(`init --image-lang zh`): English by default, Chinese when the image model takes Chinese and the
crew wants to read and edit the prompts (简体 or 繁體 — the gates fold 繁體 to 简体). The rules
below are the same in both; in Chinese the gates look for the ethnicity (东亚 / 汉族 …), a whole era
word (当代 / 秦末汉初 / 唐代 — a bare 明 or 清 is not an era), `16:9`, the first words of the
style's `renderZh` phrase (photoreal: 真人实拍参考摄影) and its Chinese negatives (photoreal must ban
插画 / 动漫 / 卡通 and never 照片级). `identityEn`, `voice.prompt` and `voice.videoDirection` stay
English either way. The node prompts themselves come from `$SD prompt <project> image C01 --asset
headshot|sheet`.

- **No names, aliases, author or title anywhere** — image models paint what they remember of a
  name. Describe the person.
- **Ethnicity + era + region explicit** (`East Asian, Han Chinese features`, `contemporary 2020s
  Chinese city`, `Republican-era river town`). Left out, the model defaults to a contemporary
  Western face. Both are gated.
- `image.prompt`: an expressive three-quarter bust on a neutral background, soft directional key
  light, shallow depth of field. Realism comes from imperfection: uneven skin tone, visible pores,
  asymmetry in eyelids and brows, stray hairs, fabric with weave and wear. Put the individual
  description first and make it long — two similar-age characters written as "template + age +
  jacket colour" come out as the same person (`distinct` gate, 75 % word overlap).
- `image.negativePrompt`: with `style: photoreal` (live action — the right choice for a
  drama shot like a TV series) ban *drawing*: `illustration, anime, cartoon, painting`, and
  **never** `photorealistic`, `film grain` or `skin texture`. With `style: realistic` ban *fakeness* (plastic skin, doll face, dead
  eyes, helmet hair, flat fabric) and **never** `photorealistic` / `3d render`; with `ghibli` you
  **must** ban `photorealistic`. Both gated. Always add `logo, brand name, text` — a "store
  uniform" comes back wearing a real chain's badge otherwise (seen in testing), and a real brand
  on a character is a problem in every shot after it.
- `image.sheet`: the model-sheet layout, written out in full every time:

  ```
  ┌──────────┬────────────────────────────┐
  │  bust    │   front    side    back     │   ONE 16:9 canvas, pure white background
  │ portrait ├────────────────────────────┤   LEFT ZONE ≈ 34 % width: head-and-shoulders bust,
  │ (face    │  detail · detail · detail   │     both shoulders complete, flat bottom edge
  │  ref)    │                            │   RIGHT-TOP: three full-body views, same height,
  └──────────┴────────────────────────────┘     same head-to-body ratio, PROPORTIONS ARE CRITICAL
                                               RIGHT-BOTTOM: 4–5 small detail studies;
                                               the detail studies give way, not the figures
  ```

  Plus: `all views share the SAME face as the bust portrait`, `LIGHTING IN THE LEFT ZONE ONLY:
  soft directional key…`, `LIGHTING IN THE RIGHT ZONES: flat even orthographic lighting`, the
  style's render phrase (`STYLE_PRESETS[style].render` — `node scripts/short-drama.mjs` exports
  it; copy it verbatim), `No text, no watermark`. Gated: `16:9`, render phrase, no names.

## Voice

Six local-language fields (`timbre` `pitch` `pace` `accent` `emotion` + `referenceHint` optional)
for people, one English `voice.prompt` for a voice-design engine, and a **`voice.sample`** — the
short acted line that becomes the character's voice asset.

### `voice.sample` — the 3–5 s reference

```json
"sample": { "line": "這裡是海風電台。", "direction": "貼著麥克風，像只講給一個人聽" }
```

- **`line`**: one line in the drama's language, **3–5 s at `params.speechCharsPerSecond`**
  (default 2.4 — the voice model speaks far slower than the 4.5 chars/s the script uses for
  reading, so that is **8–12 Chinese characters**, not twenty). Gated. No quote marks: the
  engine reads them.
- **`direction`**: how *this line* is acted, in the drama's language.
- Pick a line that shows the character's default register, not a plot moment: it is a timbre
  reference, and every later clip inherits it.

### The prompt the model actually receives

`prompt <project> voice C01` composes it from the fields you already wrote — you do not write it
by hand, and it is a **parenthetical instruction followed by the line**:

```
（三十五歲上下女；基隆地方電台深夜節目主持人；性格冷靜、自持、嘴硬、念舊；偏低的胸腔共鳴，帶一點沙；
中低音域，起伏小；慢，句尾拖半拍；台灣口音國語，捲舌音輕；克制的溫柔，預設是平靜；
此刻貼著麥克風，像只講給一個人聽）這裡是海風電台。
```

In order: age + gender, identity, `profile.personality`, then `voice.timbre` / `pitch` / `pace` /
`accent` / `emotion`, then `此刻` + the sample's `direction`. `params.speechAccent` is appended
only when `voice.accent` is empty — the drama-language wording wins. Quote marks are stripped,
because inside the parenthetical they would be read aloud.

**The parenthetical is obeyed, not spoken.** Measured on Seed Audio 1.0: the same 8-character line
ran 3.16 s bare and 3.50 s behind a ~100-character description — speaking that description would
have added some forty seconds. It came back slower and lower, as the description asked. So write
the voice fields richly: personality, rhythm, where the voice sits, what it does at the end of a
phrase. That detail is free and it is the only thing separating two characters of the same age.

The English `voice.prompt` stays as the static voice identity (≤ 400 characters, a parameter
string, **no quoted lines** — gated) for engines that take a description instead of a sample.

### `voice.videoDirection` — the clause every clip carries

One English clause, ≤ 160 characters, that goes **beside every line this character speaks in every
video prompt**:

```
slow and close-miked, low and chest-resonant with a light rasp, falling at the end of every phrase,
Taiwanese-accented Mandarin, restrained
```

It is `voice.prompt` compressed to what a video model can act on in one breath: pace, where the
voice sits, what it does at the end of a phrase, accent, default attitude. Without it a video model
reads every character the same way — evenly, brightly, like a newsreader — and the clip stops
matching the voice asset the same bible produced. Gated in stage 2 (present, English, ≤ 160 chars,
no names, no quoted lines) and again in stage 5: a segment prompt must carry the direction of every
character who speaks in it. For `wan`, the drama-language `timbre` / `pace` / `accent` / `emotion`
fields are used instead, since that prompt is Chinese.

## On WJI

Dataset per character in `character/`:

```bash
wji dataset new <character folder> "<name>" -t character -d "<oneLiner>"       # bind characters.C01.wji.datasetId
$SD render <project> character C01 > /tmp/C01.md
$SD prompt <project> voice C01 > /tmp/C01-voice.txt
wji fs set <id> --merge content=@/tmp/C01.md --merge image_prompt=@/tmp/C01-sheet.txt \
  --merge audio_prompt=@/tmp/C01-voice.txt --merge metadata.shortDrama=@/tmp/C01.json
```

`characters` canvas, one row per character (see `canvas-recipes.md` §1):

| Node | Model | Ratio | Prompt |
| --- | --- | --- | --- |
| headshot (image, generate) | GPT Image 2.5 Sunburst (or the best image model listed) | 1:1 | `image.prompt` + `clean front-facing portrait, plain background` |
| sheet (image, generate, `--from` headshot) | same | 16:9 | `@image1 is the face to match exactly. ` + `image.sheet` |
| **voice (audio, generate, `--from` headshot)** | **`seed-audio-1.0`** | — | `prompt voice C01` — `（direction）line` |

**The voice node references the headshot.** Seed Audio 1.0 does 参考图片配音: given the face it
invents a voice that fits it, which is why the headshot must be approved first. It takes exactly
one reference, so pass only the headshot node. About 3.6 credits a sample.

Generate headshots first (a set of headshots is a batch — quote the total), **look at them**
(download and open), then sheets and voices from the approved headshots. Check a sheet for: one
face across all views, three full bodies of equal height, no squashed figures, white background.
Regenerate rather than accept a sheet with two faces — every shot inherits it. Listen to the voice
before you attach it: the age and the weight of the voice should match the face.

Attach and bind:

```bash
wji fs set <datasetId> --add-images <headshotAsset> <sheetAsset> <voiceAsset> --icon <headshotAsset> --set primaryAudio=<voiceAsset>
$SD bind <project> characters.C01.wji.assets.headshot <headshotAsset>   # and sheet / voice, nodes.*
```

The voice lives in **three** places on the dataset, and all three matter: `images[]` (the asset
list takes audio too — the clip is then playable from the dataset card next to the headshot and
the sheet), `primaryAudio` (which one is *the* voice), and `content.audio_prompt` (the brief that
produced it, so it can be regenerated identically). `render character` puts the same brief, the
sample line and its acting direction into the readable 声线 section of `content.content`.

**The sample is a dry voice.** Seed Audio is an audio-scene generator — asked for a line it will
happily add a room, a score and a coffee machine — so the composed prompt ends its parenthetical
with `干声，无配乐无音效`. The same model makes the episode score over the edit (or the per-segment beds) in stage 5
(`prompt score` / `prompt audio`), where the room, the score and the coffee machine belong.

### What the voice asset is for

It is a **reference for later**, not a deliverable. Every ref-capable video model takes audio
references (`wan-3.0-ref` up to 5, ≤ 15 s total; `seedance-2.5-ref`; `minimax-h3-ref` up to 3), so
on an episode canvas the character's voice display node connects to the video node alongside the
sheets and becomes `@audio1…`, holding the timbre across clips the way the sheet holds the face.
Set `params.voiceSamples: false` only when no TTS model is enabled on the account — `manifest`
then stops asking for the node.

## Gates

`profile` · `bible` · `relationships` · `char-prompts` · `voice` · `distinct`. Missing assets are
reported by `manifest`, not by `validate` — a character without a voice model available is still
a valid character.
