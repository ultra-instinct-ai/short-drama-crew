# Operations — the `wji` CLI

This is the **CLI binding** of the operations the stage docs name: you have a shell, the `wji`
CLI and a project directory.

`$SD` = `node <path to short-drama-core>/scripts/short-drama.mjs` (set once per session, see
the skill's first paragraph). `{project}` = the project directory (the one holding
`project.json` and `episodes/E0N.json`). The engine is zero-dependency:

```
$SD <cmd> {project} …
```

## The engine

| Operation | Command |
| --- | --- |
| `init` | `short-drama.mjs init {project} --title "<t>" --episodes N --minutes M --genre "<g>" --register 台湾国语 [--adapt 抽核] [--ratio 9:16] [--video h3\|seedance\|seedance2\|seedance2fast\|wan] [--resolution 480P…] [--accent "<accent>"] [--style photoreal\|realistic\|ghibli] [--references sheets\|keyframes] [--duration auto\|fixed] [--look "<lens>"] [--lang zh]` |
| `validate` | `short-drama.mjs validate {project} [--stage <stage>] [--ep N]` — exits 1 on a hard failure, 0 on advisories alone |
| `checkup` | `short-drama.mjs checkup {project}` — same, but prints the passing and skipped rows too |
| `seed` | `short-drama.mjs seed {project} script --ep N [--force]` · `… seed {project} storyboard --ep N [--force]` |
| `render` | `short-drama.mjs render {project} outline \| guideline \| character C01 \| scene S01 \| prop P01 \| script --ep N \| dialogue --ep N \| segment E01-01` |
| `prompt` | `short-drama.mjs prompt {project} segment E01-01 [--json]` · `… prompt {project} audio E01-01 [--full\|--bed]` · `… prompt {project} voice C01` |
| `manifest` | `short-drama.mjs manifest {project} [--stage <stage>] [--ep N] [--json]` — exit 2 while anything is unbound |
| `bind` | `short-drama.mjs bind {project} [--ep N] <path> <value>` — record a WJI id in the JSON |

Read and write `project.json` / `episodes/E0N.json` with your ordinary file tools; `bind` exists only
so the WJI ids land on the right path without hand-editing.

## WJI, through the `wji` CLI

The `wji` skill governs auth, confirmations and spending. The calls this skill makes:

| Purpose | Command |
| --- | --- |
| preflight | `wji auth whoami --json`, `wji profile wallet` |
| workspace | `wji ws create "<title>" -r <ratio>` → `wji ws use <id>` |
| datasets | `wji dataset new … --app <appId>`, `wji fs set <id> --merge` (never `--content`), `--add-images` (never `--images` on an existing node) |
| canvases | `wji canvas create <name>` · `wji canvas add <kind> -c <cv> …` · `wji canvas connect <a> <b>` · `wji canvas get <node>` · `wji canvas gen <node> [--yes --wait]` · `wji canvas rm` |
| assets | `wji asset download <id> -o <dir>` — **look at what you generated** before building on it |
| history | `wji history get <id> --wait` |

Full canvas layouts, with the node rows and the reference order, are in `canvas-recipes.md`.
