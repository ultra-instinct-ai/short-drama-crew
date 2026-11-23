# Top-view plan — positions that hold across segments

`params.topView: on` (default `off`, set at setup with `init --top-view on`, sheets mode only).
Each segment is a separate generation, so nothing but the references and the prompt tells a clip
where everyone sat in the last one. Text alone can lose the seating. The top-view plan adds two
things:

- per scene, a **top-view sheet**: an overhead photo of the same set;
- per segment, an **overlay** drawn on that photo: who sits where, which way each person faces, and
  where each shot's camera stands.

The overlay goes into the clip as one more `@image`.

## 1. Why a photo and not a diagram

Measured on Seedance 2.5 Ref, Nov 2026: a 4-person dinner in two 6 s segments, all six references
connected, and **no position words in the prompt**.

| Layout reference | Segment 1 | Segment 2 (over-the-shoulder, two-shot, wide) |
| --- | --- | --- |
| Abstract floor-plan diagram (boxes, dots) | held | **failed**: OTS mirrored, two-shot swapped, wide reseated |
| **Top-view photo of the set + marks** | held | **held**: OTS on the right shoulder, two-shot sides, same seating |

The model reads a real room from above. It does not translate a schematic diagram into the
camera's view. Keep writing the blocking in text as well (`axis`, `placement`, eyelines); the plan
is there so text and picture agree, and the gate checks they do.

ByteDance's own documented route to blocking is a *clay render*: a textureless 3D blockout seen
from the camera. That is the stronger tool when a shot must be exact. The top-view plan is the
cheap one: one image per scene, one local drawing per segment.

## 2. The top-view sheet (Stage 3, per scene)

- Prompt: `prompt <project> image S01 --asset topview`. It is drawn `--from` the scene sheet, so
  the furniture matches.
- Node: `wji canvas add image -c <scenes> -n "S01 topview" -r 16:9 --from <S01 sheet node>
  --prompt-file …`. Bind `scenes.S01.wji.assets.topview`.
- Inspect it before use:
  - **straight overhead**, with no tilt;
  - **empty**, with nobody in the room;
  - every seat, door and table where the sheet has them.

  Regenerate if any check fails. Every mark depends on this picture.

## 3. Marks (Stage 5, per segment)

```json
"topView": {
  "positions": {
    "C01": { "at": [0.24, 0.62], "facing": 0 },
    "C02": { "at": [0.78, 0.62], "facing": 180 }
  },
  "cameras": [
    { "cut": 1, "at": [0.40, 1.20], "aim": [0.50, 0.55] },
    { "cut": 2, "at": [0.62, 1.05], "aim": "C01" },
    { "cut": 3, "at": [0.50, 1.40], "aim": [0.50, 0.55], "to": [0.50, 1.10] }
  ],
  "moved": []
}
```

- **Coordinates** are fractions of the top-view sheet: `[x, y]`, 0–1, origin at the top left.
  Read them off the photo: put each person on their actual chair.
- **`facing`** is in degrees: 0 = image right, 90 = image down, 180 = left, 270 = up.
- **Cameras**: one per cut (`cut` is 1-based).
  - `at` may sit up to 0.5 outside the photo, because a wide shot stands back.
  - `aim` is a point, or the id of the person the shot is on.
  - `to` is where a move ends; it is drawn as a dashed arrow.
- The wedge drawn from each camera is the cut's lens: `focal`, or the one its size implies.
- **`moved`**: people the script moves between this segment and the previous one in the same
  scene. Everyone else keeps their mark.

## 4. The overlay and the prompt

`topview <project> segment E01-02 --image <top-view sheet file>` writes `topview/E01-02.png`
(1280×720, through headless Chrome; set `CHROME_PATH` if it is elsewhere). To get the sheet file:

```bash
wji asset download <topview asset id>
```

Upload the overlay, bind `storyboard.segments.E01-02.wji.assets.topview`, and connect it **as the
last picture** on the video node.

`prompt segment` then writes:

- **The legend line**, e.g. *"@image5 is a photo of this same room taken from directly above, with
  markers drawn on it … the blue dot is @image2, the red dot is @image3 … never show the overhead
  view, its dots, arrows, labels or numbers"*. Dots are coloured in order of appearance in the
  segment's cuts: blue, red, yellow, green, purple, orange, teal, white. They carry no names; the
  legend ties each colour to its sheet.
- **In every shot**, `from camera k on @image5.` Gated verbatim.

## 5. What the `top-view` gate checks (hard, only when on)

- Everyone in the segment's cuts has a mark and a facing.
- Every cut has a camera.
- Everyone in a cut is inside that camera's wedge. The over-the-shoulder person is exempt.
- A cut's `placement` left / right matches what its camera actually sees.
- Cameras stay on one side of `axis.between`, unless a cut is `axisSide: cross`:
  - inside the segment;
  - and **against the previous segment of the same scene**, so screen sides do not flip between
    clips.
- Marks carry over from the previous segment of the same scene unless listed in `moved`.
- Each shot names its camera mark.

## 6. Cost and limits

- One image per scene for the top-view sheet. The overlays are drawn locally, free.
- Sheets mode only. Keyframes already fix where everyone stands.
- It does not fix framing preferences. In the test, the model still shot one close-up over a
  shoulder no matter what the plan said.
- One test so far (4 people, 2 segments). Watch the first clip of a new scene against its overlay.
