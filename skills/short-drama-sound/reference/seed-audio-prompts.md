# Seed Audio dialogue & voice prompts (BytePlus)

## What the model is

Seed Audio 1.0 on BytePlus is a **scene audio** model, not plain TTS: one prompt can coordinate speech, ambience, SFX, and music in one mixed track (up to ~120 s). Timing control for dialogue is currently the most precise layer (~100 ms).

- Official intro: https://seed.bytedance.com/en/blog/from-speech-to-audio-creation-introducing-the-seed-audio-1-0-audio-creation-model
- BytePlus Audio 1.0: https://docs.byteplus.com/en/docs/byteplusvoice/seedaudio-01

| Mode | Input | Use |
| --- | --- | --- |
| **T2A** | text (± one image) | invent voice + scene layers from description |
| **TA2A** | text + up to **3** reference audios | lock recurring voices with `@Audio1..3` |
| Dry **voice sample** | text + headshot on WJI | character `primaryAudio` / video `@audioN` — **no** bed / music / sfx |

Caps aligned with short-drama-core / WJI: prompt ≤ **2048** characters; ≤ **3** audio refs; do **not** mix image and audio refs on one Seed Audio job. Write the prompt in the **same language as the spoken lines** (project `params.register` SoT).

## Dry voiceprint (character sample)

Fill `voice.timbre / pitch / pace / accent / emotion`, English `voice.prompt` ≤400 (**no quoted lines**), `voice.videoDirection` ≤160, `voice.sample.line` + `direction` (acted ~3–5 s).

Preferred form (`voiceSamplePrompt` in short-drama-core):

```
（age+gender；identity；性格…；timbre；pitch；pace；accent；emotion；此刻<direction>；干声，无配乐无音效）<sample line>
```

Operator: `canvas add audio --from <headshot> -m seed-audio-1.0` → bind voice node / `primaryAudio`.

## Scene dialogue — SCENE brief (playback order)

Not a keyword cloud. Order:

1. **Setting** — place, time, acoustics / room tone  
2. **Cast** — who speaks; age/gender/timbre/accent/emotion/pace; sighs, whispers, laughs  
3. **Exact lines** — quoted verbatim from locked script  
4. **Timing** — dubbing / cut lock: `[5.5s:8.0s]` before the line (100 ms precision)  
5. **Layers** — optional ambience / one music bed / only story-critical SFX (omit for dialogue-only re-record)  
6. **TA2A map** — `Use @Audio1 for …; @Audio2 for …` (order = Operator `--from` order)

Use `speechLeadSeconds` (default 0.5) so mouths open after the cut starts.

```
[0.0s:16.0s] Ambience, continuous: convenience-store fridge hum, rain on the glass door, a faint radio.
Use @Audio1 for the tired young woman night-shift clerk; @Audio2 for the gruff older man regular.
[0.5s:3.2s] @Audio1, flat and guarded standard Mandarin, says: 老陈，今晚别再赊账了。
[3.4s:6.8s] @Audio2, low, half laughing, half pleading, says: 小夏，就这一次，明天发工资。
Dialogue only from the lines above; no other voices.
```

Soft-QC: speaker identity, register/language, no ad-lib lines, timestamps fit segment duration.

## Tips that match vendor guidance

- Prefer a compact **production brief** over tags  
- Onomatopoeia for SFX beats (`zzzip`, `clack`, `whoom`)  
- Extreme emotion adjectives often hurt naturalness — one controlled cue, intensify one detail  
- For series: keep the same reference clip across segments (TA2A)
