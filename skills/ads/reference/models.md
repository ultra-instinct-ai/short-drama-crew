# Models for ads — ratios, sizes, durations, references

The image, video and audio models available on the platform (WJI) that matter for ad work, with the parameter values each
one accepts, checked against the platform's model definitions (Sep 2026). `ratio`, `resolution`
and `duration` are validated per model, so a placement plan must map onto a value in these
tables; anything else (1.91:1, 6:7, banner strips) is generated at the nearest ratio and cropped
(images, see `reference/formats-image.md`) or regenerated (video, see
`reference/formats-video.md`). Text-in-image and transparency notes are the vendors' published
strengths, not platform guarantees.

## Image models

| Model | Ratios | Resolution / size | Refs | Text in image | Special |
| --- | --- | --- | --- | --- | --- |
| `gpt-image-2` | auto · 1:1 · 4:3 · 3:4 · 16:9 · 9:16 | 1K · 2K · 4K; quality low / medium / high | 16 | strong, short headlines reliable | instruction-following edits |
| `gpt-image-2.5` (sunburst / flare variants) | auto · 1:1 · 4:3 · 3:4 · 16:9 · 9:16 · **21:9** | auto · 1k · 1080p · 1440p · 4k (long edge ≤ 3840); quality auto → max | 16 | strong | `background: transparent` (PNG) for packshots and logos; flare = change only what is asked, keeps subject / composition / background |
| `nano-banana` | auto · 1:1 · 2:3 · 3:2 · 3:4 · 4:3 · **4:5** · 5:4 · 9:16 · 16:9 · 21:9 · 9:21 | fixed (≈ 1K) | 8 | good | cheapest 4:5; batch up to 8 |
| `nano-banana-pro` | same 12 ratios | 1K · 2K · 4K | 8 (fal variant 14) | strongest multilingual text; up to 6 object refs high-fidelity (vendor) | KV with headline drafted in-frame |
| `nano-banana-2` / `-2-lite` | same 12 ratios (lite: no 9:21) | 0.5K · 1K · 2K · 4K (lite: 1K only) | 8 (fal variant 14) | good | fast iterations; lite for thumbnails of variants |
| `bytedance-seedream-4.5` | match_input · 1:1 · 4:3 · 3:4 · 16:9 · 9:16 | 2K · 4K | 10 | good, 10+ languages (vendor) | sequential image generation: a numbered series from one prompt |
| `seedream-5-lite` | + 3:2 · **2:3** · 21:9 | size 2K · 3K | 14 | good | largest ref count of the Seedream family |
| `seedream-5-pro` | + 3:2 · **2:3** · 21:9 | size 1K · 2K; png / jpeg | 10 | good | `layer_decomposition`: subject split into layers (needs a reference); single output |
| `flux-2-flex` | match_input · 1:1 · 16:9 · 3:2 · 2:3 · **4:5** · 5:4 · 9:16 · 3:4 · 4:3 | 0.5 · 1 · 2 · 4 MP | 10 | fair; short words | steps / guidance controls; second choice for 4:5 |
| `marketing-studio-image` | auto · 1:1 · 3:2 · 2:3 · 4:3 · 3:4 · 16:9 · 9:16 · 21:9 | 1k · 2k · 4k | 8 | fair | tuned for a commercial "marketing" look; cheapest 4K |
| `runninghub-midjourney-v7` | 1:1 · 4:3 · 3:2 · 16:9 · 3:4 · 2:3 · 9:16 | fixed; quality 1 / 2 / 4 | 5 image + 5 omni + 5 style, weighted | weak; do not rely on it for labels | mood boards, style frames; negative prompt |
| `runninghub-midjourney-v8.1` / `v8.2` | same 7 | native 2K | 8.1: 5; 8.2: 2 (first = image ref, second = style ref) | weak | style exploration only; never the packshot |

Bold ratios are the only sources of 4:5 and 2:3 on the platform. No image model outputs 1.91:1,
6:7 or any banner strip.

## Video models

| Model | Ratios | Duration | Resolutions | Refs | Audio | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `minimax-h3` | 21:9 · 16:9 · 4:3 · 1:1 · 3:4 · 9:16 | 5–15 s | 480P · 768P native; 2K · 4K upsampled | none (text only) | no | prompt expansion on by default |
| `minimax-h3-i2v` | follows the input image | 5–15 s | as above | first / last frame | no | the keyframe route for h3 |
| `minimax-h3-ref` | adaptive + the six | 5–15 s | as above | 9 images + 3 videos + 3 audios (≤ 12 total) | no | refer as Image 1 / Video 1 / Audio 1 |
| `seedance-2.5` (first / last frame) | 21:9 · 16:9 · 4:3 · 1:1 · 3:4 · 9:16 | 4–30 s, or `autoDuration` | 480p · 720p · 1080p (Higgsfield route: 480p · 720p) | first / last frame only | `generate_audio` on by default | ratio follows the frames when given; mp4 / mov |
| `seedance-2.5-ref` | same six | 4–30 s, or auto | as above | 30 images + 10 videos + 10 audios | `generate_audio` | task mode auto / edit / extend; edit and extend need a reference video |
| `seedance-2.0` family | same six | 4–15 s, or auto | 480p · 720p · 1080p · 4k | ref variants: images + video + audio | `generate_audio` | the 4K option of the family |
| `wan-3.0` / `-prime` | 16:9 · 4:3 · 1:1 · 3:4 · 9:16 | 2–30 s, or `autoDuration` | 480P · 720P · 1080P | first / last frame | `audio` on by default | optional "AI Generated" watermark; seed for repeatability |
| `wan-3.0-ref` / `-prime-ref` | same five | 2–30 s, or auto | as above | 10 images + 5 videos + 5 audios (≤ 15 s total) | `audio` | |
| `veo-3.1` / `-fast` | 16:9 · 9:16 · auto | 4–8 s | 720p · 1080p · 4k | first / last frame | `generate_audio` | negative prompt available |
| `veo-3.1-ref` | 16:9 · 9:16 | 8 s fixed | 720p · 1080p · 4k | 1–10 images | `generate_audio` | |
| `kling-3` / `-pro` | 16:9 · 9:16 · 1:1 | 3–15 s | model default | 7 images, plus first / last frame | `generate_audio` (off by default) | pro = higher quality |
| `happy-horse` | 16:9 · 9:16 · 1:1 · 4:3 · 3:4 | 3–15 s | 720p · 1080p | 9 images, plus first frame | no | |

## Audio

| Model | Length | Refs | Use |
| --- | --- | --- | --- |
| `seed-audio-1.0` | ≤ 120 s | 1 image + up to 3 reference audios (≤ 30 s each) for voice cloning | voice-over, product sound beds, a jingle; mp3 / wav / pcm / ogg |

Voice cloning needs the speaker's consent on file; see `reference/compliance.md`.

## Pick by need

- **Packshot on transparent background** → `gpt-image-2.5` with `background: transparent`, 1:1,
  4k; the result becomes `@image1` for everything after.
- **KV with a headline rendered in the picture** → `nano-banana-pro` (best text, especially
  non-Latin scripts), then `gpt-image-2.5`, then `seedream-5-pro`. Still overlay the final,
  approved copy afterwards; in-frame text is a layout draft.
- **4:5 feed image** → `nano-banana` / `nano-banana-pro` / `nano-banana-2`, or `flux-2-flex`.
- **2:3 (Pinterest, posters)** → `nano-banana` family, `seedream-5-lite` / `-pro`,
  `marketing-studio-image`, Midjourney.
- **21:9 for banner crops** → `gpt-image-2.5`, `nano-banana` family, `seedream-5`,
  `marketing-studio-image`.
- **Many references (product + props + set + model)** → `gpt-image-2` / `2.5` (16),
  `seedream-5-lite` (14), `nano-banana-pro` (8, or 14 on the fal variant).
- **Product layers for an animator** → `seedream-5-pro` with `layer_decomposition` on and the
  packshot as reference.
- **A cheap "commercial look" first pass** → `marketing-studio-image` at 1k, then re-generate
  the chosen frame on a text-capable model.
- **Exact edit of an approved KV (swap the background, keep the pack)** → `gpt-image-2.5` flare
  variant with the KV as `@image1`.
- **Video with native audio in one pass** → `seedance-2.5` (30 s cap), `veo-3.1` (8 s),
  `wan-3.0`, `kling-3` with `generate_audio`.
- **Clip from an approved still** → any first-frame model: `seedance-2.5`, `wan-3.0`,
  `veo-3.1`, `kling-3`, `minimax-h3-i2v`, `happy-horse`; add the packshot as a reference on the
  `-ref` variants when the product turns or is handled.
- **First-and-last-frame clip (two approved stills)** → `seedance-2.5`, `wan-3.0`, `veo-3.1`,
  `kling-3`, `minimax-h3-i2v`.
- **1:1 video** → `seedance`, `wan-3.0`, `kling-3`, `happy-horse`, `minimax-h3`; not `veo-3.1`.
- **21:9 cinematic video** → `seedance-2.5` / `2.0`, `minimax-h3`.
- **Extending or editing an existing clip** → `seedance-2.5-ref` with task mode extend / edit.
- **4K video** → `seedance-2.0`, `veo-3.1`, `minimax-h3` (upsampled).
- **Voice-over or jingle** → `seed-audio-1.0`.

Duration, resolution and reference counts above are the accepted ranges; cost scales with
resolution and seconds, so quote the estimate before generating.
