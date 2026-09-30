# Ratio map — placement size → generation ratio, model, crop box

Every image placement in platforms-global.md and platforms-china.md, mapped to the ratio a WJI
image model actually generates (taken from the model seeds — the model's `ratio` list is the
law, not the platform's wish) and, where the placement is not a native ratio, to the nearest
native ratio plus the crop box that reaches the exact pixels. Then the same for video, where
the rule is different: **video is regenerated at the target ratio from the same references,
never cropped**. Read this after choosing the surfaces and before writing the generation plan
in plan-template.md.

## Native image ratios per model (from the seeds)

| Model (`model`) | Ratios | Resolution | Refs |
| --- | --- | --- | --- |
| nano-banana, nano-banana-pro, nano-banana-2 | auto 1:1 2:3 3:2 3:4 4:3 **4:5** 5:4 9:16 16:9 21:9 9:21 | pro / 2: 1K–4K | 14 (pro / 2), 4 (nano-banana) |
| nano-banana-2-lite | same minus 9:21 | | |
| gpt-image-2 | auto 1:1 4:3 3:4 16:9 9:16 | 1K / 2K / 4K | 16 |
| gpt-image-2.5 (sunburst / flare) | gpt-image-2 + **21:9** | 1K / 2K / 4K | 16 |
| bytedance-seedream-4.5 | 1:1 4:3 3:4 16:9 9:16 | 2K / 4K | |
| bytedance-seedream-5-lite / 5-pro | seedream-4.5 + 3:2 **2:3** 21:9 | size select; 5-pro layered PNG | |
| flux-2-flex | 1:1 16:9 3:2 2:3 **4:5** 5:4 9:16 3:4 4:3 | | |
| marketing-studio-image | auto 1:1 3:2 2:3 4:3 3:4 16:9 9:16 21:9 | 1k / 2k / 4k | 8 |
| runninghub-midjourney v7 / v8.1 / v8.2 | 1:1 4:3 3:2 16:9 3:4 2:3 9:16 | | |

No model generates 1.91:1, 6:7, 16:10, 2.35:1 or any banner size. Those are crops.

**Resolution rule.** Pick the resolution whose generated short side is at least the target's short
side after cover-fit, then downscale; never upscale a 1K frame to a 1242-px-wide note. 1K frames
(≈1024 on the long side) are too small for every placement in this file except 200×200 and
400×400; generate at 2K for everything else and at 4K when the crop keeps less than 60 % of the
frame.

## Image placements

| Placement (file) | Target px | Ratio | Native models | If not native: generate → crop |
| --- | --- | --- | --- | --- |
| IG feed / FB feed / Threads | 1080×1350 | 4:5 | nano-banana, nano-banana-pro, nano-banana-2, flux-2-flex | 3:4 → cover-fit to 1080 wide (1080×1440) → crop 45 px top and 45 px bottom |
| IG feed grid-native, 小红书 图文, 抖音 图文, 小红书 cover | 1080×1440 / 1242×1660 | 3:4 | all models in the table above | 1242×1660 is 4 px off exact 3:4 — cover-fit to height 1660 (1245 wide) → crop 1–2 px each side |
| IG Reels / Stories / TikTok / Shorts / 抖音 / 快手 covers, Snapchat, 视频号 9:16 | 1080×1920 | 9:16 | all | — |
| IG 1:1, FB 1:1, LinkedIn post, 视频号 1:1, 公众号 secondary cover, X square | 1080×1080 / 1200×1200 / 400×400 | 1:1 | all | — |
| YouTube thumbnail, X, B站 video frame, 微博 1000×562 | 1280×720 / 1600×900 / 1920×1080 / 1000×562 | 16:9 | all | 1000×562 is 16:9 to the pixel — resize only; keep the title inside the middle 400 px |
| Pinterest Pin | 1000×1500 | 2:3 | nano-banana family, seedream-5-lite / 5-pro, flux-2-flex, marketing-studio-image, midjourney | 3:4 → cover-fit to height 1500 (1125 wide) → crop 62 px left, 63 px right |
| 视频号 4:3, B站 动态 | 1080×810 | 4:3 | all | — |
| IG landscape | 1080×566 | 1.91:1 | none | 16:9 → cover-fit to 1080 wide (1080×608) → crop 21 px top and bottom |
| FB / LinkedIn link preview, Google landscape | 1200×630 / 1200×627 / 1200×628 | 1.91:1 | none | 16:9 → cover-fit to 1200 wide (1200×675) → crop 22–24 px top and bottom (45 / 48 / 47 px in total) |
| 视频号 feed card | 1080×1260 | 6:7 | none | 3:4 → 1080×1440 → crop 90 px top and 90 px bottom (keeps full width); or 1:1 → cover-fit to height 1260 (1260 wide) → crop 90 px each side (keeps full height) |
| B站 cover | 1146×717 | ≈16:10 | none | **3:2** (closest) → cover-fit to 1146 wide (1146×764) → crop 23 px top, 24 px bottom; or 16:9 (from the master) → cover-fit to height 717 (1275 wide) → crop 64–65 px each side |
| B站 cover large | 1920×1200 | 16:10 | none | 3:2 → 1920×1280 → crop 40 px top and bottom; or 16:9 → 2133×1200 → crop 106–107 px each side |
| 公众号 cover | 900×383 | 2.35:1 | none | 21:9 (gpt-image-2.5, nano-banana family, seedream-5-lite / 5-pro, marketing-studio-image) → cover-fit to 900 wide (900×386) → crop 1 px top, 2 px bottom; the 1:1 share crop is the centre 383×383 (x 258–641) — compose for that square |
| 微博 头条文章 alt | 900×500 | 1.8:1 | none | 16:9 → cover-fit to 900 wide (900×506) → crop 3 px top and bottom |
| 公众号 secondary | 200×200 (export 400×400) | 1:1 | all | generate 1:1 at 1K, downscale to 400, deliver 400×400 |

"Cover-fit" means: scale the generated frame uniformly until it covers the target box, then cut
what falls outside, anchored as described under "Crop anchoring". One generated frame per ratio,
never one per pixel size: a single 16:9 frame serves the YouTube thumbnail, X, 微博 and every
1.91:1 preview.

## Video placements

| Placement | Ratio | Models that generate it natively (`ratio`) | Duration range (`duration`) |
| --- | --- | --- | --- |
| Reels, Stories, TikTok, Shorts, 抖音, 快手, 小红书 video, 视频号 9:16, Snapchat, Pinterest video | 9:16 | minimax-h3 (+ -ref), seedance-2.5 (+ -ref), seedance-2.0 family, wan-3.0 (+ -ref, prime), veo-3.1, kling-3, happy-horse | h3 5–15 s · seedance-2.5 4–30 s · seedance-2.0 4–15 s · wan-3.0 2–30 s · veo-3.1 4–8 s · kling-3 3–15 s · happy-horse 3–15 s |
| YouTube long-form, B站, X, LinkedIn, FB in-stream | 16:9 | all of the above | as above |
| IG / FB / LinkedIn square, 视频号 1:1, Shorts 1:1, X 1:1 | 1:1 | minimax-h3, seedance-2.5, seedance-2.0, wan-3.0, kling-3, happy-horse (not veo-3.1) | as above |
| 视频号 4:3 | 4:3 | minimax-h3, seedance-2.5, seedance-2.0, wan-3.0, happy-horse | as above |
| 小红书 3:4 video, 视频号 tall card, 抖音 图文-style video | 3:4 | minimax-h3, seedance-2.5, seedance-2.0, wan-3.0, happy-horse | as above |
| Cinematic banner, hero loop | 21:9 | minimax-h3, seedance-2.5, seedance-2.0 | as above |
| 视频号 6:7, Pinterest 2:3, 1.91:1 previews | — | none | deliver the nearest accepted ratio instead: 视频号 takes 3:4 or 1:1 (0.33–3.0 accepted), Pinterest takes 9:16, link previews take a 16:9 still |

Resolutions: minimax-h3 480P / 768P / 2K / 4K; seedance-2.5 480p / 720p / 1080p; wan-3.0 480P /
720P / 1080P; seedance-2.0 480p / 720p. Publish 1080p or the model's top tier below it; the
platform re-encodes anyway.

**The video rule.** A 16:9 master cropped to 9:16 loses two thirds of the frame and lands the
faces under the caption band; a 9:16 master padded to 16:9 is a phone video with bars. So every
ratio in the placement list is a **new generation**: the same character / scene / product
references (`@image1` …), the same segment prompt with the framing sentence rewritten for the
new frame ("vertical, subject centred, head at the upper third, room built in depth"), the same
`duration`. Cost is one clip per ratio per segment — plan it in repurpose.md, quote it, then
generate. The only cut permitted on a video is trimming its length.

## Crop anchoring

A crop box has an anchor: the point that must stay inside. Decide it per frame before cutting.

| Frame content | Anchor | Then |
| --- | --- | --- |
| A face (poster, teaser cover, testimonial still) | the face box; eyes at ≈1/3 from the top of the target | crop from the bottom first, then the top; never cut the chin or the hairline |
| Two faces | the midpoint between them, both boxes inside | if both cannot fit, regenerate the frame tighter rather than cut one out |
| Product / packshot | the product's centre; the whole product plus its shadow inside | crop the sides symmetrically; on 1.91:1 previews keep the label readable at 600 px wide |
| Headline zone (key visual with text) | the text block plus its margin | text is rendered into the picture only on the final ratio — on crops, generate without text and overlay after |
| Scene / landscape | the horizon or the main light | side crops are free; top / bottom crops keep the horizon off the edge |

After the crop, re-check the target's safe zone (platforms-global.md / platforms-china.md):
a 6:7 视频号 cover is shared to 朋友圈 as its centre 1:1, so the face has to sit inside that
square; a 900×383 公众号 cover is read as its centre 383×383 in chats; a 4:5 IG post loses ≈3 %
per side in the 3:4 grid; a 16:9 thumbnail keeps the bottom-right corner clear for the duration
badge and a B站 cover the bottom-left. When the anchor cannot survive the crop, the answer is a
new generation at the closer native ratio (3:4 instead of 1:1 for 6:7, 3:2 instead of 16:9 for
1146×717), not a smaller face.
