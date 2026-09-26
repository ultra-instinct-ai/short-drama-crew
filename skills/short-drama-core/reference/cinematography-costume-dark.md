# Cinematography preset `costume-dark` — 古装写实 · 权谋 · 武侠 · 暗黑

The look: **history as it was lit — by fire.** Candles, oil lamps, braziers and torches at night;
daylight and moonlight cut into bars by lattice windows in the day. Faces are carved out of deep
shadow from the side and from behind. Smoke and dust hang in every shaft of light. Colour is
earthy and desaturated: ochre, umber, soot, cold steel blue. Texture is real: worn fabric, rusted
armour, weathered wood, wet stone. It is the `low-key` look moved into the past, so read
`cinematography-low-key.md` too (staging against the source, the reverse-angle flip, negative
space).

The mechanics shared by every preset (the fields, the gates, where the phrases land, the
character-sheet exception) are in `cinematography.md`. Pair it with `register: 古装` for the lines.

## 1. Light — only fire and the sky — `light.source`, `light.direction`

Every cut names its source in `light.source`, carried verbatim in the frame with `low-key firelit
period lighting`. **No electric light exists** (gated).

| time / place | the source | what it gives |
| --- | --- | --- |
| night, study or bedchamber | one or two candles, an oil lamp | a small warm pool, the face half in it, the room lost in black |
| night, hall or prison | braziers, wall torches | flickering orange from below the eyeline of standing people, moving shadows |
| night, outside | moonlight, a lantern carried by hand | cold blue rim, a warm moving key |
| day, interior | daylight through lattice windows or paper screens | bars and patterns of light across faces and floors |
| day, exterior | overcast sky, low winter sun, haze | flat grey world, faces modelled by the low sun from the side |
| battle, market, road | fire, smoke, dust, rain | backlit silhouettes, light shafts through smoke |

- **Stage the person beside the flame or the window**, then choose the camera side that makes it
  a side light or a back light. At least **half** the cuts with people are `side-*` / `back-*` /
  `backlight` (gated). The reverse angle flips the same candle from key to rim.
- **Never on a face**: `frontal` and `ambient` (gated). `underlight` is allowed, because a candle
  on a low table really does light from below: use it for menace, sparingly.
- **Flicker is part of the light.** Say it in `light.note` ("the candle flame sways and the light
  on his cheek breathes with it").
- **Lattice light** (窗棂光影) is the day signature: the window's pattern thrown across a face,
  a floor, a hand.
- **Scene lighting states** contain `low-key firelit period lighting` and the sources:
  > `low-key firelit period lighting: a single oil lamp on the low desk and two candles by the scroll rack are the only light, a warm pool over the desk and the floor mat, the lattice windows dark blue with moonlight, smoke from the incense burner drifting through the lamplight, the corners of the study falling into black. Empty room, no people.`

## 2. Colour and texture — earth, soot, steel

- **Palette**: ochre, umber, dark wood, soot black, bone, dried-blood red, cold steel blue for
  night and armour. Saturated colour is rare, and so it means something: one red robe, one gold
  seal.
- **Grade**: desaturated, contrasty but not crushed, warm firelight against cold night.
- **Texture is realism**: frayed hems, stains, repaired armour, mud on boots, cracked lacquer,
  wet stone, rough hemp. Put it in the character and scene bibles; with `style: photoreal` the
  sheet negative-prompt rules still apply (realism comes from materials and wear, not banned skin
  words).
- **The air carries the light**: smoke, incense, dust, breath in the cold, rain. It turns every
  source into a visible shaft. Make it an anchor of the scene.

## 3. Composition — vast wides with 留白, power and threat

### 全景 / 大全景 with 大量留白 (gated)

As in `costume-idol`, **every segment has at least one `wide` or `extreme-wide` cut, and its
frame says where the `negative space` is** (gated). Here the empty space is heavy, not airy: the
world is vast and indifferent, and the people in it are small against power, war and history.

- **What fills the negative space**: darkness (a black throne hall with one pool of candlelight,
  a night sky over the city wall), smoke and dust (a burning city, a battlefield after the fight,
  a desert road in haze), grey sky and snow (a frozen river, an execution ground, the palace
  square under a winter overcast), rain (the courtyard lit by one lantern).
- **The figure is small and alone**: a lone rider on the ridge, a minister kneeling in the middle
  of the empty square, the prisoner in a pool of torchlight in a huge dark hall, two swordsmen
  facing each other across a bamboo forest in mist. In 9:16, the figure low in the frame under
  the dark or the sky, or at the far end of a long axis (a corridor, a stair, a city gate).
- **Place the wide deliberately**: to open a scene (the scale of the palace, the army, the
  wilderness), to show who holds power (the throne at the far end of the hall), and after a
  blow (the character left alone in the vast space).
- Write it: `extreme wide shot, a lone kneeling figure small in the lower third of the empty
  palace square, the vast negative space of grey winter sky and falling snow above, two braziers
  burning at the foot of the steps`.
- A wide still needs depth: a banner, a spear, a lattice or a flame soft in the foreground, the
  palace roofs or the ridge line fading into haze behind.

### Power and threat

- **Negative space is darkness and threat** in the closer shots too: the empty throne, the dark
  doorway behind the listener.
- **Power by height and position**: the emperor high and centred, the minister low and off-axis;
  `height: low` for the one who holds power, `high` for the one who has lost it.
- **Foregrounds**: lattice screens, candle flames, bead curtains, the edge of a folding screen,
  spears and banners, a shoulder in armour. At least half the cuts (gated). Shooting *through*
  screens is the intrigue genre: someone is always watching.
- **Silhouettes** against a lit doorway or a burning city are allowed and strong.

## 4. Lens

| shot | focal | stop |
| --- | --- | --- |
| candlelit close-up | 75–85mm | T1.5 |
| two people at a desk, OTS | 50–75mm | T1.5–T2 |
| hall, court, courtyard | 25–35mm | T2–T2.8 |
| battle / road wide | 18–25mm | T2.8 |

Nothing slower than T2.8 (gated). Candlelight needs the wide aperture, and so does the look.

## 5. Camera and motion

- Controlled: `Static Shot` for audiences and interrogations, slow `Push In` as a threat lands,
  slow `Truck Left` / `Truck Right` along a line of kneeling officials. `Shake Slightly` only in battle and chases.
- **Motion lives in the light and the air**: flames sway, smoke drifts, rain falls through
  torchlight, a curtain moves in a draught. A lock-off is never dead.
- Violence is shown by consequence and sound more than by choreography the model cannot perform
  (see craft-shots §7).
- Sound: fire crackle, wind, rain on tiles, armour creaking, distant drums, and silence in the
  court before a verdict.

## 6. Review questions

- Is there any light in this frame that needs electricity?
- Can you point at the flame or the window lighting the face? Is the face half in darkness?
- Is there smoke, dust or rain to make the light visible?
- Does the texture look used — frayed, stained, weathered — or costume-new?
- Who holds power in this frame, and does the composition say so?
