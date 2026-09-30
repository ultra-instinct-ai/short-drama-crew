# Product photography — lighting, shots, backgrounds, camera, grade

The studio vocabulary (棚拍語彙) an image or video model understands, organised as the parts of
a prompt: lighting setup, shot type, background, camera and lens, colour grade. Each row gives
the look, what it is for, and the phrase to write. The style presets in `reference/styles.md`
pick from these tables; `reference/ai-consistency.md` says how to keep the product identical
between shots.

## Lighting setups (布光)

| Setup | Look | Use for | Prompt phrase |
| --- | --- | --- | --- |
| Three-point (三點光) | key from 45°, fill opposite at half power, back light on the edge; even, dimensional, "catalogue" | any product, safe default | `three-point studio lighting, soft key from upper left, gentle fill, thin rim light separating the product from the background` |
| Large softbox (柔光箱) | wrap-around soft light, broad soft highlight, faint shadow; closer = softer | packaging, skincare, food, anything matte | `single large softbox close above and to the left, soft wrap-around light, one soft highlight, faint shadow` |
| Rim / backlight (輪廓光 / 逆光) | bright edges, dark centre, glow through liquid | glass, bottles, dark products, anything translucent | `strong backlight through the bottle, glowing rim light on both edges, dark background, no front fill` |
| Clamshell (蚌殼光) | key above, reflector below, nearly shadow-free, luminous | cosmetics, jewellery, beauty, faces | `clamshell beauty lighting, soft light from above and below, shadowless, dewy highlights` |
| High-key (高調) | white background lit to pure white, few shadows, airy | pharmacy, tech accessories, e-commerce packshots | `high-key lighting, pure white seamless background, minimal shadow, bright and clean` |
| Low-key (低調) | one key at 45°, deep shadow, product carved out of black; premium | spirits, watches, luxury, automotive | `low-key lighting, single hard key from the right, deep black shadows, product emerging from darkness` |
| Hard light (硬光) | small source, crisp shadows, graphic, punchy | fashion, streetwear, retail-loud, editorial | `hard direct light, sharp-edged shadow cast on the wall, high contrast, graphic` |
| Strip lights (條形光) | long thin highlights that follow the product's curve; gradient reflections | gloss and metal: cans, bottles, cars, phones | `two vertical strip lights either side, long gradient highlights along the glossy surface, controlled reflections` |

Combine at most two (rim + softbox is the standard bottle setup). Name the *direction* and the
*result on the product* ("soft highlight on the shoulder of the bottle"), not the equipment
brand; the model renders results, not gear.

## Shot types (景別 / 拍法)

| Shot | What it shows | Use for | Prompt phrase |
| --- | --- | --- | --- |
| Packshot (產品照) | the product alone, label to camera, on white / neutral, eye-level, f/8–f/11 sharpness edge to edge | identity reference, e-commerce, end card | `clean product packshot, front label facing camera, centred, white seamless background, evenly lit, sharp throughout` |
| Hero (主視覺照) | low angle, dramatic light, product as monument | KV, poster, TVC end frame | `hero shot from a low angle, product towering, dramatic rim light, dark gradient background` |
| Lifestyle (情境照) | product in use in a real setting, natural light, shallow depth | social, feed, testimonial stills | `lifestyle photo, product held at a sunlit kitchen counter, window light, shallow depth of field, candid` |
| Flat lay (平鋪) | top-down, product with props arranged on a surface | cosmetics, food, stationery, social | `flat lay, top-down view, product centred among a few props on linen, soft even light` |
| Macro (微距) | texture, condensation, fabric weave, a logo emboss | hooks, cut-aways, quality proof | `extreme macro, 100 mm macro lens, condensation droplets on the label, shallow focus` |
| In-hand (手持) | a hand holding or opening the product; scale and use | UGC, demo, app / device | `product held in one hand at chest height, natural skin, hand steady, label readable` |
| Floating (懸浮) | product suspended, slight tilt, ingredients or parts orbiting | tech, beauty, food | `product floating in mid-air, slight tilt, soft shadow beneath, ingredients suspended around it` |
| Splash / freeze (潑濺) | liquid frozen mid-air around the product | drinks, skincare, cleaning | `high-speed splash, liquid frozen mid-air around the bottle, backlit droplets, dark background` |
| Knolling (整齊排列) | items laid out at right angles, grid-like | kits, sets, tools, fashion | `knolling arrangement, every item at right angles on a plain surface, top-down, even light` |
| 360 turntable (轉台) | a video move: the product rotating a full turn on a plinth | demo clip, e-commerce spin | video prompt: `product on a turntable rotating slowly through 360 degrees, camera locked, studio light constant` |

## Backgrounds (背景)

| Background | Reads as | Phrase |
| --- | --- | --- |
| Seamless white / grey (無縫背景紙) | e-commerce, clean | `white seamless sweep` / `mid-grey seamless backdrop` |
| Gradient | studio, premium | `smooth dark-to-charcoal gradient background` |
| Brand-colour sweep | campaign, retail | `seamless backdrop in the brand colour #hex, no texture` |
| Acrylic / reflective | tech, beauty, luxury | `product standing on black acrylic with a soft mirror reflection` |
| Podium / plinth (展台) | luxury, skincare | `on a round stone podium, one step, soft shadow` |
| Textured natural | food, wellness, craft | `on rough slate` / `on washed linen` / `at the edge of still water` |
| Environment | lifestyle | name the room, the time of day and the light source |

## Camera and lens language

| Choice | Effect | Phrase |
| --- | --- | --- |
| 85 mm | compression, flattering, no distortion; the packshot lens | `85 mm lens` |
| 100 mm macro | detail and texture | `100 mm macro lens` |
| 35 mm | environment visible, lifestyle | `35 mm lens, environment in frame` |
| 16–24 mm | interiors, real estate; keep verticals straight | `24 mm lens, verticals corrected` |
| f/8–f/11 | packshot sharpness, every letter readable | `f/11, sharp front to back` |
| f/2.8 or wider | lifestyle, isolates the product | `f/2.8, background softly out of focus` |
| Eye level | neutral, catalogue | `eye-level camera` |
| 45° down | shows the top and the front; food, flat objects | `camera at 45 degrees looking down` |
| Low hero | authority, scale | `low-angle camera, slightly below the product base` |

## Colour-grading vocabulary (調色)

| Grade | Reads as | Phrase |
| --- | --- | --- |
| Clean neutral | true product colour, e-commerce | `neutral colour balance, accurate product colours, no colour cast` |
| Warm golden | comfort, food, lifestyle | `warm golden grade, soft highlights` |
| Teal-orange | cinematic, tech, automotive | `teal and orange cinematic grade` |
| High-contrast editorial | fashion, retail-loud | `high-contrast editorial grade, deep blacks, crisp whites` |
| Pastel matte | beauty, wellness, festive | `pastel matte grade, lifted blacks, soft saturation` |
| Desaturated luxury | spirits, watches, premium | `desaturated luxury grade, muted tones, rich blacks` |

Always end the grade line with the product exception: "product colours stay exact".

## The prompt template

Write in this order; each slot is one clause. Skip a slot only when the reference image already
fixes it.

```
[subject: product, exact state, label to camera] →
[shot type] → [lighting setup, direction, result on the product] →
[background] → [camera: lens, aperture, height] → [grade] →
[constraints: keep label / shape / colour exactly as @image1; no text; no extra objects]
```

### Worked examples

**Bottled oolong tea** (packshot reference `@image1`, KV at 4:5, 2K)

`A chilled glass bottle of oolong tea exactly as in @image1, label facing camera, beads of
condensation on the glass. Hero shot from a slightly low angle. Strong backlight glowing through
the amber tea, thin rim light on both edges, one small soft highlight on the shoulder. Dark
teal-to-black gradient background, faint mist at the base. 85 mm lens, f/8, product sharp
throughout. Cool clean grade with the tea's amber kept exact. Keep the label text, bottle shape
and cap colour exactly as the reference; no added text; nothing else in frame; upper third
empty for a headline.`

**Trail sneaker** (packshot `@image1`, lifestyle still at 16:9)

`The sneaker exactly as in @image1, worn on a right foot mid-stride on wet asphalt at dusk.
Low-angle lifestyle shot, 35 mm lens, f/2.8, the shoe sharp and the street softly blurred.
Hard low sun from behind the shoe as rim light, cool ambient fill, small splash of water from
the heel frozen mid-air. Teal and orange cinematic grade; the shoe's colours and logo placement
stay exact. No text, no other people in focus.`

**Skincare jar** (packshot `@image1`, KV at 1:1, 2K)

`The cream jar exactly as in @image1 on a round pale-stone podium, lid off and leaning against
the jar, a smooth swirl of cream visible. Clamshell beauty lighting, soft light from above and
below, nearly shadowless, dewy highlights on the glass. Warm off-white seamless background with
a single soft petal-pink shadow. 85 mm lens, f/11, eye-level. Pastel matte grade, jar and label
colours exact. Keep the label, jar shape and lid finish exactly as the reference; no text; no
hands.`
