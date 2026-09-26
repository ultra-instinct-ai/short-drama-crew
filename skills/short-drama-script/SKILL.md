---
name: short-drama-script
description: >-
  Write Stage 4 per-episode scripts (剧本) for an AI short drama (短剧 / 短劇) on
  WJI: seed the episode, the 谈话+行动 flow of action and line beats, the hook
  inside 15 s, a turn every 30 s, the 爽点 on an action, the cliff, lines in the
  project's 语体 / register from each speaker's bible, then the dialogue polish
  pass and the Producer pull-fit gates. Use when writing or fixing episode
  screenplays or dialogue — not for the outline skeleton, art sheets or
  storyboard cuts.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core
  stage: script
---

# Stage 4 — Script (per episode, batches of ≤ 3)

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there.

Read `reference/stage-script.md` and `reference/dialogue-craft.md` (lines as action, 语体 rules,
the polish pass). `reference/screenwriter-brief-template.md` is the hook block to paste into a
rewrite brief.

## Steps

1. `$SD render <project> guideline` and the speakers' `render character` first. Then
   `$SD seed <project> script --ep N` writes `episodes/E0N.json` with target seconds, hook /
   cliff, claimed beats, the episode design (`function` / `task` / `change` / `hookType`,
   `satisfactionBeat` to set) and a `seedNote` (synopsis, the 爽点 to realise, register, guideline
   priorities, every speaker's `bible.speech`, ids, previous cliff, budget).
2. Fill `scenes[].flow` — action beats and line beats alternating, **common actions only**, the
   hook image inside the first 3 beats and by 15 s, a `turn: true` beat at least every 30 s, the
   爽点 on an action (`satisfactionBeat`), the cliff as the last beat; lines in the register, from
   each speaker's `speech`. Every line carries its emotional context and a concrete delivery.
   Genre markers on the beats: `clue: "K1"` on the beat that plants a mystery clue in its plant
   episode; `gag: setup / build / punchline` and `runningGag` in a comedy (a setup before every
   punchline, punchlines ≤ 20 字). Delete `seedNote` when done.
3. `$SD validate <project> --stage script --ep N` — duration math, line length, speakers, hook
   window, rhythm, design, filmability, upstream ids; the register gate only advises. Over
   budget: cut actions first (keep the rhythm flips); under: add conflict, not small talk. When
   dialogue is the weakness, run the polish pass: `$SD render <project> dialogue --ep N` → fill
   the 逐句校对表 → apply → re-validate.
4. Sync (Operator): `$SD render <project> script --ep N` (the 短剧 episode format with the 创作自检
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

Report green episode scripts to the Producer. The Director starts the storyboard only after the
script is green. No `wji` generation here.
