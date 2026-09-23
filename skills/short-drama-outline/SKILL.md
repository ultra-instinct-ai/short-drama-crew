---
name: short-drama-outline
description: >-
  Write Stage 1 of an AI short drama (短剧 / 短劇) on WJI: the 创作简报 (brief),
  the skeleton (core / keep / cut / merge, characters, scenes, props, beats,
  structure), the 创作指引 (guideline) and the 分集目录 — episode list with
  function / task / change / 爽点 / 钩子 and synopses. Use when drafting or fixing
  an outline, brief, guideline or episode list, or adapting a story or novel —
  not for character bibles, scripts, art or storyboards.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core
  stage: outline
---

# Stage 1 — Outline

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there (set once per session).

Read `reference/stage-outline.md` and `reference/craft-story.md` first — the 短剧 method: brief,
three phases, 分集目录, the 爽点 / 钩子 libraries, the episode formula. Field shapes:
`../short-drama-core/reference/schema.md`.

## Steps

1. **Brief first**: `outline.brief` — the six judgements (logline, audience, 爽点 engine, main
   hook, the pressures on both sides, emotional line, promise). If the user gave one line, ask the
   focusing questions; do not invent a genre.
2. **Skeleton**: `outline.core/keep/cut/merge/risks`, `characters[]` (id / name / tier / role /
   arc / from), `scenes[]` (id / name / primary / reusePlan), `props[]` (id / name / function /
   beatIds), `beats[]`, `outline.structure` (golden / escalation / climax with episode ranges; a
   one-episode drama is `golden [1,1]` + `climax [1,1]`) and `outline.guideline` (tone, intensity,
   dialogue style, visual style, limits, ≥ 3 forbidden, 3–5 priorities).
   `$SD validate <project> --stage outline` will still fail on `episodes` — expected at this point;
   read the other gates.
3. **Sign-off ⛔**: show the user the brief, what was cut, who was merged, where the major beats
   land (`cutNote` / `mergeNote`) and the guideline's priorities. Do **not** write episode synopses
   before they agree — a wrong skeleton wastes every downstream stage.
4. **Episodes** in batches of ≤ 10 — design before prose: `function` / `task` / `change` /
   `satisfaction` / `hookType` (the 分集目录; episode 1 grabs, 2 proves the 爽点, 3 widens the line,
   the finale settles), then `synopsis` / `hook` / `suspense` / ids / `crowdPlan` / `warnings`;
   validate until green.
5. Sync (the Operator runs `wji`): `$SD render <project> outline` → `story/` dataset (type
   `outline`, `viewMode=content`), bind `wji.outlineDatasetId`; `$SD render <project> guideline`
   → its own `story/` dataset `<title> 创作指引` (type `outline`), bind `wji.guidelineDatasetId`.

## Hand-off

Report the green outline to the **Producer**. Next is characters (Screenwriter) or a stop for
user review. Do not start art, script or storyboard here.
