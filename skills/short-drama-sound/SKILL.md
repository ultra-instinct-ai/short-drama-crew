---
name: short-drama-sound
description: >-
  Design the audio of an AI short drama (短剧 / 短劇) on WJI with Seed Audio:
  character dialogue performance and dry voice-sample prompts, and — after the
  clips are edited — the episode's cinematic soundtrack over the final video:
  BGM, BGE / ambience and sound design (risers, stingers, whooshes, silence
  drops) on a timecoded cue sheet following 起承轉合, since music made inside a
  clip cannot carry across segments. Also scores a video the user supplies
  (加混音 / 配樂). Use when writing voice, BGM, SFX or sound-design prompts and
  cue sheets, or soft-QC of generated tracks — the craft and prompts only;
  every canvas node, generation and bind goes through the Operator.
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
and `reference/bgm-sfx.md` (the segment `sound` fields, in-clip vs `post` sfx, cue verbs, SFX table,
intent bank, the rows per `params.cinematography` preset and per segment grammar — check those
before writing `sound.music` cues). Mixing theory and terms (DX / MX / FX, M&E, BGM vs BGE, Foley,
ducking, J / L-cut, LUFS) with sourced loudness targets: `reference/film-mixing-guideline.md`.

## The order: clips → edit → score

Each segment is a separate video generation, so music or sound design made inside a clip stops at
its last frame — a swell cannot carry across a cut, and every clip invents its own score. So with
`params.audioTrack: post` (the default):

1. **Clips carry no music.** The video prompts keep the dialogue, the ambience and the in-picture
   sfx; they say `No music.` and leave out every sfx marked `post: true`. The storyboard still
   writes `segment.sound.music` (intent + cues) and the `post: true` hits — your spotting notes.
2. **The episode is edited** into a locked cut (picture lock — no length changes after this).
   The Operator cuts it with FilmCraft, or ffmpeg if `filmcraft-cli` is not installed
   (`../short-drama-core/reference/edit-tools.md`). The `.fcproj` stays in the project.
3. **You score the edit as one piece**, on its timecode: `$SD prompt <project> score E01` gives the
   planned spotting sheet; conform it to the edit and write the cue sheet and the Seed Audio prompts
   (`reference/mix-over-video.md`).

`bed` / `full` (a Seed Audio node per segment, music in the clip) remain for projects that set them.

## Hard rule — the Operator owns the canvas

The Sound Designer writes prompts, cue sheets and soft-QC notes only. The **Operator** runs every
Infinite Canvas / Seed Audio action that spends credits or mutates a canvas: `wji canvas add
audio`, connect, gen, download, bind, `fs set`, `asset upload`. Never invent model names — list the
live ones; the crew default is `seed-audio-1.0`. Quote first; generate only after the Producer
relays the user's yes (or `-auto`).

Hand-off package for the Operator: project path, workspace / canvas ids, node names, prompt file
paths, the `--from` / `@Audio` order, duration pin, section offsets / timecodes, credit estimate,
bind paths.

## Score the edited episode

Follow `reference/mix-over-video.md`; the same steps score a video the user supplies.

- Start from `$SD prompt <project> score E01 [--fps 24]`: SMPTE rows for the scene beds (BGE),
  every line (where the music ducks), each segment's music cues at episode time, the `post` sound
  design, the sfx already in the clips, the hook / turns / 爽点 / cliff, and the ≤120 s sections.
  It is the *planned* timeline.
- Conform it to the edit. If `edits/E01.fcproj` exists, read the cuts from
  `filmcraft-cli --project edits/E01.fcproj inspect sequence`. Otherwise detect cuts, dialogue
  spans and silences with ffmpeg (free, local). Shift each segment's rows to where its clip
  starts in the edit, and re-snap hits to cuts.
- By default add only **BGM, BGE (background environment), ambience / room tone and sound design**
  (risers, whooshes, stingers, impacts, drones, silence drops). The clips already carry dialogue,
  Foley and in-picture SFX — add those only when the user asks or a story hit is clearly missing,
  and flag it as an exception.
- Place the music moves on **起承轉合** (setup / development / turn / resolution or cliff): enter,
  swell, duck, drop, silence, sting, out — one intent per story section, carried across cuts.
- Write the **cue sheet with precise timecode** — SMPTE `HH:MM:SS:FF` at the edit's fps plus
  seconds to 0.1 s, hits snapped to cut frames, `SPECIAL:` on hero moments.
- Turn it into Seed Audio bed prompts, one per ≤120 s section split at a scene change or a music
  silence (no voices, nothing already in picture, music ducked under dialogue), and package them.
- Mix spec: dialogue is the anchor; BGM sidechain-ducked (amount by ear); mobile / social target
  about −16 LUFS, ≤ −1 dBTP (a recommendation — guideline §6). Lay the stems in SoundCraft
  (`soundcraft-cli`, session kept at `edits/E01/E01.scraft`) or with ffmpeg when that CLI is
  missing (`../short-drama-core/reference/edit-tools.md`). The Operator binds the edit and the
  final mix to `wji.assets.edit` / `wji.assets.mix` (`manifest` asks for both).

## Voices and segment sound notes

- `$SD prompt <project> voice C01` — dry character voice sample (from `characters[].voice`)
- Keep `characters[].voice` and `segments[].sound` as the generative source of truth; the language
  is `params.register` + `params.speechAccent`. Review the Director's `sound` notes: in-clip sfx are
  what the world makes; stingers / risers / whooshes / impact hits are `post: true`.
- The voice-sample opening is built from `profile.ageRange` / `gender` / `identity`. If those are
  written in a different language from the dialogue, the opening comes out garbled — write a clean
  sample prompt in the dialogue language into the hand-off and tell the Operator to paste that.
- `bed` / `full` projects only: `$SD prompt <project> audio E01-01 [--bed|--full]` — the segment's
  cut-timed soundtrack; `--full` adds the lines in the connected `@Audio1..3` voices.

## Checklist

1. Locked edit (or the user's video) + the storyboard's `sound` notes + the language / register
   source of truth
2. `prompt score` → conform to the edit: cut list, dialogue spans, beat map
3. Cue sheet on the edit's timecode → Seed Audio section prompts
4. Soft-QC → package → **Operator** quotes / generates / mixes / binds
5. Soft-QC the deliverable against the cue sheet (±2 frames); FAIL → Producer before a paid
   regeneration
6. Ask for the Proofreader when language or voice bindings may have drifted

## Anti-patterns

- Running `wji canvas gen` yourself
- Music or stingers in a clip prompt under `audioTrack: post`
- Scoring before picture lock, or scoring clip by clip
- A keyword cloud for BGM with no timeline
- Cues without timecode, or hits not snapped to cuts
- Doubling Foley / SFX / dialogue the video already has
- Prompt language ≠ the spoken lines' language or register
- Music singing over dialogue; BGM not ducked under dialogue
- More than 3 voice refs; mixing image and audio refs on one Seed Audio node
- Quoted lines inside `voice.prompt` / the sample direction
- Inventing a spend approval or loudness numbers
