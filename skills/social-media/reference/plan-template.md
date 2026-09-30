# Plan template — the post spec sheet

One spec sheet per post (one platform × one surface × one asset). It is written before any
generation, filled from the platform row (platforms-global.md / platforms-china.md), the ratio
row (ratio-map.md) and the craft rules (content-craft.md); the campaign's sheets together are
the deliverables checklist of repurpose.md. The block below is the template; after it, one
filled example — a 3-episode 短剧 launch on 小红书, 抖音 and Instagram Reels with a teaser and a
poster per platform. Every figure in a sheet is copied from a reference row or marked
"not confirmed"; nothing is invented in the sheet.

## Fields

| Field | Meaning | Where it comes from |
| --- | --- | --- |
| campaign | name of the launch / series / promotion | the user |
| platform | 小红书, 抖音, Instagram … | the user |
| surface | the row: 图文, video note, Reels, Stories, thumbnail … | platform file |
| ratio | delivered ratio | platform row |
| px | delivered pixel size | platform row |
| duration cap | the surface's cap and the planned length | platform row; content-craft.md |
| safe zone | the pixel bands text and faces avoid | platform row / 9:16 diagram |
| source asset | episode + segment ids, KV id, uploaded file | short-drama storyboard / ads brief / user assets |
| generation plan | model, `ratio`, `resolution`, `duration`, references (`@imageN`), prompt notes (framing sentence) | ratio-map.md |
| crop | native ratio → target px, anchor | ratio-map.md, crop anchoring |
| cover | file or "first frame"; template name | content-craft.md, covers |
| caption | hook line + body + CTA, within the limit | content-craft.md, captions |
| hashtags | count and list, within the cap | content-craft.md |
| CTA | one verb | the brief / series plan |
| posting slot | day + time in the audience's time zone; "starting point" or "from insights" | content-craft.md, posting times |
| disclosure | the platform's AI toggle and its state; 「AI生成」 for China | platforms-china.md; repurpose.md §3 |
| status | planned · quoted · generated · cropped · overlaid · scheduled · posted | the work |

## Template block

```
campaign:         
platform:         
surface:          
ratio:            
px:               
duration cap:      (surface cap) / planned:
safe zone:        
source asset:     
generation plan:
  model:          
  ratio:          
  resolution:     
  duration:       
  references:     @image1 = … · @image2 = …
  prompt notes:   
crop:              native → target, anchor:
cover:            
caption:          
hashtags:          (n / cap)
CTA:              
posting slot:     
disclosure:       
status:           
```

## Filled example — 《穿越战神》 3-episode launch, 小红书 + 抖音 + Instagram Reels

Six sheets: a teaser and a poster per platform. Beats and references are the same across the
three teasers; only the ratio (all 9:16 here), the copy and the covers differ.

```
campaign:         穿越战神 E01–E03 launch, week 1
platform:         抖音
surface:          video
ratio:            9:16
px:               1080×1920
duration cap:     60 min (verify) / planned: 30 s
safe zone:        pixel bands not confirmed for 抖音 — using the 9:16 diagram union: x 120–960, y 270–1248
source asset:     E01 storyboard segments 03 (turn), 05 (爽点), 07 (cliff); character sheets C01, C02; scene sheet S02 (the ancestral hall)
generation plan:
  model:          seedance-2.5-ref
  ratio:          9:16
  resolution:     1080p
  duration:       4 segments × 7–8 s (hook 3 s inside segment 1)
  references:     @image1 = C01 sheet · @image2 = C02 sheet · @image3 = S02 sheet · @audio1 = C01 voice sample
  prompt notes:   vertical, faces at the upper third, hall built in depth (pillar foreground, altar behind); hook variant A = the line 「跪下的应该是你」 cut in cold; subtitles burned in at y 1100–1240
crop:             none (video is regenerated at 9:16)
cover:            first frame of variant A, title template 「穿越战神 · 第1集」 in the centre 60 %
caption:          「跪下的应该是你。」 穿越战神 第1集 — 他回来了，这次跪的是谁？ 主页看全集
hashtags:         4 / no fixed cap: #穿越战神 #短剧 #逆袭 #第1集
CTA:              主页看全集
posting slot:     Wed 20:00 CST — not confirmed for 抖音, starting point; replace from insights after week 1
disclosure:       「AI生成」 toggle on (标识办法 2025-09-01)
status:           quoted
```

```
campaign:         穿越战神 E01–E03 launch, week 1
platform:         小红书
surface:          图文 (poster + 3 cards)
ratio:            3:4
px:               1242×1660
duration cap:     — / 4 images (≤ 18)
safe zone:        title inside the middle 70 %; the tile is half a screen
source asset:     E01 爽点 keyframe (C01 standing over C02 in the hall); scene sheet S02
generation plan:
  model:          nano-banana-pro
  ratio:          3:4
  resolution:     2K
  references:     @image1 = C01 sheet · @image2 = C02 sheet · @image3 = S02 sheet
  prompt notes:   poster: two figures, C01 lit from the altar candles, title band lower third with 「穿越战神」 + 「第1集 · 跪下的应该是你」 rendered in the picture; cards 2–4 without text (overlaid after)
crop:             3:4 2K frame → cover-fit to 1660 high → trim 1–2 px each side → 1242×1660
cover:            card 1 (the poster) — template 「剧名 / 第N集 / one-line hook」
caption:          标题 (18 chars): 穿越战神｜第1集他回来了跪的是谁 · 正文: 3 short lines with emoji markers, the keyword 穿越战神 in line 1, 主页看全集 as the last line
hashtags:         6 / no fixed cap: #穿越战神 #短剧推荐 #逆袭 #穿越 #第1集 #AI短剧
CTA:              关注 + 主页看全集
posting slot:     Thu 12:30 CST — not confirmed for 小红书, starting point
disclosure:       「AI生成」 toggle on
status:           planned
```

```
campaign:         穿越战神 E01–E03 launch, week 1
platform:         Instagram
surface:          Reels
ratio:            9:16
px:               1080×1920
duration cap:     3 min in-app / planned: 30 s
safe zone:        Meta unified (Mar 2026): 269 px top, 384–672 px bottom, 65 px sides
source asset:     the 抖音 teaser's segments (same references), English subtitle layer regenerated
generation plan:
  model:          same clips as 抖音 (no new generation); overlay layer in English at the final ratio
  ratio:          9:16
  resolution:     1080p
  duration:       30 s
  references:     —
  prompt notes:   hook variant B for this market: the result-first cut (the kneel) before the line
crop:             none
cover:            first frame of variant B; title in the centre — the grid tile is 3:4
caption:          "You should be the one kneeling." Ep 1 of 穿越战神 — full episode in bio.
hashtags:         5 / 5: #shortdrama #aidrama #cdrama #reels #ep1
CTA:              full episode in bio
posting slot:     Tue 12:00 local — Sprout 2026 starting point (Mon–Thu 10–15)
disclosure:       Meta AI label per policy (auto-detected from Jun 2026; state it in the caption as well)
status:           planned
```

```
campaign:         穿越战神 E01–E03 launch, week 1
platform:         Instagram
surface:          feed poster (4:5)
ratio:            4:5
px:               1080×1350
duration cap:     —
safe zone:        avoid the outer 3 % per side (3:4 grid crop since Jan 2025)
source asset:     the 小红书 poster's references
generation plan:
  model:          nano-banana-pro
  ratio:          4:5
  resolution:     2K
  references:     @image1 = C01 sheet · @image2 = C02 sheet · @image3 = S02 sheet
  prompt notes:   same composition as the 3:4 poster; English title band 「WARLORD RETURNS · EP 1」 rendered in the picture
crop:             none (4:5 is native to nano-banana-pro)
cover:            itself
caption:          hook line + 2 lines + "full episode in bio"
hashtags:         5 / 5
CTA:              full episode in bio
posting slot:     with the Reel, same day
disclosure:       Meta AI label per policy
status:           planned
```

The 抖音 poster sheet mirrors the 小红书 one at 9:16 (a native 9:16 generation, title in the
centre 60 %), and the 抖音 teaser variant C (the direct question hook) is a fourth video sheet
with only the hook segment regenerated. Six sheets, one references set, two image generations
per ratio, four video segments plus two extra hook segments — that is the whole quote.
