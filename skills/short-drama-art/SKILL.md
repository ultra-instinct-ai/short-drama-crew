---
name: short-drama-art
description: >-
  Produce Stage 3 art for an AI short drama (短剧 / 短劇) on WJI: location /
  scene sheets with lighting variants, narrative prop sheets and their states,
  and the scenes / props canvases that generate them. Use when designing or
  fixing scene or prop art, or the visual side of character sheets — not for
  episode scripts or shot storyboards.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core
  stage: art
---

# Stage 3 — Art (scenes + props)

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there.

Read `reference/stage-art.md` and `../short-drama-core/reference/canvas-recipes.md`, and the
cinematography preset's guide (`../short-drama-core/reference/cinematography-<preset>.md`, §1 and
§2) before writing a lighting state.

## Steps

1. Scenes: `summary`, 3–5 `anchors`, `lighting` states derived from the episodes the scene
   appears in (in the preset's look, lit by named sources), empty-scene `image.*`; variants via `variantOf` + `changes`. Props (narrative ones
   only): `scale`, `anchors`, `states`, white-background `image.*`.
   `$SD validate <project> --stage art`.
2. Sync to `location/` and `prop/` datasets (Operator): content = `$SD render <project> scene S01`
   / `prop P01`, `image_prompt` = the sheet prompt.
3. Canvases: `scenes` — one 16:9 sheet node per scene, lighting / variant nodes `--from` the
   parent sheet; `props` (`wji canvas create props`) — one white-background sheet node per prop,
   state nodes `--from` it. One style for the whole drama (`params.style`); sheets are 16:9 even
   for a 9:16 drama.
4. Generate, then **inspect before approving**: no people in an empty scene, no hands on a prop,
   one consistent space across every panel. Attach the approved sheet as `icon`, bind node and
   asset ids.

## Hand-off

The Art Director drafts and approves; the **Operator** generates after the Producer relays the
cost approval. The character headshot / sheet canvas is shared with Stage 2 — coordinate through
the Producer. Do not write scripts or storyboards.
