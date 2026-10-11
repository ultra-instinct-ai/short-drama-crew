# BGM timed to video + short-drama SFX

## Segment `sound` SoT

```json
"sound": {
  "ambience": "neon KTV booth hum, leather sofa creak",
  "sfx": [
    { "cut": 2, "event": "wine glass tip and splash on table" },
    { "cut": 7, "event": "SPECIAL: cliff freeze sting — single high piano hit then silence" }
  ],
  "music": {
    "intent": "romantic neon slow pulse, soft keys, restrained satin bass",
    "cues": [
      { "at": 1, "do": "enter", "note": "under dialogue" },
      { "at": "10.5s", "do": "swell", "note": "rise into kiss handoff" },
      { "at": 4, "do": "duck", "note": "under roast lines" },
      { "at": 6, "do": "drop", "note": "after climax into plea" },
      { "at": 7, "do": "silence", "note": "before P02 reveal" },
      { "at": "end", "do": "out" }
    ]
  }
}
```

`prompt audio … --bed` / `--full` expands this into `[start s:end s]` lines for Seed Audio.

## BGM cue verbs (short-drama-core)

`enter | swell | duck | drop | silence | out`

Put mood vocabulary in `intent` + `note`:

| Want | How to write |
| --- | --- |
| rise / build | `swell` + note "intensity climb / rise into …" |
| drone / dread | intent "low dread drone, barely moving" + `enter`/`drop` |
| romantic | intent "romantic …" + `swell` on romantic beats |
| comedy | intent "light comedy pizzicato" + duck under punchlines |
| cliff | `drop` or `silence` then one special sting SFX |
| triumphant | intent "bright brass sting" — use sparingly |

Rules: one music intent per segment (or continuous across a scene); instrumental unless vocals are a story beat; **duck under dialogue**; hit 爽点 / cliff on purpose. Continuous texture belongs in **ambience**, not twenty music mood words.

### With a `params.cinematography` preset (sound is half the look)

Craft in `../../short-drama-core/reference/cinematography-<preset>.md`; not gated.

| preset | music / sfx |
| --- | --- |
| `low-key` | nothing extra — the usual dread / tension vocabulary |
| `sweet-romance` | the OST is the segment's `sound.music`, cues on the cut: `enter` on the eye-lock's last cut, `swell` on the look back / the carry / the gap closing, `silence` as the hand lands or just before a confession line (so it lands in a hush), `drop` on the 壁咚; rain on the umbrella, a heartbeat if wanted |
| `period-nostalgia` | diegetic music of the era — the radio, a period song on the cassette player — in `sound.sfx` or as the segment's `music` intent; cicadas in the courtyard, the bicycle bell, a street hawker, a distant train |
| `costume-idol` | follows `sweet-romance` for the 心动 set pieces (执手, 簪花, 共乘一马, 月下对饮, 灯会) — `enter` / `swell` / `silence`; wind, chimes, the lantern festival crowd as ambience |
| `costume-dark` | fire crackle, wind, rain on tiles, armour creaking, distant drums; **`silence`** in the court before a verdict; violence carried by sound and consequence rather than choreography |
| `scifi-hard` | hums, fans, relays, alarms, radio chatter with squelch, breathing in a helmet; **silence in vacuum** (only the suit's breathing and radio); music sparse — a low drone, a single piano line |
| `scifi-soft` | rain, crowds in many languages, synth hums, holographic chimes, drones passing; music synthwave / ambient pads |

### By segment grammar (`segment.grammar`, else `params.grammar`)

Craft in `../../short-drama-core/reference/grammar-faceslap.md` §3, `grammar-comedy.md` and
`action.md` / `action-<style>.md` ("Sound"); gate `grammar-advice` checks the 打脸 music hit.

| grammar | music / sfx |
| --- | --- |
| `faceslap` | `silence` or `drop` under the insult, **`enter` / `swell` on the entrance or the proof**, full through the reaction cascade; sfx: the document slapped on the table, the gasp, the cup falling, the murmur rising |
| `comedy` | **silence before the punchline** (a `silence` cue or a pause in the ambience); `slapstick` — cartoon sfx on every beat (boing, whoosh, record scratch) and a comic sting after the punchline; `deadpan` — no comic sfx, often no music, the ambience (clock, fly, fridge hum) fills the hold; `romcom` — playful pops and plinks, a heartbeat, a cute sting, the OST entering on the blush |
| `action` | **every impact gets an sfx on its cut**; the music `drop`s out before the decisive blow; per style: `bullet-time` stretched / pitched-down sound then snap back, `gun-fu` driving low synth, `hk-kungfu` exaggerated whooshes and snaps with a comic sting, `historical-realist` metal on metal and often no score, `street-brawl` none or a low drone, `car-chase` engines then the silence after the crash |

## SFX + special short-drama FX

Every story-visible hit needs `sfx[]` tied to a **cut** (or absolute time in a hand-written prompt). Prefer concrete / onomatopoeic events.

Mark hero moments with `SPECIAL:` in `event` so QC can hear them.

| Beat | Typical special FX |
| --- | --- |
| 打脸 / reveal | sharp whoosh + muted impact + brief silence |
| 身份揭露 | rising drone → glass-ring sting |
| 强宠 / romantic turn | soft shimmer / heartbeat under VO |
| Comedy mishap | spill / choke / bonk — diegetic if live-action |
| Cliffhanger | near-silence + one iconic prop sound |
| Transition | whip-pan whoosh (sparingly) |

Few high-value FX per segment. If the beat is only atmosphere, put it in ambience.

## Intent vocabulary bank (examples — not a closed list)

Write these into `music.intent` and cue `note`. Pair with `enter | swell | duck | drop | silence | out`. Mix freely.

**Tension / suspense:** suspense pad · ticking urgency · dread drone · cold empty room · stalking pulse · pressure build · quiet danger · held breath

**Rise / climax:** slow rise · intensity climb · heartbeat acceleration · approaching climax · swelling strings · peak hit

**Romantic:** romantic neon · soft satin · afterglow haze · tender piano · yearning guitar · candlelit hush · close whisper hush

**Comedy / farce:** light comedy pizzicato · clumsy slapstick · awkward silence bed · wink-and-nudge · drunken wobble · karaoke parody · punchline duck-and-sting

**Face-slap / twist / 爽点:** smug turnaround · reveal sting · power-flip brass · gotcha hit · vindication swell · identity-drop silence then sting

**Sad / bruised:** lonely night · soft regret · bruised tenderness · rain-on-window · hollow after

**Anger / control:** cold command · sharp authority · icy control · simmering rage · light disciplinary march


**Place texture:** neon booth haze · muffled corridor bass · office night hum · leather sofa creak bed · fluorescent buzz · city window night

**Transition / end:** whip cut · hard reset · freeze-frame sting · cliff hang · unresolved chord · fade-to-black

Example: `intent: "awkward comedy pizzicato under neon booth haze"` · note: `swell — intensity climb into climax` · note: `drop — freeze-frame sting then silence`
