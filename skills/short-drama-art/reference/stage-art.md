# Stage 3 — Art (scenes and props)

Environments and props are generated dozens of times and must look the same every time. This
stage's output is a **consistency plan** per asset, not a mood board.

## Scenes

| Field | What it is for |
| --- | --- |
| `summary` | design intent — what story this space tells, not a floor plan |
| `condition` | `new` / `lived-in` / `worn`, plus `conditionReason` from the plot. Realism is materials, light and detail, not wear. A luxury house, a set just built, a prop the organisers have just issued, and every national or regional flag are `new` and correct |
| `anchors` (3–5) | features that must appear in every generation: paintable, recognisable, checkable ("flickering oden light box", "the single red drawer under the counter"; not "old atmosphere"). They follow `condition` — do not add peeling paint, rust or fading by default |
| `lighting` (≥1) | one prompt (in `params.imagePromptLang`) per lighting state the episodes actually use — derive them from the episodes the scene appears in, don't write a day/dusk/night set nobody uses. With a `params.cinematography` preset each English prompt contains the preset's `framePhrase` (`low-key practical lighting` / `soft romantic lighting`) and names the sources that light the space (what, where, what colour) — see the preset's guide, `../../short-drama-core/reference/cinematography-<preset>.md` §1. The presets carry no Chinese phrase yet, so `imagePromptLang: zh` is not held to it |
| `image.prompt` | the master view, **empty scene, no people** (say so); `negativePrompt` must ban people |
| `image.sheet` | environment sheet: main panel (≈72 % × 70 %, master view + first lighting state) + an L of detail panels showing the anchors; `THE SPACE MUST BE IDENTICAL ACROSS ALL PANELS`, `nothing invented that is not present in the master view`; the style render phrase |
| `variantOf` + `changes` | a scene that is the parent with a different time / weather / foreground — cheaper and more consistent than a new environment; outline scenes with a `reusePlan` become variants |
| `views` | optional extra views, each made from the sheet: `reverse` and / or `high` — see **Extra views** below |

Keep scenes distinguishable from each other — the spatial character of each must differ, not all
"worn and dim". Every scene and every prop states a `condition` (`new`, `lived-in` or `worn`) and a
`conditionReason` taken from the story. Realism comes from materials, light and detail; it does not
mean worn. A luxury house, a set that has just been built, a prop the organisers have just issued,
and every national or regional flag must be new and correct. Anchors match that condition: do not
add peeling paint, rust or fading unless the condition is `worn`. A `lived-in` place may show
ordinary use. Only `worn` may forbid a clean finish in `negativePrompt` (`showroom-clean`,
`brand-new`).

### Extra views — when the sheet is not enough

The sheet shows the room from one side. Any shot that looks the other way, or down on the floor,
makes the video model invent what it never saw — a different wall, a door that moves between
cuts. Add a view when the storyboard needs it, not by default:

| View | Add it when | What it is |
| --- | --- | --- |
| `reverse` | two people face each other across the room (shot / reverse shot, over-the-shoulder pairs) — one of the two backgrounds is behind the master camera; or a character enters from, or looks toward, the side the sheet never shows | the same set from the opposite side, looking back to where the master view was taken from; what the sheet shows keeps its place |
| `high` | `high` / `top` cuts, a crowd or a fight that uses the whole floor, blocking that spans the room, a chase across it | the same set from high in one top corner, about 45° down, every piece of furniture where the sheet has it |

`prompt <project> image S01 --asset view:reverse` (or `view:high`), one node `--from` the sheet,
16:9. Check it before attaching: empty, the same room (anchors, materials, condition, light), the
reverse view shows a side that belongs to the same building, the high view keeps every piece of
furniture where the sheet has it. Bind `wji.nodes.views.<view>` / `wji.assets.views.<view>`.

In the storyboard a cut picks the view with `view: reverse` (a `high` / `top` cut takes `high` on
its own); the clip then connects that view after the environment and the shot names it. The
advisory `art-scale-views` points at scenes whose segments cut between two people or shoot from
above without the view. Not the same as the top-view plan (`params.topView`): that is a straight-down
plan for marking positions; `high` is a viewable angle of the room.

## Props (narrative props only)

Three conditions at once: **gets a close-up, spans episodes, carries plot.** A cup of tea is a
shot-level prompt detail; the oden warmer is a scene anchor; the hard drive is a prop.

| Field | Rule |
| --- | --- |
| `scale` | `handheld` / `tabletop` / `furniture`; the phrase `handheld scale` etc. (Chinese: `手持尺寸` / `桌面尺寸` / `大件尺寸`) must be in `image.prompt` and `image.sheet` — models paint handheld things at furniture size |
| `size` | the real size in words — "about 9 cm long, fits in a palm", "a 30 cm square box" — for every `handheld` / `tabletop` prop; it goes into the clip's legend and the scale picture |
| `scaleRef` / `scaleObject` | what the scale picture sets it against: `hand` (default for handheld), `object` + `scaleObject` (default for tabletop: a coffee mug, a smartphone, an A4 sheet — something everyone knows the size of), `none` (furniture: the room already scales it) |
| `summary` | dramatic function, not a product description |
| `condition` | same three values as a scene, with `conditionReason`. A flag, a just-issued badge or a showroom object is `new` |
| `anchors` (3–5) | details that survive an extreme close-up (the serial stamped on the brass clasp). They follow `condition`; a scratch, chip or rust belongs only on `worn` |
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
keep structure, materials and condition identical; change only: <state prompt>`); variants `--from` the
parent scene's sheet with the `changes` text. Sheets are single images (run), a whole batch of
them is a batch (quote the total).

**Scale picture (small props).** A prop alone on white has no size — the model paints a ring like a
dinner plate and a key like a crowbar. For every `handheld` / `tabletop` prop make one more image
`--from` the sheet: `prompt <project> image P01 --asset scale` — the same prop at its `size` in one
plain hand cropped at the wrist (`hand` — the one picture of the prop that shows a hand;
its `--json` negative drops the hand ban), or standing beside the `scaleObject` (`object`). Check: the
same prop, one hand only and no face, the size it should be. Bind `wji.nodes.scale` /
`wji.assets.scale`; the clip then connects it right after the prop's sheet and each shot with the
prop says `at the size @imageK shows`. The sheet itself stays hand-free.

Check every generated sheet before attaching: **no person or hand anywhere** (a figure in an
environment reference cannot be washed out later), one consistent space across panels, no melted
geometry. Attach: `fs set <dataset> --add-images <sheet> [<states…>] --icon <sheet>`; bind
`wji.nodes.sheet`, `wji.assets.sheet`, `wji.assets.lighting.<state>` / `wji.assets.states.<state>`.

With `params.topView: on`, each scene also gets a **top-view sheet**: `prompt <project> image S01
--asset topview`, one node `--from` the sheet. It must be straight overhead and empty, with the furniture
where the sheet has it. Bind `wji.nodes.topview` / `wji.assets.topview`. See `top-view-plan.md` §2.

## Gates

`scene-design` · `scene-prompts` · `prop-design` · `art-scale-views` (advisory: a small prop with no `size` or scale picture, a scene shot from its other side or from above with no view).
