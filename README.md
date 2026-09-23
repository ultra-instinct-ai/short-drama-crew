# Short Drama Crew

A portable **crew** that produces an AI short drama (短剧 / 短劇) on the [WJI](https://wji.ai)
platform: seven agent seats and nine skills, written once and installed into **Claude Code**,
**OpenAI Codex**, **OpenClaw**, or exported for the **Grok bot** platform with one command from the
`wji` CLI.

The crew writes the drama the way a commercial 短剧 is written — 创作简报, 创作指引, 人物圣经, 分集目录
with 爽点 and 钩子, 谈话+行动 scripts, storyboards cut to the video model — then generates the
character sheets, scene sheets, clips and Seed Audio tracks through the `wji` CLI. Every stage is
gated by `short-drama.mjs validate`; nothing is generated from a red stage, and only one seat ever
spends credits.

## Seats

| Seat | Owns | Never |
| --- | --- | --- |
| **Drama Producer** | params, stage gates, QA pull-fits, assignments, status | whole scripts, paid generation |
| **Screenwriter** | outline, character bible text, scripts, dialogue | art, storyboard, `wji` |
| **Art Director** | scenes, props, sheet look, canvas plans | scripts, storyboards, `wji` |
| **Director** | storyboard, shot language, video prompts, episode canvas | outline / script rewrites, `wji` |
| **Sound Designer** | voice / SFX / BGM prompts, cue sheets, soft-QC | canvas, generation |
| **WJI Operator** | every `wji` command, canvas, generation, download, bind | creative decisions |
| **Proofreader** | audits claimed changes on disk; PASS / FAIL with evidence | writing, generating |

Talk to the Producer. Channels: **Short Drama Crew** (all but Sound) and **Audio desk** (Producer,
Sound Designer, Operator, Proofreader).

## Skills

| Skill | Use when |
| --- | --- |
| `short-drama` | end-to-end request that names no stage — routes to the rest |
| `short-drama-core` | lifecycle: init, params, validate / render / manifest / bind, workspace layout, Producer QA gates; holds the engine, schema and fixture |
| `short-drama-outline` | brief, skeleton, 创作指引, 分集目录 |
| `short-drama-characters` | 人物圣经, identityEn, image / voice prompts, characters canvas |
| `short-drama-art` | scene / prop sheets and canvases |
| `short-drama-script` | per-episode scripts, dialogue polish |
| `short-drama-storyboard` | segments, cuts, video prompts, episode canvas |
| `short-drama-sound` | voices, SFX, cut-timed BGM, Seed Audio briefs |
| `wji` | the CLI itself (mirrored from [wji-cli](https://github.com/ultra-instinct-ai/wji-cli); do not edit here) |

The skills follow the [Agent Skills](https://agentskills.io) spec, so every host reads the same
`SKILL.md`. The engine, `schema.md` and the `night-shift` fixture live only in `short-drama-core`;
the stage skills point at it with `../short-drama-core/…`, so the nine folders must stay siblings.

## Install

Prerequisites: Node ≥ 20, the WJI CLI (`npm i -g @wji.ai/cli`) and a signed-in profile
(`wji auth login`).

```bash
wji crew install short-drama --for claude          # Claude Code: ~/.claude/skills + ~/.claude/agents
wji crew install short-drama --for codex           # Codex:       ~/.agents/skills + ~/.codex/agents/*.toml
wji crew install short-drama --for openclaw        # OpenClaw:    ~/.agents/skills + ~/.openclaw/workspaces/short-drama-crew/<seat>/
wji crew install short-drama --for grok            # Grok bot:    ./short-drama-crew-export.zip to import there
wji crew install short-drama --for all
```

`wji crew install` fetches this repository (`--ref <branch|tag>`), or takes `--from <folder|zip|tar.gz|url>`.
`--project <dir>` installs into a project (`.claude/`, `.agents/`, `.codex/`, `openclaw/`) instead
of your home directory; `--link` symlinks a local checkout instead of copying; `--dry-run` shows
the plan. `wji crew status` lists what was written and `wji crew uninstall short-drama-crew`
removes exactly that.

### Claude Code

After installing, start a session as the Producer, or let the Agent tool pick the seats:

```bash
claude --agent drama-producer
```

The repository itself is also a project scope (`.claude/skills` and `.claude/agents` symlink to
`skills/` and `agents/`) and a plugin (`claude --plugin-dir /path/to/short-drama-crew`). Use one
of the three, not several at once, or the same agents appear twice.

### Codex

Codex discovers `~/.agents/skills` (or `.agents/skills` in a project) and the seat definitions in
`~/.codex/agents/*.toml`. Two notes:

- the `wji-operator` seat needs network for the `wji` CLI: set
  `[sandbox_workspace_write] network_access = true` in `~/.codex/config.toml`;
- custom agents may not be spawnable by name from tool-backed sessions
  ([openai/codex#15250](https://github.com/openai/codex/issues/15250)); open a session with the
  seat's TOML directly when that happens.

### OpenClaw

The installer writes one workspace per seat (`AGENTS.md` = operating rules + seat block,
`SOUL.md` = persona, `skills` → the shared skills) and registers each seat with
`openclaw agents add` when the binary is found (`--no-register` to skip). It never rewrites
`~/.openclaw/openclaw.json`: merge the generated `openclaw.agents.json5` (skills allowlists,
tools, sub-agent permissions, channel bindings — fill in your real channel ids) by hand, then
`openclaw skills check --agent drama-producer`.

### Grok bot

`--for grok` builds a zip in the platform's import layout: `skills/<name>/…`, `bots/<seat>.json`
(name + description), `bots/crew-manifest.json`, `channels/*.json`. Import the skills into the
shared library, create one bot per `bots/*.json` (start with the Producer) and the two channels
from `channels/*.json`.

## Development

```bash
npm test              # engine self-test: every gate has a breaking case (no model calls)
npm run validate      # the night-shift fixture passes every gate
npm run check         # all-ages content only, spec-valid skills, links resolve, crew.json ↔ agents
npm run sync-wji      # refresh skills/wji from ../wji-cli
npm run install-crew  # wji crew install --from . --for all
```

The pack is all-ages content only; `scripts/check-clean.sh` enforces it.

## Layout

```
crew.json          seats, skill allowlists, capabilities, delegation, channels
agents/<seat>.md   one persona per seat (Claude agent frontmatter + body) — the single source of truth
skills/<name>/     Agent Skills; short-drama-core holds scripts/, examples/, reference/schema.md
AGENTS.md          shared operating rules (read by Codex and OpenClaw; Claude via CLAUDE.md)
.claude/, .agents/ symlinks so the repo is itself a project scope
.claude-plugin/    plugin manifest
scripts/           check-clean.sh, sync-wji-skill.sh
```

Codex and OpenClaw adapters are generated at install time from `agents/*.md` + `crew.json`; they
are not committed.
