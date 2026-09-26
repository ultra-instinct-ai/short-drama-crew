# Grammar `comedy` — 喜剧

Comedy is **timing and faces**. A joke is a setup, a punchline and the room to laugh; the camera's
job is to let the audience see the face and give the laugh its beat. Three styles
(`params.comedy`) share that grammar and differ in rhythm and camera. Combinations and exceptions:
`grammar.md`.

Use it on a segment with `"grammar": "comedy"`, or make it the default (`params.grammar:
comedy`) in a comedy, where a straight scene sets `grammar: drama` on itself.

## 1. The shared grammar

| field | on | meaning |
| --- | --- | --- |
| `gag: "setup"` | the cut that plants the joke | the expectation, the rule, the lie, the thing that will go wrong |
| `gag: "build"` | optional, cuts that raise it | the rule of three: the same thing twice, then the twist |
| `gag: "punchline"` | the cut the joke lands on | the reversal, the reveal, the pratfall, the line |
| `purpose.kind: "reaction"` | the cut after the punchline | the laugh room: the face that takes the joke |

**Gated:**
- **Setup first** (`setup-first`): a punchline needs a `setup` earlier in the same scene.
- **Laugh room** (`punchline-reaction`): a punchline is followed by a `reaction` cut of at least
  the style's `hold` seconds, **or** the punchline itself is a `Static Shot` held `hold + 1`
  seconds (the awkward hold).

**Advisory** (`grammar-advice`): a comedy segment with no punchline; the average cut length of the
style; its signature shot; a punchline keyed from the side or behind in a `low-key` /
`costume-dark` drama (a laugh needs the face).

**Craft that holds for all three:**
- **Faces must read.** Comedy is the one grammar that asks the light to reach the face on the
  punchline, even in a dark look.
- **The reaction is funnier than the action.** Cut to the person who sees it, not the thing
  itself, and hold.
- **The rule of three**: set it up, repeat it, break it. Mark the first two `setup` / `build`.
- **Callbacks**: a setup in episode 1 can pay off in episode 5; put the setup on the cut
  (`gag: setup`) so the payoff can point at it.
- **Silence is a sound**: a `silence` music cue or a pause in the ambience before the punchline.
- **Model limits**: a pratfall, a spit take, a double-take, a jaw drop, a freeze are common
  actions and render well; a precise timed collision (a pie hitting a moving face) does not —
  show the before and the after.

## 2. `slapstick` — 无厘头喜剧

Big, fast, physical, exaggerated. Faces stretched, bodies flung, logic abandoned.

- **Rhythm**: short cuts (2–3 s); laugh room `hold` = 2 s.
- **Camera**: the **crash zoom** (`Zoom In`) onto a stunned face is the signature; whip pans
  (`Pan Left` / `Pan Right`) between two people; a freeze-frame on the peak of the gag;
  `Shake Slightly` on a crash.
- **Sound**: cartoon sfx on every beat (boing, whoosh, record scratch), a comic sting after the
  punchline, sudden silence.
- **Set pieces**: the double-take; the pratfall on the prop planted in the setup; the
  over-the-top 反应 (fainting, spitting tea); the absurd escalation of a small lie.
- **Example `motion.action`**: `he spits the tea across the table`; `she freezes with the
  chopsticks halfway to her mouth`.

## 3. `deadpan` — 冷面处境喜剧

Dry, still, awkward. The frame does the joke: symmetrical static shots held a beat too long,
characters with straight faces in an absurd situation.

- **Rhythm**: long cuts (3–5 s); laugh room `hold` = 3 s — the silence after is the joke.
- **Camera**: locked-off (`Static Shot`) wides and mediums, centred and symmetrical; people
  arranged in a row facing the camera; no zooms, no shake.
- **Sound**: no comic sfx, often no music; the ambience (a clock, a fly, a fridge hum) fills the
  awkward pause.
- **Set pieces**: the awkward silence after the wrong thing is said; the straight-faced
  explanation of something absurd; the slow turn of every head in the row; the cut to the one
  person who has not moved.
- **Example `motion.action`**: `all four turn their heads toward him at the same time`; `he sets
  the cup down very slowly`.

## 4. `romcom` — 甜宠喜剧

Cute, flustered, embarrassed. The joke is on the lovers: the misunderstanding, the accidental
closeness, the blush.

- **Rhythm**: 2–4 s; laugh room `hold` = 2 s.
- **Camera**: close-up reactions (the blush, the double-take, the eyes going wide) are the
  signature; a `Push In` on the embarrassed face; the two-shot of the misunderstanding with both
  faces readable. Pairs with the `sweet-romance` look.
- **Sound**: playful pops and plinks, a heartbeat, a cute sting; the OST can enter on the blush.
- **Set pieces**: the overheard sentence taken the wrong way; the accidental fall into each
  other's arms (then the scramble apart); the text sent to the wrong person; the jealous
  friend's exaggerated reaction; the third wheel.
- **Example `motion.action`**: `her face goes red and she hides behind the menu`; `he does a
  double-take between the phone and her` (one action).

## 5. With the other axes

| combination | how it plays |
| --- | --- |
| `costume-idol` / `costume-dark` (古装喜剧) | court etiquette as the straight line the joke breaks; `deadpan` suits a court, `slapstick` a tavern |
| `period-nostalgia` (年代喜剧) | `deadpan` with the era's objects as props; the static tableau is already an old photograph |
| `sweet-romance` | `romcom` |
| with `action` (`hk-kungfu`) | the comic fight: the setup is the prop, the punchline the hit that goes wrong, the reaction the shaken hand |
| with `faceslap` | the villain's comeuppance played to farce |

## 6. Review questions

- Where is the setup, and does the audience see it?
- Whose face takes the joke, and for how long?
- Is the face lit on the punchline?
- Is the camera doing the style — crash zoom, locked-off symmetry, or the close-up blush?
