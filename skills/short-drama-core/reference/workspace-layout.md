# Workspace layout on WJI

One drama = one workspace. Data lives in the **Dataset** app; work happens on
**Infinite Canvas** — one canvas for characters, one for scenes and props, one
per episode. Everything below is done with the `wji` CLI (see the `wji` skill
for command semantics; this file only fixes *where things go*).

```
workspace "<title>"                      wji ws create "<title>" -r <params.ratio>            # default apps: Dataset, DatasetImageGeneration, InfiniteCanvas
├── Dataset app  (semantic folders are created by the backend with the app)
│   ├── story/       outline dataset · 创作指引 dataset (both type outline) · one screenplay dataset per episode
│   ├── character/   one dataset per character  (type character)
│   ├── location/    one dataset per scene      (type location)
│   ├── prop/        one dataset per prop       (type prop)
│   ├── shot/E01/    one dataset per segment    (type shot)   ← subfolder per episode
│   └── other/
└── InfiniteCanvas app
    └── canvases/
        ├── characters   wji canvas create characters
        ├── scenes       wji canvas create scenes
        ├── props        wji canvas create props
        ├── E01, E02 …   wji canvas create E01
        └── canvas-001   (the default one — leave it)
```

Find the semantic folders once and bind them. They live under the **Dataset
app's** tree, which `wji ws fs` alone does not list — pass the app id:

```bash
DS_APP=$(wji --json ws get | jq -r '.apps[] | select(.app=="Dataset") | .id')
wji --json ws fs --app $DS_APP | jq -r '.. | objects | select(.content.semanticKey?) | "\(.content.semanticKey) \(.id)"'
$SD bind <project> wji.datasetFolders.character <id>   # etc.
```

Folder names in the web are localized; match on `content.semanticKey`
(`story` `character` `location` `prop` `shot` `other`), never on the name.

## Dataset field contract

A dataset is an fsnode with mimetype `workspace/dataset`. The pipeline writes:

| Dataset field | Set with | Holds |
| --- | --- | --- |
| `name` | `wji dataset new <folder> "<name>"` | entity name (`<title> 大纲`, `<title> 创作指引`, `林小夏`, `便利店店内`, `E01 剧本`, `E01-01`) |
| `content.type` | `dataset new -t <type>` | `outline` · `screenplay` · `character` · `location` · `prop` · `shot` |
| `content.description` | `dataset new -d` / `fs describe` | the one-liner (required by the web validator) |
| `content.content` | `fs set --merge content=@file.md` | the rendered markdown from `render` — what people read in the web |
| `content.viewMode` | `fs set --merge viewMode=content` | `content` for outline / screenplay / shot prompts, else leave (assets grid) |
| `images[]` | `fs set --add-images <assetId...>` | **the dataset's asset list, not only pictures** — an audio asset lands there with `category: audio`, so a character carries headshot + sheet + voice. `--add-images` appends and de-duplicates; `--images` would replace |
| `content.image_prompt` / `video_prompt` / `audio_prompt` | `fs set --merge image_prompt=@prompt.txt` | the machine prompt: the sheet prompt, the segment's video prompt, and on a character the composed voice brief (`prompt <project> voice C01`) |
| `content.metadata.shortDrama` | `fs set --merge metadata.shortDrama=@entity.json` | the entity's JSON as it is in `project.json` (minus `wji`), plus `{stage, version}` |
| `images[]` | `fs set --add-images <id…>` | the entity's assets — `--add-images` appends; `--images` **replaces** |
| `icon` | `fs set --icon <assetId>` | character: headshot; scene/prop: sheet; segment: first keyframe |
| `primaryAudio` | `fs set --set primaryAudio=<assetId>` | character: voice sample (top-level field, so `--set` is right) |
| `primaryVideo` | `fs set --set primaryVideo=<assetId>` | segment: the generated clip |

`--merge` reads the node and deep-merges into `content`, so the other dataset
fields survive; `--content` and `--set content.x` replace the whole content
object — never use them on a dataset. Several `--merge` pairs go in one call.
Reads right after a write can lag 10 s (server cache) — trust the write, or
re-read after a moment.

Character datasets must end up with the three assets the `wji` skill expects
(headshot as `icon`, sheet, voice as `primaryAudio`) — Ref video models take
the headshot + sheet as image references and the voice as audio.

## Canvas conventions

### `characters` canvas — one row per character

```
[title C01 林小夏] → [image* headshot 1:1] → [image* sheet 16:9  @image1=headshot] → [audio* voice]
```

- headshot: `canvas add image -n "C01 headshot" -m <image model> -r 1:1 -p "<image.prompt>"`
- sheet:    `canvas add image -n "C01 sheet" --from <headshotNode> -m <image model> -r 16:9 -p "@image1 is the face to match. <image.sheet>"`
- voice:    `canvas add audio -n "C01 voice" -m <audio/tts model> -p "<voice.prompt>"` (optional; skip when no voice model is enabled)
- title:    `canvas add title -t "C01 林小夏" --at <x>,<y>` — one per row, rows 700 px apart

Bind the node ids (`wji.nodes.*`) and, after generation, the asset ids
(`wji.assets.*`); then attach the assets to the dataset.

### `scenes` canvas — one row per scene

```
[title S01] → [image* sheet 16:9] → [image* lighting:<state> @image1=sheet] …
```

Variants (`variantOf`) reference the parent scene's sheet node as `@image1`.

### `props` canvas — one row per prop

```
[title P01] → [image* sheet 16:9 white bg] → [image* state:<state> @image1=sheet] …
```

Bound as `wji.canvases.props`; `manifest` asks for it as soon as the project has a prop.

### `E<nn>` canvas — references on top, one block per segment

```
row 0   [image display C01 sheet] [image display C02 sheet] [image display S01 sheet] [image display P01 sheet] [audio display C01 voice]
row 1   [title E01-01] → [video* E01-01 (@image1..N = the sheet display nodes, @audio1..M = the voices of whoever speaks)] [audio* E01-01 track] [text prompt]
row 2   [title E01-02] …
```

By default the video node references the sheets directly — **no storyboard images**. Only with
`params.references: keyframes` does row 1 gain `[image* f1] [image* f2] …` between the title and the
video node, and the video node then references those instead of the sheets.

- Display nodes: `canvas add image --asset <assetId> -n "C01 sheet"` and `canvas add audio --asset <voiceAsset> -n "C01 voice"` — record both in the episode's `wji.displayNodes` (`"C01:sheet"`, `"C01:voice"`) so every generate node can `--from` them. Pictures become `@imageN`, voices `@audioN`, numbered per type in connection order.
- Per segment, beside the video node, a **soundtrack audio node** (`canvas add audio -n "E01-01 track" -m seed-audio-1.0 --prompt-file …`, prompt from `prompt audio E01-01`) → `storyboard.segments.E01-01.wji.nodes.track`; its asset joins the shot dataset's `images[]`.
- Video: `canvas add video -n "E01-01" --from <sheet display nodes in legend order> <voice display nodes of everyone who speaks> -m <the mode's model> -r <params.ratio> [-d <Σ cut seconds>] --prompt-file prompt.txt`. The model and its resolution spelling come from `prompt segment` (`video.model`, `video.resolution`). `-d` **only in `videoDuration: fixed`** — it switches auto-duration off, which pins the clip to the storyboard's timestamps but also fixes the price; in `auto` (the default) leave it out and the model matches the clip to the prompt.
- Prompt text node: `canvas add text -n "E01-01 prompt" --text-file prompt.txt` beside the video node, for people reading the canvas.
- Keyframes (opt-in only): `canvas add image -n "E01-01 f<k>" --from <sheet display nodes> -m <image model> -r <params.ratio> -p "<plan prefix + frame>"`, and the video node then `--from f1…fN` instead of the sheets.
- Shot dataset: `dataset new <shot/E01 folder> "E01-01" -t shot -d "<one line>"`, `--set video_prompt=@prompt.txt`, images = the soundtrack (and keyframes, if any), `primaryVideo` = the clip.

Placement: `canvas add` puts a node right of its `--from` nodes; pass `--at x,y`
for the row starts (title nodes) so blocks do not overlap. Take ids from the
command output (`wji --json canvas add … | jq -r .id`), never by name.

## Idempotency

- Before creating anything, run `manifest` — it lists what is unbound. Only
  create those; a bound id is trusted (verify with `wji fs get <id>` if in doubt).
- After every create, `bind` the id immediately. Losing the mapping means the
  next run duplicates the node.
- Regenerating a node keeps its id; only `wji.assets.*` changes.
- Renaming or renumbering an entity after binding is a manual migration —
  don't.
