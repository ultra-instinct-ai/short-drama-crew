# Cinematography preset `period-nostalgia` — 年代 · 怀旧

The look: **a memory shot on film.** Warm, faded colour on vintage lenses and film stock, with
grain and a soft glow. The light is the era's own: sun through a window, a bare tungsten bulb, a
green-white fluorescent tube, the flicker of an old television. Frames are steady and unhurried,
so the period details (the enamel mug, the bicycle, the calendar on the wall) have time to be
seen. The feeling is warmth with an ache: the picture should feel like something already lost.

The mechanics shared by every preset (the fields, the gates, where the phrases land, the
character-sheet exception) are in `cinematography.md`. Pair it with `register: 年代` for the lines.

## 0. Name the decade

The preset is the *look*. The *era* is yours to state, and the details depend on it. Put the
decade in `params.lookPhrase` (e.g. `1980s`), so every segment prompt carries it, and in every
scene lighting state and frame. A 1920s 民国 drama, a 1970s 大院 drama and a 1990s 下岗 drama
share the film look and nothing else:

| era | light sources that exist | palette |
| --- | --- | --- |
| 民国 (1920s–40s) | sun, oil lamps, early bare bulbs, candles, neon on the treaty-port streets | sepia, ivory, tea brown, jade, black lacquer |
| 1960s–70s | sun, bare bulbs, kerosene lamps in the countryside, the one fluorescent tube in the office | faded army green, navy, grey, a slogan red |
| 1980s | sun, bare bulbs, fluorescent tubes, desk lamps, the first colour TVs, neon on new shopfronts | warm amber, mustard, brick red, teal, cream |
| 1990s | fluorescent tubes, shop neon, karaoke lights, CRT TVs, street lamps | cooler greens, bright signage colours over faded walls |

The validator refuses sources no older era had (LEDs, smartphones, laptops, flat screens, ring
lights). The finer calls — a fluorescent tube in a 民国 room, a colour TV in 1972 — are yours; the
review questions (§6) ask them.

## 1. Light — the era's own sources — `light.source`, `light.direction`

Every cut names its source in `light.source`, carried verbatim in the frame with `nostalgic
period film look`.

- **Window sun is the signature.** Hard, warm shafts through a window, dust hanging in them, a
  pool of light on the floor or the table. Afternoon is the nostalgic hour.
- **Bare bulbs at night**: one warm tungsten bulb hanging over the table, the room falling off
  into brown shadow. A fluorescent tube is the colder, harsher office or factory version: let it
  go slightly green.
- **The face is lit by an angle, not a flash.** Key from the window or the bulb at three-quarter
  or from the side; at least **half** the cuts with people are `front-left` / `front-right` /
  `side-*` / `back-left` / `back-right` (gated). `top` is allowed when the bare bulb really hangs
  above them; it is not in the preferred half.
- **Never on a face**: `frontal` (reads as a modern flash snapshot) and `underlight` (horror).
- Shadows are warm brown, not black; contrast is gentle, like old print film.
- **Scene lighting states** contain `nostalgic period film look`, the decade and the sources:
  > `nostalgic period film look, 1980s: warm late-afternoon sun slanting through the single window of the dormitory room, dust hanging in the shaft of light, a bare tungsten bulb unlit above the table, faded mint-green walls glowing where the sun lands, the corners falling into warm brown shadow. Empty room, no people.`

## 2. Colour and texture — film, not filter

- **Grade**: warm amber highlights, faded lifted blacks, muted greens and brick reds, colours that
  look sun-bleached. Say it in the frame: `faded warm film colour, soft grain, gentle halation`.
- **Film texture**: soft grain, halation around the window and the bulbs, slight softness at the
  frame edges from the vintage lens. Put a lens and stock in `params.camera` if you want it named
  (e.g. lens `Cooke Speed Panchro`), or in `params.lookPhrase` (`shot on 35mm film`).
- **Production design carries the era**, and this look is built to show it. Make the period
  objects the scenes' **anchors** (so they appear in every generation) and the **foregrounds**:
  the enamel mug with a red slogan, the thermos, the transistor radio, the wall calendar, the
  bicycle, the lace doily on the TV, the coal stove, the cassette player, the lottery posters.
- Wardrobe in the character bibles is of the era: knitted vests, army-green jackets, floral
  shirts, wide trousers, perms and parted hair. Faded and worn, not costume-new.

## 3. Composition — steady, framed, lived-in

- **Let the frame sit.** More `Static Shot` and slow `Push In` than any other preset. The shot
  holds, and life moves inside it.
- **Frame within a frame**: doorways of the 筒子楼 corridor, the courtyard gate of the 胡同, the
  window of the bus, the hatch of the ticket office. It looks through time.
- **Medium-wide more than close-up.** The room is part of the character. Keep people in their
  space with room around them; save the close-up for the emotional peak.
- **Foregrounds are period objects**, thrown out of focus: the mug, a bead curtain, laundry on the
  line, a bicycle wheel, the net curtain. At least half the cuts have one (gated).
- **Tableau shots** for families and groups: people arranged around the table or the courtyard
  like an old photograph, the camera at eye height, level and still.

## 4. Lens — vintage, not necessarily wide open

This preset allows **T4** (the others stop at T2.8): the period detail is the point, and the
room should often read in focus.

| shot | focal | stop |
| --- | --- | --- |
| the room / courtyard / street tableau | 25–35mm | T2.8–T4 |
| people in their space, medium | 40–50mm | T2–T2.8 |
| the emotional close-up | 75mm | T2 |
| period-object insert | 100mm macro | T2.8 |

## 5. Camera, motion and sound

- Gentle camera: `Static Shot`, slow `Push In`, a slow `Truck Left` / `Truck Right` along a corridor or a street, a
  `Tracking Shot` alongside a bicycle. No shake.
- **Motion that breathes the era**: dust in the sunbeam, a ceiling fan turning, the curtain
  lifting, steam from a teacup, the bicycle bell, the TV picture rolling.
- **Sound is half the nostalgia**: the radio, cicadas in the courtyard, the bicycle bell, the
  street hawker, the train in the distance, a period song on the cassette player. Put the diegetic
  music in `sound.sfx` or as the segment's `music` intent.
- **Transitions by memory**: a match cut from an object in the present to the same object then,
  or a slow push into a photograph that becomes the scene.

## 6. Review questions

- Which year is it? Would every object and light source in this frame exist that year?
- Can you point at the window or the bulb that lights the face?
- Is there a period object in the foreground or the anchors that tells you the era at a glance?
- Does the picture feel like film (grain, warm faded colour), not like a filter?
- Does the frame hold long enough for the room to be seen?
