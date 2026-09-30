# Visual styles — 13 looks for ads

One style per campaign, chosen from the brief's industry and tone and written into every prompt
so the KV, the stills and the clips agree. Each row names the visual signifiers, the lighting
preset it borrows from `reference/product-photography.md`, the phrases to write, and the tone
of the CTA that fits. Nothing here names a real brand's look; describe the style, never a
competitor's ad.

## The styles

| Style | Visual signifiers | Light preset | Prompt phrases | CTA tone |
| --- | --- | --- | --- | --- |
| Minimal (極簡) | negative space, one product, neutral sweep, thin type, nothing moves fast | large softbox or high-key | `minimal composition, generous negative space, single product, neutral seamless background, soft shadow, quiet` | short, lower-case, one verb: "Try it." |
| Luxury (奢華) | low-key black, jewel tones, marble or dark stone, gold accents, serif type, slow motion | low-key + rim | `low-key luxury lighting, black gradient, marble surface, gold rim highlights, rich shadows, slow deliberate camera` | restrained, no discount: "Discover the collection" |
| Retail-loud (促銷) | saturated brand colours, big percentage type, bursts and badges, hard light, fast cuts | hard light | `bold saturated brand colour background, hard direct light, punchy contrast, high energy, graphic` | urgent, numeric: "40 % off. Ends Sunday." |
| Lifestyle (生活感) | real rooms and streets, window or golden-hour light, candid people, hands, imperfect framing | softbox window light (natural) | `lifestyle photo, natural window light, candid moment, shallow depth of field, warm and lived-in` | conversational: "Made for mornings like this" |
| Tech (科技) | dark background, neon edge light, glass and brushed metal, particles, HUD lines, orbiting camera | strip lights + low-key | `dark studio, cyan and magenta edge lighting, glass and brushed metal, floating particles, slow orbit camera` | precise, feature-led: "Meet the new X" |
| Food (食品) | warm backlight, steam, drips, glistening surfaces, macro, shallow depth, wood and linen | rim / backlight + softbox | `warm backlit food shot, rising steam, glossy surface, macro detail, shallow focus, wooden table` | appetite verbs: "Taste it hot" |
| Beauty (美妝) | clamshell light, dewy skin, water droplets, product swatches, pastel and skin-tone palette | clamshell | `clamshell beauty lighting, dewy luminous skin, water droplets, soft pastel palette, swatch of the product texture` | promise-led, gentle: "Glow by morning" |
| Fashion (時裝) | editorial pose, hard flash, colour block, fabric in motion, off-centre crop | hard light | `editorial fashion shot, hard on-camera flash look, colour-block background, fabric mid-motion, bold crop` | terse, imperative: "Wear it now" |
| Automotive (汽車) | wet asphalt, dusk or tunnel light, long strip reflections down the body, low tracking camera | strip lights + low-key | `car on wet asphalt at dusk, tunnel light streaks along the bodywork, low tracking camera, cinematic teal-orange` | aspirational, one line: "Drive further" |
| Real estate (房地產) | 16–24 mm interiors, verticals corrected, HDR balance of window and room, twilight exteriors | high-key interior, natural | `wide 24 mm interior, verticals straight, balanced window and room exposure, twilight exterior with warm windows` | invitation: "Book a viewing" |
| App / SaaS (應用 / 軟體) | device mockups, cursor and tap animation, brand gradient, kinetic type, flat clean UI | high-key or gradient sweep | `phone mockup floating on a brand gradient, clean UI on screen, soft shadow, kinetic typography space around it` | outcome + free: "Start free" |
| Festive (節慶) | seasonal props, warm bokeh lights, gold and red or snow and blue, wrapped gifts | softbox + warm practicals | `festive scene, warm bokeh string lights, seasonal props, gift wrapping, cosy warm grade` | gifting: "Gift the good stuff" |
| Black Friday (黑五) | black background, neon or acid accents, glitch and scan lines, countdown numerals, bold percentage type | hard light + neon rim | `black background, neon accent rim light, glitch texture, bold oversized sale typography space, high contrast` | countdown, urgency: "24 hours. 50 % off." |

## Choosing by industry

| Industry | First choice | Second choice | Avoid |
| --- | --- | --- | --- |
| Beverage, snacks | Food | Lifestyle, Retail-loud | Luxury unless premium spirits |
| Skincare, cosmetics | Beauty | Minimal, Luxury | Retail-loud (cheapens the product) |
| Fashion, footwear | Fashion | Lifestyle, Minimal | Tech |
| Consumer electronics | Tech | Minimal | Food, Festive |
| Software, apps | App / SaaS | Minimal | Luxury |
| Cars, e-bikes | Automotive | Tech | Retail-loud except clearance |
| Property | Real estate | Luxury (high-end) | Everything else |
| Jewellery, watches, spirits | Luxury | Minimal | Lifestyle unless aspirational |
| Supermarket, e-commerce promo | Retail-loud | Black Friday (seasonal) | Minimal |
| Seasonal campaign, any category | Festive | the category's first choice | — |
| Home, furniture, wellness | Lifestyle | Minimal | Tech |

## Style in motion (video clips)

The same style decides how the camera and the cut behave; write the motion clause of a clip
prompt from this table and keep it constant through the ad.

| Style | Camera | Cut rhythm | Motion phrases |
| --- | --- | --- | --- |
| Minimal, Luxury, Beauty | slow push or slow orbit, locked horizon | 4–8 s per clip | `slow push in`, `slow orbit`, `camera locked, only the light moves` |
| Retail-loud, Black Friday, Fashion | whip pans, snap zooms, hard cuts | 1–3 s per clip | `fast whip pan`, `snap zoom onto the product`, `hard cut` |
| Lifestyle, Food, Festive | handheld drift, rack focus, natural pace | 3–5 s | `gentle handheld drift`, `rack focus from the hand to the product` |
| Tech, Automotive | orbit, low tracking, reveal from dark | 3–6 s | `low tracking shot`, `orbit with edge light sweeping across the surface`, `reveal from darkness` |
| Real estate, App / SaaS | slow glide, dolly through a door, screen-locked mockup | 4–6 s | `slow glide forward`, `dolly through the doorway`, `tap animation on the screen` |

Clip lengths above are planning values; the accepted ranges per model are in
`reference/models.md`.

## Applying a style

- Write the style's phrases in **every** prompt of the campaign: KV, stills, clips. A style that
  appears in the KV and not in the clips reads as two campaigns.
- The style sets light, background, palette and type feeling. It never changes the product: the
  packshot reference and the identity clause in `reference/ai-consistency.md` stay in force.
- Two styles in one ad is a mistake except the deliberate before / after (a Lifestyle "before"
  cut to a Minimal "after").
- Brand colours from the brief override the style's palette: a Tech look in a brand's orange is
  `orange edge lighting`, not cyan.
- Match the CTA tone column to the copy on the end card; a Luxury visual with "BUY NOW!!!" on
  the card is the most common mismatch.
