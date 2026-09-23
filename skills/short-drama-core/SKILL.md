---
name: short-drama-core
description: >-
  Run the lifecycle of an AI short drama (短剧 / 短劇) project on WJI — init
  project.json, lock the params (episodes, minutes, genre, 语体/register, video
  mode, ratio, style, references), lay out the workspace, and drive
  validate / seed / render / prompt / manifest / bind through
  scripts/short-drama.mjs with the crew hand-offs (Producer gates, Operator runs
  wji, creatives draft). Use for project setup, stage status, sync rules, the
  Producer QA gates and crew coordination — not for the outline, script, art,
  storyboard or sound craft itself (those are the stage skills).
license: UNLICENSED
metadata:
  crew: short-drama-crew
  role: core
---

# Short drama — core (lifecycle)

Paths in this file are relative to this skill's folder. The engine, the schema and the fixture
live here; the stage skills (`../short-drama-outline/` …) point back to this folder. Shell
examples use `$SD` for the engine — set it once per session:

```bash
SD="node $PWD/skills/short-drama-core/scripts/short-drama.mjs"   # or the installed skill path
# Claude Code: SD="node $CLAUDE_SKILL_DIR/scripts/short-drama.mjs"; OpenClaw: {baseDir}/scripts/short-drama.mjs
```

Five stages plus sound, one project directory, one WJI workspace. The **model writes the design
fields**; the **script checks them** (`validate`), derives what it can (`seed`, `prompt`) and keeps
the local ↔ WJI bindings (`manifest`, `bind`). Nothing is generated until its stage is green.

```
outline ──▶ characters ──▶ art ──▶ script (per episode) ──▶ storyboard (per episode) ──▶ sound
   │            │            │           │                        │
 story/      character/   location/    story/                   shot/E01/  datasets
 dataset     datasets +   prop/        screenplay               + E01 canvas: sheets → video → track
             `characters` datasets +   dataset
             canvas       `scenes` + `props` canvases
```

Read `reference/schema.md` before writing any JSON and `reference/workspace-layout.md` before
touching WJI. Everything runs through the **`wji` CLI** — `reference/operations-cli.md` is the
binding of every operation the stage docs name, and the `wji` skill governs every call (auth,
confirmations, spending policy, model choice). This skill only says what to build.

**Re-read the guideline.** The 创作指引 (`render guideline`) is the drama's top rule document.
Print it before writing any character, any episode and any storyboard, and print the speakers'
`render character` before writing their lines — a script that drifts from the guideline is wrong
even when every gate is green. When the user changes a core requirement (genre, register, length,
ending), change the guideline first, then the episodes.

## Crew hand-offs

| Seat | Owns | Skill |
| --- | --- | --- |
| **Producer** | params, gates, assignments, the QA pull-fits, user-facing status | this one + `../short-drama/` |
| **Screenwriter** | outline, character bible (text), scripts, dialogue | `../short-drama-outline/`, `../short-drama-characters/`, `../short-drama-script/` |
| **Art Director** | scenes / props art; character sheet look once the text prompts exist | `../short-drama-art/`, `../short-drama-characters/` |
| **Director** | storyboard, shot language, video prompts, episode canvas plan | `../short-drama-storyboard/` |
| **Sound Designer** | voice / Seed Audio prompts, SFX, cut-timed BGM | `../short-drama-sound/` |
| **Operator** | **every** `wji` command: workspace, datasets, canvas, generation, download, bind | `../wji/` |
| **Proofreader** | independent audit after claimed changes; PASS / FAIL with file evidence | reads all of the above |

Rules:

- The Producer owns "which stage is green". Specialists do not skip ahead.
- Creatives draft JSON and prompts only. The **Operator** runs paid generation after the cost is
  approved (or the user said `-auto`). Specialists never call the Operator directly — the Producer
  relays the package and the approval.
- **Dialogue performance pull-fit** (every episode, every script re-lock): the Producer runs
  `reference/producer-dialogue-performance-qa.md` — for every spoken line, (1) the emotional
  context is established and (2) the delivery is specified. FAIL blocks script green and paid gen.
- **Continuity & blocking pull-fit** (every episode, every staging rewrite), in parallel with the
  one above: `reference/producer-continuity-blocking-qa.md` — position bridges, relative places,
  action chains, prop tracking, presence. **P0** blocks greening and burning; **P1** before burn.
- After a material change that could drift (language, voices, references, spend caps), the
  Producer asks the **Proofreader** before greenlighting paid generation.
- Stable ids (`C01`, `S01`, `P01`, `B01`, `E01-01`). Never renumber after a bind.
- Report one line per stage stop: counts, credits charged, unbound `manifest` items, gates fixed.

On a single-agent host the one model plays every seat in turn; the rules still hold — draft, then
validate, then quote, then generate.

## Before anything else

1. **Preflight WJI**: `wji auth whoami --json`, the version check from the `wji` skill,
   `wji profile wallet` (a drama is many generations — know the balance).
2. **Scan the message for `-auto`** (spending waiver, see the `wji` skill). Without it: one image
   runs, video and batches ask first.
3. **Ask the parameters once**, in one message: episodes × minutes per episode, genre, adapt
   mode (原创 / 忠实 / 抽核 / 借壳), the 语体 (`register`: 粤语 / 大陆普通话 / 台湾国语 / 港式普通话 /
   古装 / 年代 / 英文美式 / 英文英式 — it decides how the lines are written and the accent the video
   model speaks), ratio (default 9:16). Offer the defaults you will use unless told otherwise:
   `video: h3` (MiniMax H3 ref), `style: realistic`, **`references: sheets`** (no storyboard
   images) and **`videoDuration: auto`**. Do not start Stage 1 without the first two.

   **The video mode decides how the plot is cut up.** A segment is one video generation, so its
   length is whatever the provider accepts — and that differs by a factor of two:

   | `--video` | model | segment | images | voices | auto duration | prompt |
   | --- | --- | --- | --- | --- | --- | --- |
   | `h3` | `minimax-h3-ref` | **5–15 s** | 9 | 3 | ✗ — always `fixed` | English, keyframe-pinned |
   | `seedance` | `seedance-2.5-ref` | **4–30 s** | 30 | 10 | ✓ | English, `@imageN` |
   | `seedance2` | `seedance-2.0-ref` | **4–15 s** | 9 | 3 | ✓ | English, `@imageN` |
   | `seedance2fast` | `seedance-2.0-fast-ref` | **4–15 s** | 9 | 3 | ✓ | English, `@imageN` |
   | `wan` | `wan-3.0-ref` | **2–30 s** | 10 | 5 | ✓ | Chinese prose, **speaks the dialogue itself** |

   All five take **whole seconds only**, and each has its own resolution tiers (h3: 480P / 768P /
   2K / 4K — note there is no 720P; the Seedance pair is lowercase; wan: 480P / 720P / 1080P).
   `validate` checks the spelling against the model. Pick the mode **before** the storyboard: the
   same 90-second episode is 7 generations on a 15 s model and 3 on a 30 s one, and
   `seed storyboard` computes that split for you. With `wan`, set `speechAccent` (e.g.
   台湾口音国语) because the model speaks the lines.

   **Style**: `photoreal` for a live-action drama, `realistic` for semi-realistic painterly,
   `ghibli` for hand-painted anime. **References** (default `sheets`): the video node references
   the character / scene sheets directly and no storyboard images are generated — fewer images to
   pay for and approve, and continuity comes from the sheets. Every mode works this way, h3
   included (its sheets-mode prompt opens with an `@imageK is …` legend instead of the alignment
   line). Choose `keyframes` (one generated image per cut) only when the user asks for it or a shot
   has to be composed exactly — never switch a project to it on your own. **Duration** (default
   `auto`): the model matches the clip to the prompt; `fixed` sends `-d` = Σ cuts and is forced on
   models without an auto duration.

   **The camera package** is `params.camera` — body, lens family and working stop, default
   `ARRI ALEXA Mini LF` / `Zeiss Supreme Prime` / `T1.5`. Every shot prompt names it verbatim, so
   the drama looks shot on one rig; a cut can override the focal and the stop. A look the user asks
   for on top of that (大光圈, 背景虛化, 前景模糊…) goes in `lookPhrase`.
4. **Locate or create the project directory** (the user's choice, else next to the source):
   ```bash
   $SD init <dir> --title "<title>" --episodes N --minutes M --genre "<genre>" --register 台湾国语 [--adapt 抽核] [--ratio 9:16] [--video h3|seedance|seedance2|seedance2fast|wan] [--resolution 480P|…] [--accent "台湾口音国语"] [--style photoreal|realistic|ghibli] [--references sheets|keyframes] [--duration auto|fixed] [--look "<lens phrase>"] [--lang zh]
   # params.camera (body / lens / aperture) is edited in project.json
   ```
   An existing `project.json` means a resumed run: `validate` and `manifest` tell you where it stands.
5. **Workspace**: reuse the one bound in `project.json`; otherwise create it and bind the ids
   (`wji ws create "<title>" -r <ratio>` → `wji ws use` → find the semantic folders `story`
   `character` `location` `prop` `shot` → `bind`). Details in `reference/workspace-layout.md`.

## The loop every stage follows

```
write JSON → validate --stage <stage> → fix until green → render → sync datasets → build canvas → generate → bind ids
```

- **Validate before spending.** `validate` exits 1 with the failing gates; fix each one, re-run.
  Never generate from a red stage.
- **Sync = publish.** `render` produces the markdown for the dataset's `content.content`; the
  entity JSON goes to `metadata.shortDrama`; prompts to `image_prompt` / `video_prompt` /
  `audio_prompt` (a character's voice brief). Use `wji fs set --merge …` (never `--content`),
  `--add-images` (never `--images` on an existing node).
- **Bind immediately.** Every id `wji` returns goes into `project.json` / `episodes/E<nn>.json`
  with `bind` before the next command. `manifest` lists what is still unbound; run it before
  creating anything so a resumed run never duplicates.
- **Look at what you generated.** `wji asset download <id> -o <dir>` and open the image before
  approving a sheet or moving to the next segment. One wrong sheet corrupts every shot after it.

## Stage skills (the craft lives there)

| Stage | Skill | Gate |
| --- | --- | --- |
| 1 Outline | `../short-drama-outline/SKILL.md` | `validate --stage outline` |
| 2 Characters | `../short-drama-characters/SKILL.md` | `validate --stage characters` |
| 3 Art | `../short-drama-art/SKILL.md` | `validate --stage art` |
| 4 Script | `../short-drama-script/SKILL.md` | `validate --stage script --ep N` + the two Producer pull-fits |
| 5 Storyboard | `../short-drama-storyboard/SKILL.md` | `validate --stage storyboard --ep N` |
| 6 Sound | `../short-drama-sound/SKILL.md` | soft-QC against the cue sheet |

Canvas node recipes (characters / scenes / props / episode canvases, the exact `wji canvas`
sequences): `reference/canvas-recipes.md`.

## Reporting

One line per stage when you stop: what exists (counts), what was generated and the credits
actually charged (the `credits` line of each result, not the estimate), what `manifest` still
lists, and any gate you had to fix. If a generation failed, say which and why — never resubmit a
node whose status is `generating`.

## Rules specific to this crew

- **The user signs off the brief + outline skeleton and the first segment's clip.**
  Everything else runs on the `wji` spending table.
- **The guideline outranks a good idea.** A single episode's idea that conflicts with
  `outline.guideline` is either dropped or the guideline is changed with the user first.
- **Ids are stable.** Never renumber `C01` / `S01` / `P01` / `B01` / `E01-01` after a dataset or node
  is bound; add new ids at the end.
- **Prompts never carry names.** Faces come from the sheet references; `validate` rejects a name
  or alias in any English prompt.
- **The voice sample is a reference, not a deliverable.** 3–5 s, acted, generated from the
  headshot; it connects to later video nodes as `@audio1` to hold the timbre the way the sheet
  holds the face.
- **In `wan` mode the dialogue audio also comes from the video model** — it speaks the lines from
  the segment prompt's 音频 line. Fill the `voice` fields anyway; they are the register, and the
  gate wants them.
- **One style for the whole drama** (`params.style`). Changing it later means regenerating every
  sheet — say so before doing it.
- **Keyframes at `params.ratio`, sheets at 16:9.** A 9:16 drama still gets landscape sheets.
- **Don't fight a gate by loosening `params`** unless the user asks; the thresholds encode
  production limits (H3 15 s, 2–5 s attention span, one breath per line).
- **The language is one source of truth**: `params.register` + `params.speechAccent`. A language
  change is not done until the script, the storyboard `@audio` lines, the sound briefs and every
  character's `primaryAudio` all match, and the old voice samples are stripped.

## Self-test

```bash
node scripts/selftest.mjs                        # no model calls; every gate has a breaking case
$SD validate examples/night-shift                # ✓ 44 gate(s) passed, 3 advisory (0 notes)
```

`examples/night-shift` — 《夜班便利店》, 3 × 1 min, three characters, two scenes, one prop, episode 1
scripted and storyboarded in H3 mode — passes every gate (the register gate is advisory and clean)
and is the reference for the shape of every field, the brief, the guideline and the bibles
included.
