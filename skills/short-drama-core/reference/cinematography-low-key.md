# Cinematography preset `low-key` — 悬疑 / 犯罪 / 惊悚 / 都市暗黑

The look: **low-key light that comes from the scene itself, people standing in shadow and shaped
from the side or from behind, frames with room to breathe and a foreground in front of them, shot
wide open.** The mechanics shared by every preset (the fields, the gates, where the phrases land,
the character-sheet exception) are in `cinematography.md`.

The brief it comes from:

> **光影**：low key，尽量使用现场光源，需要注意角色的站位及镜头的方向调整光源的方向。人物要站在阴影位置。
> 优先使用侧光、逆光、边缘光、轮廓光等等。人物避免使用包围光或世界光。
> **构图**：构图留白设计，保留空间感。场景需要加入前景画面增加层次。因应不同场景使用大光圈镜头。


## 1. Light comes from the scene — `light.source`

There are no film lights. Every key light is a **practical**: something that exists in the space
and can be painted, like a lamp, a window, a screen, a neon sign, a fridge door, a candle, a
streetlight through glass, or the light box of a vending machine. A good anchor (stage 3) often
*is* the practical ("the flickering oden light box").

- **Scene lighting states** (`scenes[].lighting[].prompt`, stage 3) are written in the look. Each
  one contains `low-key practical lighting`, names each practical, says where it sits in the space
  and what colour it is, and describes the **pools of light with darkness between them**. Nothing
  is evenly lit.
  > `low-key practical lighting: the cold fluorescent tube over the counter and the warm oden light box by the door are the only sources; pools of light on the counter and the floor by the door, the back aisles falling to near black, the street outside unlit. Empty scene, no people.`
- **Every cut** names its source in `light.source`, and the frame carries the same words
  verbatim, along with `low-key practical lighting`:
  ```json
  "light": { "direction": "side-left",
             "source": "the oden light box",
             "note": "the light box catches the left edge of her face and the rim of her ear; the rest of her face stays in shadow, the fluorescent spill behind her lifts only her hair" }
  ```

## 2. Stage the person against the source — `light.direction`

The direction is **relative to the camera** (craft-shots §6), so it follows from two choices: where
the person stands relative to the practical, and where the camera looks from. Block the person
first, then choose the camera side that turns the practical into a side light or a back light.

| the practical is… | from the camera it reads as | use |
| --- | --- | --- |
| beside the person, 90° to the lens | `side-left` / `side-right` — 侧光, half the face lit, half in shadow | **preferred** |
| behind the person, off to one side | `back-left` / `back-right` — 逆侧光 / 边缘光, an edge on the cheek, shoulder and hair | **preferred** |
| directly behind the person | `backlight` — 逆光 / 轮廓光, a silhouette with a lit outline | **preferred** |
| in front of the person, 45° to the lens | `front-left` / `front-right` — 前侧光 | sparingly: a reveal close-up where the face must read |
| overhead (a hanging bulb, a ceiling tube) | `top` — 顶光, eye sockets fall dark | when that is the practical |
| below the eyeline (a phone, a screen, a candle) | `underlight` — 底光 | when that is the practical |
| on the lens axis | `frontal` — 顺光 | **never on a person** (包围光: flat, no shadow side) |
| everywhere / nowhere | `ambient` — 世界光 | **never on a person** (no key, no shape) |

- **The person stands in the shadow**, next to the pool of light, not in the middle of it. The
  light catches an edge: the cheekbone, the jawline, an ear, a shoulder. Write that result in
  `light.note` ("only her cheekbone and the rim of her ear catch the light; the far side of her
  face falls to black").
- **No fill.** The shadow side is lifted only by what the practical bounces off a nearby surface,
  if at all. Deep blacks are part of the look, not an exposure mistake.
- **The reverse angle flips the role of the same lamp.** A practical that side-keys her from
  camera left in the single becomes a rim from behind camera right in the reverse over her
  partner's shoulder. Work out both sides of the axis (`segment.axis`) before cutting a dialogue,
  so the scene's light stays in one place while the camera moves around it.
- **Gated**: a cut with a person on screen may not be `frontal` or `ambient`, and **at least half**
  the cuts with people in each segment must be `side-*`, `back-*` or `backlight`. When the gate
  fails, re-stage the person or move the camera; don't just relabel the direction.

## 3. Composition — negative space and a foreground

**留白 — negative space.** Don't centre the person and fill the frame. Put them on a third, and
give the empty part of the frame a job: the dark aisle they are walking into, the door behind
them that is about to open, the distance to the person they won't look at. In the low-key look
the negative space is usually the dark part of the frame.

- Leave looking room on the side the person faces (`start.facing`), and leading room on the side
  they move toward.
- A vertical 9:16 frame has room above and below. A small figure low in the frame under dark
  space reads as isolation or pressure, and this is often the strongest wide shot.
- A close-up still leaves room: the face off-centre, with the space on the side the eyes look.
- Write the placement into `frame`: `she sits in the lower-left third, the unlit shelves filling
  the right two-thirds of the frame`.

**前景 — a foreground layer.** Most cuts shoot *past* something: the edge of a shelf, rain on the
glass, a door frame, a hanging lamp, the shoulder of the other person (an over-the-shoulder). Take
it from the scene's anchors where you can, so it also carries continuity. The existing `photography`
gate already requires a named `foreground` on at least half the cuts of a segment, said to be out
of focus. Aim higher than that minimum in this look.

**Three layers.** A defocused foreground, the person in the shadow in the mid-ground, and a
practical in the background that falls into bokeh. That depth is what the wide aperture exists for.

## 4. Lens — wide open, chosen per scene

The default package (`ARRI ALEXA Mini LF` / `Zeiss Supreme Prime` / `T1.5`) already shoots wide
open. A cut may override `focal` and `aperture` to suit the scene, but **never slower than T2.8**
(gated).

| scene | focal | stop | why |
| --- | --- | --- | --- |
| intimate dialogue close-up, interior night | 75–85mm | T1.5 | eyes sharp, ears already soft, the background a wash of practicals |
| two-shot / medium, interior | 40–50mm | T1.5–T2 | both faces hold, the room behind melts |
| over-the-shoulder | 50–75mm | T1.5–T2 | the near shoulder is the foreground blur |
| wide establishing, interior or street at night | 25–35mm | T2–T2.8 | the space stays readable, the far practicals bloom |
| day exterior | 35–50mm | T2–T2.8 | still shallow; the brightness is carried by an implied ND, not by stopping down |
| insert / prop | 100mm macro | T2–T2.8 | a sliver of focus on the one detail |

The frame carries the whole camera phrase verbatim, including the stop
(`shot on an ARRI ALEXA Mini LF with a Zeiss Supreme Prime 75mm at T1.5`).

## 5. Review questions

- Can you point at the lamp in each cut? If the light has no source in the scene, it is a film
  light, and this look has none.
- Is the person standing *beside* the light rather than *in* it?
- On the reverse angle, is the same lamp still on the same side of the room?
- Cover the person with your thumb. Does the empty part of the frame still say something?
- What is the blurred thing in front of the lens, and is it something from this scene?
