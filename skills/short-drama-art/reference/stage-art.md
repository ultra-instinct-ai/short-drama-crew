# Stage 3 — Art (scenes and props)

Environments and props are generated dozens of times and must look the same every time. This
stage's output is a **consistency plan** per asset, not a mood board.

## Scenes

| Field | What it is for |
| --- | --- |
| `summary` | design intent — what story this space tells, not a floor plan |
| `anchors` (3–5) | features that must appear in every generation: paintable, recognisable, checkable ("flickering oden light box", "red drawer with worn corners"; not "old atmosphere") |
| `lighting` (≥1) | one prompt (in `params.imagePromptLang`) per lighting state the episodes actually use — derive them from the episodes the scene appears in, don't write a day/dusk/night set nobody uses |
| `image.prompt` | the master view, **empty scene, no people** (say so); `negativePrompt` must ban people |
| `image.sheet` | environment sheet: main panel (≈72 % × 70 %, master view + first lighting state) + an L of detail panels showing the anchors; `THE SPACE MUST BE IDENTICAL ACROSS ALL PANELS`, `nothing invented that is not present in the master view`; the style render phrase |
| `variantOf` + `changes` | a scene that is the parent with a different time / weather / foreground — cheaper and more consistent than a new environment; outline scenes with a `reusePlan` become variants |

Keep scenes distinguishable from each other — the spatial character of each must differ, not all
"worn and dim". Environment realism comes from used materials (chipped paint, water stains,
polished-by-hands wood), never from skin-detail vocabulary.

## Props (narrative props only)

Three conditions at once: **gets a close-up, spans episodes, carries plot.** A cup of tea is a
shot-level prompt detail; the oden warmer is a scene anchor; the hard drive is a prop.

| Field | Rule |
| --- | --- |
| `scale` | `handheld` / `tabletop` / `furniture`; the phrase `handheld scale` etc. (Chinese: `手持尺寸` / `桌面尺寸` / `大件尺寸`) must be in `image.prompt` and `image.sheet` — models paint handheld things at furniture size |
| `summary` | dramatic function, not a product description |
| `anchors` (3–5) | details that survive an extreme close-up (a fresh scratch on the brass clasp) |
| `states` (≥1) | closed / open, sealed / plugged in — each is its own reference image |
| `image.*` | **pure white background (纯白背景), no people, no hands** (negative prompt bans hands — the hand holding the prop is the usual contamination), three-quarter master view; sheet = white-background main panel + detail panels + other states + a side orthographic view |

## On WJI

```bash
wji dataset new <location folder> "<scene name>" -t location -d "<one line>"    # bind scenes.S01.wji.datasetId
wji dataset new <prop folder> "<prop name>" -t prop -d "<function>"             # bind props.P01.wji.datasetId
$SD render <project> scene S01 > /tmp/S01.md
wji fs set <id> --merge content=@/tmp/S01.md --merge image_prompt=@/tmp/S01-sheet.txt --merge metadata.shortDrama=@/tmp/S01.json
```

`scenes` canvas (`canvas-recipes.md` §2) for the scenes and a separate `props` canvas (§2b) for
the props: one 16:9 **sheet** node per scene and per prop; per
extra lighting state / prop state one node `--from` the sheet (`@image1 is this exact space —
keep structure, materials and wear identical; change only: <state prompt>`); variants `--from` the
parent scene's sheet with the `changes` text. Sheets are single images (run), a whole batch of
them is a batch (quote the total).

Check every generated sheet before attaching: **no person or hand anywhere** (a figure in an
environment reference cannot be washed out later), one consistent space across panels, no melted
geometry. Attach: `fs set <dataset> --add-images <sheet> [<states…>] --icon <sheet>`; bind
`wji.nodes.sheet`, `wji.assets.sheet`, `wji.assets.lighting.<state>` / `wji.assets.states.<state>`.

## Gates

`scene-design` · `scene-prompts` · `prop-design`.
