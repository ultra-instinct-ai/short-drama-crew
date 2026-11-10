---
name: short-drama-script
description: >-
  Write Stage 4 per-episode scripts (剧本) for an AI short drama (短剧 / 短劇) on
  WJI: seed the episode, the 谈话+行动 flow of action and line beats, the hook
  inside 15 s, a turn every 30 s, the 爽点 on an action, the cliff, lines in the
  project's 语体 / register from each speaker's bible, then the required dialogue
  review (w-film-dialogue-editor guides + corpus) and the Producer pull-fit gates. Use when writing or fixing episode
  screenplays or dialogue — not for the outline skeleton, art sheets or
  storyboard cuts.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core, w-film-dialogue-editor
  stage: script
---

# Stage 4 — Script (per episode, batches of ≤ 3)

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there.

Read `reference/stage-script.md` and `reference/dialogue-craft.md` (lines as action, 语体 rules,
the dialogue review). The full dialogue method is the user's **`w-film-dialogue-editor`** skill,
installed beside this one ([its SKILL.md](../w-film-dialogue-editor/SKILL.md)): its language
guides and corpus are read while the lines are written and again in the required review. `reference/screenwriter-brief-template.md` is the hook block to paste into a
rewrite brief.

## Steps

1. `$SD render <project> guideline` and the speakers' `render character` first. Then
   `$SD seed <project> script --ep N` writes `episodes/E0N.json` with target seconds, hook /
   cliff, claimed beats, the episode design (`function` / `task` / `change` / `hookType`,
   `satisfactionBeat` to set) and a `seedNote` (synopsis, the 爽点 to realise, register, guideline
   priorities, every speaker's `bible.speech`, the dialogue skill's guides and per-speaker corpus
   queries in `dialogue`, ids, previous cliff, budget).
2. Fill `scenes[].flow` — action beats and line beats alternating, **common actions only**, the
   hook image inside the first 3 beats and by 15 s, a `turn: true` beat at least every 30 s, the
   爽点 on an action (`satisfactionBeat`), the cliff as the last beat; lines in the register, from
   each speaker's `speech`. Every line carries its emotional context and a concrete delivery.
   Genre markers on the beats: `clue: "K1"` on the beat that plants a mystery clue in its plant
   episode; `gag: setup / build / punchline` and `runningGag` in a comedy (a setup before every
   punchline, punchlines ≤ 20 字). Delete `seedNote` when done.
3. `$SD validate <project> --stage script --ep N` — duration math, line length, speakers, hook
   window, rhythm, design, filmability, upstream ids; the register gate only advises. Over
   budget: cut actions first (keep the rhythm flips); under: add conflict, not small talk.
4. **Dialogue review** (required, gate `dialogue-review`): `$SD seed <project> dialogue --ep N` →
   read the `w-film-dialogue-editor` framework and the guide of each 语体 it prints, run each
   speaker's corpus query → fill the diagnosis, `level`, one row per line (issue / revised /
   reason / playable note) and the guide's 自检 → `$SD apply <project> dialogue --ep N` →
   re-validate. A line edited later is reviewed again. Details in `reference/stage-script.md`.
5. Sync (Operator): `$SD render <project> script --ep N` (the 短剧 episode format with the 创作自检
   table) → `story/` dataset `E0N 剧本` (type `screenplay`, `viewMode=content`); bind
   `wji.screenplayDatasetId` with `--ep N`.

## Continuity writing rule (every episode)

When writing any physical beat, always include the **entry and exit movement** for every
position change and **track every prop** from its pre-placement to its final use. The Producer's
continuity pull-fit is P0 before green.

## Producer gates before green

- `../short-drama-core/reference/producer-dialogue-performance-qa.md` — every spoken line:
  (1) 對白有冇交代清楚, (2) 點樣演繹. FAIL → revise; blocks paid gen.
- `../short-drama-core/reference/producer-continuity-blocking-qa.md` — bridges, relative places,
  action chains, props, presence. P0 blocks green and burn.

## Hand-off

Report green episode scripts to the Producer; the Proofreader audits `episode.dialogueReview`
against the guide's 自检 before the storyboard starts. The Director starts the storyboard only after the
script is green. No `wji` generation here.
