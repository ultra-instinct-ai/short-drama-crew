# Platform specs — global (Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Pinterest, Threads, Snapchat)

One table per platform, one row per surface: the ratio and pixel size to deliver, the duration
and file-size caps, the safe zone where UI covers the picture, the text limits, and what has
changed recently with the date. Copy the row into the post spec sheet (plan-template.md) before
generating anything; the generation ratio and crop box for each row is in ratio-map.md, and the
Chinese platforms are in platforms-china.md. Figures marked *(verify)* were inconsistent between
sources in the 2025–2026 research; "not confirmed" means the research produced no figure — never
fill it from memory, say so and let the user check the platform's current help page.

## The 9:16 safe zone (1080×1920) — one diagram for every vertical surface

Vertical surfaces all hide the top band behind the status bar and the bottom band behind the
caption, the sound tag and the action rail on the right. Measured bands, in pixels of a
1080×1920 frame:

```
 y     0 ┌────────────────────────────┐
         │ ▒ top band: Meta 14 % = 269 px (Stories / Reels, unified Mar 2026)
         │   TikTok 108 · IG Reels 220 · Snapchat 150
 y   270 ├────────────────────────────┤ ▒ right rail (likes / comments / share):
         │                            │   TikTok 120 px · Meta 6 % = 65 px
         │   SAFE — faces, headline,  │ ▒ left band: TikTok 60 px · Meta 65 px
         │   subtitles, product,      │
         │   x 120 → 960              │
 y  1248 ├────────────────────────────┤
         │ ▒ bottom band: Meta 20–35 % = 384–672 px (caption + sound + CTA)
         │   TikTok 320 · IG Reels 420 · Snapchat 330
 y  1920 └────────────────────────────┘
```

The conservative union — text and faces inside **x 120–960, y 270–1248** — is safe on every
platform in this file at once, so a single 9:16 master can be posted everywhere. Per-platform
bands are looser; use them only when a variant is made for one platform.

## Instagram

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Feed image | 4:5 1080×1350 (standard); 3:4 1080×1440 (shows uncropped in the grid); 1:1 1080×1080; 1.91:1 1080×566 | — | not confirmed | grid tile is 3:4 since Jan 2025: a 4:5 loses ≈3 % per side, 1:1 ≈12 % per side, 1.91:1 keeps only the centre | caption 2,200; **≤5 hashtags since Dec 2025** | 4:5 fills the most feed height; 1080×1440 may fail via API upload |
| Feed video | 4:5 or 9:16 | 3 s–60 min | not confirmed | as Reels | caption 2,200; ≤5 hashtags | every feed video is shown as a Reel |
| Reels | 9:16 1080×1920 | 3 min in-app (Jan 2025); up to 15 min upload *(verify)* | not confirmed | 220 px top, 420 px bottom (IG figure); Meta unified 14 % / 20–35 % / 6 % from Mar 2026 | caption 2,200; ≤5 hashtags | cover frame is cropped to 3:4 in the grid — keep the cover's title in the centre |
| Stories | 9:16 1080×1920 | 60 s per card | not confirmed | 14 % top and bottom clear (269 px) | sticker text, link sticker | tap-through: one idea per card |
| Carousel | one ratio for every slide (4:5 recommended) | — | not confirmed | first slide sets the crop for all | caption 2,200; ≤5 hashtags | ≤20 slides; last slide carries the CTA |
| Profile grid | 3:4 tiles since Jan 2025 | — | — | design covers for the 3:4 tile | — | previews of 9:16 Reels and 1:1 posts are centre-cropped |

## TikTok

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Video | 9:16 1080×1920 | ≤60 min upload, 10 min in-app | not confirmed | 108 px top · 320 px bottom · 60 px left · 120 px right | caption 4,000 | product or key message inside 3 s; start in motion |
| Photo mode | 9:16 (1:1 and 4:5 accepted) | — | not confirmed | as video | caption 4,000 | ≤35 images; swipes like a carousel with music |
| Cover | first frame or a chosen frame, 9:16 | — | — | profile-grid tile crop not confirmed — keep title text in the centre 60 % of the frame | cover text | face + ≤4 words; the same template across a series |

## YouTube

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Long-form | 16:9 1920×1080 or 3840×2160 | 15 min unverified account, 12 h verified | not confirmed | end-screen area in the last 5–20 s | title 100 (≈60–70 shown), description 5,000 | chapters from timestamps in the description |
| Shorts | 9:16 or 1:1 | ≤3 min (Oct 2024) | not confirmed | pixel bands not confirmed — keep captions above the bottom UI; use the 9:16 diagram | title 100 | a Short is any vertical video ≤3 min with #Shorts optional |
| Thumbnail | 16:9 1280×720 | — | ≤2 MB | duration badge sits bottom-right; keep that corner clear | — | face + ≤4 words, high contrast; see content-craft.md |
| Posts (formerly Community tab) | image ratio not confirmed | — | not confirmed | — | not confirmed | renamed from "Community" to "Posts"; polls, images, text |
| End screens | inside the 16:9 frame | last 5–20 s of videos ≥25 s | — | elements occupy the frame — no important picture behind them | — | ≤4 elements (video, playlist, subscribe, link) |

## Facebook

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Feed image | 4:5 1080×1350 or 1:1 1080×1080 | — | not confirmed | — | post text not confirmed | 4:5 fills the most feed height |
| Feed video | 4:5 or 9:16 | 1 s–240 min | not confirmed | Meta 9:16 bands | not confirmed | **all Facebook video is published as Reels since Jun 2025** |
| Reels | 9:16 1080×1920 | 3–90 s | not confirmed | Meta unified: 14 % top, 20–35 % bottom, 6 % sides (Mar 2026) | caption not confirmed | same master as Instagram Reels |
| Stories | 9:16 1080×1920 | 1–60 s | not confirmed | Meta unified bands | sticker text | — |
| Link preview | 1.91:1 1200×630 (OG image) | — | not confirmed | — | title and description from the page's OG tags | crop from 16:9 — see ratio-map.md |

## X

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Image post | 16:9 1600×900 or 1:1 | — | not confirmed | timeline preview crops tall images to 16:9-ish — keep the subject centred | 280 chars (Premium longer) | up to 4 images; the first sets the layout |
| Video | 16:9 or 1:1, ≤1920×1200 | 2 min 20 s (Premium up to 4 h) | 512 MB | — | 280 chars | autoplays muted — burned subtitles |

## LinkedIn

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Image post | 1080×1080 or 4:5 1080×1350 | — | not confirmed | — | 3,000 chars ("see more" after ≈3 lines) | first two lines carry the hook |
| Link preview | 1.91:1 1200×627 | — | not confirmed | — | OG title / description | crop from 16:9 — see ratio-map.md |
| Video | 16:9, 1:1 or 9:16 | ≤10 min organic | 5 GB | — | 3,000 chars | muted autoplay — burned subtitles; 3 hashtags |
| Document / carousel | PDF pages, 1:1 or 4:5 | — | not confirmed | — | — | one idea per page, last page CTA |

## Pinterest

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Standard Pin | 2:3 1000×1500 | — | not confirmed | — | title 100; description 500–800 *(verify)* | Idea Pins merged into standard Pins in 2023 |
| Video Pin | 9:16 (2:3 accepted) | 4 s–15 min | not confirmed | bottom band hides behind the title on the feed card | title 100 | first frame is the cover unless a cover is chosen |

## Threads

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Post | 4:5 best; 9:16, 1:1, 16:9 accepted | video ≤5 min | 500 MB | — | 500 chars | text-first feed: the first line is the hook |

## Snapchat

| Surface | Ratio · px | Duration | File size | Safe zone | Text limits | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Story / Spotlight | 9:16 1080×1920 | 3–180 s | not confirmed | 150 px top · 330 px bottom | caption not confirmed | full-screen only; no letterboxing |

## Recent changes to keep in mind (dated)

| When | Platform | Change | Effect on delivery |
| --- | --- | --- | --- |
| Oct 2024 | YouTube | Shorts up to 3 min | drama teasers up to 3 min qualify as Shorts |
| Jan 2025 | Instagram | profile grid tiles 3:4; Reels 3 min in-app | covers designed for 3:4; 4:5 posts lose ≈3 % per side in the grid |
| 2025 | YouTube | Community tab renamed Posts | say "Posts" in plans |
| Jun 2025 | Facebook | every video post is a Reel | there is no separate feed-video spec; use the Reels row |
| Dec 2025 | Instagram | hashtags capped at 5 per post | captions with more are rejected or trimmed; pick 5 |
| Mar 2026 | Meta | one unified safe zone for Stories and Reels: 14 % top, 20–35 % bottom, 6 % sides | one 9:16 master serves IG and FB Reels and Stories |

Where a row says "not confirmed", the platform may well have a published figure; the research
did not verify it, so the plan must not state one.
