---
name: wji
description: Drive the WJI AI platform from the terminal with the `wji` CLI — sign in, manage workspaces and the fsnode/dataset tree, upload assets, generate images/video/audio and poll the results, and work on Infinite Canvas nodes (read the user's selected nodes, create generate nodes, connect references), manage workspace members, invitations and canvas owners, and manage models, agents, prompt presets and your profile. Use whenever a task mentions WJI, wji-backend, a WJI workspace, canvas, fsnode, dataset node, or asks to generate media on WJI.
---

# WJI CLI

`wji` is a thin, scriptable client over the WJI API. Every command accepts
`--json`, so prefer `--json` piped through `jq` when you need to read a value,
and the human table output when you are showing the user a result.

## Before anything else

```bash
wji auth whoami --json      # confirms endpoint, credential, org context
```

- **Check for a CLI update first.** The skill documents the newest commands, so
  an old binary fails in confusing ways:

  ```bash
  wji --version && npm view @wji.ai/cli version
  ```

  If the installed version is lower, tell the user to run
  `npm i -g @wji.ai/cli@latest` (or `pnpm add -g` / `yarn global add`) before
  continuing. A dev checkout linked into PATH updates with `pnpm build`
  instead. If the registry check fails (offline, proxy), carry on — don't
  block the task on it.
- `wji: command not found`: the CLI is not on PATH. From the `wji-cli` repo,
  `npm run build`, then link it where the user can write without sudo —
  `ln -s "$PWD/dist/index.js" ~/.local/bin/wji` (if `~/.local/bin` is on
  PATH). `npm link` fails with `EACCES` when the global prefix is root-owned;
  don't reach for `sudo`.

- Exit code `77` means the credential is missing or rejected. Tell the user to
  run `wji auth login` (interactive) or export `WJI_API_KEY`. **Never ask the
  user to paste a password into the conversation and never type one into
  `--password` yourself** — `wji auth login` prompts without echoing.
- `wji config show` reveals which endpoint and profile are active. A local
  backend is `wji config set endpoint http://localhost:3002` — `:3000` is the
  web frontend, not the API.
- **Scan the user's message for `-auto`.** It is not a CLI flag — it is the
  user telling you to generate everything this request needs without stopping
  to confirm the spend. See *Rules* for what it does and does not waive.
- **Running several `wji` commands in parallel? Prefer an API key**
  (`WJI_API_KEY`, or `wji auth key create <name> --save`). A JWT login rotates
  its refresh token, and the server revokes *every* session if a refresh token
  is ever replayed. The CLI serializes refreshes across processes, but a key
  never refreshes at all. A JWT profile that keeps returning 401 needs one
  `wji auth login`.

## The mental model

```
organization (X-Org-Id header, optional)
└── workspace                       wji ws
    ├── apps  (Dataset, Files, InfiniteCanvas, …)
    └── fsnode tree                 wji fs
        └── dataset nodes           wji dataset
generation ─> history entry ─> assets    wji gen / wji history / wji asset
```

- A **workspace** scopes billing, quota and members.
- The **fsnode tree** is the file system inside a workspace: folders and files,
  each with a free-form `content` JSON object.
- A **dataset node** is an fsnode with mimetype `workspace/dataset` whose
  `content` carries `{ type, description }` — these are the "ideas"
  (outline, screenplay, character, location, prop, outfit, scene, shot, other)
  that feed generation. See *Character datasets* below.
- **Generation is asynchronous.** Submitting returns a history entry; the
  assets inside it start `pending` and become `ready`.

## Set a working context first

Most commands take `--workspace`, but setting a default is less error-prone:

```bash
wji ws list
wji ws use <workspaceId>
```

After that, `wji ws get`, `wji fs`, `wji gen` and `wji preset list` all default
to that workspace. Use `wji ws use` rather than repeating `--workspace`.

`wji ws create <name>` seeds the default template — Dataset, DatasetImageGeneration and
InfiniteCanvas — because the API creates no apps on its own; pass `-a` to choose apps or
`--no-apps` for an empty workspace.

## Reading and editing the tree

```bash
wji ws fs                                  # whole workspace tree
wji ws fs --app <appId>                    # one app's tree
wji fs tree <nodeId> --depth 2
wji fs ls <folderId>
wji fs get <nodeId> --json | jq .content

wji fs mkdir <parentId> characters --nickname 角色
wji dataset new <folderId> "Ada" -t character -d "a tired detective"
wji fs describe <nodeId> @description.md
wji fs set <nodeId> --merge content=@body.md --merge viewMode=content   # merged into content
wji fs set <nodeId> --add-images <assetId> <assetId>                    # appended
wji fs set <nodeId> --images <assetId> <assetId>                        # replaced
```

`wji fs set --content` **replaces** the whole content object, and so does
`--set content.x=…`. To change fields inside `content`, use `--merge key=value`
(dotted keys, `@file` values) — it reads the node and deep-merges for you, like
`wji fs describe` does for `content.description`.

Several GET endpoints are cached server-side for 10 seconds, so a plain read
immediately after a write can come back stale. `wji fs describe` and
`wji preset update` already bypass that cache; if you hand-roll a
read-merge-write with `--json`, expect the read to lag briefly.

## Generating media

Always pick the model from the live list rather than guessing a name:

```bash
wji models list --feature image
wji models get <model>            # ratios, max n, reference support, --set params
wji gen cost -t image -m <model> -n 4
```

**Pass the value in the MODEL column to `-m`** — that is the model's `nickname`,
which is unique. The `name` column is shown only when it differs, and names do
collide across providers (two different `seedance-2.0` entries exist), so `-m`
with a bare name resolves to whichever the server picks first.

Then submit. Add `--wait` when the user is waiting on the result:

```bash
wji gen image -m <modelName> -p "a rainy alley at dusk" -n 4 --ratio 16:9 --wait
wji gen video -m <modelName> -p "slow pan" -d 5 --start-image <assetId> --wait --timeout 1200
wji gen audio -m <modelName> -p "rain on a tin roof" --wait
```

- **Check the spending policy in *Rules* before you submit:** a single image
  just runs; video, audio and anything with `-n` above 1 need a yes in the
  chat first — unless the user's message carried `-auto`.
- References are `assetId[:label[:weight]]`: `--ref 65f0…:hero:0.6`. Reference
  *assets*, not file paths — upload first with `wji asset upload`.
- Model-specific parameters go through `--set` (`--set quality=high`); read the
  valid keys from `wji models get`.
- `--fsnode <id>` files the *history entry* under a node — it does **not** add
  the asset to that node's `images`. Recover them later with
  `wji history list --fsnode <id>`. To make a generated image part of a dataset
  you must attach it yourself, and `fs set --images` replaces the whole array:
  read the current ids first, then write old + new together.
- `--tags` labels the history entry.
- Video can take minutes. Without `--wait` you get a history id back:
  `wji history get <id> --wait` resumes polling, and `--timeout` is in seconds.
- On timeout the task is usually still running — re-poll rather than
  resubmitting, which would charge credits twice.
- `wji models get` prints the model's own parameter list with defaults and
  allowed values. Only `--set` keys listed there take effect; anything else is
  ignored silently.
- Billing inputs are server-owned and stripped from `--set` / `--values`:
  `num_images`, `referenceImageCount`, `referenceVideoTotalDuration`,
  `output_resolution` and every `*Info` field. Use `-n` for the count and the
  real reference flags (`--ref`, `--ref-video`, …) for references.

### Choosing a model (house guidance)

Use this to pick a model when the user hasn't named one, and to explain the
trade-off when they have. Exact nicknames differ between environments — always
confirm with `wji models list --feature <image|video>` and `wji models get`.

**Images:** prefer **GPT Image 2.5** (`gpt-image-2.5-sunburst` for new images
and big changes such as character sheets; `gpt-image-2.5-flare` for edits that
keep the composition), **Nano Banana 2** or **Nano Banana Pro**.

Two image jobs have one right model each:

- **Transparent background** (logos, cut-outs, overlays, sprites) → GPT Image
  2.5 with `--set background=transparent`; the result comes back as PNG with
  alpha. `opaque` forces a filled background, `auto` lets the model decide.
- **Split a picture into layers** (subject separated from background, for
  compositing) → `bytedance-seedream-5-pro` with
  `--set layer_decomposition=true`. It needs **exactly one** reference image,
  a size tier (`--set size=1K|2K`, not pixel dimensions), and returns several
  PNG layers as separate assets. On a canvas, run it in the browser's layer
  editor instead — a CLI generate node keeps only one asset per node.

**Video — reference models over first/last-frame models.** A family usually
has both:

| Kind | Examples | Takes |
| --- | --- | --- |
| **Ref** (preferred) | `seedance-2.5-ref`, `seedance-2.0-ref`, `seedance-2.0-fast-ref`, `Wan 3.0 Ref`, `Wan 3.0 Prime Ref`, `minimax-h3-ref`, `minimax-h3-max-ref` | reference **images, videos and audio** together (e.g. a character sheet + a motion clip + a voice line) |
| First/last frame | `seedance-2.5`, `seedance-2.0`, `Wan 3.0`, `minimax-h3-i2v`, `minimax-h3-max-i2v` | only a start and/or end image |

Use a first/last-frame model only when the user explicitly wants a shot to
start or end on an exact frame. With a Ref model, pass images with `--ref`,
videos with `--ref-video` and audio with `--ref-audio` (or connect them on the
canvas); `wji models get` shows each model's caps (e.g. Wan 3.0 Ref: 10 images,
video/audio ≤ 15 s total).

**Video trade-offs** (best first):

| | Ranking |
| --- | --- |
| **Quality** | Seedance 2.5 › Seedance 2.0 ≈ Wan 3.0 › MiniMax H3 ≈ Seedance 2.0 Fast › MiniMax H3 Max |
| **Speed** (fastest first) | MiniMax H3 Max › Seedance 2.0 Fast › Wan 3.0 Prime › Seedance 2.0 ≈ Wan 3.0 › Seedance 2.5 |
| **Price** (cheapest first) | MiniMax H3 Max › Seedance 2.0 Fast › Wan 3.0 Prime › Seedance 2.0 ≈ Wan 3.0 › Seedance 2.5 |

So: **Seedance 2.5** for final, hero shots; **Seedance 2.0 / Wan 3.0** as the
balanced default; **Seedance 2.0 Fast / MiniMax H3 Max** for drafts, tests and
large batches. The ranking is a guide — quote the real number from
`wji gen cost` / `wji canvas gen` before spending.

### Limits (per account)

| Limit | Value | When exceeded |
| --- | --- | --- |
| Submissions per minute | image 30 · video 10 · audio 20 | HTTP 429 |
| Queued + running jobs | FREE 3 · VIP 10 · SVIP 25 | HTTP 429 `排隊中的任務已達上限` |

**Never fire more generations at once than the queue allows.** Submit up to the
cap, wait for jobs to finish (`wji history get <id> --wait`), then submit the
next batch. A 429 means the request was rejected before anything was charged —
wait and resubmit; do not retry in a tight loop.

```bash
wji history list --mode video
wji history download <historyId> -o ./out
```

## Character datasets

A character is only reusable across shots when its dataset carries all three:

1. **Headshot** — a clean front-facing portrait on a plain background (sets
   the face). Make it the dataset's `icon`.
2. **Character sheet** — full-body front/side/back turnaround plus a few
   expressions and outfit details, in the same outfit (sets body, clothes and
   consistency). Generate it from the headshot with GPT Image 2.5 Sunburst.
3. **Voice** — a short, clean audio sample of the character speaking (sets the
   voice for Ref video models that take `--ref-audio`). Set it as
   `primaryAudio`.

All three are assets attached to the dataset node (`images` holds images and
audio alike). When creating or reviewing a character, check which are missing
and offer to make them; when generating video of that character, pass the
headshot and sheet as image references and the voice as an audio reference to
a Ref model.

```bash
wji fs get <datasetId> --scope full --json | jq '{images: [.images[]? | {id, type}], icon, primaryAudio}'
wji fs set <datasetId> --add-images <headshot> <sheet> <voice> --icon <headshot> --set primaryAudio=<voice>
```

`--add-images` appends; `--images` replaces the whole list — use it only when
the user wants the list rewritten, after reading what is there.

## Assets

```bash
wji asset upload ./ref.png                 # returns an asset id
wji asset import https://example.com/x.jpg
wji asset status <id> <id>                 # pending | ready | cancelled
wji asset download <id> [<id>…] -o ./out   # keeps the file extension, so you can view images
```

- Uploaded assets attach to the default workspace unless you pass `--workspace`.
- `asset status` only returns assets you created or that sit in a workspace
  you belong to; other ids are silently omitted (the CLI warns how many).
- `asset import` refuses private and internal addresses (`不允許存取該主機`).
  Some public hosts also block server-side downloads (`無法下載或處理該圖片 URL`)
  — download the file yourself and `wji asset upload` it instead.
- `.html`, `.svg` and script uploads are stored as `application/octet-stream`
  and served as attachments, so they will not render inline.

## Skills

Skills are SKILL.md bundles. **System skills** are built-in and read-only;
**user skills** are yours to author and attach to agents. Only `.md` files
persist server-side — scripts belong to system skills.

```bash
wji skill system                      # built-in skills you can attach
wji skill push ./my-skill             # zip a local folder (SKILL.md at root) and upload
wji skill list
wji skill pull <id> ./my-skill        # write a bundle back to disk to edit it
wji skill get <id>                    # metadata + file list
```

Attach skills to an agent and manage its version history:

```bash
wji agent skill-add <agentId> system:image user:<skillId>
wji agent skills <agentId>
wji agent versions <agentId>          # every edit auto-snapshots a version
wji agent restore <agentId> <versionId>
```

Skill refs are `system:<key>` or `user:<skillId>` (a bare id means `user:`).
System keys currently include `image`, `document`, `workspace-dataset`,
`canvas` and `seedance-25` — confirm with `wji skill system`.
When authoring, edit a pulled folder and `skill push` it again, or
`skill update <id> --dir ./my-skill` to replace its files.

**Crews** are skill packs with agent seats (a `crew.json` + `agents/<seat>.md`
next to `skills/`). `wji crew install <name> --for claude|codex|openclaw|grok|all`
installs one into the host (Claude Code: `~/.claude/skills` + `~/.claude/agents`;
Codex: `~/.agents/skills` + `~/.codex/agents/*.toml`; OpenClaw: workspaces under
`~/.openclaw/workspaces/<crew>/` plus a JSON5 fragment to merge by hand; Grok bot:
an import zip). `--dry-run` shows the plan, `--from <dir|zip|url>` bypasses the
registry, `wji crew status` / `uninstall` track what was written, and
`wji crew check <dir>` validates a pack. The `short-drama` crew is the known one.

Bundle limits: at most 200 markdown files, 2MB per file, 20MB in total and a
5MB zip; 50 user skills per account. `skill update --dir` sends files in the
request body, where each file is capped far lower, at **200,000 characters** —
use `skill push` for large files.

## Canvas

An Infinite Canvas holds **nodes** (text, title, comment, image, video, audio,
dataset…) and **edges** between them. An edge into a media node makes the
source one of its **references**, numbered per kind in edge order: `@image1`,
`@image2`, `@video1`. A media node is either a **display** node (shows an
existing asset) or a **generate** node (prompt + model + settings; generating
fills in its asset). A **dataset** node is a card bound to a workspace dataset
(`canvas add dataset --dataset <fsnodeId>`) — good for showing a character
or scene next to its sheets, but `canvas gen` cannot take it as a reference:
reference the image display node that shows the asset instead.

A workspace's InfiniteCanvas app can hold several canvases (`wji canvas list`);
`wji canvas create <name>` adds an empty one — e.g. one canvas per episode or
per character set.

**Ownership.** A canvas can have an owner (a workspace member) and a
visibility: `members` (everyone in the workspace sees it) or `owner` (only
the owner and the workspace owner). `wji canvas list` shows both;
`wji canvas owner <canvasId> <member> --visibility owner` sets them — the
workspace owner only. Visibility hides, it does not lock: on a `members`
canvas any editor can edit. For a class of students (one canvas each, copy
work to all, collect results) use `wji class` — see the `wji-classroom` skill.

**Color tags.** `wji canvas tag red <nodeIds…> -l HW1` tags nodes and names
the color on that canvas; `--tag HW1` then filters `canvas nodes`,
`class status` and `class results`. `wji canvas copy <nodeIds…> --to
<canvasId…>` copies nodes with their connections and tags to other canvases.

**The link.** The user opens a canvas in the browser and presses the link
button in its top bar. That stores the open workspace, canvas and **the nodes
they have selected** on their account for 5 minutes (the tab renews it while
open). Every `wji canvas` command then targets that canvas; pass
`--canvas <id>` to work on another one (`wji canvas list`).

```bash
wji canvas status                     # linked canvas + selected nodes (ids, asset URLs, settings)
wji canvas nodes                      # every node; * marks generate nodes
wji canvas nodes --tag C01            # nodes with the color tag labelled C01 (or --tag red, --untagged)
wji canvas nodes -n '^C0[1-3] '       # nodes whose name matches a regex (case-insensitive); combines with --tag/-k
wji canvas tags                       # color tags on the canvas: color, label, node count
wji canvas get <nodeId>               # full detail incl. references
wji asset download <assetId…> -o <dir>   # then look at the images yourself

wji canvas create E01 -w <workspaceId>  # new empty canvas; then --canvas <id>
wji canvas add video --from <imgNode> <imgNode> -m <model> -r 16:9 -d 8 -p "@image1 … @image2 …"
wji canvas add text -t "shot list…" --at 0,600
wji canvas add text --text-file prompt.txt --plain --size 600,900   # plain text keeps its line breaks; node 600×900
wji canvas set <nodeId> --text-file notes.md --size 520,700           # replace the text, resize
wji canvas add image --asset <assetId> -n "Ada sheet"     # display node for an existing asset
wji canvas add dataset --dataset <fsnodeId>                # card bound to a workspace dataset
wji canvas set <nodeId> -p "new prompt"        # merges: other settings stay
wji canvas set <nodeId> -m <model> --resolution 720p --set seed=42
wji canvas connect <from> <to>  /  wji canvas disconnect <from> <to>
wji canvas gen <nodeId> --wait                 # costs credits — see Rules
wji canvas rm <nodeId…>                        # destructive — see Rules
```

- **Match the CLI to the site the user is on before anything else.** The
  link is stored on the backend the browser talks to, so the CLI must use the
  same one. `Cannot GET /canvas-link` (404) means the active profile points at
  a backend without this feature — typically profile `prod`
  (`https://api.wji.ai`) while the user linked on `http://localhost:3000`
  (API `http://localhost:3002`). Check `wji config show`, then tell the user
  which profile to use (`wji config use <profile>`), or run the commands with
  `WJI_ENDPOINT=… WJI_API_KEY=…` for that backend. Don't switch their
  profile silently, and never run canvas commands against production when the
  link URL is localhost.
- If `status` says *Not linked*, ask the user to open the canvas and press the
  link button (and to select the nodes they mean). Don't guess a canvas.
- The selection is **what the user means by "these" / "the selected images"**.
  Use those node ids for `--from`; use each node's `assetId` to download and
  look at the picture before writing a prompt about it.
- Prompts are literal: `-p "@image1 …"` is text, not a file. Use
  `--prompt-file` for a file and `-p -` for stdin.
- Pick the model from `wji models list --feature video` and read
  `wji models get <model>` for its ratios, duration range and `--set` keys.
  `add`/`set` validate against it, fill the model's defaults, and turn
  auto-duration off when you pass `-d`.
- **A model the user names may not accept references.** Check the REFS column
  of `wji models list`: a family often has a text-only model and a `Ref`
  variant (`Wan 3.0` has none, `Wan 3.0 Ref` takes up to 10). If the request
  builds on selected images, use the variant with references and say so —
  otherwise the selection is silently ignored and the person or object in the
  video will not match.
- Model nicknames can contain spaces (`"Wan 3.0 Ref"`) — quote them.
  Parameter values are case-sensitive and differ per model (`480P` for Wan,
  `480p` for Seedance); copy them from `wji models get`.
- Defaults you did not ask about still shape the result: the ratio falls back
  to the workspace's (often 16:9 — ask or pick 9:16 for a portrait-style clip),
  `audio` may default on, and **auto-duration** lets the model choose the
  length. With auto-duration the cost `canvas gen` shows is an estimate for
  the node's configured seconds; the final charge follows the real length.
  Mention these when you report the node, and pass `-d` if the user needs a
  fixed length or a fixed price.
- Take new ids from the command's own output (`wji --json canvas add … | jq
  -r .id`), not by searching names — names repeat on a canvas. In zsh a
  variable holding several ids is not word-split; pass the ids literally.
- Text, title and comment nodes are **Markdown** on the web: a single line break
  joins the lines into one paragraph (the CLI warns). For prompts and other plain
  text pass `--plain` (line breaks become Markdown hard breaks); `--size w,h`
  sets the node's box so a long prompt is readable without scrolling.
- Changes show up live in the user's open canvas; there's no need to ask them
  to reload.
- `canvas gen` sends exactly what the canvas's own Generate button sends
  (references in order, text-node references prefixed to the prompt). Nodes
  referencing dataset, bundle, table or YouTube nodes must be generated from
  the browser.

See `reference/canvas-recipes.md` for end-to-end examples.

## Everything else

```bash
wji preset list -k "hero"        # usable presets; also `mine`, `public`, `workspace`
wji preset get <id> --json | jq -r .prompt
wji agent list                   # marketplace; `wji agent mine` for yours
wji profile show
wji profile wallet               # credit balance before an expensive batch
wji org list && wji org use <orgId>
```

## Rules

- **Confirm before destroying — in the conversation, one target at a time.**
  These commands delete, revoke or overwrite, and none can be undone from the
  CLI: `ws rm`, `ws app rm`, `ws member rm`, `fs rm`, `dataset rm`,
  `asset rm`, `history rm`, `preset rm`, `skill rm`, `skill update --dir`,
  `agent rm`, `auth key rm`, `auth key revoke`, `config rm`, `canvas rm`,
  `ws member link` (revokes the current share link).
  They prompt `[y/N]` in a terminal, but when you run them there is no
  terminal, so they refuse unless you pass `--yes`. **The user's reply in the
  chat is the only confirmation there is.** Before running one:
  1. Look the target up and tell the user exactly what will go — name and id,
     plus what goes with it: a workspace's apps and files, a folder's whole
     subtree, the files `skill update --dir` replaces, anything still using an
     API key, the credentials stored in a profile, the connections a canvas
     node takes with it.
  2. Wait for an explicit yes to *those* targets. A broad instruction such as
     "clean up" or "delete the old ones" is not approval: list what you found
     and ask.
  3. Only then pass `--yes`. The approval covers the targets you listed, not
     anything you find afterwards — new targets need a new question.
- **Overwrites don't prompt at all.** `fs set --content`, `--images` and
  `--tags`, and the update commands' tag options, replace the whole value.
  Prefer the merging forms (`--merge`, `--add-images`, `fs describe`); when
  you must replace, read the current value first and check with the user
  before replacing anything they did not ask to change.
- **Generation costs credits — one image just runs; video and batches ask
  first.** This is the user's standing policy. Follow it without asking them
  to restate it:

  | About to run | Do this |
  | --- | --- |
  | **One image** — `gen image` with `-n 1`, or `canvas gen` on an image node | **Go ahead.** Pass `--yes`, then report the `credits` line from the result. |
  | **Any video or audio** | **Ask first.** Get the number, tell the user, wait for a yes. |
  | **More than one generation in one step** — `-n 2` or higher, several nodes, a storyboard fan-out, an A×B matrix | **Ask first, with the total** — not the per-item price. |

  Splitting a batch does not make it single: what needs approval is the total
  you are about to spend in this step, however many commands it takes.

  To get the number before asking, both of these are free: `wji gen cost -t
  video -m <model> -d 8`, or run `wji canvas gen <nodeId>` *without* `--yes` —
  it refuses to run and the error names the exact credits.

  **`-auto` in the user's message overrides the table.** Generate everything
  that request needs without asking — video and batches included — and report
  the total actually charged when you are done. It covers that request and the
  follow-ups continuing it; when the user moves to a different task, the table
  above applies again. `-auto` never waives the confirmations for *destructive*
  commands above, only the spending ones.

  Creating or editing a generate node (`canvas add` / `canvas set`) costs
  nothing, and neither does `gen cost`. Actual spend is in the result's
  `credits` field (`history.chargedCredits`), so quote that rather than the
  estimate once a job has finished.
- **Never invent ids.** Look up workspace, node, asset and model ids with the
  list commands; ids are Mongo ObjectIds, not names.
- **Stay inside the generation queue.** See *Limits* above — batch to the cap
  and wait for completions rather than retrying 429s.
- **Lists are paginated.** `--limit` is capped at 100; `--limit -1` returns at
  most 500 on most endpoints. Page with `--page` instead of assuming you got
  everything.
- **Report failures honestly.** A failed generation surfaces as a non-zero exit
  with the provider's message — pass it on rather than retrying silently.

See `reference/commands.md` for the full command and flag inventory.
