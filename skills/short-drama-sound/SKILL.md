---
name: short-drama-sound
description: >-
  Design the audio of an AI short drama (短剧 / 短劇) on WJI with Seed Audio:
  character dialogue performance and dry voice-sample prompts, per-segment SFX
  and special 短剧 hits, ambience, and BGM timed to the video cuts (enter / swell
  / duck / drop / silence / out). Use when writing voice, SFX, BGM or scene-audio
  prompts and cue sheets, or soft-QC of generated tracks — the craft and prompts
  only; every canvas node, generation and bind goes through the Operator.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core
  stage: sound
---

# Short drama — sound

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there.

Read `reference/seed-audio-prompts.md` (the model, T2A / TA2A, dry voiceprints, the SCENE brief)
and `reference/bgm-sfx.md` (the segment `sound` fields, cue verbs, SFX table, intent bank).

## Hard rule — the Operator owns the canvas

The Sound Designer writes prompts, cue sheets and soft-QC notes only. The **Operator** runs every
Infinite Canvas / Seed Audio action that spends credits or mutates a canvas: `wji canvas add
audio`, connect, gen, download, bind, `fs set`. Never invent model names — list the live ones;
the crew default is `seed-audio-1.0`. Quote first; generate only after the Producer relays the
user's yes (or `-auto`).

Hand-off package for the Operator: project path, workspace / canvas ids, node names, prompt file
paths, the `--from` / `@Audio` order, duration pin, credit estimate, bind paths.

## With a project on disk

- `$SD prompt <project> voice C01` — dry character voice sample (from `characters[].voice`)
- `$SD prompt <project> audio E01-01 [--bed|--full]` — cut-timed soundtrack from
  `storyboard.segments[].sound`; `--full` adds the lines in the connected `@Audio1..3` voices
- Keep `characters[].voice` and `segments[].sound` as the generative source of truth; the
  language is `params.register` + `params.speechAccent`.

## Checklist

1. Locked script + the Director's cut map + the language / register source of truth
2. Update the voice / `sound` JSON (or prompt files under `audio/`)
3. Build the prompts (engine helpers, or a SCENE brief from the reference)
4. Soft-QC → package → **Operator** quotes / generates / binds
5. Soft-QC the deliverable against the cue list; FAIL → Producer before a paid regeneration
6. Ask for the Proofreader when language or voice bindings may have drifted

## Anti-patterns

- Running `wji canvas gen` yourself
- A keyword cloud for BGM with no timeline
- Prompt language ≠ the spoken lines' language or register
- Music singing over dialogue
- More than 3 voice refs; mixing image and audio refs on one Seed Audio node
- Quoted lines inside `voice.prompt` / the sample direction
- Inventing a spend approval
