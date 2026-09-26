# Action — how fights are cut (`params.action`)

An action style says **how a fight is broken into shots**: rhythm, coverage, camera, speed,
signature shots, sound. It is separate from the cinematography preset (the light, see
`cinematography.md`) and the render style (`params.style`), so the three combine: a
`costume-dark` 古装 with `historical-realist` fights, a `low-key` city thriller with `gun-fu`.

It applies only to **fight segments**: set `"grammar": "action"` on a storyboard segment that is
a fight, chase or power battle (or `["action", "comedy"]` for a comic fight — see `grammar.md`).
Talk segments keep the ordinary storyboard rules. The old `action: true` still works.

| style | 中文 | for | the fight in one line | natural look | guide |
| --- | --- | --- | --- | --- | --- |
| `gun-fu` | 近身枪斗 | 杀手、特工、黑帮枪战 | close-quarters gunplay fused with grappling, long takes, full bodies, no wasted motion | `low-key` | `action-gun-fu.md` |
| `hk-kungfu` | 港式功夫 | 功夫、动作喜剧、警匪 | crisp full-body exchanges, anything to hand is a weapon, speed-ramped hits, comedy between blows | `none` / `low-key` | `action-hk-kungfu.md` |
| `wuxia-fantasy` | 仙侠武侠 | 仙侠、玄幻、武侠 | wire-work flight, flowing silk, sword light and qi, slow motion and freeze poses | `costume-idol` | `action-wuxia-fantasy.md` |
| `historical-realist` | 写实冷兵器 | 古装权谋、战争、写实武侠 | heavy blades, mud and exhaustion, few blows, each one final | `costume-dark` | `action-historical-realist.md` |
| `bullet-time` | 子弹时间 | 科幻、超现实动作 | time freezes mid-move, the camera orbits, bullets trace trails, then snap to speed | `low-key` | `action-bullet-time.md` |
| `superhero` | 超级英雄 | 超能力、英雄 | power reveals, low-angle hero framing, landings, spectacle | `none` | `action-superhero.md` |
| `street-brawl` | 写实街头格斗 | 黑帮、复仇、犯罪 | raw handheld close-quarters fighting in cramped spaces | `low-key` | `action-street-brawl.md` |
| `car-chase` | 飞车追逐 | 犯罪、特工、复仇 | low tracking alongside, the driver inside vs the cars outside, near misses, a crash | `none` / `low-key` | `action-car-chase.md` |

**Choosing.** `init` sets `params.action` only when the genre names a style outright (功夫, 枪战,
杀手, 冷兵器, 超级英雄, 飞车, 街头格斗, 仙侠 + 动作…); otherwise it stays `none`. When the story has
fights and the style is `none`, **ask the user** which one, with the table above. One style per
drama; a drama with both a sword fight and a car chase picks the dominant one, and the other
segments may deviate through the exceptions below.

## 1. The shared craft — breaking a fight into moves (拆招)

A video model cannot perform continuous choreography. It performs **one clear, big, common move**
well: a punch, a kick, a shot, a throw, a leap, a swerve. Everything in the action styles is built
on that:

1. **One cut, one move.** Wind-up → contact → result, one blow per cut (`motion.action` with one
   fight verb, gated). A three-move combo is three cuts. The drama of a fight lives in the rhythm
   of the cuts, not in a single shot's choreography.
2. **The fight sequence** — the unit every style varies:
   | beat | cut | purpose |
   | --- | --- | --- |
   | geography | wide / extreme-wide: who is where, the exits, the weapons to hand | `establish` |
   | the exchange | medium / close: one move per cut, alternating attacker | `performance` / `pressure` |
   | the impact | insert or close: the blow lands (`move.impact: true`) | `performance` / `consequence` |
   | the answer | the receiver's reaction or the consequence (flies back, falls, drops the gun) | `reaction` / `consequence` |
   | the reset | back to the wide: the new geography after the blow | `establish` / `transition` |
3. **Show the result, not the contact.** Models draw results (a body flying back, a table
   breaking, glass shattering, a gun skidding away) better than the exact moment of contact. Put
   the landing in `motion.result`.
4. **Sound sells the hit.** Every impact gets an sfx on its cut (`sound.sfx`), and the music cue
   plan (`sound.music`) drops out before the decisive blow.

## 2. Fields

| field | where | what |
| --- | --- | --- |
| `grammar: "action"` | segment | this segment is a fight / chase / power battle; the action gates apply |
| `move: { kind, impact }` | cut | `kind` ∈ `strike kick shot slash stab block dodge throw grapple fall leap draw reload power stance chase swerve crash none`; `impact: true` when the move lands on a body or an object |
| `exceptions: [{ rule, reason }]` | segment | waive a hard rule for this segment **only when the user asks**; `reason` records the request |
| `params.action` | project | the style (table above) |
| `params.violence` | project | `blood` (default: blood and wounds may show) or `implied` (impact through reaction and sound only) |

## 3. The gates

| rule | what | hard? |
| --- | --- | --- |
| `open-wide` | the first fight segment of a scene opens on a `wide` / `extreme-wide`; later fight segments in the scene contain at least one | hard, waivable |
| `one-move` | `motion.action` has at most one fight verb (punches, kicks, shoots, slashes, blocks, throws, swerves… / 出拳, 踢, 开枪, 劈, 格挡…) and no chaining ("then", "接着", "连环") | hard, waivable |
| `impact-reaction` | a cut with `move.impact` is followed by a `reaction` or `consequence` cut, unless it is itself a `consequence` (the result shown in the same shot) | hard, waivable |
| `no-graphic` | no dismemberment, decapitation, severed limbs or organs — providers refuse them even with blood allowed | hard, waivable (the provider may still refuse) |
| blood | with `params.violence: implied`, no blood or wounds in frames or prompts | hard |
| style phrase | a fight segment's prompt carries the style's phrase (an `Action:` line, `动作：` for `wan`); `prompt segment` writes it | hard |
| no IP names | no film, franchise, character or performer names (John Wick, Matrix, Marvel, 李小龙, 成龙…) in any prompt or frame — every segment, not only fights | hard |
| rhythm | a fight segment's cuts average the style's length (`action-advice`) | advisory |
| signature shots | the episode's fight segments contain the style's signature shots (an Arc Shot for `bullet-time`, handheld for `street-brawl`…) | advisory |

**Exceptions.** When the user asks for something a hard rule forbids ("open on the fist, no
wide", "one continuous combo in one shot"), add
`"exceptions": [{ "rule": "open-wide", "reason": "user: open on the fist" }]` to that
segment. Never add one on your own to turn a gate green. A waived `one-move` is a known risk:
tell the user the model may garble the combo, and check the clip.

## 4. Blood

`params.violence: blood` (the default) lets frames and prompts show blood: a split lip, a spray
on a wall, a stained blade, a wound on a sleeve. Keep it **specific and small** ("a thin line of
blood at the corner of his mouth") rather than vague and lurid; providers judge by wording. Never
dismemberment, decapitation or organs (gated). `implied` is for platforms or audiences that allow
none: the reaction, the sound, the dropped weapon and the aftermath carry it.

## 5. What each guide contains

Rhythm and cut lengths · shot sizes and camera · speed (slow motion, ramps) · the signature
sequences written as shot lists · staging and props · sound · the look it pairs with · example
`motion` lines (one move each) · review questions.
