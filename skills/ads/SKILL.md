---
name: ads
description: >-
  Make commercials and ad creative with AI on WJI through the `wji` CLI — video
  ads (TVC 15 / 30 / 60 s, 6-second bumpers, skippable and non-skippable pre-
  roll, 9–34 s social ads, product demos, UGC-style, testimonials, explainers)
  and ad images (product shots / 产品图, key visuals / 主视觉 KV, display banners),
  with studio lighting and product-photography vocabulary, visual styles by
  industry, second-by-second ad structure (hook in 3 s, brand by 5 s, CTA card),
  product identity locked across every generation, deliverables per placement
  and AI-disclosure compliance. Use whenever a task mentions an ad / 广告 / 廣告, a
  commercial, TVC, product shot, packshot, banner, key visual, promo / 宣传片 or
  brand video. Hands per-platform sizes to the social-media skill. The craft and
  the plan only — every `wji` command, canvas node and generation goes through
  the Operator.
license: UNLICENSED
metadata:
  crew: short-drama-crew

---

# Ads on WJI

One brief, one canvas, one master. **You write the brief, the concept and every prompt**; the
`wji` CLI keeps the brief as a dataset, lays the work out on a canvas and generates the stills
and clips. Nothing is generated until the brief is complete and the user has said yes to the
quote (or the message carried `-auto`, see the `wji` skill).

```
brief ──▶ concept & hooks ──▶ key visual / storyboard ──▶ stills ──▶ clips ──▶ master + deliverables
  │            │                    │                        │          │            │
 brief.md   3–5 hooks,           shot list with           product-   image-to-   ratio variants,
 + story/   framework,           timecodes, one           locked     video,      overlays, end card
 dataset    CTA & end card       master ratio             KV + keys  3–8 s each  → social-media skill
```

Paths are relative to this skill's folder. Read `reference/brief-template.md` before asking the user
anything and `reference/formats-video.md` or `formats-image.md` before proposing a format.
The [wji](../wji/SKILL.md) skill governs every CLI call (auth, confirmations, spending policy, model choice) — and in this crew the **Operator** runs them.

| Read | When |
| --- | --- |
| `reference/brief-template.md` | before the first question — the fields, and what a complete brief looks like |
| `reference/formats-video.md` | choosing a video format, its length and second-by-second structure; cutting the ad into clips |
| `reference/formats-image.md` | a KV, packshot or banner: IAB / Google / Meta sizes, text limits, generate-then-crop |
| `reference/product-photography.md` | writing any product still: lighting setups, shot types, backgrounds, lens, grade, the prompt template |
| `reference/styles.md` | picking the look — 13 styles with signifiers and prompt phrases, by industry |
| `reference/ai-consistency.md` | before generating: how the product stays the same across stills and clips, what never to generate |
| `reference/models.md` | which WJI model for which need (ratios, resolutions, references, text in image, transparent background) |
| `reference/compliance.md` | before delivery: AI-content labels per platform / jurisdiction, misleading-depiction rules |

## Hard rule — the Operator owns the canvas

This seat writes the brief, the prompts, the spec rows and the QC notes. The **Operator** runs
every `wji` command below that creates, generates, downloads or spends — after the Producer
relays the user's yes (or `-auto`). Hand-off package: workspace / canvas ids, node names, prompt
file paths, the `--from` order, ratio / resolution / duration per node, the credit estimate, and
where the returned ids go in the plan. On a host without sub-agents you play every seat yourself,
in that order.

## Operations

### Where the brief lives

Locally: an `ads/<product>/` folder with `brief.md` (the brief, concept, shot list and
deliverables — one file, sections in that order) and `prompts/` (one text file per still and
clip, so `--prompt-file` can send them verbatim). On WJI: the same brief as a dataset in the
workspace's **story** folder, so the canvas and the chat see it.

```bash
wji auth whoami --json && wji profile wallet            # preflight; an ad is a handful of stills + 4–8 clips
wji ws use <workspaceId>                                 # or wji ws create "<product> ads" -r 16:9
wji ws app list                                          # the Dataset app id → DS_APP
wji --json ws fs --app DS_APP | jq -r '.. | objects | select(.content.semanticKey? == "story") | .id'   # → STORY
wji dataset new STORY "AD <product>" -t other -d "<one line>" --json | jq -r .id                       # → BRIEF
wji fs set BRIEF --merge content=@ads/<product>/brief.md --merge viewMode=content                      # the brief text
wji asset upload ads/<product>/packshot.png              # the user's product photo → PACK asset id
wji models get <model>                                   # confirm ratios and the reference cap before promising a size
```

### The canvas

One canvas per ad, `AD · <product>`, rows top to bottom:

| Row | Nodes | Command |
| --- | --- | --- |
| 1 references | the packshots and brand assets | `wji canvas add image -c CV -n "packshot" --asset PACK --at 0,0` (display nodes) |
| 2 key visuals | one image node per style / hook variant | `wji canvas add image -c CV -n "KV minimal" --from P1 -m <image model> -r 1:1 --resolution 2K --prompt-file prompts/kv-minimal.txt --at 0,400` — the packshot node is always **first** in `--from` (`@image1`) |
| 3 storyboard stills | one per clip, in order | same, `--from P1 KV1` so light and grade carry over |
| 4 clips | one video node per still | `wji canvas add video -c CV -n "clip 01" --from S1 P1 -m <video model> -r 16:9 -d 5 --prompt-file prompts/clip-01.txt` |
| 5 copy | headline / CTA / legal lines | `wji canvas add text -c CV --text-file ads/<product>/overlays.md --plain` beside the clip they belong to — overlays are added in the edit, **never generated into the picture** |

`--from` order sets `@imageN`; `wji canvas connect <from> <to>` adds a reference later. Quote
first — `wji canvas gen <nodeIds…>` prints the cost and refuses — tell the user, then
`wji canvas gen <nodeIds…> --yes --wait` after the yes. `wji canvas set <node> -p … / -r … / -d …`
changes a node without rebuilding it; `wji canvas get <node> --json | jq -r .assetId` then
`wji asset download <asset> -o /tmp/ad` to look at a result before approving it.

For a one-off still with no canvas: `wji gen image -m <model> -p "…" -r 1:1 --ref PACK --wait`
— it still needs the user's yes first unless the message carried `-auto`.

Take ids from the command's own JSON (`wji --json canvas add … | jq -r .id`), never by searching
names. Ratio, resolution and duration are validated against the model — copy the spelling from
`wji models get`.

## Before anything else

1. **Read the brief template**, then **ask for what is missing in one message**: product (and a
   packshot or product photo — without one the product cannot be kept consistent), audience,
   objective (awareness / conversion / retargeting), format and length, placements and their
   ratios, style, brand colours (hex), must-show / must-say, CTA, legal lines, whether the ad
   will run where AI content must be labelled. Offer defaults where the user has none
   (`reference/formats-video.md` §"Formats at a glance", `reference/styles.md` §"Choosing by industry"), but
   **do not generate anything without the product reference and the placement**.
2. **Write `brief.md`** and push it as the `AD <product>` dataset. Everything later reads from it.
3. **Confirm the master ratio**: 16:9 when the primary placement is YouTube / TV / display,
   9:16 when it is Reels / TikTok / Shorts / 抖音, 1:1 or 4:5 for feed-only. One master; the
   other ratios are made later (stills regenerated or cropped, video regenerated — see
   `reference/formats-image.md` §"Generate, then crop" and the social-media skill).
4. **Check the wallet and quote** (`wji gen cost`) before every generation; say what the whole
   plan will cost before starting row 2.

## Stage 1 — Concept

- Pick the framework (`reference/formats-video.md`): AIDA for cold audiences and launches, PAS
  for retargeting, ABCD as the checklist for anything on YouTube. Write **3–5 hooks** (first
  3 seconds), pick one with the user, keep the others as A/B variants.
- Write the **shot list with timecodes**: hook 0–3 s, product in frame by 3 s, brand by 5 s,
  proof / demo, CTA card in the last 2–5 s. Sound-off first: every beat must read with captions
  and no audio.
- Cut the ad into **clips of 3–8 s**, each one generation, sized to the video model
  (`reference/models.md`: h3 5–15 s fixed, seedance-2.5 4–30 s auto, wan 2–30 s, veo 4–8 s,
  kling 3–15 s). A 15-s vertical ad is typically 3 clips + end card; a 30-s TVC 5–7 clips.
- For an **image-only** job (KV, banner set, packshot variants) the concept is the layout: where
  the product sits, where the headline zone stays clear, which sizes are needed
  (`reference/formats-image.md`).
- Put the concept into `brief.md` (`## Concept`, `## Shot list`, `## Deliverables`) and
  `wji fs set BRIEF --merge content=@ads/<product>/brief.md`.

## Stage 2 — Key visual and stills

- Build row 1 (packshots, brand refs) and row 2 (one KV per style variant, 2–3 at most). Every
  prompt follows `reference/product-photography.md` §"The prompt template": subject → shot → lighting
  → background → camera → grade → constraints, and ends with the identity line from
  `reference/ai-consistency.md` ("keep the label, shape and colour of @image1 exactly …").
- Pick the model by need (`reference/models.md`): legible text in the picture → nano-banana-pro /
  gpt-image-2.5 / seedream-5-pro; transparent background for a logo or cut-out → gpt-image-2.5
  with `--set background=transparent`; 4:5 or 2:3 placements → nano-banana / flux-2-flex /
  seedream-5; a marketing look out of the box → marketing-studio-image. Default
  `--resolution 2K` for a KV, `1K` while exploring.
- **Never generate** legal text, small print, prices that must be exact, or a real logo — those
  are text nodes and overlays. Headline text may be generated only to preview a layout.
- Download and look at the KVs, show the user, take the pick, then generate row 3 (storyboard
  stills) `--from P1 KV1` so light direction, grade and lens stay the same across the ad.
- Quality pass before any clip: hands on the product, label text, logo drift, product proportions,
  impossible physics (`reference/ai-consistency.md` §"Artefact checklist"). Regenerate a still
  rather than trying to fix it in the clip.

## Stage 3 — Clips

- One video node per approved still, `--from S1 P1`, `-d` from the shot list (whole seconds),
  master `-r`. Prompts describe **motion and camera only** — the look is already in the still;
  repeat the product-identity line.
- Product in frame for the whole clip unless the shot list says otherwise; no text in the video
  prompt (captions and CTA are overlays).
- Voice-over and music: `wji canvas add audio -c CV -m seed-audio-1.0 --prompt-file prompts/vo.txt`
  when the user wants a VO bed; the script lines come from the brief's must-say.
- Quote the whole row, generate after the yes, download and review every clip against the still
  it came from (same product, same light), regenerate the ones that drift.

## Stage 4 — Master and deliverables

- The master is the clip sequence + overlay text in order; assembling the cut, captions and
  overlays happens in the user's editor (or locally with ffmpeg when it is installed and the user
  asks) — list the timeline explicitly (clip → seconds → overlay text) in `## Deliverables`.
- **Other ratios**: stills are regenerated at the placement ratio (or cropped when the ratio is
  not native, `reference/formats-image.md`), video is **regenerated** at the placement ratio
  from the same stills — never cropped. Hand the brief and the canvas to the
  [social-media](../social-media/SKILL.md) seat; it owns the per-platform spec sheet. Otherwise list the sizes yourself
  from `reference/formats-image.md`.
- **Compliance** (`reference/compliance.md`): say whether the ad needs an AI-content label on
  each placement, and never depict a result the product cannot deliver.

## Reporting

After each stage: what is on the canvas (row, node names), what was spent, what the user must
decide next (pick a KV, approve the shot list, approve a clip). After delivery: the deliverables
table (file, ratio, duration, overlay text, label needed) and the A/B variants still unbuilt.

## Rules specific to this skill

- **Ask before every generation**, even one image (the `wji` skill's spending policy is the
  floor; this skill asks for images too, because an ad's stills are its most expensive mistakes).
- **The packshot is `@image1` in every generation** — stills and clips. No packshot, no
  generation; ask for one or generate a packshot first and have the user approve it.
- One master ratio per ad; variants are separate rows, never reframes of the master.
- Text, prices, legal lines and logos are overlays, never generated pixels.
- Do not invent platform limits or sizes — cite the row in `reference/formats-video.md` /
  `reference/formats-image.md`; rows marked *(verify)* are said as such.
- All-audiences content only, no real people's likeness without the user's confirmation that they have the
  rights, no competitor products in frame.
