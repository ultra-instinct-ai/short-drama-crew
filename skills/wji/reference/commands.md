# wji CLI — full command reference

Global flags (accepted before any subcommand):

| Flag | Meaning |
| --- | --- |
| `--profile <name>` | config profile to use |
| `--endpoint <url>` | API base URL (default `https://api.wji.ai`) |
| `--token <token>` | bearer token or `sk_` key for this call only |
| `--org <orgId>` | organization context (`X-Org-Id`) |
| `--no-org` | force personal context for this call |
| `--locale <locale>` | response language: `cht`, `chs`, `en` |
| `--json` | print the raw API response instead of tables |

Value conventions: `@file` reads a file, `-` reads stdin, `--set key=value`
repeats and nests on dots, references are `assetId[:label[:weight]]`.

Exit codes: `0` ok, `1` error, `77` auth/permission failure.

Destructive commands — marked `[-y]` below — ask `[y/N]` with the target's
name. Without a terminal they refuse to run unless `-y/--yes` is passed.
`canvas gen` asks the same way, showing the credit cost.

Token rotation: every refresh issues a new refresh token and invalidates the
old one. Presenting an already-used refresh token makes the server revoke
**all** of that user's sessions. The CLI takes a lock file next to the config
(`.refresh-<profile>.lock`) and re-reads the config before refreshing, so
parallel commands share one refresh. Access tokens are not revoked by logout;
they stay valid until they expire.

## auth

| Command | API |
| --- | --- |
| `auth login [-e email] [-p password]` | `POST /auth/signin` |
| `auth signup -e -n -c [-p]` | `POST /auth/signup` (needs an emailed code) |
| `auth token` | prints the active bearer token |
| `auth whoami` | `GET /user/me` + local context |
| `auth refresh` | `POST /auth/refresh` `{refreshToken}` — rotates the pair |
| `auth logout` | `POST /auth/signout` `{refreshToken}` (best effort) and clears local credentials |
| `auth key list` | `GET /api-key/search` |
| `auth key create <name> [--expires] [--save]` | `POST /api-key/create` — secret shown once |
| `auth key revoke <id> [-y]` | `POST /api-key/list/:id/revoke` — immediate; anything using the key breaks |
| `auth key rm <id> [-y]` | `DELETE /api-key/list/:id` |
| `auth key use <secret>` | stores an existing `sk_` key |

## config

`config show` · `config set <key> <value>` · `config unset <key>` ·
`config profiles` · `config use <profile>` · `config rm <profile> [-y]` · `config path`

Settable keys: `endpoint`, `orgId`, `workspace`, `locale`, `apiKey`, `email`, `name`.

## org

`org list` · `org use <orgId>` · `org personal` · `org current` ·
`org members` · `org create <name>` (at most 3 organizations per account; name ≤200)

Maps to `GET /organization/mine`, `/organization/me`, `/organization/members`,
`POST /organization/create`. Context is the `X-Org-Id` header; there is no
switch endpoint.

## ws (workspace)

| Command | API |
| --- | --- |
| `ws list [-k keyword] [-s all\|me\|shared\|favorite] [--page] [--limit]` | `GET /workspace/search` — `--limit` max 100, `-1` returns at most 500 |
| `ws get [id]` | `GET /workspace/list/:id` |
| `ws use <id>` | stores the default workspace locally |
| `ws create <name> [-d] [-r ratio] [-l lang] [-t type] [-a app...] [--no-apps]` | `POST /workspace/create` — without `-a` the workspace gets the default template `dataset datasetimagegeneration canvas`; `--no-apps` creates it empty (the API itself adds nothing) |
| `ws update [id] [-n] [-d] [-r] [-l] [--set]` | `PUT /workspace/list/:id` |
| `ws rm <id> [-y]` | `DELETE /workspace/list/:id` (owner only) |
| `ws favorite <id> [--off]` | `PUT /workspace/list/:id/favorite` |
| `ws fs [id] [-a appId]` | `GET /workspace/list/:id/fs[/:appid]` |
| `ws app list\|add <app> [-n]\|rm <appId> [-y]` | `POST/DELETE /workspace/list/:id/apps` |
| `ws member list\|add <userId> [-r role]\|role <memberId> <role>\|rm <memberId> [-y]` | `/workspace/list/:id/member/*` |
| `ws quota [id] [--set k=v]` | `GET .../quota-usage`, `PUT .../quota` |
| `ws stats [id]` | `GET /workspace/list/:id/stats` |
| `ws templates` / `ws clone <templateId>` | `GET /workspace/start/templates`, `POST /workspace/create/:id` |

Caps: 50 workspaces per account (`ws create` and `ws clone`), names ≤200
characters, descriptions ≤5,000.

App tokens for `-a` / `ws app add`: `dataset`, `datasetimagegeneration`,
`canvas` (InfiniteCanvas), `document`, `draw`, `files`, `playscript`, `batch`,
`digitalhost`.

Restriction from the backend: `Dataset`, `Draw`, `DatasetImageGeneration` and
`Files` may exist at most once per workspace.

## fs (fsnode)

| Command | API |
| --- | --- |
| `fs root [key] [-d depth]` | `GET /fsnode/root[/:key]` — key defaults to your drive; pass a workspace id for its root |
| `fs ls <id> [--limit] [--scope]` | `GET /fsnode/list/:id/children` |
| `fs tree <id> [-d depth]` | `GET /fsnode/list/:id/tree` |
| `fs get <id> [--scope]` | `GET /fsnode/list/:id` (comma-separated ids allowed) |
| `fs path <id>` | `GET /fsnode/list/:id/path` |
| `fs mkdir <parent> <name> [--nickname] [--content]` | `POST /fsnode/create` type=folder |
| `fs touch <parent> <name> [--mimetype] [--asset] [--content]` | `POST /fsnode/create` type=file |
| `fs set <id> [-n] [--nickname] [--content] [--tags] [--images] [--add-images] [--icon] [--asset] [--sort] [--set] [--merge]` | `PATCH /fsnode/list/:id` — `--merge key=value` deep-merges into `content` (reads first; `@file` values), `--add-images` appends to `images`; `--content`, `--images`, `--set content.*` replace |
| `fs describe <id> <text>` | merges `content.description` |
| `fs rm <id> [-y]` | `DELETE /fsnode/list/:id` (soft delete, whole subtree) |
| `fs sort <parent> <ids...>` | `PATCH /fsnode/list/:id/children/sort` |
| `fs batch <json>` | `PATCH /fsnode/batch` — `[{id, name?, content?, sort?, file?}]` |
| `fs used-space` | `GET /fsnode/drive/used-space` |

`--content` replaces the entire content object. Names are capped at 500
characters, nicknames at 200, and `fs batch` at 100 items per call.

## dataset

| Command | Notes |
| --- | --- |
| `dataset new <parent> <name> [-t type] [-d description] [--images] [--nickname]` | creates an fsnode with mimetype `workspace/dataset` |
| `dataset list <folderId>` | dataset nodes in a folder |
| `dataset get <key>` | `GET /dataset/list/:key` (vector-store record) |
| `dataset rm <key> [-y]` | `DELETE /dataset/list/:key` |

Types (as the web app defines them): `outline`, `screenplay`, `character`,
`location`, `prop`, `outfit`, `scene`, `shot`, `other`. A character dataset
should carry a headshot, a character sheet and a voice sample (see SKILL.md).

Semantic dataset folders created with the Dataset app: `story`, `character`,
`location`, `prop`, `shot`, `other` (identified by `content.semanticKey`).

## asset

| Command | API |
| --- | --- |
| `asset upload <file...> [-w] [--store] [--vectorize] [--width] [--height] [--duration]` | `POST /assets/v2/upload` (multipart) |
| `asset import <url> [-w] [-n] [--type] [--raw]` | `POST /assets/create-from-url` (or `/import-from-url`) — http/https only; private, loopback, link-local and metadata hosts are rejected, including via redirect |
| `asset list [--store] [--page] [--limit]` | `GET /assets/search` — only `store` filters server-side; the endpoint otherwise returns your own assets |
| `asset get <id>` | `GET /assets/list/:id` |
| `asset status <ids...>` | `POST /assets/check-status` — batched 100 per request; returns only assets you created or in your workspaces |
| `asset update <id> [-n] [--tags]` | `PATCH /assets/list/:id` |
| `asset rm <id> [-y]` | `DELETE /assets/list/:id` |
| `asset download <ids...> [-o path]` | fetches `asset.url`; into a directory, each file is named after the asset and keeps the URL's extension |
| `asset resolve <url> [-w]` | `GET /assets/resolve-by-url` |
| `asset summary <id...>` | `POST /assets/list/:id/summary` or `/assets/summary/batch` — at most 100 ids, your own assets only |

Asset states: `0` pending, `1` ready, `-1` cancelled.

Model parameters worth knowing (`--set`, see `wji models get`):
`gpt-image-2.5-*` `background=transparent` returns a PNG with alpha;
`bytedance-seedream-5-pro` `layer_decomposition=true` splits one reference
image into separate PNG layer assets (exactly 1 reference, `size=1K|2K`).

Uploads of `.html`, `.xhtml`, `.svg`, `.js` and `.xml` are stored as
`application/octet-stream` with `Content-Disposition: attachment`.

## canvas

Targets the canvas linked from the browser (top-bar link button) unless
`-c/--canvas <id>` is given. Every write is a plain fsnode call; an open canvas
updates live.

| Command | API / behaviour |
| --- | --- |
| `canvas status` (`link`) | `GET /canvas-link`, then the selected nodes read fresh from the canvas |
| `canvas unlink` | `DELETE /canvas-link`; the tab turns its button off at its next heartbeat (≤ 60s) |
| `canvas list [-w]` | canvases under each InfiniteCanvas app: `GET /workspace/list/:id/fs/:appId` → `workspace-v2/canvases` children |
| `canvas create <name> [-w] [--app]` | `POST /fsnode/create` a `workspace-v2/canvas` folder under that `canvases` folder with the web's initial content (`{data:{viewport, backgroundMode:'dots'}, metadata:{}}`) |
| `canvas nodes [-c] [-k kind] [-n regex] [--tag tags…\|--untagged]` | `GET /fsnode/list/:canvasId/children?limit=-1` + `POST /assets/check-status`. `-n` matches the node name as a case-insensitive regex (`/re/flags` to set flags yourself). `--tag` takes a label (`C01`, case-insensitive), a color (`red`) or a color id (`rose`); several values match any. Filters combine (AND) |
| `canvas tags [-c] [-a]` | the canvas's color tags: color, label, node count (`-a` also unused, unlabelled colors) |
| `canvas get <nodeId> [-c]` | same load; one node with references (`@image1 ← id`) and frame slots |
| `canvas edges [-c] [--node]` | the `canvas/edge` children |
| `canvas add <kind> [-c] [-n] [-t\|--text-file] [--asset] [--dataset] [-p\|--prompt-file] [-m] [-r] [--resolution] [-d] [--set] [--from ids…] [--at x,y]` | `POST /fsnode/create` (`canvas/node/<kind>`), then one `canvas/edge` per `--from`. Kinds: text, title, comment, image, video, audio, dataset. `add dataset --dataset <fsnodeId>` writes `content {datasetId, datasetName, datasetType, datasetParentName, description}` from the dataset node (must be `workspace/dataset`); it takes no `--from` |
| `canvas set <nodeId> [-c] [-n] [-t] [--move x,y] [-p] [-m] [-r] [--resolution] [-d] [--set]` | read → merge → `PATCH /fsnode/list/:id` |
| `canvas connect <from> <to> [-c]` | `POST /fsnode/create` (`canvas/edge`); a first/last-frame video model gets `videoFrameSlot` start, then end |
| `canvas disconnect <from> <to> [-c]` | `DELETE /fsnode/list/:edgeId` |
| `canvas rm <nodeIds...> [-c] [-y]` | deletes the nodes' edges, then the nodes; refuses nodes still generating |
| `canvas gen <nodeId> [-c] [-y] [-w] [--timeout] [--interval]` | `POST /ai/assets/preComputeCost` → confirm → `POST /ai/assets/history/<kind>/generations` (`fsnode`, `scope: canvas`, `scopeId`) → PATCH the node's `file` and `generate.historyId/pendingAssetId` |

Storage format (what the web canvas writes):

- Node: `mimetype canvas/node/<kind>`, `content.position {x,y}`; text kinds
  `content.text`; media `content.mode` `display` (asset in `file`) or
  `generate` with `content.generate {prompt, model, ratio, resolution,
  duration, values, improvePromptEnabled, historyId?, pendingAssetId?}`. Width
  and height are not stored.
- Color tag: the node stores only `content.colorTag {colorId}`, one of
  `rose` (red), `orange`, `amber` (yellow), `lime` (green), `teal`, `sky`
  (blue), `violet` (purple), `fuchsia` (pink). The label is per color per
  canvas, on the canvas folder: `content.colorTagNames {rose: "C01", …}`, so
  every red node on a canvas shares one label. A `name` left on an old node's
  `colorTag` is ignored, as on the web.
- Edge: `mimetype canvas/edge`, name `连线`, `content {fromNodeId, toNodeId,
  sourceHandle, targetHandle, videoFrameSlot?}`. References are incoming edges
  sorted by `sort` then id, numbered per source kind.
- `PATCH` replaces `content` whole, so the CLI always reads and merges first.
- Canvas apps skip the unique-sibling-name check, so names may repeat.

`add`/`set` validate ratio, resolution, duration and `--set` keys against the
model's form, fill its defaults, drop unknown parameters with a warning, and
set `autoDuration=false` when `-d` is passed. `-p` and `-t` are literal text
(`@image1` is not a file).

`canvas gen` builds the same request as the canvas Generate button: image,
video and audio references in order; text-node references prefixed to the
prompt as `[name]\ntext`; `startImage`/`endImage` from frame slots; Seedance
ref auto-duration sent as `-1`. References to dataset, bundle, table, YouTube,
sprite, layer or panorama nodes are refused — generate those from the browser.

Link state (`/canvas-link`, one per user, Redis TTL 300s): the tab `PUT`s
`{sessionId, takeover?, workspaceId, canvasId, selectedNodeIds, selectedNodes,
viewport, url}` on toggle (`takeover: true`), on selection change and every
60s. A non-takeover `PUT` from a tab that no longer owns the link gets
`409 canvas-link-gone`, which switches that tab's button off.

## gen

Shared flags: `-m/--model` (required), `-p/--prompt`, `-n/--n`, `-w/--workspace`,
`--fsnode`, `--scope`, `--scope-id`, `-r/--ratio`, `--tags`, `--values`,
`--set`, `--wait`, `--timeout` (seconds, default 900),
`--interval` (seconds, default 5).

| Command | Extra flags | API |
| --- | --- | --- |
| `gen image` | `--ref`, `--omni`, `--style-ref`, `--reference-weight`, `--stylize`, `--model-options` | `POST /ai/assets/history/image/generations` |
| `gen video` | `-d/--duration`, `--start-image`, `--end-image`, `--ref`, `--ref-video`, `--ref-audio` | `POST /ai/assets/history/video/generations` |
| `gen audio` | `-d/--duration`, `--ref-audio` | `POST /ai/assets/history/audio/generations` |
| `gen cost -t <type> -m <model>` | `-n`, `-p`, `-d`, `-r`, `--refs`, `--values` | `POST /ai/assets/preComputeCost` |

Every generation goes through the history endpoint — there is no raw mode. The
backend also exposes `/ai/assets/<type>/generations`, which skips the history
record, but the CLI never calls it: without a history there is no id to poll,
and `fsnode`, `scope`, `scopeId` and `tags` are silently dropped (they are
written only inside `if (toHistory)`).

Admission limits, per user and API key (changing IP does not reset them):

- Submissions: image 30/min, video 10/min, audio 20/min → HTTP 429.
- Queued + running jobs: FREE 3, VIP 10, SVIP 25 (admins can override per user)
  → HTTP 429 `排隊中的任務已達上限（N），請等待現有任務完成後再試`. Checked before anything is charged.
- Insufficient balance is rejected up front; there is no partial charge.

Server-owned `values` keys are stripped before billing: `num_images`,
`referenceImageCount`, `referenceVideoTotalDuration`, `hasReferenceVideo`,
`output_resolution`, `output_billing_key` and every `*Info` key. Numeric form
parameters are range-checked against the model's `min`/`max`.

`gen cost` validation: `n` 1–32, `duration` −1–600 (−1 = automatic),
`prompt` ≤10,000 characters, `aspectRatio` ≤32 characters,
`referenceImageCount` 0–64.

## history

`history list [-w] [--mode image|video|audio] [--fsnode] [--scope] [--scope-id] [--tags] [--bookmarked]` →
`GET /ai/assets/history/search`

`history get <id> [--wait] [--timeout] [--interval]` ·
`history bookmark <id> [--off]` · `history rm <id> [-y]` ·
`history download <id> [-o dir]`

## models

`models list [-f feature...] [-w] [-k keyword] [--all]` →
`GET /ai/model/list/:features`

The endpoint matches with `features.some(...)`, so an empty feature list returns
nothing; with no `-f` the CLI asks for every feature instead.

The response is a curated view — no `id`, `rate`, `tags` or `protocol` — and it
is de-duplicated by **`nickname`**, which is therefore the unique selector.
`name` is not unique (`seedance-2.0` exists twice under different providers).
Pass the `MODEL` column (the nickname) to `-m`.

`models get <name>` matches nickname first, then name, and warns when several
models share the name. It prints ratios, batch range, reference support,
duration range, accepted/required props, and the `form.other` parameters
reachable through `--set`.
`models features` lists the flags accepted by `-f`.

Features: `text`, `image`, `video`, `audio`, `tts`, `web`, `thinking`,
`function_calling`, `image_vision`, `video_vision`, `structured_output`,
`digital_host`, `upscale_video`.

## agent

`agent list` (public marketplace) · `agent mine` · `agent get <id>` ·
`agent create <name> -d [-i instructions] [-m model] [--visibility] [-c] [-t] [--greeting]` ·
`agent update <id> …` · `agent rm <id> [-y]` · `agent files <id>` ·
`agent categories [--mine]` · `agent tags [--mine]` · `agent recommend`

Skills & versions:
`agent skills <id>` · `agent skill-add <id> <ref...>` · `agent skill-remove <id> <ref...>` ·
`agent versions <id>` · `agent restore <id> <versionId>`. `agent create` also
takes `--skill <ref...>`.

- Skill refs: `system:<key>` (e.g. `system:image`) or `user:<skillId>` (a bare
  value is treated as `user:`). They map to the agent's `skills: SkillRef[]`.
- Any edit that changes the agent's snapshot auto-records a version
  (`GET /ai/agent/list/:id/versions`); `restore`
  (`POST /ai/agent/list/:id/versions/:versionId/restore`) reverts to one and
  itself records a new version.

Visibility: `private`, `unlist`, `public`. Instructions are only returned to
the agent's creator.

Field caps: name ≤200, model ≤100, description and greeting ≤5,000,
instructions ≤200,000 characters.

`-n/--name`, `-c/--category` and `-t/--tag` are **exact** server-side matches,
not fuzzy search — `--tag` matches agents whose tag array contains that tag.
There is no keyword search on agents; filter client-side with `--json | jq` if
you need substring matching.

## preset

`preset list` (usable) · `preset mine` · `preset public` ·
`preset workspace [id]` — all take `-k`, `-t tags`, `-s sort`, `--page`, `--limit`.

`preset get <id>` · `preset create <name> -p prompt [-d] [-c category] [-t] [--visibility] [-w]` ·
`preset update <id> …` · `preset rm <id> [-y]` · `preset fork <id>` ·
`preset copy <id> [workspaceId]` · `preset tags -s my|public|workspace`

`PUT /prompt-preset/list/:id` rebuilds every field from the body, so an omitted
field arrives as `undefined` and the request 500s. `preset update` therefore
reads the current preset (bypassing the 10s cache) and merges, which keeps
partial updates working.

Field caps: name ≤200, prompt ≤50,000, description ≤5,000 characters; at most
50 tags of ≤64 characters each.

Categories: `character`, `storyboard`, `multi_angle`, `composition`, `utility`.
Sorts: `weight`, `popular`, `latest`, `updated`. `-t` takes comma-separated
tags that must all match.

## skill

Skills are SKILL.md bundles stored server-side as `files: [{path, content}]`.
Only `.md` files persist (the importer drops everything else); scripts belong to
*system* skills, which are built-in and read-only.

| Command | API |
| --- | --- |
| `skill system` | `GET /ai/skill/system` — built-in skills `{kind:'system', key, name, description, runtime, script}` |
| `skill list [--page] [--limit]` | `GET /ai/skill/search` — your user skills |
| `skill get <id>` | `GET /ai/skill/:id` — metadata + file list (full content with `--json`) |
| `skill cat <id> [path]` | prints one file (defaults to SKILL.md) from the `get` response |
| `skill import <zip>` | `POST /ai/skill/import` (multipart `file`) — a zip whose root holds SKILL.md |
| `skill push <dir>` | zips a local folder's `.md` files and imports it (ergonomic `import`) |
| `skill pull <id> [dir] [-f]` | writes the bundle's files to disk |
| `skill update <id> [-n] [-d] [--visibility] [--dir] [-y]` | `PUT /ai/skill/:id` — metadata, or replace **all** files from `--dir` (confirms first) |
| `skill rm <id> [-y]` | `DELETE /ai/skill/:id` |

## crew

Crew packs are local or remote folders (`crew.json`, `agents/<seat>.md`, `skills/<name>/SKILL.md`, `AGENTS.md`) — no WJI API involved.

| Command | Behaviour |
| --- | --- |
| `crew install [name] --for <claude,codex,openclaw,grok\|all> [--from dir\|zip\|tar.gz\|url] [--ref] [--project dir] [--link] [--out zip] [--no-register] [--dry-run] [-y]` | fetches the pack (registry → GitHub tarball, cached under `~/.wji/crews/`), validates it, prints the plan, then per host: **claude** copies `skills/*` → `~/.claude/skills/` and `agents/*.md` → `~/.claude/agents/`; **codex** copies skills → `~/.agents/skills/` and writes `~/.codex/agents/<seat>.toml` (`developer_instructions` = persona body, `sandbox_mode` from capabilities, `[[skills.config]]` per skill); **openclaw** shares `~/.agents/skills/`, writes `~/.openclaw/workspaces/<crew>/<seat>/{AGENTS.md,SOUL.md,skills→}` + `openclaw.agents.json5` and runs `openclaw agents add` when the binary exists; **grok** writes `<crew>-export.zip` (`skills/`, `bots/*.json`, `bots/crew-manifest.json`, `channels/*.json`, sibling links rewritten to `sand-workflow:`). `--project` targets `<dir>/.claude`, `.agents`, `.codex`, `openclaw` instead of `$HOME` |
| `crew status [name]` | reads `~/.wji/crews/installed.json`; per path ✓ / ↗ symlink / ✗ missing |
| `crew uninstall <name> [--for targets] [-y]` | removes exactly the recorded paths; reminds you to clean `openclaw.json` by hand |
| `crew check <dir>` | validates `crew.json` ↔ `agents/*.md` (names, skills, tools vs capabilities), every `SKILL.md` (name == folder, description ≤ 1024) and that relative links resolve |

## crew

Crew packs are local/remote folders (`crew.json`, `agents/<seat>.md`, `skills/<name>/SKILL.md`, `AGENTS.md`) — no WJI API involved.

| Command | Behaviour |
| --- | --- |
| `crew install [name] --for <claude,codex,openclaw,grok\|all> [--from dir\|zip\|tar.gz\|url] [--ref] [--project dir] [--link] [--out zip] [--no-register] [--dry-run] [-y]` | fetches the pack (registry → GitHub tarball, cached under `~/.wji/crews/`), validates it, prints the plan, then per host: **claude** copies `skills/*` → `~/.claude/skills/` and `agents/*.md` → `~/.claude/agents/`; **codex** copies skills → `~/.agents/skills/` and writes `~/.codex/agents/<seat>.toml` (`developer_instructions` = persona body, `sandbox_mode` from capabilities, `[[skills.config]]` per skill); **openclaw** shares `~/.agents/skills/`, writes `~/.openclaw/workspaces/<crew>/<seat>/{AGENTS.md,SOUL.md,skills→}` + `openclaw.agents.json5` and runs `openclaw agents add` when the binary exists; **grok** writes `<crew>-export.zip` (`skills/`, `bots/*.json`, `bots/crew-manifest.json`, `channels/*.json`, sibling links rewritten to `sand-workflow:`). `--project` targets `<dir>/.claude`, `.agents`, `.codex`, `openclaw` instead of `$HOME` |
| `crew status [name]` | reads `~/.wji/crews/installed.json`; per path ✓ / ↗ symlink / ✗ missing |
| `crew uninstall <name> [--for targets] [-y]` | removes exactly the recorded paths; reminds you to clean `openclaw.json` by hand |
| `crew check <dir>` | validates `crew.json` ↔ `agents/*.md` (names, skills, tools vs capabilities), every `SKILL.md` (name == folder, description ≤ 1024) and that relative links resolve |

Import rules: the zip must contain `SKILL.md` at its root (or one folder deep — a
single common root folder is stripped). `SKILL.md` frontmatter `name:` is
required; `description:` is read too. Visibility is `private` (default) or
`unlist`.

Import limits (checked locally by `skill push` / `skill import` before upload):
zip ≤5MB, ≤200 entries, each `.md` ≤2MB uncompressed, ≤20MB total; 50 user
skills per account.

`skill update --dir` sends `files` in the JSON body instead, where the entity
caps each file at **200,000 characters** and a path at 512 (≤200 files; name
≤200, description ≤5,000). Use `skill push` for larger files.

## profile

`profile show` · `profile update [-n] [--handle] [--bio] [--email] [--contact-email] [--phone] [--website] [--avatar] [--banner]` ·
`profile password [-p]` · `profile logins` · `profile wallet [--limit]` ·
`profile search <keyword>`

`profile search` needs a keyword of 2–64 characters and `--limit` 1–20. It
fuzzy-matches name and handle, matches an email only exactly, and never
returns email addresses.

Handle rules: 3–24 chars, starts with a letter, lowercase letters/digits/underscore.
Pass `null` to clear a nullable field. Password minimum is 6 characters.

## API notes

- Responses are unwrapped JSON. Errors are `{ message, path, method, timestamp }`
  with a matching HTTP status.
- An image history's `images` array carries **only `{id}`** — no status, no url.
  Real state comes from `POST /assets/check-status`; the CLI does this for you
  in `gen --wait`, `history get` and `history download`. Polling the history
  alone would report success the moment the entry exists.
- Asset states: `status` `0` pending, `1` ready, `-1` cancelled; a `Completed`
  asset carrying `error` is also a failure.
- Some GETs are cached per user for 10s, keyed on the full URL including the
  query string.
- Paginated endpoints return `{ data, pagination: { total, page, limit, next,
  hasNext, hasPrev, totalPages } }`. An explicit `limit` is capped at **100**.
  `limit: -1` returns everything only on endpoints that opt in (`fs ls` does);
  everywhere else it returns at most **500**. Check `pagination.hasNext`.
- Batch id arrays (`check-status`, `summary/batch`, `fs batch`) accept at most
  100 entries, and a single malformed id fails the whole request.
- Anonymous auth routes are rate-limited per client IP: signin and refresh
  10/min, signup 5/min, forgot-password 5/min. Authenticated routes are limited
  per user or API key (default 200/min per route).
- Query strings use `qs` with `allowDots`, so `--set a.b=1` becomes `a.b=1`.
- Ids are Mongo ObjectIds.
