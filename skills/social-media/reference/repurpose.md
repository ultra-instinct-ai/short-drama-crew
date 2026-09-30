# Repurposing — one master → every placement; episode → teaser; ad → placements

How one piece of source material becomes a full set of platform deliverables without cropping
video: which surfaces need which variant, what is regenerated and what is cropped, in which
order, and the two recipes that use it most — a 短剧 episode turned into vertical teasers and a
poster set, and an ad master turned into its placements. Sizes come from platforms-global.md
and platforms-china.md, the generation ratios and crop boxes from ratio-map.md, the hook and
caption rules from content-craft.md; the result is written into the spec sheet of
plan-template.md.

## 1. Master → placement matrix

Two masters exist: a **16:9 master** (long-form, TVC, 中剧 / movie, B站, YouTube) or a
**9:16 master** (短剧, Reels-first ads). Given one, the matrix says what each surface needs.

| Surface | From a 16:9 master | From a 9:16 master | Kind |
| --- | --- | --- | --- |
| YouTube long-form, B站, X, LinkedIn 16:9 | the master, trimmed | regenerate 16:9 (wides can carry two people; keep the vertical's cut points) | video |
| Reels, TikTok, Shorts, 抖音, 快手, 小红书 video, 视频号 9:16, Snapchat, Pinterest video | **regenerate 9:16** from the same references, reframed on faces | the master, trimmed to the surface's cap | video |
| IG / FB / LinkedIn square, 视频号 1:1 | regenerate 1:1 | regenerate 1:1 | video |
| 视频号 6:7 card, 小红书 3:4 video | regenerate 3:4 (视频号 accepts it; 6:7 is not generatable) | regenerate 3:4 | video |
| YouTube thumbnail, X image, 微博 1000×562 | a keyframe of the master, 16:9 | regenerate a 16:9 still from the same references | image |
| IG feed 4:5, Threads | regenerate 4:5 still (nano-banana family / flux-2-flex) | regenerate 4:5 | image |
| 小红书 图文 / cover 3:4, IG grid 3:4 | regenerate 3:4 still | regenerate 3:4 | image |
| Pinterest 2:3 | regenerate 2:3 still | regenerate 2:3 | image |
| Link previews 1.91:1, 微博 cover, 公众号 900×383, B站 1146×717, 视频号 6:7 cover | crop from the 16:9 / 21:9 / 3:2 / 3:4 still per ratio-map.md | same, from a regenerated still | image crop |
| Stories cards | regenerate 9:16 stills or reuse the 9:16 clips ≤ 60 s | trim the master into ≤ 60-s cards | either |

**Regenerate vs crop.** Video: always regenerate (ratio-map.md, the video rule) — same
`@imageN` references, same `duration`, framing sentence rewritten for the new frame. Image:
regenerate at every native ratio (4:5, 3:4, 2:3, 1:1, 16:9, 21:9); crop only for the ratios no
model has (1.91:1, 6:7, 16:10, 2.35:1), and crop from the nearest native, not from the master.

**Order of work.** (1) Spec sheet rows for every surface. (2) Stills first: one generation per
native ratio, from the same references; approve them — they are the covers and the reference
frames for the clips. (3) Crops from the approved stills. (4) Video regenerations, one ratio at
a time, primary platform first; quote before each batch. (5) Overlays and subtitles at the final
ratio. (6) Captions, hashtags, slots. (7) The deliverables checklist (section 4) filled in.

## 2. Drama episode → teaser + poster set

Source: an episode's storyboard (segments, cuts, the 爽点 and the cliff) and the character /
scene sheets it was generated from. The teaser is not the episode's first 30 seconds and not a
crop of the episode; it is **new 9:16 segments** built from the same sheets.

### The 4-beat teaser (15–45 s)

| Beat | Time | Content | Source in the storyboard |
| --- | --- | --- | --- |
| Hook | 0–3 s | the most shocking line or action from the *middle* of the episode, cut in cold, burned-in text of the line | the 爽点 cut or the turn's reveal cut |
| Context | 3–15 s | who wants what, in two cuts and one line — enough to make the hook hurt | the episode's establish / evidence cuts |
| Escalation | 15–35 s | the pressure rising toward the payoff: the decision cut, the reaction cut | the cuts before the 爽点 / cliff |
| Cut before payoff | last 2–5 s | freeze one beat before the answer + 「主页看全集 / full episode in bio」 card in the same template as the cover | the cliff cut, ending early |

- **2–3 variants** that differ only in the hook beat (a line, a result-first, a question — see
  content-craft.md); beats 2–4 are shared, so only the hook segment is regenerated per variant.
- Generated as **9:16 segments** with the same character and scene sheets as references
  (`@image1` character, `@image2` scene …), segment length inside the video model's range
  (ratio-map.md), 3–5 segments for a 30-s teaser. Prompts reframe on faces: medium / close /
  extreme-close, space built in depth (foreground shoulder, counter edge, room behind) — a wide
  on a phone says nothing.
- Subtitles burned in, inside the safe zone; the hook line is on screen from frame 1.
- Sound: the episode's voice track for the lines, one Seed Audio sting under the cut-before-payoff.
- A 16:9 teaser for YouTube / B站 is a further regeneration of the same beats, not a pad.

### The poster / cover set

From the episode's keyframes or a regenerated hero still (the two leads in the 爽点 pose, the
scene sheet behind), one generation per native ratio, then the crops; title-safe zones per
surface:

| Surface | Ratio · px | Generate | Title-safe zone |
| --- | --- | --- | --- |
| 小红书 cover / 图文 | 3:4 1242×1660 | native 3:4, text inside the picture (nano-banana-pro / seedream-5-pro) | middle 70 % — the tile is half a screen |
| Instagram feed | 4:5 1080×1350 | native 4:5 | avoid the outer 3 % (grid crop) |
| Pinterest | 2:3 1000×1500 | native 2:3 | lower third for the title band |
| YouTube thumbnail | 16:9 1280×720 | native 16:9, face + ≤ 4 words | keep the bottom-right clear |
| B站 cover | 1146×717 | 3:2 → crop 23 / 24 px | keep the bottom-left clear |
| 视频号 cover | 6:7 1080×1260 | 3:4 → crop 90 / 90 px | inside the centre 1:1 square (朋友圈 crop) |
| Reels / TikTok / 抖音 cover | 9:16 1080×1920 | the teaser's first frame or a native 9:16 still | centre 60 % (grid tile crop) |

One title template for the whole series: 剧名 + 第N集 + one-line hook, same position on every
cover.

## 3. Ad master → placements

Source: the ad brief (product references, CTA, legal lines, disclosure need), the key visual
(KV) and the master clip (16:9 or 9:16) from the ads skill.

- **KV crops per size**: the KV is regenerated at 4:5, 1:1, 3:4, 2:3, 16:9 and 21:9 with the
  packshot as `@image1` and "keep the label, shape and colour exactly"; the 1.91:1 previews,
  900×383, 1146×717 and 6:7 are crops of those (ratio-map.md), anchored on the product centre.
  Legal text and small print are overlaid after the crop, never generated.
- **Vertical / square video regenerations**: 9:16 and 1:1 (and 4:3 / 3:4 for 视频号 and 小红书)
  from the same product stills and the same shot list; product in frame by 3 s; CTA card in the
  last 3 s inside the safe zone; 15–30 s for Reels / Stories ads, ≤ 6 s for a bumper-style cut.
- **Per-platform copy** from the brief's CTA and legal lines: the CTA verb stays the platform's
  button (shop now, learn more, 立即购买), the legal line goes into the caption or the end card,
  the hashtags follow content-craft.md (IG ≤ 5, TikTok 3–5, LinkedIn 3, 小红书 keyword + 话题).
- **Disclosure toggles**: YouTube "altered or synthetic" for realistic people / voices; Meta
  "AI info" (automatic for Meta-tool ads, mandatory disclosure for political / social ads);
  TikTok "contains AI-generated content"; China 「AI生成」 on every platform (since 2025-09-01).
  Record the toggle state per placement in the spec sheet.
- Sound-off first: the ad reads with captions alone; the audio track is a bonus.

## 4. Deliverables checklist

One row per file. Empty cells are work not yet done.

| File | Platform · surface | Ratio | px | Duration | Cover | Caption | Hashtags | Posting slot | Disclosure | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| teaser-A-9x16.mp4 | 抖音 video | 9:16 | 1080×1920 | 28 s | cover-9x16-A.jpg | ✓ | 4 话题 | Wed 20:00 CST | 「AI生成」 on | generated |
| teaser-A-9x16.mp4 | Instagram Reels | 9:16 | 1080×1920 | 28 s | cover-9x16-A.jpg | ✓ | 5 | Tue 12:00 local | AI label per policy | scheduled |
| poster-3x4.jpg | 小红书 图文 cover | 3:4 | 1242×1660 | — | itself | ✓ | keyword + 5 话题 | Thu 12:30 CST | 「AI生成」 on | to crop |
| thumb-16x9.jpg | YouTube thumbnail | 16:9 | 1280×720 | — | itself | — | — | with the video | — | pending |
| cover-bili.jpg | B站 封面 | ≈16:10 | 1146×717 | — | itself | — | — | with the video | 「AI生成」 on | pending |

Status values: planned · quoted · generated · cropped · overlaid · scheduled · posted. A row is
complete when every cell is filled and the file's pixel size equals the platform row.
