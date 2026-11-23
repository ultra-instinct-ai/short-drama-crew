# Grammar `horror` — 恐怖

Horror is cut by **rhythm, not coverage**: long holds the viewer searches, a build that takes
things away, a false alarm, relief, then one short scare from where nobody was looking, and the
silence after. The light is the `horror` look (`cinematography-horror.md`); this guide is how a
segment is cut and what is gated. Combinations and exceptions: `grammar.md`.

Use it on a segment with `"grammar": "horror"`. In a horror drama `init` makes it the default
(`params.grammar: horror`), so a straight scene sets `grammar: drama` on itself and a fight sets
`["horror", "action"]` with `params.action: horror-struggle`.

## 1. The fields

| field | on | meaning |
| --- | --- | --- |
| `cut.scare` | the cut a scare lands on | `false-alarm` (the pan to empty, the cat) · `scare` (the hit) · `reveal` (the threat suddenly present) |
| `cut.threat` | a cut where the threat is present or implied | its rung on the reveal ladder: `sound` · `trace` · `shape` · `part` · `full` |
| `segment.panic` | the run right after a scare | `true` lets it cut fast (the panic); dread segments may not |
| `outline.horror.threat.character` | optional, the character id of the threat | every cut that puts that character in frame must say its rung: `shape`, `part` or `full` |
| `outline.horror.threat.revealEp` | the episode of the full reveal | no `full` rung before it |
| `outline.horror.threat.glimpseEps` | episodes with a glimpse | a glimpse in an earlier episode counts as the lower rung |

**The reveal ladder.** Sound only (scraping, a breath off screen) → trace (wet footprints, hair on
the floor, the box moved one inch) → shape (a silhouette, a shadow on the wall, a figure out of
focus at the end of the hall) → part (a hand around a door frame, eyes in the dark) → **full —
once**: brief, close, badly lit, then cut away. A `sound` or `trace` cut keeps the threat out of
`characters`; the model puts on screen everyone a shot names.

**The threat kind** (`outline.horror.threat.kind`): `single` (the default — one presence, held
back) or `horde` (zombies, the infected, a swarm). A horde climbs the ladder up to the outbreak —
its first full sighting, or `revealEp` — and after that it is simply there: full cuts as often and
as long as the story needs. `story-horror`'s hide-the-monster rule does not apply to a horde (the
outbreak is the premise; the dread is who is bitten next).

## 1a. Horror styles — `params.horrorStyle`

| style | for | scares | false alarms | the full threat |
| --- | --- | --- | --- | --- |
| `dread` (default) | 灵异, J-horror, 心理恐怖, 规则怪谈 — slow-burn | about one per 20 s | ≤ 1 per real scare | once per episode, ≤ 3 s, in the last third (or from `revealEp`) |
| `jump` | 惊吓, 鬼屋, 密室, the haunted-house jump-scare film, short vertical horror | about one per 12 s | ≤ 2 per real scare — the fake-out, the relief, then the real hit | may flash in full **on a scare / reveal cut**, ≤ 2 s, gone as fast; never in a quiet cut |

`init` reads `jump` from 惊吓 / 吓人 / jump scare / 鬼屋 / 密室, else `dread`; `--horror-style`
overrides. **Both keep the hold of ≥ 4 s before the scare and the still camera on it** — a jump
scare without the build is the cheap one. `jump` adds to the Horror line: `sudden hard scares after
quiet, the threat appearing without warning in a flash of light or between cuts, gone as fast`.

Jump craft: the double tap (a false alarm, the relief, then the real scare from the other side of
the frame); the hit on a mundane beat (closing the mirror cabinet, turning off the tap); the silence
before it and one loud stinger on it (post); never two real scares in a row without a quiet between.

## 2. Gated (`horror`, waivable per segment when the user asks)

| rule | what |
| --- | --- |
| `horror-hold` | every `scare` / `reveal` cut has a cut of **4 s or more** before it in the same segment — the scare is generated with the quiet before it |
| `still-reveal` | the camera on a `scare` / `reveal` cut is `Static Shot`, the jolt (`Shake Slightly` / `Shake Strongly`) or a held `POV` — a move into a reveal tells the viewer it is coming |
| `dread-pace` | a horror segment that is not a fight and not `panic` averages **4 s a cut or more** (≤ 1 cut per 4 s, ≤ 7 in 30 s) — fast cutting releases tension |
| `scare-ration` | about **one real scare per 20 s** of the episode (`scare` + `reveal`; `jump`: per 12 s), and no more false alarms than real scares (`jump`: two per real scare) |
| `reveal-ladder` | the `full` rung: not before `revealEp`, else in the episode's last third (`dread`); a lower rung before it (this episode, or a `glimpseEps` episode before); **≤ 3 s** (`jump`: ≤ 2 s and only on a scare cut); once per episode (`dread`). A horde is free after its outbreak |

Values are checked everywhere (`scare` and `threat` must be in the lists); the threat character in
frame needs a rung. A horror segment's cuts may hold **up to 10 s** (gate `timing`), past
`params.maxCutSeconds`.

**The prompt line** (gate `grammar`, written by `prompt segment`):
`Horror: a slow-burn horror build, long uneasy holds in which almost nothing moves, the threat
kept unseen, in shadow or out of focus, near silence before anything happens.`
(wan: `恐怖：慢热的恐怖铺垫，长时间不安的停留，……`).

**Advisory** (`horror-advice`): an episode whose outline `scares` promise 惊吓 / 揭示 / 规则惩罚
with no `scare` / `reveal` cut; handheld drift (`Shake Slightly`) on a dread cut outside DV;
a `Tracking Shot` alongside the hero; a horror frame that never names its darkness; art-first
symmetry in a horror look; a segment prompt over 4,000 characters.

## 3. The scare cycle in segments

```
quiet (hold) → build (push / sound drops / focus narrows) → false alarm → relief
            → second build → real scare → aftermath (silence, a reaction, the space again)
```

| beat | cut length | camera | sound |
| --- | --- | --- | --- |
| quiet / dread | 4–10 s | `Static Shot`, or a slow drift | room tone, a low drone, one small diegetic sound |
| build | 4–8 s | slow `Push In` that ends *before* the reveal | the sound thins, breath |
| false alarm | 2–3 s | `Pan Left` / `Pan Right` to empty | a small sharp sound, then nothing |
| relief | 2–4 s | static | room tone returns |
| **real scare** | **2 s** | still, the jolt, or the threat suddenly present in a still frame | silence just before; the stinger is post |
| aftermath | 2–5 s | static, the empty space again | ringing silence |

A 15 s segment carries three to five cuts; a 30 s segment five to seven. Generate the scare in its
own short segment (4–6 s: a 4 s hold, a 2 s hit) when it must be retimed in the edit.

Example — a 12 s segment, `grammar: horror`:

| cut | s | size / camera | scare / threat | frame (abridged) |
| --- | --- | --- | --- | --- |
| 1 | 6 | wide · Static Shot | `threat: sound` | she is on the left third, the black corridor fills the right two-thirds; near silence, only the hum of the tube |
| 2 | 4 | close · Push In | — | her face, lit from below by the phone, the push ends as she stops breathing |
| 3 | 2 | medium · Shake Strongly | `scare: reveal`, `threat: shape` | the tube flickers back on: a pale shape stands behind her shoulder, out of focus |

## 4. Writing it

- **Write what is hidden.** `the end of the corridor stays black; nothing is visible there yet`.
  Never name the ghost in a cut where it should not be seen.
- **One event and one camera move per cut.**
- **Escalate by taking away:** less light, less sound, fewer cuts, until the hit.
- **Let the timing slip:** the scare a beat after the viewer expects it, or in a mundane moment.
- **Sound** is half the scare — `../../short-drama-sound/reference/bgm-sfx.md`: a drone that lowers before the hit, silence just
  before it, one stinger on it (post), ringing silence after.

## 5. Review questions

- Before this scare, is there a hold of 4 s or more where nothing happens?
- Is this a scare, or just an event? How many real scares are in this minute?
- Does the camera move into the reveal? Hold it still.
- Which rung of the ladder is this cut, and has the previous rung been seen?
- Is the full reveal once, short, late and badly lit?
