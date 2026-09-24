---
name: short-drama-characters
description: >-
  Write Stage 2 character bibles (人物圣经) for an AI short drama (短剧 / 短劇) on
  WJI: profile and 关系网, Want vs Need, 核心误信, speech register, the name-free
  identityEn, headshot / sheet image prompts and the voice brief, then the
  characters canvas (headshot → sheet → voice sample). Use when filling or fixing
  character JSON or planning character sheets and voices — not for scene / prop
  art or storyboards.
license: UNLICENSED
metadata:
  crew: short-drama-crew
  requires: short-drama-core
  stage: characters
---

# Stage 2 — Characters

Paths are relative to this skill's folder. The engine, `schema.md` and the fixture live in
`../short-drama-core/`; `$SD` is the engine alias defined there.

Read `reference/stage-characters.md`. The bible shape follows
`../short-drama-outline/reference/craft-story.md` §7; the fixture
`../short-drama-core/examples/night-shift/project.json` shows every field filled.

## Steps

1. Fill `oneLiner`, `profile` (with the 关系网 in `relationships`: surface / real / power /
   secret), **`bible`** (剧情功能, 一句话人物钩子, Want vs Need, 核心误信, 核心矛盾, 受压反应, `speech`
   — and for leads the wound, past choices, forbidden / mustFace and the arc), `identityEn`,
   `image` (portrait prompt, negative, 16:9 sheet prompt, tags) and `voice` for every character;
   `$SD validate <project> --stage characters`.
2. Two fields exist purely so a video prompt can talk about the person: **`identityEn`** is the
   name-free way to refer to them (`the woman in her mid thirties in headphones`) and
   **`voice.videoDirection`** is one English clause on how they speak, pasted beside every line
   they say in every clip — written from `bible.speech`. Prompts never carry names — and neither
   do the drama-language voice fields (`timbre / pitch / pace / accent / emotion`, the sample
   `direction`): a `wan` prompt pastes them beside the line. Write 对她说话时放轻, not 对晚晴….
3. Sync each character to a `character/` dataset (Operator): description = `oneLiner`, content =
   `$SD render <project> character C01`, `image_prompt` = the sheet prompt, `audio_prompt` =
   `$SD prompt <project> voice C01`, metadata = the JSON.
4. `characters` canvas (`wji canvas create characters` once; Art Director designs, Operator
   executes): per character a title node, a **headshot** image node (1:1, portrait prompt), a
   **sheet** image node (16:9, `--from` the headshot, sheet prompt prefixed with `@image1 is the
   face to match`) and a **voice** audio node (`seed-audio-1.0`, `--from` the headshot — the model
   reads the face and invents a voice; `prompt voice C01` composes a dry-voice prompt: age,
   identity, personality, timbre, pitch, pace, accent, emotion, then the acted line). Recipes:
   `../short-drama-core/reference/canvas-recipes.md`.
5. Generate **headshots first** (single images run without asking; a batch of them is a batch —
   quote the total), inspect, then sheets and voices from the approved headshots. Listen to each
   voice. Attach all three assets — the asset list takes audio too:
   `wji fs set <dataset> --add-images <headshot> <sheet> <voice> --icon <headshot> --set primaryAudio=<voice>`;
   bind node and asset ids.

## Hand-off

The Screenwriter owns the text fields through validate-green; the Art Director signs the sheet
look; the **Operator** generates after the Producer relays the cost approval. Report to the
Producer; do not storyboard.
