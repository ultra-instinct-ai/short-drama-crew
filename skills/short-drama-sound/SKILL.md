---
name: short-drama-sound
description: >-
  Design the audio of an AI short drama (短剧 / 短劇) on WJI with Seed Audio:
  character dialogue performance and dry voice-sample prompts, per-segment SFX
  and special 短剧 hits, ambience, and BGM timed to the video cuts (enter / swell
  / duck / drop / silence / out). Also mixes over a supplied video (加混音 /
  配樂): BGM + BGE + ambience + sound design on a timecoded cue sheet following
  起承轉合. Use when writing voice, SFX, BGM or scene-audio prompts and cue
  sheets, or soft-QC of generated tracks — the craft and prompts only; every
  canvas node, generation and bind goes through the Operator.
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
and `reference/bgm-sfx.md` (the segment `sound` fields, cue verbs, SFX table, intent bank, the
rows per `params.cinematography` preset and per segment grammar — check those before writing
`sound.music` cues).

Mixing theory and terms (DX / MX / FX, M&E, BGM vs BGE, Foley, ducking, J / L-cut, LUFS) with
sourced loudness targets: `reference/film-mixing-guideline.md`.

## Hard rule — the Operator owns the canvas

The Sound Designer writes prompts, cue sheets and soft-QC notes only. The **Operator** runs every
Infinite Canvas / Seed Audio action that spends credits or mutates a canvas: `wji canvas add
audio`, connect, gen, download, bind, `fs set`. Never invent model names — list the live ones;
the crew default is `seed-audio-1.0`. Quote first; generate only after the Producer relays the
user's yes (or `-auto`).

Hand-off package for the Operator: project path, workspace / canvas ids, node names, prompt file
paths, the `--from` / `@Audio` order, duration pin, section offsets / timecodes, credit estimate,
bind paths.

## With a project on disk

- `$SD prompt <project> voice C01` — dry character voice sample (from `characters[].voice`)
- `$SD prompt <project> audio E01-01 [--bed|--full]` — cut-timed soundtrack from
  `storyboard.segments[].sound`; `--full` adds the lines in the connected `@Audio1..3` voices
- Keep `characters[].voice` and `segments[].sound` as the generative source of truth; the
  language is `params.register` + `params.speechAccent`.
- The voice-sample opening is built from `profile.ageRange` / `gender` / `identity`. If those are
  written in a different language from the dialogue, the opening comes out garbled — write a clean
  sample prompt in the dialogue language into the hand-off and tell the Operator to paste that.

## Mix over a supplied video

When the user hands over a video and asks to add a mix / 加混音 / 配樂, follow
`reference/mix-over-video.md`.

- AI video (Seedance with audio on) already carries **dialogue, Foley and SFX**. By default add
  only **BGM, BGE (background environment), ambience / room tone and sound design** (risers,
  whooshes, stingers, impacts, drones, silence drops). Add hard SFX or Foley only when the user
  asks or a story hit is clearly missing, and flag it as an exception.
- Listen first: list what the video already has; detect cuts, dialogue spans and silences with
  ffmpeg (free, local).
- Map the story to **起承轉合** (setup / development / turn / resolution or cliff) and place the
  music moves on it: enter, swell, duck, drop, silence, sting, out.
- Write a **cue sheet with precise timecode** — SMPTE `HH:MM:SS:FF` at the video's fps plus
  seconds to 0.1 s, hits snapped to cut frames, `SPECIAL:` on hero moments.
- Turn the cue sheet into Seed Audio bed prompts (≤120 s per job, no voices, no Foley / SFX
  already in picture, music ducked under dialogue) and package them for the Operator.
- Mix spec: dialogue is the anchor; BGM sidechain-ducked (amount by ear); mobile / social target
  about −16 LUFS, ≤ −1 dBTP (a recommendation — guideline §6).

## Checklist

1. Locked script + the Director's cut map + the language / register source of truth (for a
   supplied video: cut list, dialogue spans, beat map)
2. Update the voice / `sound` JSON (or prompt files under `audio/`)
3. Build the prompts (engine helpers, a SCENE brief, or a timecoded cue sheet)
4. Soft-QC → package → **Operator** quotes / generates / binds
5. Soft-QC the deliverable against the cue list and timecodes (±2 frames); FAIL → Producer before
   a paid regeneration
6. Ask for the Proofreader when language or voice bindings may have drifted

## Anti-patterns

- Running `wji canvas gen` yourself
- A keyword cloud for BGM with no timeline
- Cues without timecode, or hits not snapped to cuts
- Doubling Foley / SFX / dialogue the video already has
- Prompt language ≠ the spoken lines' language or register
- Music singing over dialogue; BGM not ducked under dialogue
- More than 3 voice refs; mixing image and audio refs on one Seed Audio node
- Quoted lines inside `voice.prompt` / the sample direction
- Inventing a spend approval or loudness numbers
