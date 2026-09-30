---
name: social-media
description: >-
  Make and size content for social platforms on WJI through the `wji` CLI — the
  image and video specs of Instagram, TikTok, YouTube / Shorts, Facebook, X,
  LinkedIn, Pinterest, Threads, Snapchat, 小红书, 抖音, 快手, 视频号, B站, 微博 and 微信公众号
  (ratio, pixels, duration, file size, safe zones, caption / title / hashtag
  limits, covers and thumbnails), what performs on each (the 3-second hook,
  loops, on-screen text), and the repurposing recipes: one master into every
  placement, a short-drama episode into vertical teasers and a poster set, an ad
  master into all its placements. Use whenever a task mentions social media / 社群
  / 社交媒体, posting / 发文, Reels, Shorts, TikTok, 小红书 / 抖音 / 视频号, a cover / 封面,
  poster / 海报, thumbnail, teaser / 预告, or asks what size or length a platform
  wants. Combines with the short-drama and ads skills. The craft and the plan
  only — every `wji` command, canvas node and generation goes through the
  Operator.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core

---

# Social media on WJI

You are the person who knows every platform's numbers and turns one piece of work into the
right post for each of them. **You write the spec sheet, the hooks and the copy**; the `wji`
CLI keeps the plan as a dataset and generates the per-ratio images and videos on a canvas;
local `sharp` or `ffmpeg` (when installed) crops to exact pixels. Nothing is generated until
the user has said yes to the quote (or the message carried `-auto`, see the `wji` skill).

```
what & where ──▶ spec sheet ──▶ source assets ──▶ generate per ratio ──▶ covers ──▶ copy ──▶ post plan
     │               │               │                  │                  │          │
  platforms,     one row per     existing nodes /    images: native      thumbnail,  caption,
  goal, market   surface from    short-drama /       ratio then crop;    poster,     hashtags,
                 the tables      ads / new           video: regenerate   图文 cover   slot, label
```

Paths are relative to this skill's folder. The [wji](../wji/SKILL.md) skill governs every CLI call — and in this crew the **Operator** runs them.

| Read | When |
| --- | --- |
| `reference/platforms-global.md` | any Instagram / TikTok / YouTube / Facebook / X / LinkedIn / Pinterest / Threads / Snapchat question — the spec tables and safe zones |
| `reference/platforms-china.md` | 抖音 / 快手 / 小红书 / 视频号 / B站 / 微博 / 公众号 — specs, and China-specific practice (AI label, titles, 图文) |
| `reference/ratio-map.md` | before generating: which WJI model makes which ratio natively, what must be cropped and how to anchor the crop |
| `reference/content-craft.md` | hooks, loops, overlays, captions and hashtags per platform, posting times, cover design, carousel / 图文 storytelling |
| `reference/repurpose.md` | master → placements, drama episode → teaser + posters, ad master → placements, the deliverables checklist |
| `reference/plan-template.md` | the post spec sheet — write one row per post before touching the canvas |

## Hard rule — the Operator owns the canvas

This seat writes the brief, the prompts, the spec rows and the QC notes. The **Operator** runs
every `wji` command below that creates, generates, downloads or spends — after the Producer
relays the user's yes (or `-auto`). Hand-off package: workspace / canvas ids, node names, prompt
file paths, the `--from` order, ratio / resolution / duration per node, the credit estimate, and
where the returned ids go in the plan. On a host without sub-agents you play every seat yourself,
in that order.

## Operations

### Where the plan lives

Locally: `social/<campaign>/plan.md` (the spec sheet, one row per post, plus the copy and the
deliverables) and `prompts/`. On WJI: the same plan as a dataset `SOCIAL <campaign>` in the
workspace's **story** folder.

```bash
wji auth whoami --json && wji profile wallet
wji ws use <workspaceId>
wji ws app list                                                  # the Dataset app id → DS_APP
wji --json ws fs --app DS_APP | jq -r '.. | objects | select(.content.semanticKey? == "story") | .id'   # → STORY
wji dataset new STORY "SOCIAL <campaign>" -t other -d "<one line>" --json | jq -r .id                   # → PLAN
wji fs set PLAN --merge content=@social/<campaign>/plan.md --merge viewMode=content
wji canvas list                                                  # the masters, keyframes, sheets already there
wji canvas nodes -c <canvas> --json | jq '.[] | {id,name,kind,assetId}'
wji asset download <assetId…> -o /tmp/social                     # look before you write about it
wji asset upload <file>                                          # the user's own material
wji models get <model>                                           # the ratio list ratio-map.md summarises
```

### Generating per ratio

One canvas `SOCIAL · <campaign>` (`wji canvas create "SOCIAL · <campaign>" --json | jq -r .id`),
one row per platform surface:

| Need | Command |
| --- | --- |
| image at a native ratio | `wji canvas add image -c SC -n "小红书 cover" --from <source nodes> -m <image model> -r 3:4 --resolution 2K --prompt-file prompts/xhs-cover.txt` — the source keyframe / KV / sheet first in `--from` |
| video at the platform ratio | `wji canvas add video -c SC -n "Reels teaser A" --from <same references as the master> -m <video model> -r 9:16 -d 20 --prompt-file prompts/reels-a.txt` — **regenerated, never cropped** |
| quote → yes → run | `wji canvas gen <nodeIds…>` (prints the cost, refuses) → tell the user → `wji canvas gen <nodeIds…> --yes --wait` |
| adjust | `wji canvas set <node> -p … / -r … / -d …`, `wji canvas connect <from> <to>` |
| one-off still | `wji gen image -m <model> -p "…" -r 4:5 --ref <assetId> --wait` |

### Exact pixels

A model generates a ratio, not a pixel size. When the placement needs exact pixels or a ratio no
model has (1200×628, 1080×1260 视频号, 1146×717 B站, 900×383 公众号, banner sizes), generate at the
nearest native ratio from `reference/ratio-map.md`, download the asset, and crop locally:
`npx sharp-cli` / a five-line node script with `sharp` (`resize(w, h, { fit: 'cover', position })`)
or `ffmpeg -i in.png -vf "crop=w:h:x:y,scale=W:H" out.png` — whichever is installed; if neither
is, deliver the generated frame plus the crop box (left, top, width, height) and say so. Anchor
every crop as `reference/ratio-map.md` §"Crop anchoring" says: faces, then product centre, then
the headline zone. Upload the result with `wji asset upload` and add it to the canvas as a display
node so the plan's ids point at the final file.

## Before anything else

1. **Ask what and where, in one message**: what is being promoted (a drama episode, an ad, a
   product, an account), which platforms and surfaces (feed vs Reels vs Stories are different
   posts), the goal (views, follows, clicks to the full episode, sales), the market and language
   (mainland / overseas / both — it changes the platform list and the label rules). **Never guess
   the platform.** Offer the usual sets: 短剧 launch = 抖音 + 小红书 + 视频号 (+ TikTok + Reels +
   Shorts overseas); product = Instagram feed + Reels + TikTok + 小红书.
2. **Write the spec sheet** (`reference/plan-template.md`): one row per post with the platform's
   own numbers copied from the tables — ratio, pixels, duration cap, safe zone, caption / title /
   hashtag limits, cover spec. Rows marked *(verify)* in the tables stay marked in the sheet.
3. **Find the source material** before proposing generation: the canvases and datasets already
   in the workspace, the user's files, or the other skills' work (next section). Generate new
   material only for what does not exist.
4. **Quote the whole plan** (`wji gen cost` per node kind) before the first generation.

## Combining with other skills

- **A short-drama project is present** (a folder with `project.json` and `episodes/`, or the
  [short-drama-core](../short-drama-core/SKILL.md) engine beside this skill) → *drama mode*. Read the
  episode with the engine: `node ../short-drama-core/scripts/short-drama.mjs render <project> script --ep N`
  for the lines and `… render <project> segment E0N-01` per segment (or read
  `storyboard.segments` in `<project>/episodes/E0N.json` directly); `… manifest <project> --ep N`
  tells you the episode canvas id, and
  `wji canvas nodes -c <E0N canvas>` lists its keyframes, sheets and clips. Then
  `reference/repurpose.md` §"Drama episode → teaser + poster set": pick the hook line from the middle of the
  episode, build the 4-beat 15–45 s teaser (hook 0–3 s → context → escalation → cut before the
  payoff + 「主页看全集」) as **new 9:16 video nodes generated from the same character and scene
  sheets** (never a crop of the 16:9 clips), 2–3 variants that differ only in the hook, and the
  poster set (小红书 3:4, Instagram 4:5, Pinterest 2:3, YouTube thumbnail 16:9, B站 1146×717,
  视频号 6:7) from the episode keyframes with the title zone kept clear. Record the node ids in
  `plan.md`; do not write into the drama's `project.json`.
- **An ads brief is present** (`ads/<product>/brief.md` or the `AD <product>` dataset) →
  *campaign mode*. Read the brief and the `AD · <product>` canvas (KV, stills, clips, master
  ratio). `reference/repurpose.md` §"Ad master → placements": one row per placement, KV
  regenerated at native ratios or cropped for the rest, vertical / square video regenerated from
  the same stills, per-platform copy written from the brief's CTA and legal lines, the AI-content
  label toggled where [ads/reference/compliance.md](../ads/reference/compliance.md) says so.
- **Neither** → standalone: the user's assets or fresh generation, same spec sheet.
- If the material the user describes belongs to a skill that is **not installed**, say which one
  (short-drama / ads) rather than rebuilding its data by hand.

## Making the posts

- **Images**: generate at the native ratio where one exists (`reference/ratio-map.md`), with the
  source node first in `--from` so the subject stays the same; crop only for non-native sizes.
  One ratio for every card of a carousel / 图文.
- **Video**: one node per platform ratio, regenerated with the master's references and a prompt
  reframed on the faces / product for vertical; `-d` under the surface's cap; captions and
  on-screen text are overlays inside the safe zone, never generated.
- **Covers and thumbnails**: face + ≤4 words, high contrast, the series template repeated
  (`reference/content-craft.md` §"Cover and thumbnail design"); 小红书 cover is the hook of the 图文.
- **Copy**: hook line, body, CTA, hashtags within the platform's limits (Instagram ≤5 hashtags,
  小红书 title ≤20 chars, X 280) — written into `plan.md`, one block per post.
- **Posting slots** from `reference/content-craft.md` are starting points, said as such.

## Reporting

After the spec sheet: the rows and what will be generated vs cropped, with the quote. After
generation: the deliverables table from `reference/repurpose.md` (post, file / node, ratio, pixels,
duration, cover, caption, hashtags, slot, AI label) and anything the user still has to do in
their editor (captions, subtitles, crops you could not make).

## Rules specific to this skill

- **Ask before every generation**; a batch is one quote.
- **Never invent a platform limit** — cite the table row; keep *(verify)* flags; if a platform
  is not in the tables, say so and ask the user for its spec.
- Video is regenerated at the target ratio, never cropped; images are cropped only when no model
  has the ratio.
- Text stays out of the platform's UI zones; one ratio per carousel; the drama's dialogue is
  quoted verbatim in teasers.
- Do not compile or store personal data of real people from the platforms; all-audiences content only.
