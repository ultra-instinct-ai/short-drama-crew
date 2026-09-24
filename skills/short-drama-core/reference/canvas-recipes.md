# Canvas recipes for short drama

Command sequences for the three canvas types. All ids are placeholders — take real ones from the
command output (`wji --json canvas add … | jq -r .id`) and `bind` them at once. `$SD` is the
engine alias from the skill's first paragraph.

Common setup (once per project):

```bash
wji ws create "<title>" -r 9:16 --json | jq -r .id     # default template: dataset, image generation, canvas → WS
wji ws use WS
SD bind <project> wji.workspaceId WS
DS_APP=$(wji --json ws get | jq -r '.apps[] | select(.app=="Dataset") | .id')
wji --json ws fs --app $DS_APP | jq -r '.. | objects | select(.content.semanticKey?) | "\(.content.semanticKey) \(.id)"'
SD bind <project> wji.datasetFolders.character <id>        # story / character / location / prop / shot
# zsh: a variable holding several ids is not word-split — pass ids literally or pipe through `while read`
wji models list --feature image        # pick the image model once (GPT Image 2.5 Sunburst if listed)
wji models get "<image model>"         # confirm 1:1 and 16:9 ratios and the max reference count
```

**Prompts as text nodes** (a plan the user will generate from, or a reference to read): text nodes
are Markdown on the web, so pass `--plain` to keep the prompt's line breaks and `--size 600,900` so
it reads without scrolling — `wji canvas add text -c CV -n "E01-01 影片提示词" --text-file /tmp/E01-01.txt --plain --size 620,1300`.

## 1. `characters` canvas

```bash
wji canvas create characters --json | jq -r .id                                  # → CV; bind wji.canvases.characters
# row for C01 (rows 700 px apart: --at 0,0 / 0,700 / …)
wji canvas add title -c CV -t "C01 林小夏" --at 0,0 --json | jq -r .id           # → T1; bind characters.C01.wji.nodes.title
wji canvas add image -c CV -n "C01 headshot" -m "<image model>" -r 1:1 \
  --at 400,0 -p "<image.prompt>, clean front-facing portrait, plain neutral background" --json | jq -r .id   # → H1
wji canvas add image -c CV -n "C01 sheet" --from H1 -m "<image model>" -r 16:9 \
  --prompt-file /tmp/C01-sheet.txt --json | jq -r .id                          # → S1 (file = "@image1 is the face to match exactly. " + image.sheet)
wji canvas add audio -c CV -n "C01 voice" --from H1 -m seed-audio-1.0 \
  -p "$(SD prompt <project> voice C01)" --json | jq -r .id                     # → V1; references the HEADSHOT
#   the prompt is （age;identity;personality;timbre;pitch;pace;accent;emotion;此刻<direction>）<line>
SD bind <project> characters.C01.wji.nodes.headshot H1      # sheet S1, voice V1
```

Generate: headshots for all characters are one batch (quote the total, or `-auto`), then look at
each (`wji canvas get H1 --json | jq -r .assetId` → `wji asset download <asset> -o /tmp/sd`), then
sheets. `wji canvas gen S1 --yes --wait` per node; the result's asset id →
`bind characters.C01.wji.assets.sheet`. Attach to the dataset:

```bash
wji fs set <C01 dataset> --add-images <headshot> <sheet> <voice> --icon <headshot> --set primaryAudio=<voice>
```

Reference for the sheet prompt file: `@image1 is the face to match exactly — same features, same
hairstyle. ` + `image.sheet`.

## 2. `scenes` canvas — one row per scene

```bash
wji canvas create scenes --json | jq -r .id                                      # → SC; bind wji.canvases.scenes
wji canvas add title -c SC -t "S01 便利店店内" --at 0,0
wji canvas add image -c SC -n "S01 sheet" -m "<image model>" -r 16:9 --at 400,0 --prompt-file /tmp/S01-sheet.txt   # → SS1
wji canvas add image -c SC -n "S01 lighting 监控回放绿" --from SS1 -m "<image model>" -r 16:9 \
  -p "@image1 is this exact space; keep structure, materials and wear identical; change only the lighting: <lighting prompt>. Empty scene, no people, cinematic film still"
```

Variants: `--from` the parent scene's sheet node, prompt = parent master view + `changes` +
`keep the structure, materials and wear identical to @image1`.

After generation: inspect (no people, one space across panels), attach
(`--add-images <sheet> <variants…> --icon <sheet>`), bind `scenes.S01.wji.nodes.sheet`,
`scenes.S01.wji.assets.sheet`, `scenes.S01.wji.assets.lighting.<state>`.

## 2b. `props` canvas — one row per prop

Props live on their own canvas: white background, `handheld scale` / `tabletop scale` /
`furniture scale` in the prompt, one **state** node per `states[]` entry referencing the sheet.

```bash
wji canvas create props --json | jq -r .id                                       # → PC; bind wji.canvases.props
wji canvas add title -c PC -t "P01 旧监控硬盘" --at 0,0
wji canvas add image -c PC -n "P01 sheet" -m "<image model>" -r 16:9 --at 400,0 --prompt-file /tmp/P01-sheet.txt   # → PS1
wji canvas add image -c PC -n "P01 state 接在主机上" --from PS1 -m "<image model>" -r 16:9 \
  -p "@image1 is the prop to reproduce exactly. <state prompt>, pure white background, no people, no hands"
```

Inspect (no hands, no people, the same object in every panel), attach
(`--add-images <sheet> <states…> --icon <sheet>`), bind `props.P01.wji.nodes.sheet`,
`props.P01.wji.assets.sheet`, `props.P01.wji.assets.states.<state>`. On the episode canvas the
prop's sheet becomes a display node like any other (`wji.displayNodes["P01:sheet"]`).

## 3. `E01` canvas

```bash
wji canvas create E01 --json | jq -r .id                                          # → E1; bind --ep 1 wji.canvasId
# row 0 — the sheets this episode uses, as display nodes (assets already generated in stages 2–3)
wji canvas add image -c E1 -n "C01 sheet" --asset <C01 sheet asset> --at 0,0 --json | jq -r .id     # → D_C01
SD bind <project> --ep 1 wji.displayNodes.C01:sheet D_C01
wji canvas add image -c E1 -n "S02 sheet" --asset <S02 sheet asset> --at 500,0 …                    # D_S02, D_C03, D_P01 …
wji canvas add audio -c E1 -n "C01 voice" --asset <C01 voice asset> --at 2000,0                      # D_C01v (only if a voice exists)
wji canvas add dataset -c E1 --dataset <C01 dataset id> --at 0,300                                    # optional: the character card, for people reading the canvas

# row 1 — segment E01-01 (default: reference images → video, no storyboard images)
SD prompt <project> segment E01-01 > /tmp/E01-01-prompt.txt   # the header line lists refs: in the order to connect them
wji canvas add title -c E1 -t "E01-01 · 雨棚 · 15 s" --at 0,700
wji canvas add video -c E1 -n "E01-01" --from D_S02 D_C01 D_C03 D_P01 D_C03v D_C01v -m seedance-2.5-ref -r 9:16 \
  --resolution 480p --prompt-file /tmp/E01-01-prompt.txt --json | jq -r .id                          # → VID1
# D_S02 D_C01 D_C03 D_P01 → @image1 … @image4   ·   D_C03v D_C01v → @audio1 @audio2   (pictures, then clips, then voices)
SD bind <project> --ep 1 storyboard.segments.E01-01.wji.nodes.video VID1
wji canvas add text -c E1 -n "E01-01 prompt" --text-file /tmp/E01-01-prompt.txt
wji canvas gen VID1                 # prints the cost and refuses → tell the user → then --yes --wait (or -auto)
```

`wji canvas get VID1` must print `@image1 ← D_S02`, `@image2 ← D_C01` … exactly as the prompt's
legend says; fix with disconnect/connect if it does not. With `videoDuration: auto` (the default)
there is no `-d`; `minimax-h3-ref` has no auto duration, so h3 projects pass `-d` = Σ cut seconds.

**Only with `params.references: keyframes`** — one generated image per cut, referenced by the video
node instead of the sheets (an opt-in for shots that must be composed exactly; twice the images to
pay for and approve):

```bash
wji canvas add image -c E1 -n "E01-01 f1" --from D_S02 D_C01 D_C03 D_P01 -m "<image model>" -r 9:16 --at 400,700 \
  --prompt-file /tmp/E01-01-f1.txt                                                                    # → K1 … K5  (prompt = plan prefix + cut.frame)
SD bind <project> --ep 1 storyboard.segments.E01-01.wji.nodes.keyframes.0 K1
wji canvas gen K1 --yes --wait      # first segment: generate, download, inspect, fix, then the rest
wji canvas add video -c E1 -n "E01-01" --from K1 K2 K3 K4 K5 D_C03v D_C01v -m minimax-h3-ref -r 9:16 -d 15 \
  --resolution 768P --prompt-file /tmp/E01-01-prompt.txt --json | jq -r .id                          # → VID1
```

Video models, one per `params.video`: `h3` → `minimax-h3-ref`, `seedance` → `seedance-2.5-ref`,
`seedance2` → `seedance-2.0-ref`, `seedance2fast` → `seedance-2.0-fast-ref`, `wan` → `wan-3.0-ref`.
`prompt segment` prints the right one under `video.model` with the resolution already in that
model's spelling — copy both rather than typing them, and `wji models get <name>` confirms the caps.
Pass `-d` **only in `videoDuration: fixed`** (it switches `autoDuration` off, which is what pins the
clip to the storyboard); in `auto`, leave it out. `minimax-h3-ref` has no `autoDuration`, so it is
always `-d`.

**Connect the voices too.** Everyone who speaks in the segment brings their voice asset as an audio
reference — `canvas add audio --asset <voiceAsset>` once per character on the episode canvas, then
`--from` them **after** the pictures (and after the clip reference, if there is one: `canvas connect`
labels each edge as it is made, and `wji canvas connect <prev video node> <this video node>` prints
`as @video1`, which is how to check the numbering landed where the prompt expects). They become `@audio1…M` (their own series, so a voice
connected after three sheets is `@audio1`, not `@image4`), and the prompt attributes every one of
that character's lines to the label. Caps: 3 audio references on `minimax-h3-ref` and the Seedance
2.0 pair, 5 on `wan-3.0-ref`, 10 on `seedance-2.5-ref`. `prompt segment` prints the whole list,
pictures then voices, in the order to connect them; drop them only if the model shows no audio
reference support (`params.voiceSamples: false`).

The segment's **soundtrack node** (Seed Audio; `params.audioTrack`, default `bed`) sits beside the
video node — no `--from` for a bed, the voice display nodes in speaking order for `--full`:

```bash
SD prompt <project> audio E01-01 > /tmp/E01-01-audio.txt                    # timecoded ambience / sfx / music
wji canvas add audio -c E1 -n "E01-01 track" -m seed-audio-1.0 --prompt-file /tmp/E01-01-audio.txt --json | jq -r .id   # → A1
SD bind <project> --ep 1 storyboard.segments.E01-01.wji.nodes.track A1
wji canvas gen A1 --yes --wait                                                # ~0.15 credits a minute; attach: fs set <shot dataset> --add-images <asset>
# --full: wji canvas add audio … --from D_C02_VOICE D_C01_VOICE  (→ @Audio1 @Audio2, the order the prompt names them)
```

`wan` mode, one clip per segment (the model speaks the dialogue itself, so no voice nodes):

```bash
wji canvas add video -c E1 -n "E01-01" --from K1 K2 K3 -m wan-3.0-ref -r 9:16 -d 15 \
  --resolution 480P --prompt-file /tmp/E01-01-prompt.txt
```

`wan-3.0-ref` takes at most **10** reference images and whole-second durations (2–30 s); the
`timing` gate already refuses a segment that breaks either rule. `--set audio=false` turns the
generated sound off if you are laying your own track.

`wan-3.0-ref` rejections from DashScope's green-net (`DataInspectionFailed`) are random and free —
retry the same node 8–12 times, then shorten the prompt (see `stage-storyboard.md`).

Queue: FREE accounts run 3 jobs at once — submit 3 keyframes, `wji history get <id> --wait` (or
`wji canvas get <node>` until `done`), submit the next 3. A 429 was rejected before charging;
wait, don't loop.

After the clip: `wji fs set <E01-01 shot dataset> --add-images K1a K2a … --icon K1a --set primaryVideo=<clip asset>`,
bind `storyboard.segments.E01-01.wji.assets.video`, then `SD manifest <project> --ep 1`.

## Reference order after `connect`

WJI numbers connected references **per type and in edge order** — `@image1 @image2 …` for pictures,
`@video1 …` for clips, `@audio1 …` for the character voices — and that numbering is what the prompt
addresses. So a voice node connected alongside three sheets is `@audio1`, not `@image4`.

References are numbered by edge creation order. `canvas connect` appends, so adding a sheet later
puts it *last* even if the legend says `@image2`. To restore the legend order, `disconnect` the
edges that should come after it and `connect` them again in order — then `canvas get <video>`
must print `@image1 ← <scene>`, `@image2 ← <person>` … exactly as `prompt segment` lists them.

## Waiting for long clips

`canvas gen --wait` gives up after 600 s by default and a 25–30 s Seedance clip can take longer;
the task keeps running. Pass `--timeout 900`, or pick it up with `wji history get <id> --wait` —
never resubmit a node whose status is still `generating`.

## Measured prices (2026-09, one FREE account — re-check with `canvas gen` without `--yes`)

With `params.videoReferences: previous`, the previous segment's **video node** is `--from`'d
directly — it already carries the clip, so no display node is needed, and segment k cannot be built
until k−1 has generated.

| Generation | Credits |
| --- | --- |
| gpt-image-2.5-sunburst 1:1 1k (headshot, keyframe) | 18.3 |
| gpt-image-2.5-sunburst 16:9 1080p (sheet) | 14.34 |
| wan-3.0-ref 480P | 15 / s (15 s = 225) |
| minimax-h3-ref 480P | 15 / s (15 s = 225) |
| seedance-2.5-ref 480p, auto duration | ≈ 31 / s, billed on the real length (≈30 s = 900–930) |

The Seedance 2.0 pair was not price-measured here; `canvas gen` without `--yes` quotes before
charging, and `seedance-2.0-fast-ref` is the cheap one — use it for a draft pass of a shot you
expect to re-cut, then re-run the approved segments on 2.5.

A rejected submission (content filter, real-person check, 429) is not charged.

## Cleaning up

`wji canvas rm` and `wji fs rm` are destructive — name the targets in the chat and wait for a yes
(the `wji` skill rules). Never delete a node whose asset is attached to a dataset without saying so.
