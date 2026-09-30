# Video ad formats — length, structure and segment planning

Which ad format to make, how long it is, what happens in every second, and how a finished length
breaks into clips an AI video model can generate one at a time. Platform rules (a bumper over 6 s
is rejected, a skippable ad is skippable at 5 s) are marked as such; everything else here is
trade practice (廣告慣例), not a hard limit. Image deliverables are in `reference/formats-image.md`,
the per-model duration and ratio facts in `reference/models.md`.

## Formats at a glance

| Format | Length | Master ratio | Structure | Rule or practice |
| --- | --- | --- | --- | --- |
| TVC (電視廣告) | 15 / 30 / 60 s | 16:9 (cut 9:16 / 1:1 for social) | hook → setup → product / solution → brand + CTA in the last 3–5 s | practice (broadcast clocks add slate / black; not covered here) |
| YouTube bumper | ≤ 6 s, non-skippable | 16:9 | one idea; logo or product in frame throughout | platform: > 6 s is rejected |
| YouTube non-skippable | ≤ 15 s (some markets 20 s *(verify)*) | 16:9 | hook → benefit → brand → CTA | platform cap |
| YouTube skippable (TrueView) | any; 15 s – 3 min common | 16:9 | brand + hook **before the 5 s skip** → payoff → proof → end card | platform: skip button at 5 s |
| Social feed / Reels / TikTok ad | 9–34 s (TikTok 21–34 s for conversion) | 9:16 | hook 0–3 s with product on screen, proof, CTA | practice; 63 % of top-CTR TikTok ads show the product in the first 3 s |
| Product demo | 15–60 s | 16:9 or 9:16 | problem → product in use → 2–3 feature beats → result → CTA | practice |
| UGC-style (素人風) | 15–45 s | 9:16 | selfie hook → problem → product in hand → before / after → casual CTA | practice; must look native to the feed |
| Testimonial (見證) | 15–60 s | 9:16 or 16:9 | statement → problem → specific result → brand + CTA | real customers or disclosure, see `reference/compliance.md` |
| Explainer | 60–120 s, with a 30 s cut | 16:9 | problem → "meet X" → 3 steps → benefit → CTA | practice |

Meta Reels / Stories ads perform best at 15–30 s; a 6 s bumper and a 15 s non-skippable are the
only formats where the platform, not the brief, fixes the length.

## Timecode skeletons

Seconds are the *latest* point each beat may land; a beat can come earlier, never later.

| Format | 0–3 s | then | then | last seconds |
| --- | --- | --- | --- | --- |
| TVC 15 | hook, product visible | 3–8 setup / problem | 8–12 product as the answer | 12–15 brand lock-up + CTA |
| TVC 30 | hook | 3–10 setup | 10–22 product / solution in 2–3 beats | 22–27 proof or payoff, 27–30 brand + CTA |
| TVC 60 | hook | 3–15 story setup | 15–40 demonstration in 3–4 beats | 40–52 payoff, 52–60 brand line + CTA hold |
| Bumper 6 | 0–1 product in frame | 1–5 the one idea | — | 5–6 logo lock; brand never leaves frame |
| Non-skippable 15 | 0–2 hook | 2–7 benefit | 7–12 proof | 12–15 brand + CTA |
| Skippable | 0–5 brand **and** hook before the skip | 5–15 payoff of the hook | 15–30 proof, features | end card 5–20 s before the end |
| Social 9–34 | 0–3 hook + product | 3–10 problem or desire | 10–25 product in use, proof | CTA card 3 s, loop-friendly last frame |
| Demo | 0–5 the problem, plainly | 5–10 product enters | 10–40 features, one per 5–8 s | result, CTA |
| UGC | 0–3 selfie hook line | 3–8 problem | 8–20 product in hand | 20–35 before / after, casual CTA |
| Testimonial | 0–3 the claim in the person's words | 3–12 what was wrong | 12–35 the specific result | brand + CTA |
| Explainer 120 | 0–10 problem | 10–20 "meet X" | 20–75 three steps, 75–100 benefit | 100–120 CTA; the 30 s cut keeps problem, one step, CTA |

A 9:16 social cut of a TVC is not a crop: it is regenerated from the same stills at 9:16 with
the product re-centred (see `reference/ai-consistency.md`).

## The three frameworks

| Framework | Beats | Use when | Ad type |
| --- | --- | --- | --- |
| AIDA | Attention → Interest → Desire → Action | cold audience, new product, awareness | TVC, skippable, explainer |
| PAS | Problem → Agitate → Solve | the audience already feels the pain; retargeting, conversion | social ad, UGC, demo |
| ABCD (Google) | Attention, Branding early and often, Connection, Direction | any YouTube placement; ads following it showed ≈ 30 % higher short-term sales likelihood | bumper, non-skippable, skippable |

The common hybrid is an AIDA hook (a striking image, a question) that drops into PAS at second
3. Choose one and write the shot list in its beats, so every clip has a job.

## Craft rules

- **Hook in 3 s.** Motion, a face or the product itself in the first frame; no logo intro, no
  fade-in from black on social. Start mid-action.
- **Brand by 5 s.** Product, pack or name on screen before the skip point, and again at the end;
  on a bumper it never leaves.
- **Sound-off design.** Most feed viewing is muted: burn captions for every spoken line, put the
  key claim in an overlay, let the picture carry the point. 40 % of the highest-VTR TikTok ads use
  overlays. Design the audio (voice, music, a product sound) as a bonus layer, never the carrier.
- **One idea per ad.** A 15 s spot holds one benefit; a 30 s spot one benefit and one proof.
- **Loop-friendly ending** on social: the last frame can cut back to the first.
- **CTA as a card, not a line.** The last 3 s (5 s on 60 s) is a still card: product, one line,
  the CTA verb, the legal line. On placements with a native button the card repeats the same verb.

### Safe zones for burned text (practice, from platform UI overlays)

| Master | Keep clear | Put text |
| --- | --- | --- |
| 9:16 (Reels / Stories / TikTok) | top 14 %, bottom 20–35 %, 6 % each side (Meta, unified from Mar 2026); TikTok ≈ 108 px top / 320 px bottom / 60 px left / 120 px right on 1080×1920 | centre band, between 25 % and 65 % of the height |
| 16:9 (YouTube, TV) | outer 10 % (title-safe); bottom 15 % where captions and the skip button sit; YouTube end screens occupy the last 5–20 s | centre and upper-centre; end-card elements in the last 5–20 s, ≤ 4 |
| 1:1 / 4:5 (feed) | outer 5 %; the bottom strip where the caption starts | centre |

Full per-platform safe zones belong to the social-media skill; these are the minimum for an ad
master that will be re-used.

## Segment planning — from a length to clips

An AI ad is a chain of separately generated clips, each 3–8 s, cut together. Plan the clips
before any generation:

1. Pick the **master ratio** from the primary placement (16:9 for TVC / YouTube, 9:16 for
   social). Every clip is generated at that one ratio; a second ratio is a second set of clips.
2. Split the timecode skeleton into clips at beat boundaries. One clip = one beat = one camera
   idea. A 30 s TVC is typically 5–7 clips; a 15 s social ad 3–4; a bumper 1–2.
3. Size each clip to the model. What the models accept is in `reference/models.md`; for planning:

| Model family | Plan clips of | Notes for ads |
| --- | --- | --- |
| minimax-h3 | 5–15 s | shortest clip is 5 s: plan beats of ≥ 5 s or trim in the edit |
| seedance-2.5 | 4–30 s, or auto | can carry a whole 15 s social ad in one clip with audio; still better as 2–3 clips for control |
| wan-3.0 | 2–30 s, or auto | the only family that goes to 2 s: good for bumper stings and cut-aways |
| veo-3.1 | 4–8 s (8 s fixed with references) | 16:9 / 9:16 only; native audio |
| kling-3 | 3–15 s | 16:9 / 9:16 / 1:1 |
| happy-horse | 3–15 s | 5 ratios; 720p / 1080p |

4. Generate **one clip per generation**, each from its approved still with the packshot as a
   reference, and never ask one generation for two beats ("then it cuts to…"). Generate 1–2 s
   longer than the beat and trim.
5. The CTA card and any legal line are made as images (`reference/formats-image.md`) and laid
   over in the edit; they are never generated inside the clip.

Worked example, 30 s TVC for a bottled tea, 16:9, seedance-2.5:

| Clip | Beat | Seconds | Content |
| --- | --- | --- | --- |
| 1 | hook | 0–4 | condensation bead sliding down the bottle, macro, cold backlight |
| 2 | setup | 4–10 | office at 3 pm, a tired hand reaching past a coffee cup |
| 3 | product | 10–16 | bottle lifted into a shaft of window light, label to camera |
| 4 | solution | 16–22 | the first sip, shoulders drop, the room brightens |
| 5 | proof | 22–27 | slow push on the pack; overlay: the one claim |
| — | brand + CTA | 27–30 | still card: packshot, brand line, CTA, legal line |

Five generations, one ratio; the card is an image. The 9:16 social version is the same five
beats regenerated at 9:16 from the same stills, with clip 2 reframed on the hand.
