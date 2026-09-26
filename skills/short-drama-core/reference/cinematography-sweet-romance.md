# Cinematography preset `sweet-romance` — 甜宠 · 韩风唯美 · 浪漫

The look: **bright, soft, flattering light on the faces with a warm halo behind the hair; a
pastel, low-contrast picture with creamy highlights and a dreamy glow; two people framed so that
the space between them tells the story; shot wide open into creamy bokeh.** It is the modern
idol-romance look: the screen should feel like a warm afternoon even when the scene is sad.

The mechanics shared by every preset (the fields, the gates, where the phrases land, the
character-sheet exception) are in `cinematography.md`.

## 1. Light — soft sources, a lit face, a halo — `light.source`, `light.direction`

Every cut names a **soft, motivated source** in `light.source`, carried verbatim in the frame
along with `soft romantic lighting`. Big and soft beats small and hard:

| time / place | the source | what it gives |
| --- | --- | --- |
| day interior | a big window, sheer curtains | soft wrap on the face, bright background that blooms |
| golden hour (the signature) | the low sun behind the couple | warm rim and halo in the hair, lens flare, glowing air |
| overcast / snow day | the whole sky, snow bounce | even, luminous, clean skin, cool-white with warm accents |
| blue hour, rooftop or riverside | the sky + warm string lights / street lamps | cool background, warm faces, bokeh balls |
| night interior (café, apartment) | warm lamps, fairy lights, candles on the table | a warm pool around the couple, the room a soft glow |
| rainy night | shop windows and signs through wet glass | coloured bokeh, a warm key from the umbrella side |

- **The face is lit and pretty.** Key the face soft from the front three-quarter (`front-left` /
  `front-right`, 前侧柔光), or put the source behind and let the bounce fill the face (`back-*` /
  `backlight`, 逆光). At least **half** the cuts with people use one of these (gated).
- **Always look for the halo.** The source behind the person, lighting the edges of the hair and
  shoulders, is the single strongest romance cue. Stage people with the window or the sun behind
  them, and write it in `light.note` ("the low sun behind her turns the loose strands of her hair
  gold; her face is lit softly by the bounce off the white table").
- **Shadows are soft and open, never black.** Lift the shadow side ("the shadow side of his face
  stays soft and open"). A half-lit, half-black face is the thriller look.
- **Never on a face**: `underlight` (底光) and `top` (顶光). Both carve eye sockets and chins
  (gated). `side-*` (侧光) is allowed but not in the preferred half: a hard split reads as moody.
  Use it for a sad beat, not a sweet one.
- **Scene lighting states** (stage 3) contain `soft romantic lighting`, name the sources, and
  describe the glow:
  > `soft romantic lighting: warm late-afternoon sun pouring through the tall café windows behind the counter, sheer curtains diffusing it into a soft glow, warm pendant bulbs lit above the tables, the room bright and airy with gentle open shadows, dust motes floating in the sunbeams. Empty scene, no people.`

## 2. Colour — pastel, warm, low contrast

Colour is written into the scene lighting states and the frames, because the video model grades
from what it is told.

- **Palette**: cream, peach, blush pink, butter yellow, sky blue, mint, soft lavender. Warm whites,
  never clinical.
- **Grade**: low contrast, lifted blacks, creamy (not clipped) highlights, warm-peach skin, a
  slight glow around bright edges (halation). Say it in the frame: `pastel palette, creamy
  highlights, lifted soft shadows, gentle glow`.
- **The couple is colour-coordinated.** Give the two leads complementary wardrobe palettes in the
  character bibles (her blush and cream, his camel and soft blue), so every two-shot is
  harmonious. The pair's palettes converge in the episodes where they become a couple.
- **One colour per scene** in the scene bible: the café is cream and wood, the rooftop is blue
  hour with warm bulbs, the park is cherry-blossom pink, the snow scene is white-blue with warm
  lamps. A scene should be recognisable from its colour alone.
- Seasons and weather are romance tools: falling petals, first snow, light rain under one
  umbrella, autumn leaves, sunbeams with dust. Put them in the scene anchors, so they appear
  in every generation, and in `motion` when they move.

## 3. Composition — the distance between two people

**The space between the two leads is the story.** Use it deliberately across the drama:

| stage of the relationship | how the two-shot is built |
| --- | --- |
| strangers / enemies | far apart in the frame, often separated by something: a door frame, a pillar, a glass wall, a table |
| noticing (心动 starts) | still apart, but they share the frame, and their eyelines meet across the empty space |
| closer (暧昧) | the gap narrows, over-the-shoulder singles with the other's shoulder soft in the foreground |
| together | they share one side of the frame; the negative space is now the world around them, not between them |

- **Negative space is air, not darkness.** In this look the empty part of the frame is bright:
  sky, a sunlit window, a blossom-filled park. A small couple low in a 9:16 frame under a big sky
  reads as 浪漫, not lonely.
- **The 心动 close-up is centred and clean.** It is the one shot where symmetry and a centred
  face are right: the audience falls for the face with the character.
- **Over-the-shoulder is the dialogue workhorse.** The other person's shoulder or hair is the soft
  foreground, which keeps both people in every line.
- **Foregrounds are pretty things, thrown out of focus**: flowers on the café table, fairy
  lights, falling petals or snow near the lens, rain on the glass, a curtain edge, the rim of a
  cup. At least half the cuts have one (gated). Aim for most.
- **Frame within a frame**: a window, a doorway, the space under an umbrella. It gives the couple
  a small private world.
- **Inserts are romance beats**: fingers almost touching, a hand on a sleeve, the shared
  umbrella handle, two cups side by side. A 2-second `extreme-close` on hands does more than a
  line of dialogue.

## 4. Lens — long, fully open, the dreamiest bokeh

`init` gives this preset a faster package: `Zeiss Master Prime` at **T1.3** (the body stays the
default). Nothing is slower than **T2** (gated), so even the wides stay soft behind the couple.

| shot | focal | stop | why |
| --- | --- | --- | --- |
| the 心动 close-up / eye-lock | 85mm (or 100mm) | T1.3 | the face alone, the background dissolved into huge soft discs |
| over-the-shoulder singles | 75–85mm | T1.3 | the near shoulder melts, the face stays crisp |
| two-shot, medium | 50mm | T1.3–T1.5 | both faces sharp, the room turns to glow |
| couple in the place (wide) | 35mm | T2 | the season and the setting read, the lights behind still bloom |
| hands / object insert | 100mm macro | T1.5–T2 | one sliver of focus |

### The dreamiest bokeh (最梦幻的散景)

A fast stop alone does not make dreamy bokeh; the frame has to give the lens **points of light to
dissolve**. At least **half** the frames of a segment say what melts into bokeh (gated: the word
`bokeh` in the frame). To get the biggest, creamiest discs:

- **Put lights behind the subject, far away**: string lights, lanterns, candles, city lights,
  car tail lights in the rain, sun glinting through leaves, sparkles on water, Christmas trees.
  The farther they are behind the person, the bigger the discs.
- **Go long and close**: 85mm or 100mm, the subject near the lens. Long focal + close subject +
  far background is what turns each light into a large soft circle.
- **Bokeh in front too**: fairy lights, flowers, petals or snow right in front of the lens,
  becoming soft glowing shapes across the edge of the frame.
- **Name it in the frame**, with its colour: `the warm string lights behind her melting into
  oversized creamy golden bokeh`, `snowflakes near the lens drifting as soft white bokeh`.
- Put a diffusion filter in `params.lookPhrase` for extra glow (`soft black pro-mist diffusion,
  gentle halation`). Every segment prompt then carries it.

## 5. Camera and motion — slow, floating, lingering

The camera is gentle: slow `Push In` on a realisation, a slow `Arc Shot` circling the couple at a
confession or a kiss, a floating `Tracking Shot` walking beside them, `Static Shot` for the
lingering look. No `Shake`, no fast moves. `cameraNote.motivation` is usually `relationship` or
`stillness`.

- **Slow motion on the 心动 beat.** Write it in the cut's `motion` and `cameraNote`
  ("in slow motion, her hair lifts in the breeze as she turns"). The video model understands
  `slow motion`; one or two slow-motion cuts per episode, on the beats that matter.
- **Ambient motion makes it breathe**: hair and scarves in a breeze, petals or snow drifting,
  curtains moving, steam from the cups, bokeh lights twinkling. Put it in `cameraNote.hold` on a
  lock-off, so the frame is never dead still.
- **Hold the look.** Romance lives in the extra second: let the eye-lock cut run to the upper end
  of `maxCutSeconds`.

## 6. The 甜宠 set pieces — how to shoot them

The genre's recurring moments (撒糖 beats) are where this look pays off. Each is a short sequence
of cuts. Mark them as `turn` beats; when one is the episode's 爽点, its scene gets the seeded
`visualPlan` — fill it with the sequence below.

| moment | the cuts | light and camera | sound |
| --- | --- | --- | --- |
| 心动对视 (the eye-lock) | her CU → his CU → back to her, tighter | 85mm T1.5, halo behind each, slow `Push In`, slow motion on the last cut | music `enter` on the last cut |
| 回眸 (the look back) | wide of her walking away → MS as she turns → CU of her smile | backlight from the sun ahead of her, hair in the wind, slow motion on the turn | music `swell` |
| 意外靠近 (falls into arms / too close) | MS stumble → two-shot, faces inches apart → alternating ECUs of eyes | soft front key on both faces, `Static Shot`, hold longer than feels safe | music `silence`, a heartbeat sfx if wanted |
| 共伞 (one umbrella in the rain) | wide of rain and warm shop lights → MS two-shot under the umbrella → insert of the hand on the handle | warm shop windows as key, rain lit from behind as bokeh | rain on the umbrella (sfx), music `enter` |
| 披外套 / 围巾 (the coat or scarf) | MS as he drapes it → CU of her reaction → insert of hands on the collar | soft window or street lamp, 3/4 front key | music continues |
| 摸头杀 (hand on her head) | OTS from behind her → CU of her face as the hand lands → his smile | halo behind him, soft front on her | music `silence` as the hand lands |
| 壁咚 / 近距离对峙 | low two-shot against the wall → CU her → CU him | soft front three-quarter key, never top light, background soft | music `drop` |
| 公主抱 (the carry) | wide as he lifts her → MS walking toward camera → CU her looking up at him | backlight from the corridor or the sun, slow `Tracking Shot` backwards | music `swell` |
| 告白 / 初吻 (the confession) | two-shot apart → the gap closes → slow `Arc Shot` around them | golden hour or string lights, flare, slow motion | music `silence` on the line, `swell` as the gap closes |

Sound is part of the look. The OST is the segment's `sound.music` with cues (`enter`, `swell`,
`duck`, `drop`, `silence`, `out`) placed on the cut: it comes in or swells on the 心动 cut, and
goes to `silence` just before a confession so the line lands in a hush.

## 7. Cast, wardrobe and sets (for the bibles)

- **Character bibles**: clean, styled, soft-textured wardrobe (knitwear, trench coats, shirts,
  pastel dresses), neat hair with some movement, the pair's coordinated palettes. Styling is part
  of the fantasy. With `style: photoreal` the negative-prompt rules in stage-characters still
  apply; flattering comes from the light, not from banned skin words.
- **Scenes that suit the genre**: a sunlit café, a rooftop at blue hour, a riverside walk at
  night, a convenience store at night (warm, not grim), a library by the window, a park in
  blossom or snow, a bus stop in the rain, the male lead's clean minimal apartment. Give each one
  a colour (§2) and a soft source (§1) in its lighting states.

## 8. Review questions

- Is the face lit, soft and pretty in every cut with a person? Is there a halo in the hair?
- Could you name the source (window, sun, string lights)? Is it big and soft?
- What colour is this scene? Would you recognise it from a thumbnail?
- Where are the two people in the frame, and is that distance the right one for this episode?
- Is there something pretty and blurred in front of the lens?
- On the 心动 beat: does the camera slow down, does the music come in, does the cut linger?
