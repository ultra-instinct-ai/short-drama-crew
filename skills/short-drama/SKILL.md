---
name: short-drama
description: >-
  Produce an AI short drama (短劇 / 短剧) on WJI end to end — the 创作简报, 创作指引,
  人物圣经, 分集目录 with 爽点 and 钩子, the 15-second hook and 30-second turns,
  谈话+行动 scripts, storyboards, then sheets, clips and Seed Audio tracks through
  the `wji` CLI, every stage gated by `short-drama.mjs validate`. Use whenever a
  task mentions short drama, 短劇 / 短剧, 分集 / 分镜 / 剧本 for AI video, or a
  serialised video story on WJI and no single stage is named — it loads
  `short-drama-core` and routes to the stage skills (outline, characters, art,
  script, storyboard, sound) and to `wji` for platform execution.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  role: router
---

# Short drama (router)

This skill is a **thin entry point**; the pipeline lives in the sibling skills (paths relative to
this folder).

1. Read and follow [short-drama-core](../short-drama-core/SKILL.md) for params, gates, the
   validate / render / manifest / bind loop, the workspace layout and the crew hand-offs.
2. Load the stage skill that matches the work:
   - outline (brief, skeleton, 分集目录) → [short-drama-outline](../short-drama-outline/SKILL.md)
   - characters (bible, identityEn, image / voice prompts) → [short-drama-characters](../short-drama-characters/SKILL.md)
   - art (scene / prop sheets, canvases) → [short-drama-art](../short-drama-art/SKILL.md)
   - script (per-episode 谈话+行动, dialogue polish) → [short-drama-script](../short-drama-script/SKILL.md)
   - storyboard (segments, cuts, video prompts, episode canvas) → [short-drama-storyboard](../short-drama-storyboard/SKILL.md)
   - sound (voices, SFX, cut-timed BGM, Seed Audio briefs) → [short-drama-sound](../short-drama-sound/SKILL.md)
3. Platform execution — every `wji` command, canvas node, generation and bind →
   [wji](../wji/SKILL.md) (the Operator seat).

## Seats

| Seat | Does | Never |
| --- | --- | --- |
| Producer | asks the params once, owns which stage is green, runs the QA pull-fits, relays approvals | writes whole scripts, runs paid generation |
| Screenwriter | outline, character bible text, scripts | art, storyboard, `wji` |
| Art Director | scenes, props, sheet look | scripts, storyboards, `wji` |
| Director | storyboard, shot language, video prompts | rewrites the outline, `wji` |
| Sound Designer | voice / SFX / BGM prompts and cue sheets | canvas or generation |
| Operator | all `wji` / canvas / gen / bind, after the cost is approved | creative decisions |
| Proofreader | audits claimed changes on disk, PASS / FAIL with evidence | writes or generates |

One agent playing every seat still follows the order: draft → validate → quote → generate.
