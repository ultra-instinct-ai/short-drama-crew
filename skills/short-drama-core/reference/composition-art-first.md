# Composition `art-first` — 艺术优先

**Composition comes before coverage.** Every frame is built like a painting or a photograph:
vast negative space, rigorous symmetry, monumental scale with small figures in immense spaces,
strong geometry, a patient camera. It works in **any genre and any look**: an art-first 古装, an
art-first 硬科幻, an art-first 悬疑, an art-first 甜宠. Set it for the drama
(`params.composition: art-first`) or for one segment (`"composition": "art-first"`); a segment in
an art-first drama can step out with `"composition": "standard"` (a chaotic fight, a crowded
market).

## 1. The devices — `cut.composition`

Every cut of an art-first segment names its devices (one or more). Each device's phrase is gated
verbatim in the frame:

| device | phrase in the frame | 中文 | use |
| --- | --- | --- | --- |
| `negative-space` | vast negative space | 大面积留白 | a small figure and a big empty field (sky, wall, snow, sea, darkness): loneliness, awe, waiting |
| `symmetry` | perfectly symmetrical composition | 严格对称构图 | the centred axis: power, ritual, order, something too perfect |
| `grand-scale` | monumental scale with small figures in an immense space | 宏大壮观的空间中人物渺小 | the world bigger than the people: a palace, a ship, a canyon, a city |
| `frame-in-frame` | framed within a frame | 框中框构图 | doors, windows, arches, mirrors: a character trapped or watched |
| `leading-lines` | strong leading lines | 强烈的引导线 | corridors, rails, roads, beams converging on the subject |
| `silhouette` | a stark silhouette against the light | 逆光中的鲜明剪影 | the shape of a person or an act, not the face |
| `layered-depth` | layered foreground, midground and background | 前中后景层次分明 | a world with depth |
| `color-block` | bold blocks of flat colour | 大块平涂色块 | graphic, painted frames |
| `top-down` | a graphic top-down view | 图形化的俯视构图 | patterns, bodies on a floor, a table from above |
| `thirds` | the subject placed on a third | 主体位于三分线 | the quiet default |

**Gated** (waivable per segment when the user asks):
- `composition-device` — every cut names at least one device, and its phrase is in the frame.
- `signature-share` — at least **half** the cuts of a segment use a signature device:
  `negative-space`, `symmetry` or `grand-scale`.
- `art-wide` — every segment has at least one `wide` or `extreme-wide`.
- The prompt carries the `Composition:` line (`构图：` for `wan`); `prompt segment` writes it.

**Advisory** (`grammar-advice`): cuts average 3 s or more, so a composed frame can be seen (not in
fight or comedy segments); no handheld in an art-first segment unless it is a fight or a gag.

## 2. How to build an art-first frame

- **Decide what the empty space means** before placing the person: the sky they will never
  reach, the corridor they must walk, the wall between two people.
- **Place the figure small and exact**: on the axis for symmetry, on a third or at an edge for
  negative space, low in a 9:16 frame under the sky or high above an empty floor.
- **Hold it.** The camera is `Static Shot`, or moves slowly and ends on a composed frame
  (`cameraNote.endFraming` says the composition it lands on).
- **Let one element break the geometry**: the red umbrella in the grey square, the one figure
  facing the other way. That is where the eye goes.
- **Colour with intent**: few colours, large areas. Pair with the look's palette.
- **Close-ups are composed too**: a face on a third with the empty side where it looks; a
  symmetrical face straight to camera for a moment of truth.

Write it: `extreme wide shot, perfectly symmetrical composition down the snow-covered palace
axis, a lone figure in red kneeling at the centre, vast negative space of white on both sides`.

## 3. With the other axes

| combination | how it plays |
| --- | --- |
| `costume-idol` / `costume-dark` | the palace axis, the court in rows, the lone figure in a snow field; the costume presets' wide-with-negative-space rule is already met |
| `scifi-hard` | engineered symmetry of corridors and airlocks, the ship dwarfed by a planet |
| `scifi-soft` | the tiny figure under a wall of holograms, the symmetrical neon street |
| `low-key` | silhouettes and one pool of light in darkness as negative space |
| `sweet-romance` | the couple small in a vast bright landscape, symmetry for the confession |
| `grammar: action` | the fight inside the geometry: wide locked-off frames, the moves readable, fewer cuts |
| `grammar: faceslap` | the hero centred on the axis, the room arranged symmetrically around the reversal |
| `grammar: comedy` | the `deadpan` style is already art-first; slapstick in symmetry is its own joke |

## 4. Review questions

- What does the empty space mean in this frame?
- Is the figure placed exactly — on the axis, on a third, at the edge?
- Is there one element that breaks the geometry, and is it the one that matters?
- Would this frame hold up as a still photograph?
