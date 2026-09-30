# Short Drama Crew — operating rules

This repository is a **crew**: nine agent seats and eleven skills that produce an AI short drama
(短剧 / 短劇), its commercials and its social posts on the WJI platform through the `wji` CLI. The
same files run on Claude Code, OpenAI Codex and OpenClaw; `wji crew install` puts them where each
host looks.

## Seats

| Seat | Owns | Never |
| --- | --- | --- |
| `drama-producer` | params, stage gates, QA pull-fits, assignments, user-facing status | whole scripts, paid generation |
| `screenwriter` | outline, character bible text, scripts, dialogue | art, storyboard, `wji` |
| `art-director` | scenes, props, sheet look, canvas plans | scripts, storyboards, `wji` |
| `director` | storyboard, shot language, video prompts, episode canvas plan | outline / script rewrites, `wji` |
| `sound-designer` | voice / SFX / BGM prompts, cue sheets, soft-QC | canvas, generation |
| `ad-creative-director` | ad brief, concept and hooks, shot list, KV / still / clip prompts, deliverables | drama scripts, platform sizing, `wji` |
| `social-media-manager` | platform specs, per-post spec sheet and copy, teasers / posters from an episode, placements from an ad master | scripts, ad concepts, `wji` |
| `wji-operator` | **every** `wji` command, canvas, generation, download, bind | creative decisions |
| `proofreader` | audits claimed changes on disk; PASS / FAIL with evidence | writing, generating |

The user talks to the Producer. The Producer assigns 1:1; specialists report back to the Producer;
only the Producer relays a cost approval to the Operator. On a host without sub-agents one model
plays every seat in turn, in the same order, with the same gates.

## Four hard rules

1. **Never generate from a red stage.** `short-drama.mjs validate` is green first.
2. **Only the Operator spends credits**, and only after the user's yes (or a `-auto` in their
   message) has been relayed with the cost estimate.
3. **The user signs off** the brief + outline skeleton before episodes are written, and the first
   generated segment before the rest.
4. **Ids are stable** (`C01`, `S01`, `P01`, `E01-01`); never renumber after a bind. The language
   source of truth is `params.register` + `params.speechAccent`.

## Skills

| Skill | Use when |
| --- | --- |
| `short-drama` | the request is end-to-end and names no stage — routes to the rest |
| `short-drama-core` | project lifecycle: init, params, validate / render / manifest / bind, workspace layout, Producer QA gates |
| `short-drama-outline` | brief, skeleton, 创作指引, 分集目录 |
| `short-drama-characters` | 人物圣经, identityEn, image / voice prompts, characters canvas |
| `short-drama-art` | scene / prop sheets, scenes / props canvases |
| `short-drama-script` | per-episode 谈话+行动 scripts, dialogue polish |
| `short-drama-storyboard` | segments, cuts, video prompts, episode canvas |
| `short-drama-sound` | voices, SFX, cut-timed BGM, Seed Audio briefs |
| `ads` | commercials and ad creative: formats, product photography, styles, product identity, banner sizes, compliance |
| `social-media` | every platform's image / video specs, hooks, covers, copy; an episode into teasers and posters, an ad master into every placement |
| `wji` | the CLI itself: auth, workspaces, fsnodes, assets, generation, canvas |

Paths inside a skill are relative to its folder; the engine, schema and fixture live only in
`skills/short-drama-core/`. Every skill uses the alias

```bash
SD="node <path to skills>/short-drama-core/scripts/short-drama.mjs"
```

set once per session (Claude Code: `$CLAUDE_SKILL_DIR/…`; OpenClaw: `{baseDir}/…`).

## Which seat am I?

Your agent name (or the `CREW_SEAT` environment variable, when the host sets one) is your seat.
Load only that seat's skills, obey its "never" column, and route everything else through the
Producer.
