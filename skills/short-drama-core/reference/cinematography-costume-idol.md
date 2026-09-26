# Cinematography preset `costume-idol` — 古装偶像 · 古偶 · 仙侠

The look: **a luminous, painted world.** Faces are bright, soft and flawless. Light is diffused
through silk gauze and paper windows and glows through flowing hair and sleeves from behind.
Mist, petals and shafts of light drift through the air. The palette is soft: jade, moon-white,
pale pink, pale gold. The frames swing between two scales: vast wides and extreme wides full of
empty sky and mist (大量留白) with a small figure in them, and close shots of the couple fully open
into the dreamiest bokeh. It is `sweet-romance` moved into a palace or an immortal realm, so read
`cinematography-sweet-romance.md` too (the couple's distance, the 心动 set pieces and the music
cues all apply).

The mechanics shared by every preset (the fields, the gates, where the phrases land, the
character-sheet exception) are in `cinematography.md`. Pair it with `register: 古装` for the lines.

## 1. Light — diffused, glowing, never electric — `light.source`, `light.direction`

Every cut names a soft period source in `light.source`, carried verbatim in the frame with
`ethereal costume drama lighting`. **No electric light exists** (gated: bulbs, neon, fluorescent
tubes, LEDs, street lights, screens are refused).

| time / place | the source | what it gives |
| --- | --- | --- |
| day, palace hall | sun through paper windows and layers of silk gauze | an even, luminous wrap on the faces, glowing backgrounds |
| garden, peach blossom | the open sky, the sun behind the trees | a halo in the hair, petals lit from behind |
| immortal realm, mountain | sun through mist and clouds, god rays | shafts of light, a soft white world |
| night, courtyard | moonlight + rows of red lanterns | cool moon rim, warm lantern key, bokeh lanterns |
| night, bedchamber | many candles through gauze curtains | a warm glow wrapping the couple |
| magic | the glow of a spell, a jade pendant, fireflies | a coloured key from the hand or the object |

- **The face is luminous.** Soft three-quarter front (`front-left` / `front-right`) or a glow from
  behind (`back-*` / `backlight`): at least **half** the cuts with people (gated).
- **Backlight through fabric** is the signature: the sun or the lanterns behind flowing sleeves,
  veils and loose hair, turning them into light.
- **Never on a face**: `underlight` and `top` (gated). Those belong to `costume-dark`.
- Shadows are soft and open; nothing falls to black except the night sky.
- **Scene lighting states** contain `ethereal costume drama lighting` and the sources:
  > `ethereal costume drama lighting: soft morning sun diffused through the tall paper lattice windows and layers of pale silk gauze, the hall luminous and airy, a faint mist catching the shafts of light, jade and moon-white surfaces glowing softly. Empty hall, no people.`

## 2. Colour, fabric and air

- **Palette**: jade green, celadon, moon-white, pale pink, lotus, pale gold, soft lavender. Give
  each lead a colour in the character bible (he in moon-white and silver, she in pale pink and
  jade) and keep it through the drama. The villain gets the deep, saturated colour.
- **Grade**: soft, bright, slightly desaturated pastels, creamy highlights, a gentle glow
  (halation) around bright edges.
- **Fabric is the effects budget**: silk that catches light, layered gauze, long sleeves and
  ribbons that move. Say it in the frames (`sheer silk sleeves glowing in the backlight`).
- **Air is never empty**: mist, falling petals (peach, plum, pear blossom), drifting snow, floating
  lanterns, fireflies, incense smoke. Make one of them an anchor of each scene, and move it in
  `motion` / `cameraNote.hold`.

## 3. Composition — vast wides with 留白, intimate close-ups

This look lives on two scales at once: **the world is huge and empty, the couple is close and
glowing.** Cut between them.

### 全景 / 大全景 with 大量留白 (gated)

**Every segment has at least one `wide` or `extreme-wide` cut, and its frame says where the
`negative space` is** (gated). The empty part of the frame is the fantasy: the world is bigger
than the people in it.

- **What fills the negative space**: sky and clouds, a sea of mist, a still lake, a snow field, an
  endless palace courtyard, a sea of blossom, mountain ridges fading into haze. Bright and soft,
  never black.
- **The figure is small.** One or two people take up a small part of the frame: on a bridge, at
  the top of a stairway, on a cliff edge, in the middle of an empty courtyard. The 9:16 frame is
  tall: put them in the lower third with the sky or mist above, or at the top with the empty
  stairway below.
- **Place the wide deliberately**: to open a scene (where are we), to end it (the couple left
  alone in the world), and at the emotional turn (she walks away across the empty courtyard).
- Write it: `extreme wide shot, a lone figure in moon-white robes on the arched bridge in the
  lower third, the vast negative space above filled with drifting mist and peach blossom`.
- A wide still needs depth (the `storyboard-advice` note on 9:16 wides): a blossom branch or a
  lantern soft in the foreground, the mountains or the palace roofs faded in the background.

### Close to the couple

- **The couple uses the romance rules** (the distance between them, over-the-shoulder with a
  soft sleeve or hair in the foreground, the centred 心动 close-up), see
  `cinematography-sweet-romance.md` §3.
- **Palaces and ceremonies are symmetrical**: centred axis, the throne or the gate in the middle,
  people in rows. Low `height` for power.
- **Foregrounds**: gauze curtains, blossom branches, bead curtains, lantern tassels, lattice
  windows, drifting petals near the lens. At least half the cuts (gated).
- **Frame within a frame**: moon gates, lattice windows, the gap in a folding screen, the space
  under an oil-paper umbrella.

## 4. Lens — fully open, the dreamiest bokeh

`init` gives this preset a faster package: `Zeiss Master Prime` at **T1.3**. Nothing is slower
than **T2** (gated).

| shot | focal | stop |
| --- | --- | --- |
| realm / palace extreme wide | 18mm | T2 |
| courtyard, bridge, garden wide | 25mm | T2 |
| two-shot in the garden | 50mm | T1.3–T1.5 |
| couple, OTS | 75–85mm | T1.3 |
| the 心动 close-up | 85mm | T1.3 |

**The dreamiest bokeh** follows `cinematography-sweet-romance.md` §4: at least half the frames of
a segment name what melts into `bokeh` (gated). The period gives you the best sources: rows of
red lanterns, a lantern festival, candles through gauze, fireflies, sun glinting through blossom
branches, sparkles on the lake, floating river lanterns. Diffusion in `params.lookPhrase` suits
this look (`soft pro-mist diffusion, gentle halation`).

## 5. Camera and motion

- Floating and slow: slow `Arc Shot` around the couple, rising `Pedestal Up` / `Tilt Up` to a
  palace or a flying figure, slow `Push In` on a look, gentle `Tracking Shot` through a garden.
- **Slow motion** on the 心动 beats, the turn of a sleeve, a flying leap, falling petals around a
  still figure. Write `in slow motion` in `motion`.
- **Wind is always on**: hair, sleeves, ribbons and petals move in every lock-off.
- The 甜宠 set pieces translate directly (see `cinematography-sweet-romance.md` §6), plus the
  genre's own: 执手 (holding hands on a bridge), 簪花 (putting a flower or hairpin in her hair),
  共乘一马 (riding one horse), 月下对饮 (drinking under the moon), 灯会 (the lantern festival),
  英雄救美 (a rescue ending in a spin and a caught glance).

## 6. Review questions

- Is there any light in this frame that needs electricity?
- Is the face luminous? Is something (hair, sleeve, veil) glowing from behind?
- What is floating in the air in this scene?
- Does each lead wear their own colour?
- Palace: is it symmetrical? Couple: is the distance right for this episode?
