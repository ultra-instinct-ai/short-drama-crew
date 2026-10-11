# Mix over a supplied video (default: BGM + BGE + Ambience + Sound design)

Use when the user hands over a finished or rough-cut video and asks to "add a mix / 加混音 / 配樂". AI video (Seedance with audio on) already carries **dialogue, Foley and diegetic SFX**, so the default job adds only the layers the video lacks. Full theory, loudness standards and sources: `film-mixing-guideline.md` (sections 2, 5, 6, 8).

## Default layer policy

| Layer | 中文 | Default | Notes |
| --- | --- | --- | --- |
| BGM / score | 配樂 | **ADD** | Non-diegetic music, one intent per story section, ducked under dialogue |
| BGE / BGs | 背景環境聲 | **ADD** | Location bed (city, office HVAC, KTV corridor bass, rain). Continuous; covers clip seams |
| Ambience / room tone | 環境底／房間底噪 | **ADD** | Fills dead air and 15 s clip joins; matches the space |
| Sound design | 聲音設計 | **ADD** | Non-literal: risers, whooshes, stingers, impacts, drones, hits, reverses, silence drops |
| Dialogue (DX) | 對白 | **KEEP from video** | Never regenerate or cover |
| Foley | 擬音 | **KEEP from video** | Do not double footsteps, cloth, props |
| Hard SFX | 實體音效 | **KEEP from video** | Add only if the user asks, or a story hit is clearly missing in the video (note it as an exception) |

Rule: if the video already has it, don't add it again. Listen first and list what the video already carries before writing a single cue.

## Step 1. Analyse the video (local, free; no WJI)

```bash
V=input.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,r_frame_rate,codec_name -of json "$V"
# shot cuts (tune 0.3–0.4)
ffmpeg -i "$V" -vf "select='gt(scene,0.35)',showinfo" -an -f null - 2>&1 | grep -oE 'pts_time:[0-9.]+'
# existing audio loudness + where it goes quiet
ffmpeg -i "$V" -af ebur128=peak=true -f null - 2>&1 | tail -15
ffmpeg -i "$V" -af silencedetect=n=-40dB:d=0.4 -f null - 2>&1 | grep -E 'silence_(start|end)'
```

Then get a beat map: who speaks when, what happens, where the jokes, turns and cliff land (watch the video with the video-analysis helper, or read the locked script and storyboard if the project has them). Note dialogue spans: BGM must duck there.

## Step 2. Story structure 起承轉合 → music map

| Part | 作用 | Typical sound move |
| --- | --- | --- |
| 起 Setup | establish place, tone | BGE + ambience first, BGM **enter** soft or late; establish the theme |
| 承 Development | build, complicate | BGM **swell** gradually; add pulse/drone layers; comedy: pizzicato, duck-and-sting |
| 轉 Turn / twist | reversal, reveal, 打臉 | **drop** or **silence** 0.3–1.5 s, then **stinger / impact / riser hit** exactly on the reveal frame |
| 合 Resolution / cliff | payoff or cliffhanger | romance: swell + resolve; comedy: button sting; cliff: near-silence + one iconic hit, unresolved chord, hard **out** |

Short-drama grammar: hit the 爽點 on the frame, keep one music intent per section, contrast beats loudness (silence before a hit makes it land), and the mix must read on a phone speaker (dialogue intelligible, low end not relied on).

## Step 3. Timecode cue sheet (SoT)

Format every cue with **both** SMPTE timecode `HH:MM:SS:FF` at the video's frame rate and seconds to 0.1 s (Seed Audio's dialogue timing precision is ~100 ms). Frame = round(seconds × fps). Snap hits to detected cut times.

```
Project: <name>  Video: <file>  Duration: 00:02:19:00 (139.0 s)  FPS: 24  Section split for Seed Audio: ≤120 s

| # | TC in      | TC out     | sec in–out    | 起承轉合 | Layer        | Action  | Description |
|---|------------|------------|---------------|---------|--------------|---------|-------------|
| 1 | 00:00:00:00| 00:01:06:00| 0.0–66.0      | —       | BGE          | bed     | neon KTV booth, muffled corridor bass, low hum |
| 2 | 00:00:00:12| 00:00:10:00| 0.5–10.0      | 起      | BGM          | enter   | light comedy pizzicato, tipsy wobble |
| 3 | 00:00:10:00| 00:00:25:00| 10.0–25.0     | 承      | BGM          | duck    | duck under dialogue (amount by ear) |
| 4 | 00:00:46:01| 00:00:46:12| 46.0–46.5     | 轉      | Sound design | silence | music drop to silence before reveal |
| 5 | 00:00:46:12| 00:00:48:00| 46.5–48.0     | 轉      | Sound design | sting   | SPECIAL: sharp impact + glass-ring sting on reveal frame |
| 6 | 00:02:15:00| 00:02:19:00| 135.0–139.0   | 合      | BGM          | out     | cliff: unresolved chord, hard out on last frame |
```

Actions: `enter | swell | duck | drop | silence | sting | riser | whoosh | out | bed`. Mark hero moments `SPECIAL:` so QC can find them.

## Step 4. Seed Audio prompts (Operator runs them)

- One Seed Audio job per ≤120 s section; split at a scene change or a music silence, never mid-phrase. Local time 0 = section start; write the offset in the header.
- **Bed mode, no voices**: "No dialogue, no vocals, no lyrics, no Foley, no footsteps, no hard sound effects already in the picture."
- Write timeline lines `[start s:end s]` from the cue sheet: BGE/ambience continuous first, then BGM cues, then sound-design hits. Leave dialogue spans quiet ("music ducks under dialogue").
- Default model `seed-audio-1.0` (confirm live). Prompt ≤2048 chars. Package for the Operator: prompt files, durations, section offsets, credit estimate.
- If the user only wants BGM, drop BGE/ambience/sound-design lines and say "instrumental BGM only".

## Step 5. Mix spec (for whoever lays it under the video)

- Dialogue is the anchor: centred; everything sits under it.
- BGM ducks under dialogue via sidechain from the video's audio (or automation on the dialogue spans from Step 1). No standard fixes the dB; judge by ear.
- BGE/ambience low and continuous; crossfade across clip seams.
- Targets: social / mobile vertical ≈ −16 LUFS integrated, true peak ≤ −1 dBTP (a recommendation derived from AES TD1006 / EBU R128 s2, not a platform rule). Netflix-style long form: −27 LKFS dialogue-gated, ≤ −2 dBTP. Broadcast EBU: −23 LUFS, ≤ −1 dBTP. See `film-mixing-guideline.md` §6.

## Step 6. Soft-QC

- Duration matches section; offsets align with timecode (check the hits against the cut list, ±2 frames).
- No accidental vocals or dialogue (use spectrogram; ASR on music hallucinates, ignore nonsense text).
- No doubled Foley or SFX against the video.
- 起承轉合 arc audible; every `SPECIAL:` hit present at its timecode.
- Loudness measured with `ffmpeg -af ebur128=peak=true` on the final mix.
FAIL → Producer before any paid regen.
