# The ad brief — template and a filled example

The brief (創意簡報) is the single document every generation is checked against: what the
product is, who sees the ad, what it must do, in which sizes, in which style, with which words.
Fill every field before generating anything; a missing field is a question to the client, not a
guess. Formats are defined in `reference/formats-video.md` and `reference/formats-image.md`,
styles in `reference/styles.md`, model choices in `reference/models.md`, disclosure in
`reference/compliance.md`.

## Fields

| Field | What goes in it | Why it matters |
| --- | --- | --- |
| Product | name, variant, size, what it is in one sentence | the subject clause of every prompt |
| Packshots | the approved product images (front; back / open if shown), file names or references | the identity reference `@image1`; see `reference/ai-consistency.md` |
| Audience | who, where, what they already know, what they are doing when they see the ad | hook and framework choice |
| Objective | awareness · consideration · conversion · retargeting, with the one metric | AIDA vs PAS; length; CTA strength |
| Format and length | from the formats table: e.g. 15 s social ad, 30 s TVC, KV + banners | the timecode skeleton and clip count |
| Placements and ratios | every surface, its ratio and pixel size | the master ratio and the crop / regeneration list |
| Style | one of the 13 styles, with any reference mood words | every prompt's look clauses |
| Brand colours | hex values for primary, secondary, background; type feeling (serif / sans) | palette clauses; overlay design |
| Must show | product moments that have to be in the ad (the pour, the label, the app screen) | shot list |
| Must say | the claim, the tagline, the offer, exact wording | overlay copy; substantiation check |
| Must not | anything forbidden by the client (no ice, no competitor red, no children) | negative constraints in prompts |
| CTA | the verb and the destination | end card; platform button |
| Legal lines | small print, offer terms, age or health notices, exact text | overlays; never generated |
| AI disclosure | which platforms and jurisdictions; whether a synthetic person or voice appears | labels and marks before publishing |
| Talent and consent | real people, voices, creators involved; consent status | compliance |
| Budget and credits | credit cap for generation, number of variants, deadline | how many stills and clips to plan |
| Approval | who approves the packshot, the KV, the stills, the final | the gate before each generation round |

## Template

```
AD BRIEF — <product>
Product:            <name · variant · size · one-line description>
Packshots:          <@image1 front · @image2 back / open · @image3 logo file>
Audience:           <who · market · language · context of viewing>
Objective:          <awareness | consideration | conversion | retargeting> — metric: <…>
Format & length:    <format from formats-video.md / formats-image.md> — <seconds or sizes>
Placements & ratios:<surface: ratio px> · <surface: ratio px> · …   master ratio: <16:9 | 9:16>
Style:              <one of the 13> — mood words: <…>
Brand colours:      primary #… · secondary #… · background #… · type: <serif | sans>
Must show:          <…>
Must say:           <claim> · <tagline> · <offer>
Must not:           <…>
CTA:                <verb> → <destination>
Legal lines:        <exact text>
AI disclosure:      <platforms · jurisdictions · synthetic person / voice: yes | no>
Talent & consent:   <…>
Budget & credits:   <credit cap> · <variants> · <deadline>
Approval:           packshot <who> · KV <who> · stills <who> · final <who>
```

## Filled example — bottled oolong tea

```
AD BRIEF — 山青 冷泡烏龍 (Shanqing Cold-Brew Oolong) 500 ml
Product:            Shanqing cold-brew oolong tea, 500 ml glass bottle, unsweetened, amber
                    liquid, cream label with a dark-green mountain mark, dark-green cap.
Packshots:          @image1 front packshot on transparent background (approved 2026-09-28)
                    @image2 cap-off packshot · @image3 brand logo file (do not regenerate)
Audience:           office workers 25–40 in Taiwan and Hong Kong, afternoon slump, scrolling
                    Instagram / 抖音 on the phone; know oolong, do not know cold-brew.
Objective:          conversion (7-Eleven and online shop) — metric: click-through to shop.
Format & length:    15 s vertical social ad (PAS, hook in 3 s) + 1080×1080 key visual.
Placements & ratios:Instagram Reels 9:16 1080×1920 · 抖音 9:16 1080×1920 · Instagram feed KV
                    1:1 1080×1080 · Facebook link image 1.91:1 1200×628 (crop of a 16:9 KV)
                    master ratio: 9:16
Style:              Food, leaning Minimal — mood words: cold, clear, mountain air, 3 pm.
Brand colours:      primary #1F4D3A (mountain green) · secondary #F3EEE2 (cream) ·
                    background #0E1F1A (deep green-black) · type: serif headline, sans body
Must show:          condensation on the bottle · the label readable · the first sip · the cap
                    twisting open (sound-off: show the twist)
Must say:           claim "冷泡 12 小時，零糖零卡" (cold-brewed 12 h, zero sugar zero calories)
                    · tagline "把三點的下午冰一下" · offer none this round
Must not:           no ice cubes in the bottle · no lemon · no hot tea steam · no children
CTA:                "現在就冰一瓶" → shop page; Meta button: Shop Now
Legal lines:        "每 100 ml 熱量 0 kcal。冷藏保存，開封後請盡快飲用。" (overlay, bottom
                    band, ≥ 24 px at 1080 wide)
AI disclosure:      Meta AI info label · 抖音 「AI生成」 visible mark + metadata; no synthetic
                    person speaks; hand only, no face.
Talent & consent:   none (hand model is AI-generated, no likeness); voice-over is a licensed
                    human read, not a clone.
Budget & credits:   cap 600 credits · 3 hook variants for the first 3 s, 1 CTA · final by 10-06
Approval:           packshot: brand manager · KV: brand manager · stills: creative director ·
                    final: brand manager + legal
```

### What the example produces

| Step | Output | Parameters |
| --- | --- | --- |
| KV | 1:1 hero, bottle low-angle, backlit amber, condensation, dark green-black gradient, upper third empty | `nano-banana-pro`, ratio 1:1, resolution 2K, `@image1` packshot + `@image3` logo for placement only; headline overlaid after |
| KV 16:9 | the same composition regenerated wide for the 1200×628 crop | same model, ratio 16:9, 2K |
| Stills (9:16) | 1 hook macro · 1 desk "before" · 1 bottle lift (start) + 1 cap twist (end) · 1 first sip · end card is an overlay image | `nano-banana-pro` or `gpt-image-2.5`, ratio 9:16, 2K, `@image1` first, identity clause |
| Clips | 4 clips of 3–4 s from the stills: 0–3 hook, 3–7 before, 7–11 twist (first + last frame), 11–14 sip; 14–15 end card | `seedance-2.5`, ratio 9:16, 720p, duration 4 (trim), `generate_audio` on for ambience; packshot referenced on the twist via the ref variant |
| Variants | hook A condensation macro · hook B cap twist first · hook C the tired hand | one change each; same seeds, light, lens |
| Overlays | claim (3–7 s), tagline (11–14 s), CTA + legal line on the end card, inside the 9:16 safe band | approved text, never generated |
| Disclosure | Meta AI info label · 抖音 「AI生成」 mark | before publishing |

Roughly 9 stills and 4–6 clips, quoted before the first generation and kept under the 600-credit
cap; the social-media skill turns the master into the remaining placements.
