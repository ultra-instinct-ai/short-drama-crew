# Stage 5 — Storyboard

The first layer that faces the video model. Cuts are nearly free, so **the only hard ceiling is one
generation's length — and that belongs to the model, not to the story.** A segment is one video
generation, so it can only be as long as the provider accepts:

| `params.video` | model | one segment | refs | auto duration |
| --- | --- | --- | --- | --- |
| `h3` | `minimax-h3-ref` | 5–15 s | 9 | ✗ — always `fixed` |
| `seedance` | `seedance-2.5-ref` | 4–30 s | 30 | ✓ |
| `seedance2` | `seedance-2.0-ref` | 4–15 s | 9 | ✓ |
| `seedance2fast` | `seedance-2.0-fast-ref` | 4–15 s | 9 | ✓ |
| `wan` | `wan-3.0-ref` | 2–30 s | 10 | ✓ |

All five take **whole seconds only**. So decide the model first: the same 90-second episode is
seven segments on a 15-second model and three on a 30-second one, and a storyboard written for one
does not transfer to the other. `min`/`maxSegmentSeconds` follow `params.video` on their own — set
them by hand only to go *narrower*, never wider than the model.

**Cuts claim beats**: every beat of every scene is claimed by exactly one cut, in order — change
the script and `validate` names the cuts that broke.

## Start from the seed

```bash
$SD seed <project> storyboard --ep 1
```

Three worksheets, all deleted once the segments are written:

- **`storyboard.plan`** — the split this model forces. Per scene: its seconds, how many segments it
  needs (`⌈seconds ÷ max⌉`, the fewest the model allows) and how long each should be, with a `note`
  on any scene too short for the model's floor. Follow it. It is arithmetic, not taste, and it is
  the step people skip — writing 30-second beats and then discovering the model tops out at 15.
- **`storyboard.seedScenes`** — every beat with its computed seconds and speaker, plus an
  `axisHint` naming the pairs that need a declared axis.
- **`storyboard.visualPlans`** — one worksheet per key scene (the 爽点 scene and the cliff scene):
  戏剧转向 / 观众立场 / 空间压力 / 视觉推进 / 摄影节奏 / 反应落点 / 声音策略. Fill it before cutting the
  scene (gate `visual-plan`); ordinary scenes get none.

## Segment, then cut

1. **Segment = one generation**: inside the model's range, never crosses a scene (new scene → new
   segment), and a whole number of seconds when `videoDuration: fixed`. Group beats by dramatic
   unit (one exchange, one entrance, one exit) and let `plan` tell you how many runs the scene
   needs — a 15 s model wants 9–15 s runs, a 30 s model can hold a whole exchange in one.
2. **Cut = 2–5 s**, aim at 3. A segment holds 3–5 cuts. The dialogue of the beats a cut claims
   must fit in its seconds (`chars ÷ 4.5`) — a 4.4 s line gets a 5 s cut, or two cuts.
3. **`frame` per cut** — the shot's description inside the segment prompt (by default no image
   is generated from it; only with `references: keyframes` does it also become the keyframe image's
   prompt): an English prompt for that moment — composition, this
   moment's positions and poses (already on the boat / still on the pier — the model trusts the
   picture over the text), the size phrase (`wide shot`, `close-up`…), the style's
   `framePhrase` (`photorealistic cinematic film still` / `cinematic film still` /
   `hand-painted anime film still`), `params.ratio`. No names: identity
   comes from the sheet references.
4. `camera` from the H3 vocabulary (`Static Shot`, `Push In`, `Tracking Shot`, `Pan Left`…);
   `characters` / `props` ⊆ the scene's; > 3 people on screen needs a `note` (staging).

## Shot language — purpose, axes, boundaries, motion, sound

The method is in `craft-shots.md` and `craft-motion.md`; the fields below are what the gates
check, in **both** reference modes — in `keyframes` the frame becomes an image, in `sheets` it is
the shot's description, and either way `prompt segment` composes frame + motion + camera + sound
into the prompt.

- **`purpose { kind, change }`** (gate `shot-purpose`) — why this cut exists (`establish / reveal /
  evidence / reaction / pressure / decision / consequence / performance / transition`) and what
  the audience knows or who holds power when it ends. Adjacent cuts differ in size, angle or
  people. A cut on a script `turn` beat or the 爽点 is reveal-class or is followed by a `reaction`
  on someone who did not speak it; the cliff cut is `reveal / consequence / reaction / pressure`.
- **`angle`, `height`, `axisSide`** (gate `framing-axis`) — three fields, not one: `front /
  three-quarter / profile / rear-three-quarter / back`, `ground / low / eye / high / top`,
  `working / cross / neutral` (`cross` with a `note`). A segment with two or more people declares
  **`axis { between, workingSide, screenLeft, screenRight }`**; consecutive singles on the two axis
  people face opposite screen directions.
- **`start` (first cut only) and `end`** (gate `continuity`) — `positions / facing / gaze / hands /
  heldProps / state` for every person on screen, in screen terms (bare left / right is the
  screen's). Later cuts begin where the previous ended; the next segment of the same scene begins
  where this one ended. A prop changes hands only on an action beat. The `frame` is the start
  instant: no end-only state in it, no sequence words.
- **`motion { trigger, action, result }`** and **`cameraNote`** (gate `motion`) — the one visible
  state chain from cue to landing (or `hold`), common actions only, no names, no inferred inner
  states, ≤ 3 hand verbs. A `Static Shot` writes `hold` (what still moves); any move writes
  `motivation` + `endFraming` (and `trigger`, `path`).
- **`background`** — the third depth layer; on 9:16 a wide without it (or a `note`) is flagged by
  `storyboard-advice`, as are size jumps of more than two steps, a segment that only tightens,
  frames over `maxFrameChars` and negative-form actions.
- **`segment.sound { ambience, sfx: [{cut, event}], music }`** (gate `sound`) — the same
  `ambience` string on every segment of a scene, sfx pinned to cuts, `music` `N/A` or its intent.
- **Prompt hygiene** (gate `prompt-hygiene`) — no `…` left from the skeleton, no ids / file names /
  notes, the subtitles-off sentence in the prompt's language unless `params.subtitles`, on H3 the
  other person on screen during a line has `lips remain completely closed`, `<d>` holds only the
  line, and in sheets mode every person on screen is bound by `@imageK` inside their own shot.
- **`params.speechLeadSeconds`** (0.5) is added to the dialogue-fit check: a 4.0 s line needs a
  5 s cut.
- A prop may carry **`textPolicy { mode: readable | symbolic | blank, text }`** (gate
  `text-policy`): readable text is verbatim in every frame and prompt that shows the prop and is
  never overridden by "no text".

`render segment` prints one `### SHOT k` block per cut (职责 · 来源 · 时长 · 起点 · 唯一动作 · 终点 ·
摄影机 · 光与前景 · 声音 · 视觉依据) — the reference 分镜 shape, published as the shot dataset's content.

## Shoot it like a shoot — lens, light, foreground

Three things a real crew decides per set-up and a prompt usually forgets. All three are gated
(`photography`), and `prompt segment` writes them into the shot lines for you.

### Lens and stop

`params.camera` is the production's package — one body, one lens family, one working stop:

```json
"camera": { "body": "ARRI ALEXA Mini LF", "lens": "Zeiss Supreme Prime", "aperture": "T1.5" }
```

Per cut, `focal` is the focal length and `aperture` an optional override. Leave `focal` out and the
shot size decides it, the way a crew would: `extreme-wide` 18mm, `wide` 25mm, `medium` 40mm,
`close` 75mm, `extreme-close` 100mm macro. Every `frame` must then carry the phrase verbatim:

```
shot on an ARRI ALEXA Mini LF with a Zeiss Supreme Prime 75mm at T1.5
```

Naming a real body and a real lens is not decoration: it is the shorthand these models were trained
on, and it pins sensor size, rendering and — through the stop — how much of the frame is sharp. One
package across the whole drama is also what makes two shots look like the same production. The stop
lives here rather than in `lookPhrase` because it is what buys the shallow focus the foreground
depends on; override it on a cut that genuinely needs depth (`"aperture": "T5.6"` for a wide the
audience has to read).

### Key light, relative to the camera

The same lamp is a key from one side of the axis and a rim from the other, so the direction belongs
to the **shot**, not to the room:

```json
"light": { "direction": "back-left",
           "note": "the ON AIR box rims her left shoulder while the desk lamp fills the other side; as the lens pushes in the red creeps further onto her cheek" }
```

`direction` is one of `frontal` `front-left` `front-right` `side-left` `side-right` `back-left`
`back-right` `backlight` `top` `underlight` `ambient`, each of which expands to a phrase the frame
must carry (`rim-lit from behind camera left`). `note` is the part that costs thought: what the key
picks out, what fills the shadow side, and **how it changes over the cut** — a push in that takes
the fill away, a pan that carries the face out of one source into another, a turn that trades a
front key for a rim. A cut where the light does nothing is a cut where the light was not directed.

Under a `params.cinematography` preset the light also has a `source`: the lamp, window, sun or
string lights, candle or lattice window it comes from, named verbatim in the frame. A person is never keyed from the
preset's banned directions (e.g. `low-key` / `costume-dark`: `frontal` / `ambient`;
`sweet-romance` / `costume-idol`: `underlight` / `top`), at least half the cuts with people in a
segment use its preferred ones, the stop stays within the preset's limit, and a period or costume
preset refuses a source its era did not have. Stage the person against the source first, then pick the camera side; the
tables are in `../../short-drama-core/reference/cinematography.md` and the preset's guide.

**Each segment is cut in its grammar** (`segment.grammar`, else `params.grammar`; see
`../../short-drama-core/reference/grammar.md`): `action` segments open on a wide, take one move per cut and answer every impact
(`../../short-drama-core/reference/action.md`); `faceslap` segments show the proof and a cascade of reactions
(`../../short-drama-core/reference/grammar-faceslap.md`); `comedy` segments set up every punchline and give it laugh room
(`../../short-drama-core/reference/grammar-comedy.md`). Each grammar adds its line to the prompt (`Action:` / `Payoff:` /
`Comedy:`).

### Foreground

`foreground` names what sits between the lens and the subject — a console edge, a curtain of rain
off an awning, a blurred shoulder, a doorframe — and the frame prompt says it is thrown out of focus.
`""` is a deliberately clean frame.

**How often** is `params.foregroundLevel`, gated across the episode so scenes can differ:

| Level | Cuts with a foreground | Use |
|---|---|---|
| `low` | up to 25 % | clean, direct, face-led; only where the story asks for one |
| `medium` (default) | 25–50 % | where the story or the shot type gives a reason |
| `high` (default for 唯美 / 美感优先) | 50 % or more | a layered, voyeuristic or crowded look; soft, composed beauty |

唯美 / 美感优先 means `composition: art-first`, `cinematography: sweet-romance` or `costume-idol`, or a genre
that says 唯美 or 美感. Naming `foregroundLevel` overrides this.

**Which cuts** — story first, then shot type, then shot size. Remove it in your head: if the audience
loses no meaning, shoot the cut clean.

1. **Story decides whether.** Threat (the barrel in front of him), watching or hiding (a doorframe, a
   curtain), trapped or outnumbered (bodies closing in), distance between two people, power (the
   powerful one's shoulder or weapon), closeness (her hair, soft), a clue that matters later.
2. **Shot type decides what.** Over-the-shoulder always has one (the listener's shoulder); POV has what
   they look past; an establishing shot has a layer of the place. Usually clean: a reaction close-up, an
   insert, the 打脸 proof or reveal, an action impact, a moment of isolation.
3. **Shot size decides how much.** A wide can take a large shape on one edge; a medium one edge; a close
   a soft sliver, never near the eyes or mouth; an extreme close-up almost never.

Take it from the scene: it must already be there and on the camera's side of the action. Keep it off
the face, the mouth, the key prop and the action. Prefer simple still shapes (edges, frames, shoulders)
over foreground faces and hands, which can read as an extra person. Do not repeat one object across
cuts unless it is a story motif. At `high`, keep the same reasons and simply use them more.

Directing feel (not gated): reverse angles for dialogue (asker's close-up, answerer's close-up);
the first cut of an episode moves; a key action gets its own 2 s insert; a reaction shot after a
heavy line is free drama; cut on motion; the last cut of a segment leaves a hook; static is the
default and more than two camera moves per segment is showing off.

## The video prompt (`prompt`)

Get the skeleton:

```bash
$SD prompt <project> segment E01-01
```

It prints the parts that are derived and gated verbatim — the alignment line, `[Shot k] At
mm:ss.mmm,` stamps, `<d>[Chinese] …</d>` dialogue, camera words, the lens phrase, the light
direction and each speaker's delivery — and now the parts composed from the shot language: per
shot the frame, `Cue: … Action: … End: …` from `motion`, the camera clause from `cameraNote`
(`The camera holds; …` / `Push In (reveal), as his eyes drop: …, ending on …`), on H3 the
`while <other> does not speak, lips remain completely closed` clause on every line, and per
segment the sound block from `segment.sound` with the accent and the subtitles-off sentence —
plus the reference plan. Fill in the descriptions; do not touch the derived tokens. **Change a
cut's seconds and the prompt is stale** — re-run `prompt`, re-paste.

### References are always `@image1` / `@video1` / `@audio1`

Whatever the model, a reference is addressed the way WJI labels it on the canvas: connected
references are numbered **per type**, in connection order — `@image1 @image2 …` for pictures,
`@video1 …` for clips, `@audio1 …` for the character voices. That is what the edge labels show
(the frontend's `referenceOrder.ts`), so the prompt and the canvas read the same, and the order the
nodes were connected in *is* the numbering — reconnect one and the whole legend shifts. The two
series are independent: a voice connected after three sheets is `@audio1`, not `@image4`.

**A label is used wherever it applies, not once in a legend.** `prompt segment` lists every
reference the node carries, and the rule is that each one is then referred to by its label
everywhere it is relevant:

| Reference | Legend line | Used again in |
| --- | --- | --- |
| `@imageN` keyframe | the alignment line, which pins it to a shot | **that shot's paragraph**, which anchors on it — gated |
| `@imageN` sheet | what it is and what to match | wherever that thing appears; every one must be mentioned |
| `@videoN` previous clip | what to carry over from it | the continuity sentence — gated when connected |
| `@audioN` voice | whose voice it is (by `@imageK` in sheets mode, else by their identity) | **every line that character speaks** — gated per line |

`segmentReferences` builds the list in connection order: environment sheet, lighting state, one
sheet per person, one per prop (or the keyframes, in `keyframes` mode) — then the **previous clip**
if `params.videoReferences: previous` — then one **voice** per character who *speaks in that
segment*, in speaking order. Each series numbers from 1 independently.

### `@videoN` — continuity between clips

A segment is one generation, and a ten-segment episode is ten of them. Sheets hold the faces and
the space, but not the grade, the way someone walks, or how fast the camera drifts — which is why
separate clips of one scene can look like separate productions. `params.videoReferences: previous`
hands each segment the clip before it as `@video1`:

```
@video1 is the clip immediately before this one — continue its look, wardrobe, lighting and camera
language, and pick up where it left off; do not repeat its action.
```

It is **opt-in** (`none` by default) because it changes every clip after the first and chains them:
regenerate segment 2 and segments 3+ now reference a clip that no longer exists on screen. Turn it
on for a scene that has to feel continuous; leave it off for an episode that cuts between places.

Caps, from the model forms: **3** reference videos on `minimax-h3-ref` and the Seedance 2.0 pair,
**5** on `wan-3.0-ref`, **10** on `seedance-2.5-ref`; and a reference video may itself run at most
**15 s** (30 s on `seedance-2.5-ref`) — so a 30-second `wan` segment cannot be fed to the next one,
which the `timing` gate reports rather than letting the provider refuse it.

On the canvas the previous segment's **video node** is connected directly — it already holds the
clip, so there is no display node to make. It means segment k cannot be built until k−1 has
generated, which is the order `manifest` prints anyway.

### Dialogue points at the voice

The character's voice sample from stage 2 is connected to the video node, so every line they speak
is attributed to it — `@audioN` — and carries their `voice.videoDirection`. The label says *which
voice to read in*; the direction says *how*:

```
@audio1 is the voice of the person in @image2 — speak their lines in it, matching its timbre,
pitch, pace and accent.
…
@audio1 / @image2, slow and close-miked, low and chest-resonant with a light rasp, falling at the end
of every phrase, Taiwanese-accented Mandarin, restrained, says <d>[Chinese] 凌晨兩點，這裡是海風電台。</d>
```

The **full** voice description is spelled out on that character's *first* line in the segment; after
that the `@audioN` label carries it and only the beat's own delivery is added. The beat's `delivery`
is script prose in the drama's language, so it goes into a `wan` prompt as written and is **left out
of an English one** — write the English acting note yourself if the line needs one
(`@audio1 / @image2, the voice catching on the last three words, says: …`). Repeating sixty
characters of timbre on every line buys nothing, and on `wan` it feeds the content filter, which
judges by length.

Three things are gated, and the third is the one people get wrong:

1. every speaking character's `voice.videoDirection` appears verbatim (the drama-language voice
   fields instead, for `wan`);
2. every connected `@audioN` is mentioned, and no `@audioN` above the number connected;
3. **every single line** names its voice reference within the sentence or two before it — not just
   once in the legend. A model picks a voice per line; a line with no label attached gets read in
   whatever the model feels like, which is exactly the drift the voice sample exists to stop.

Never the speaker's **name** — the name gate rejects it. Use `@audioN`, the `@imageK` sheet label,
or `identityEn`.

Voices are audio references and have their own, much smaller cap: **3** on `minimax-h3-ref` and the
Seedance 2.0 pair, **5** on `wan-3.0-ref`, **10** on `seedance-2.5-ref`. More speakers than that in
one segment is a gate failure — split the segment. `params.maxAudioRefs` tightens it further;
`params.voiceSamples: false` removes the voice references altogether.

**H3 mode** (`params.video: h3`, model `minimax-h3-ref`): alignment line first, then
`integrated_multimodal_description:` with one `[Shot k]` paragraph per cut (anchor on `@imagek`,
then action, camera word, dialogue in `<d>`; the speaker's identity, age and voice in English
outside `<d>`; voice-over as `says in an off-screen voiceover while their lips remain completely
closed`), then `overall_soundscape:` (ambient and action sounds — the soundscape is an action
instruction: change the picture, change the sound), then `non_diegetic_music:` (or `N/A`).

**Seedance modes** (`seedance` → `seedance-2.5-ref`, `seedance2` → `seedance-2.0-ref`,
`seedance2fast` → `seedance-2.0-fast-ref`): one prompt dialect for all three — follow the `sd25-pe`
skill's templates. The anchors are verbatim: `Use @image1 through @imageN as keyframes in that
order.`, `Use @image1 as the first frame.`, `Use @imageN as the last frame.`, then one sentence per
keyframe state, the event script, the dialogue verbatim, continuity. Only `@image1…N` may be
referenced. What differs is the size of the box: 2.5 takes 30 s and 30 references, the 2.0 pair
15 s and 9 — which is the whole reason to plan the split per model. The 2–5 s cut band applies to
all of them. `seedance2fast` is the cheap draft of the same shot; it tops out at `720p`.

**Wan mode** (`params.video: wan`, model `wan-3.0-ref`) — an Alibaba model, so the prompt is
**Chinese**, the reference images are addressed as 图1…图10, and the model generates the
**audio with the picture**. What that changes:

- The first line is the derived legend (参考图说明：图1=镜头1关键帧；…), then one derived header per
  cut: `镜头k（start–end秒，size，camera）：` with Chinese size and camera words. Both are gated
  verbatim — take them from `prompt segment`, never retype them.
- **Speakers are named by picture, never by name**: `台词（图2中的少年，低头）：「…」`. Off-screen
  lines are `台词（画外…）`.
- The last line is `音频：` and must name `params.speechAccent` verbatim (e.g. 台湾口音国语)
  together with the ambient sound. There is **no separate voice stage** in this mode: the accent,
  the delivery and the room tone all come from this one line.
- Write the shot descriptions in 简体 (the model's native register) and keep the dialogue in the
  drama's own script — the gate only demands the line verbatim.
- **Whole seconds**: the segment total must be an integer, because `-d` is an integer and
  `autoDuration` is switched off by passing it. At most **10** keyframes per segment.
- Duration times `params.videoResolution` is the price: 480P is a quarter the rate of 1080P, and
  480P at 9:16 is enough for a phone-first short drama.

**Wan's content filter rejects benign prompts.** `wan-3.0-ref` runs the prompt through DashScope's
green-net before generating:

```
✗ Generation failed: DataInspectionFailed: Green net check failed for text (input):
  Input data may contain inappropriate content.
```

A rejection happens **before** generation and **costs nothing**. What it actually does, measured on
an ordinary drama (four 15-second segments):

- It is **partly random**: one short string passed once and was rejected twice in three consecutive
  submissions; one segment passed only on attempt 5. So **retry 8–12 times first** — it is free.
- It is **not only random**: two segments were rejected **24/24** across two rounds, while the same
  prompts' legend, every `镜头k` block, the `整体` line and the `音频` line each **passed on their own**.
  The verdict is on the assembled prompt, not on any phrase in it.
- **The dialogue is never the problem.** Dialogue-only text passed; the same segment with the
  `台词` lines stripped was still rejected.
- **What fixed it: making the prompt shorter.** Drop the `整体` paragraph, cut each `镜头k` block to
  one terse sentence of action, and keep `音频` to one clause. Both stuck segments then passed on
  attempts 1 and 2. Rewriting *content* (removing stillness, facial detail, breathing) changed
  nothing — only length did.

So: keep Wan segment prompts lean from the start (roughly 300 characters, one line per shot). If a
segment is rejected, retry, then trim — do not go hunting for a forbidden word.

To bisect anyway, use a scratch video node at `-d 2`, 480P: free when rejected, ~30 credits when it
passes, and sample each fragment several times because one pass proves nothing.

## Sheets mode — no storyboard images (the default)

`params.references: sheets` drops stage 5's image generation entirely: the video node references
the scene sheet, each character sheet and each prop sheet the segment uses (`prompt segment`
prints the order), and the prompt carries one `Shot k (start–end s, size, camera)` line per cut
built from the cut's `frame`. **This is the default**, because a storyboard image is a second
generation per cut to pay for, wait for and approve, and the sheets already hold the faces, the
space and the props — which is what continuity actually depends on. It works in any mode (`h3`
then takes an `Image k is …` legend instead of the alignment line).

Switch to `references: keyframes` when a shot needs a composition the model would not invent — a
specific blocking, a prop in a specific place, an exact eyeline — or when a first pass drifts and
you want to pin each moment. Cuts exist either way and are gated either way: they are the timing
plan and the shot list, they just do not become images.

With `videoDuration: auto` (also the default) the node gets no `-d`; write the planned timing into
the shot lines and let the model match it (the Seedance models quote the cost for 5 s and bill the
real length). `minimax-h3-ref` has no auto duration, so h3 always sends `-d` = Σ cut seconds and
the cuts must sum to a whole number.

**Seedance and photoreal people.** By default the Seedance ref models (BytePlus) reject any reference
image its real-person check flags — with `style: photoreal` that is every character sheet and
every keyframe with a face, deterministically (HTTP 400, `input image 'content[k]' may contain
real person`; `content[0]` is the prompt, so `k` counts the references from 1). Environment and
prop sheets pass. The account can have the **real-person permission** enabled on the provider
side, after which the same sheets are accepted. So for seedance + photoreal the `params` gate
demands an explicit `humanReferences`: `false` (no permission — reference only scene and prop
sheets, put the people in a `Cast:` line of the prompt; the face will drift between clips) or
`true` (permission enabled — the character sheets are referenced and the identity holds).

A look that must hold across every clip — lens, depth of field, foreground blur — goes in
`params.lookPhrase`, which every segment prompt must carry verbatim.

## Keyframes — only with `params.references: keyframes`

Not the default. Read this section only when the user has chosen keyframes for a project.

Each keyframe is an image node whose references are the **sheet display nodes** on the episode
canvas, in the order the reference plan prints (environment first, then each person, then props),
with the plan's prefix in front of the frame prompt (`@image1 is the environment …; @image2 is the
character sheet of one person in this frame …`). Never reference a dataset node — `canvas gen`
refuses it; reference the image display node that shows the sheet asset.

Chain references when a face still drifts: use the best generated keyframe of that character as an
extra `--from` on the later keyframes (`the SAME face and clothes as @imageN`). Anything large
that enters the frame (a boat, a car, a gate) needs its own sheet reference or it is reinvented
every frame.

**First segment first.** Generate its keyframes, download them, check against the sheets (same
world, same faces, right size, nobody extra), fix, then continue. An episode is 30–40 keyframes;
a wrong direction costs the whole batch — which is why this is opt-in and the default references
the sheets directly.

## Soundtrack — scored over the edit, not per clip

Each segment is a separate generation, so music and sound design made inside a clip stop at its
last frame: a cue cannot swell across a cut into the next segment, and every clip invents its own
score. So by default (`params.audioTrack: post`) **the clips carry no music**: the video prompt
says `No music.` (H3 `non_diegetic_music: N/A`, Wan `无配乐`), keeps the dialogue, the ambience and
the in-picture sfx, and drops every sfx marked `post: true` (stingers, risers, whooshes, impact
hits — sound design outside the story world). The storyboard still writes `sound.music` (intent and
cues) and the `post: true` hits: they are the **spotting notes**. When every clip is in, the Operator
cuts the episode as in `../../short-drama-core/reference/edit-tools.md` (FilmCraft, or ffmpeg if
`filmcraft-cli` is missing; the `.fcproj` stays in the project), and the Sound Designer scores that
locked picture as one piece on its timecode:

```bash
$SD prompt <project> score E01            # planned spotting sheet: SMPTE rows + ≤120 s Seed Audio sections
```

The sheet lays the segments end to end — scene beds (BGE), every line (where the music ducks), each
segment's music cues at their episode time, the `post` sound design, the sfx already in the clips
(never doubled) and the hook / turns / 爽点 / cliff as the 起承转合 anchors. It is the *planned*
timeline: the Sound Designer conforms it to the edit's real cuts
(`../../short-drama-sound/reference/mix-over-video.md`) before any prompt is written. `manifest`
then asks for the episode's `wji.assets.edit` and `wji.assets.mix`.

### Per-segment soundtrack node (`audioTrack: bed` / `full`)

`seed-audio-1.0` (the voice-sample model of stage 2) generates a whole **audio scene** from one
prompt: speech, sound effects, ambience and music in one track, up to 120 s, and a
**`[start s:end s]` timecode in front of an element pins it to that interval** (100 ms
precision). In `bed` / `full` every segment gets a soundtrack node next to its video node and the
music goes into the clip prompt too; the prompt is derived — not written — from `segment.sound` and
the cut timing:

```bash
$SD prompt <project> audio E01-05            # bed (default)
$SD prompt <project> audio E01-02 --full     # + the lines, in the @AudioN voices
```

```
[0.0s:11.0s] Ambience, continuous: the low hum of the oden warmer under a faint fluorescent buzz.
[6.0s:9.0s] SFX: a single ring of the brass wind chimes, rain hammering the glass.
Music, instrumental: the low cello note.
[0.0s:6.0s] the music enters.
[6.0s:10.5s] the music swells — on the chime.
[10.5s:11.0s] the music falls silent — cuts off with the last line.
No dialogue, no vocals, no narration.
```

`params.audioTrack` decides what the node makes: **`bed`** — ambience + sfx + timed
music, no voices: the editor's music-and-effects track, and what the video model's same-pass sound
is checked against; **`full`** — the bed plus every line at its cut (start = cut start +
`speechLeadSeconds`, length from the reading rate), each read in the connected voice sample
(`--from` the voice display nodes in speaking order → `@Audio1..3`; Seed Audio takes at most 3, so a
segment with four speakers stays `bed`); **`none`** / **`post`** — no node. Music dynamics are
written as cues on `sound.music` in every mode:

```json
"music": { "intent": "the low cello note",
           "cues": [{ "at": 1, "do": "enter" }, { "at": 3, "do": "swell", "note": "on the chime" },
                    { "at": "10.5s", "do": "silence", "note": "cuts off with the last line" }] }
```

`at` is a cut number (its start) or seconds inside the segment; `do` ∈ `enter / swell / duck /
drop / silence / out`. Cues cut the timeline into timecoded states; a plain string is an intent
with no cues (music under everything), `N/A` is no music. Gated (`sound`, `audio-track`): cues
valid, ≤ 120 s, prompt ≤ 2048 characters, ≤ 3 voices in `full`. The rules for the bed are the
`craft-motion.md` §1.6 rules — ambience identical across a scene, sfx on their cut, music a
timeline decision — the node just makes them audible. `render segment` prints the prompt under
`## 音轨提示词`; `manifest` asks for `wji.nodes.track` / `wji.assets.track` per segment and the asset
is attached to the shot dataset with `--add-images`. A same-pass video clip and a Seed Audio bed of
the same segment are two takes of one design: keep the video's sound section and the bed reading
the same `segment.sound`, and lay the bed under the clip in the edit when the clip's own sound is
the weaker of the two.

## Video node

`--from` **in the exact order `prompt segment` lists under `references:`** — the pictures first
(sheet display nodes in sheets mode, keyframe nodes in cut order otherwise), then the **voice
display nodes** of everyone who speaks in the segment. The pictures become `@image1…N` and the
voices `@audio1…M`, numbered per type in connection order, which is why the order matters and why
`canvas connect` appending to the end can silently renumber a legend.

Then `-m` the mode's model (check `wji models get` for the exact nickname and its caps);
`-r params.ratio`; `-d` = Σ cut seconds **only in `videoDuration: fixed`**;
`--resolution params.videoResolution`; the prompt via `--prompt-file`. Cost it
(`wji canvas gen <node>` without `--yes`), ask, generate, poll. Then the shot dataset:
`--add-images <keyframes>`, `--set primaryVideo=<clip>`, `icon` = f1.

The voice display nodes are the same assets stage 2 attached to the character datasets
(`primaryAudio`), added to the episode canvas with `canvas add audio --asset <voiceAsset>` and
recorded in the episode's `wji.displayNodes` as `"C01:voice"`, exactly like the sheets.

## Sync and bind

```bash
wji fs mkdir <shot folder> E01                                                   # bind --ep 1 wji.shotFolderId
wji dataset new <shot/E01> "E01-01" -t shot -d "<scene · seconds>"               # bind --ep 1 storyboard.segments.E01-01.wji.datasetId
$SD render <project> segment E01-01 > /tmp/E01-01.md
wji fs set <id> --merge content=@/tmp/E01-01.md --merge viewMode=content --merge video_prompt=@/tmp/E01-01-prompt.txt
$SD bind <project> --ep 1 storyboard.segments.E01-01.wji.nodes.keyframes.0 <nodeId>
$SD manifest <project> --ep 1                 # must be clean before the episode is "done"
```

## Gates

`segments` · `timing` (durations, the speech lead-in **and** the reference caps) · `cut-content` ·
`photography` · `video-prompt` · `shot-purpose` · `boundary-contrast` · `framing-axis` · `continuity` · `motion` · `sound`
· `visual-plan` · `text-policy` · `prompt-hygiene` · `audio-track` · `boundary-contrast-episode` (advisory) · `storyboard-advice` (advisory).
