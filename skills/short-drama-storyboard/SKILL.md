---
name: short-drama-storyboard
description: >-
  Produce Stage 5 storyboards (分镜) for an AI short drama (短剧 / 短劇) on WJI:
  segment splits sized to the video model, cuts with purpose / framing axes /
  start-end boundaries / motion / light / foreground, the segment prompt with
  @imageN / @audioN / @videoN references, the episode canvas and the clip
  generation plan. Use when cutting or prompting video segments, planning an
  episode canvas or fixing storyboard gates — not for the outline, full dialogue
  script or sound cues.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core
  stage: storyboard
---

# Stage 5 — Storyboard (per episode)

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there.

Read `reference/stage-storyboard.md`, `reference/craft-shots.md`, `reference/craft-motion.md`
and `../short-drama-core/reference/canvas-recipes.md` before the first storyboard — plus the
cinematography preset's guide (`../short-drama-core/reference/cinematography-<preset>.md`) and
`../short-drama-core/reference/grammar.md` with the guide of every grammar this episode uses.

## Craft reminders

- **Every cut is lit and composed in the preset's look** (`params.cinematography`). Name the
  source in `light.source`, stage the person against it, and choose the camera side that gives the
  preset's preferred direction (the table in
  `../short-drama-core/reference/cinematography.md`). Compose as the guide says and stay within the preset's stop (T2.8; T2 for `sweet-romance` and `costume-idol`,
  which start on a T1.3 package and name their bokeh; T4 for `period-nostalgia`). Both costume
  presets also need a 全景 / 大全景 with negative space in every segment. For `sweet-romance` and
  `costume-idol`, shoot the 甜宠 set pieces (心动对视, 回眸, 共伞…) as
  `../short-drama-core/reference/cinematography-sweet-romance.md` §6 lays out.
- **Each segment is cut in its grammar.** Set `grammar` on a segment whose kind differs from the
  drama's default (`"action"`, `"faceslap"`, `"comedy"`, `"drama"`, or several:
  `["action", "comedy"]`) and read the guide of each grammar used before cutting it:
  `action` (`action.md`, `action-<style>.md`) breaks the fight into moves (拆招) — one move per cut
  (`move: { kind, impact }`), open on a wide, a reaction or consequence after every impact;
  `faceslap` (`grammar-faceslap.md`) is pressure, the calm, the entrance, **the proof on screen**,
  **a cascade of at least two reactions** — the 爽点 of a 打脸 / 身份揭露 / 智商碾压 / 复仇 episode is
  cut this way; `comedy` (`grammar-comedy.md`) needs **a setup before every punchline** (`gag`) and
  **laugh room after it**, in the comedy style's rhythm. The bold rules are gated. Waive one for a
  segment (`exceptions: [{ rule, reason }]`) only when the user asks, never to turn a gate green.
  `$SD prompt <project> segment` writes each grammar's line (`Action:` / `Payoff:` / `Comedy:`).
  No film, franchise or performer names in any prompt (gated).
- With `params.composition: art-first` every cut names its devices (`composition: [...]`); a
  segment may override it back to `standard` for a chaotic fight
  (`../short-drama-core/reference/composition-art-first.md`).
- Every cut is a set-up: besides its beats and framing it carries the **lens** (`focal`, or let
  the shot size pick it), the **key light relative to the camera** (`light.direction` +
  `light.note`), the **foreground** if the story gives one a reason (how often is
  `params.foregroundLevel`: `low` / `medium` / `high`), its `purpose` (kind + what changes),
  the three framing axes (`angle`, `height`, `axisSide` against the segment's `axis`), its
  `start` / `end` boundaries (positions, facing, gaze, hands, held props per person — the next
  cut begins where these end), `motion` (cue → one visible action → landing) and `cameraNote`
  (a lock-off says what still moves; a move says why and where it ends). The segment carries
  `axis` and `sound`; the 爽点 / cliff scenes a `visualPlan`.
- **Cross-scene boundary** (gate `boundary-contrast`): the last cuts of one scene must not
  repeat the size + angle + characters of the first cuts of the next; write a deliberate one
  with `note: match-cut`. The episode-level version is advisory.
- **Everyone on screen is alive** (gate `idle-motion`, sheets mode): a model freezes whoever the prompt gives no
  motion. In a cut with two or more visible people, all but the one carrying the action get a small
  motion in `idle` (`"still"` when keeping still is the performance). See `craft-motion.md`.
- **Two people talking** (gate `two-person-framing`, sheets mode): a two-shot once, then
  over-the-shoulder (`ots`) for the exchange, a clean single for the punchline. A single names only
  its person; every look states a screen direction (`eyeline`); the sides stay locked. See
  `craft-shots.md`.
- **Prompts are delivery text**: no ids, files or notes, subtitles off, the other person's lips
  closed while one speaks (H3), everyone bound by `@imageK` in their own shot.
- **Every picture says what it is, and what NOT to copy from it** (gate `ref-binding`). The model
  reads one string: a legend line that only says "a character sheet" for two different people is
  how faces get swapped, and a shot that never names its `@imageK` is a shot where the model
  invents the face or the prop. So: one legend line per picture, naming the person by age / hair /
  clothes from the character bible (a room by its name, a prop by its name); every non-person
  picture says *take only its light ratios, never its composition or its people*; the room is
  named once for the whole segment; every prop in shot is bound by its label in that shot. Details
  and the wording patterns: `reference/reference-binding.md`.
- **Everything the node references is addressed by its label, everywhere it applies.** WJI
  numbers connected references per type from 1: `@image1…` sheets or keyframes, `@video1…` the
  previous clip when `params.videoReferences: previous` is on, `@audio1…` the voice samples of
  whoever speaks. Every line a character speaks names their `@audioN` at that line. `$SD prompt
  <project> segment E0N-01` prints the references in the exact order the node must be connected:
  pictures, then clips, then voices.
- **`refOverride`**: a segment may pin its own image reference list (`{entity, asset, faceOf}`)
  when the derived set is wrong — `faceOf` says whose face a headshot supplies so the prompt
  binds that character to it instead of a body sheet.
- Default **sheets** mode: no storyboard stills. Never switch a project to `keyframes` unless
  the user asks.

## Steps

1. `$SD seed <project> storyboard --ep N` adds `storyboard.plan` (segment count and lengths
   from the chosen model's duration range — **follow it**), `seedScenes` and `visualPlans` (fill
   the 爽点 and cliff worksheets before cutting them). Cut into **segments** (one scene each,
   whole seconds inside the model range) of **cuts** (2–5 s, claiming consecutive beats). Fill
   the segment `prompt` from `prompt segment`. Delete `seedScenes` and `plan` when done.
   `$SD validate <project> --stage storyboard --ep N`.
2. Sync: shot folder `shot/E0N`, one `shot` dataset per segment (`video_prompt` = the prompt,
   content = `$SD render <project> segment E0N-01`). Before an image is generated from a prompt
   that was written or edited by hand (or copied from a production run), proofread its reference
   binding: `$SD validate` runs the gate, and for text that is not yet in the project file
   `node reference/prompt-audit.mjs` (shipped alongside this skill) reports per-shot unbound
   people and props, indistinguishable legend lines and unused pictures.
3. `E0N` canvas (`wji canvas create E0N`): display nodes for every sheet the episode uses plus
   the voice nodes of whoever speaks; one video node per segment `--from` those nodes **in legend
   order** (the order is the numbering — a reconnect redoes the whole set), the mode's model,
   `--resolution params.videoResolution`, `--prompt-file`, and `-d` = Σ cut seconds only in
   `fixed` duration mode.
4. The **Operator** generates segment by segment after the Producer relays the cost approval;
   download and check the first clip against the sheets (same world, same faces, right size,
   nobody extra) before the rest. Stay under the queue cap. A `wan-3.0-ref` rejection from
   DashScope's content filter (`DataInspectionFailed`) charges nothing and is partly random —
   retry the same node 8–12 times, then **shorten** the prompt.
5. **No BGM in the clips.** With `params.audioTrack: post` (the default) a clip carries dialogue,
   ambience and in-picture sfx only — music and sound design (stingers, risers, whooshes) cannot
   carry across separately generated segments. Still write `segment.sound.music` (intent + cues) and
   mark sound-design hits `post: true`: they are the spotting notes the Sound Designer scores from.
6. After each clip: `wji fs set <shot dataset> --set primaryVideo=<clip>` (in `bed` / `full` also
   `--add-images <track>`); bind asset ids.
7. When every clip is in: the Operator cuts the episode to picture lock as in
   `../short-drama-core/reference/edit-tools.md` — FilmCraft (`filmcraft-cli`), timeline kept at
   `edits/E0N.fcproj`, or ffmpeg when that CLI is not installed. Then hand the locked export to
   the Sound Designer (`../short-drama-sound/SKILL.md`) with `$SD prompt <project> score E0N` for
   the score and sound design on the edit's timecode. `$SD manifest <project> --ep N` (edit → mix)
   must be clean before the episode is done.

## Hand-off

The Director designs; the **Operator** runs `wji canvas` / `gen`. Escalate story problems to
the Screenwriter through the Producer; never rewrite the outline or the script here.
