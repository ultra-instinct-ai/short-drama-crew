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
and `../short-drama-core/reference/canvas-recipes.md` before the first storyboard.

## Craft reminders

- Every cut is a set-up: besides its beats and framing it carries the **lens** (`focal`, or let
  the shot size pick it), the **key light relative to the camera** (`light.direction` +
  `light.note`), the **foreground** to throw out of focus, its `purpose` (kind + what changes),
  the three framing axes (`angle`, `height`, `axisSide` against the segment's `axis`), its
  `start` / `end` boundaries (positions, facing, gaze, hands, held props per person — the next
  cut begins where these end), `motion` (cue → one visible action → landing) and `cameraNote`
  (a lock-off says what still moves; a move says why and where it ends). The segment carries
  `axis` and `sound`; the 爽点 / cliff scenes a `visualPlan`.
- **Cross-scene boundary** (gate `boundary-contrast`): the last cuts of one scene must not
  repeat the size + angle + characters of the first cuts of the next; write a deliberate one
  with `note: match-cut`. The episode-level version is advisory.
- **Prompts are delivery text**: no ids, files or notes, subtitles off, the other person's lips
  closed while one speaks (H3), everyone bound by `@imageK` in their own shot.
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
   content = `$SD render <project> segment E0N-01`).
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
5. Soundtrack per segment: hand the `segment.sound` design to the Sound Designer
   (`../short-drama-sound/SKILL.md`); `$SD prompt <project> audio E0N-01` derives the Seed Audio
   prompt.
6. After each clip: `wji fs set <shot dataset> --add-images <track> --set primaryVideo=<clip>`;
   bind asset ids. `$SD manifest <project> --ep N` must be clean before the episode is done.

## Hand-off

The Director designs; the **Operator** runs `wji canvas` / `gen`. Escalate story problems to
the Screenwriter through the Producer; never rewrite the outline or the script here.
