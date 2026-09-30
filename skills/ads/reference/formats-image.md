# Image ad formats — key visual, packshot, banner

What each static deliverable is for, the exact pixel sizes the ad networks accept, the text and
safe-zone rules that go with them, and how to get from a generated image (which only comes in
model ratios) to those sizes by cropping. Lighting and shot vocabulary for making the source
images is in `reference/product-photography.md`; the model ratios in `reference/models.md`.

## The three deliverables

| Deliverable | What it is | Typical ratio | Made how |
| --- | --- | --- | --- |
| Packshot (產品去背圖 / 產品照) | the product alone, clean, label to camera, on white or transparent; the identity reference for every other generation | 1:1, 4:5, or transparent 1:1 | photograph or generate once, approve, then reuse as `@image1` everywhere |
| Key visual, KV (主視覺) | the campaign's one hero image: product + concept + headline zone; the source of every crop | 4:5 or 16:9 master, 1:1 secondary | generated from the packshot reference; text added as an overlay afterwards |
| Banner / display asset | the KV re-composed into network sizes with headline, CTA and logo | fixed pixel sizes below | crop of the KV or a re-generation at the nearest ratio, then text overlay |

Rule of thumb: one packshot, one to three KVs (one per hook or style), and every banner is
derived from a KV, never generated from scratch, so the product looks identical across sizes.

## IAB display sizes

All ten fixed sizes of the IAB portfolio; the five marked ★ cover most inventory and are where a
campaign starts. Google Display Network static files ≤ 150 KB.

| Size (px) | Name | Ratio | Priority | Note |
| --- | --- | --- | --- | --- |
| 300×250 | Medium rectangle | 6:5 | ★ | most inventory; headline + product + button |
| 728×90 | Leaderboard | ≈ 8:1 | ★ | product small at one end, headline the rest |
| 300×600 | Half page | 1:2 | ★ | tall; product top, headline, CTA bottom |
| 160×600 | Wide skyscraper | ≈ 1:4 | ★ | narrow; stacked product, two-word headline |
| 320×50 | Mobile leaderboard | ≈ 6:1 | ★ | logo + 4 words + button; no product detail survives |
| 320×100 | Large mobile banner | 3.2:1 | | as 320×50 with room for a product thumbnail |
| 970×250 | Billboard | ≈ 4:1 | | a landscape KV crop with a headline |
| 970×90 | Super leaderboard | ≈ 11:1 | | as 728×90 |
| 336×280 | Large rectangle | 6:5 | | same composition as 300×250 |
| 250×250 | Square | 1:1 | | small square; product + 2 words |

## Google responsive display assets

Upload assets; Google assembles them. Images must be sharp with the product centred, because any
of them may be shown in any slot.

| Asset | Ratio | Recommended | Minimum | Limit |
| --- | --- | --- | --- | --- |
| Landscape image | 1.91:1 | 1200×628 | 600×314 | ≤ 5120 KB; up to 15 images |
| Square image | 1:1 | 1200×1200 | 300×300 | |
| Logo (square) | 1:1 | 1200×1200 | 128×128 | optional but recommended |
| Logo (landscape) | 4:1 | 1200×300 | 512×128 | transparent background preferred |
| Headlines | — | up to 5 × 30 characters | | |
| Long headline | — | 1 × 90 characters | | |
| Descriptions | — | up to 5 × 90 characters | | |
| Business name | — | 25 characters | | |

Images with more than ≈ 20 % of their area as text are ranked down; put the words in the
headline fields, not in the picture. A landscape and a square image are the minimum set.

## Meta (Facebook / Instagram) ad sizes by placement

| Placement | Ratio | Pixels | Notes |
| --- | --- | --- | --- |
| Feed (default) | 4:5 | 1080×1350 | tallest feed unit; also accepts 1:1 |
| Carousel card | 1:1 | 1080×1080 | one ratio for every card |
| Stories / Reels | 9:16 | 1080×1920 | safe zone: 14 % top, 20–35 % bottom, 6 % sides (unified Mar 2026) |
| In-stream video | 16:9 | 1920×1080 | |
| Right column / link | 1.91:1 | 1200×628 | same crop as the Google landscape asset |
| Files | — | images ≤ 30 MB; video ≤ 4 GB; Reels ads ≤ 90 s *(verify)* | |

The 20 % text rule was retired in 2020, but images under 20 % text still deliver better; keep
headline and CTA in the ad's text fields and the image mostly picture. Never draw a fake button
on the image: every Meta and Google placement renders its own CTA button, and a painted one
looks like a mismatch and is rejected by some review passes.

## CTA conventions

| Platform | Button labels (choose from the platform's list) | Practice |
| --- | --- | --- |
| Meta | Shop Now · Learn More · Sign Up · Book Now · Get Offer · Download · Contact Us | one verb, matches the landing page |
| Google | Learn More · Shop Now · Get Quote · Apply Now · Sign Up · Subscribe | the CTA text field, ≤ 10 characters in some units |
| TikTok | Shop Now · Learn More · Download · Sign Up · Contact Us · Apply Now | the card's CTA and the burned CTA line say the same thing |
| YouTube | Learn More · Shop Now · Sign Up (call-to-action extension) | the video's end card repeats it |

On a static KV or end card the CTA is a *line of type* in the headline zone ("Try it cold."),
not a rounded rectangle. Chinese-market placements (朋友圈, 抖音信息流) use the platform's own
按鈕 with the same rule.

## Generate, then crop

No image model outputs 1200×628 or 728×90; generate at the nearest model ratio, then crop. Every
row below is a ratio the platform's models accept (see `reference/models.md`). The crop principle: keep the product
centre-weighted, keep the headline zone (usually the upper third, or the empty side) clear of
product, and let background sweep, not product, be what the crop removes.

| Target | Generate at | Crop | Composition rule |
| --- | --- | --- | --- |
| 1200×628, 1200×630 (1.91:1) | 16:9 | trim ≈ 6 % height (top and bottom) | product centre or right third; headline left |
| 300×250, 336×280 (6:5) | 4:3 or 1:1 | 4:3 → trim sides; 1:1 → trim top / bottom | product centred, headline above |
| 250×250, 1200×1200, 1080×1080 (1:1) | 1:1 | none | product dead centre |
| 728×90, 970×90 (≈ 8:1 / 11:1) | 21:9 | keep a centre band ≈ 30 % of the height | product at one end, background sweep the rest |
| 970×250 (≈ 4:1) | 21:9 | keep a centre band ≈ 60 % of the height | as above with room for a two-line headline |
| 320×50, 320×100 | 21:9 | narrow band; or a logo + colour field instead of the KV | text-only unit |
| 160×600, 300×600 (1:4, 1:2) | 9:16 | 300×600: trim ≈ 12 % width; 160×600: keep a centre column ≈ 15 % wide | product stacked vertically; headline top |
| 1080×1350 (4:5) | 4:5 (nano-banana, flux-2-flex) | none; or 3:4 trimmed | |
| 1080×1920 (9:16) | 9:16 | none | product inside the centre safe band |
| 1200×300 logo (4:1) | transparent 1:1 (gpt-image-2.5 `background: transparent`) | place on a 4:1 transparent canvas, logo left | never regenerate a real logo; use the supplied file |

Generate at 2K or 4K for anything that will be cropped hard (banners, 160×600): a 21:9 4K frame
still leaves a sharp 970×250 after the band crop. Keep a 10 % margin around the product in
every KV so a tighter crop never cuts the pack. Video is never cropped; see
`reference/formats-video.md` for regenerating at the placement ratio.
