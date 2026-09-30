# Product identity across AI generations

How to make the same product appear in every still and clip of a campaign: which image is the
reference, what the prompt must say, what must never be generated, how to check the output, and
how stills and clips stay continuous. Model reference caps and text strengths are in
`reference/models.md`; the shot vocabulary in `reference/product-photography.md`.

## The identity rule

1. **One approved packshot is the identity.** Photographed or generated once on a clean
   background (transparent where possible), label to camera, approved by the client. It is the
   first reference (`@image1`) of every later generation: KV, variant, still, clip.
2. **Say it in words as well.** Every prompt carries the clause: *"keep the label, shape and
   colour exactly as @image1"* (or the model's own phrasing: "while maintaining the product
   exactly as in the reference"). References anchor the look; the clause stops drift.
3. **Additional references come after the product.** Set, props, a hand model, a colour swatch:
   `@image2` onward. Name each in the prompt ("the bottle from @image1 on the tray from @image2").
   Do not exceed the model's cap; if a scene needs more, generate the set first and use that
   result as one reference.
4. **Edit, do not regenerate, once approved.** A background swap or a colour change on an
   approved KV goes through an edit-style model with the KV as `@image1`, so the product pixels
   are carried over rather than re-imagined.
5. **A second product angle is a second packshot.** If the ad shows the back label or the cap
   open, generate and approve that view once, then reference it; do not ask a scene generation to
   invent the back of the pack.

## What never to generate

| Never in the picture | Because | Do instead |
| --- | --- | --- |
| Legal text, small print, ingredients, warnings, prices, terms | garbled letters, wrong numbers; a legal exposure | overlay the approved text in the edit |
| The real logo re-drawn by the model | logo drift: wrong kerning, weight, colour | keep the supplied logo file; place it as an overlay; on a packshot rely on `@image1` and check every output |
| Awards, certifications, seals, star ratings | fabricated endorsement | overlay only what the client can prove |
| Competitor packs, real people who did not consent, other brands' marks | rights and comparison-advertising rules | describe generic "other bottles, unbranded" |
| Screens with readable UI, QR codes, phone numbers | unreadable or wrong | overlay a real screenshot or code |
| Before / after results the product cannot deliver | a misleading depiction, see `reference/compliance.md` | show use and feel, not fabricated results |

Headlines generated in-frame are allowed as a **layout draft** only; the approved copy is
overlaid afterwards.

## Artefact checklist (每張都查)

Check every output before it becomes a reference or a deliverable:

- Label: every word spelt as on the packshot; no extra characters; no mirrored text.
- Shape: proportions, cap, neck, corners, count of segments (a 6-pack is six).
- Colour: brand colours against the hex in the brief; the product not tinted by the grade.
- Logo: placement, size and colour identical to the reference; no second logo.
- Hands: five fingers, natural grip, the hand does not merge with the pack.
- Physics: liquid level, condensation, reflections and shadows consistent with the light
  direction; the product does not float unless the shot is "floating".
- Impossible behaviour: the pack does not open where it cannot, pour from the wrong end, change
  size between frames.
- Background: no stray objects, no invented brand names on props, no text in the set.
- Crop margin: 10 % around the product so the placement crops never cut it.
- For video: the label stays readable through the move; no morphing in the last second; the
  product enters and exits the way the still implies.

One failed line means regenerate or edit; a "nearly right" pack is the most expensive thing to
ship.

## A/B variant discipline (變體只改一處)

A variant tests one thing. Change exactly one of: the hook (first 3 s or the KV's concept), the
headline, the CTA, the background / setting, the model of person, the colour way, the music.
Everything else, including the seed of the stills where the model exposes one, stays the same.
Label variants by what changed ("hook B: condensation macro") so results can be read. Three
hook variants and one CTA variant is a normal first round; ten variants that each change three
things teach nothing.

## Keyframe → clip continuity

A clip is generated from an approved still (the keyframe) with the packshot as reference, so the
still, not the prompt, carries the product. Keep these constant within a scene:

| Keep the same | How |
| --- | --- |
| Light direction and quality | the same lighting clause in the still prompt and the clip prompt ("soft key from upper left, rim from behind") |
| Lens and height | the same camera clause; a 35 mm still cannot become an 85 mm clip |
| Seed, where the model has one | reuse the still's seed for sibling stills of the same scene (wan-3.0 and seedance expose `seed`) |
| Product state | lid on / off, liquid level, condensation: the still fixes it; the clip prompt repeats it |
| Palette and grade | the grade clause verbatim |
| The end state | for first-and-last-frame models, the end still is generated from the start still with the same references |

Write the clip prompt as *motion only*: what moves, how fast, where the camera goes. Do not
re-describe the scene the still already shows, and never ask for a second beat ("then it cuts
to…"): one clip, one action, one camera idea.

## How many stills per clip

| Clip | Stills to approve first | Why |
| --- | --- | --- |
| Product static, camera moves (push, orbit, turntable) | 1 (start) | the model only has to move the camera |
| Product handled, poured, opened | 2 (start and end state) | first-and-last-frame generation locks both states; the pack cannot drift in between |
| Person + product, action beat | 2 | the end frame stops hands and pack morphing |
| Before / after in one clip | 2, and a reference of each state | the change is the story; both ends must be approved |
| Hook macro (condensation, splash) | 1, plus 1–2 texture references | the reference carries the surface detail |
| End card | 0; it is an image with overlay text | never a clip |

A 30 s ad of five clips therefore needs roughly 6–9 approved stills before the first clip is
generated. Approve stills in one pass, then generate clips in one pass; interleaving them is how
a campaign ends up with three slightly different bottles.

## Cross-ratio versions

A second ratio (9:16 from a 16:9 master) is a regeneration, not a crop: the same stills are
regenerated at the new ratio with the packshot reference and a reframing clause ("product
centred in the middle band, headline space above"), then the clips are regenerated from the new
stills. Keep the same clip count, beats and seconds so the two versions cut to the same audio.
