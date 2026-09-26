# Genre = axes + grammars — how a drama's look and cutting are composed

A genre like 古装喜剧 or 未来动作 is not one setting. It is a **combination**: what the world looks
like, how people talk, and how each scene is cut. The skill keeps those apart so any combination
works, and never needs a preset per genre.

## 1. The drama's axes (one value each, in `params`)

| axis | param | what it decides | values | guide |
| --- | --- | --- | --- | --- |
| render | `style` | how the picture is drawn | `photoreal` · `realistic` · `ghibli` · `soft3d` · `disney3d` | stage-characters |
| look | `cinematography` | light, colour, the world | `low-key` · `sweet-romance` · `period-nostalgia` · `costume-idol` · `costume-dark` · `scifi-hard` · `scifi-soft` · `none` | `cinematography.md` |
| framing | `composition` | what the frame is built for, in any genre (a segment may override it) | `standard` · `art-first` (艺术优先: negative space, symmetry, monumental scale) | `composition-art-first.md` |
| lines | `register` | how dialogue is written and spoken | `粤语` · `大陆普通话` · `台湾国语` · `港式普通话` · `古装` · `年代` · `英文美式` · `英文英式` | dialogue-craft |
| fights | `action` | how a fight is cut | `gun-fu` · `hk-kungfu` · `wuxia-fantasy` · `historical-realist` · `bullet-time` · `superhero` · `street-brawl` · `car-chase` · `none` | `action.md` |
| laughs | `comedy` | how a gag is cut | `slapstick` · `deadpan` · `romcom` · `none` | `grammar-comedy.md` |
| default cutting | `grammar` | the grammar of a segment that does not name its own | `drama` · `action` · `faceslap` · `comedy` | this file |

## 2. The segment's grammar (per storyboard segment)

Each segment is cut in one or more grammars: `segment.grammar` (a string or an array), else
`params.grammar`.

| grammar | for | adds | guide |
| --- | --- | --- | --- |
| `drama` | ordinary scenes | nothing beyond the base storyboard rules | — |
| `action` | fights, chases, power battles | open wide, one move per cut, a reaction after every impact, in `params.action`'s style | `action.md` |
| `faceslap` | the 打脸 payoff: 身份揭露, 智商碾压, 复仇 reversals | the proof on screen, a cascade of ≥ 2 reactions | `grammar-faceslap.md` |
| `comedy` | gags | a setup before every punchline, laugh room after it, in `params.comedy`'s style | `grammar-comedy.md` |

**Grammars combine.** `"grammar": ["action", "comedy"]` is a comic fight (a 港式功夫喜剧 brawl):
every hard rule of both applies, and the prompt carries both lines. `["faceslap", "comedy"]` is a
comic 打脸 (the villain's jaw literally drops). `["action", "faceslap"]` is the fight in which the
underdog wins and the room turns.

**The prompt says how it is cut.** `prompt segment` writes one labelled line per grammar,
gated verbatim: `Action: …`, `Payoff: …`, `Comedy: …` (for `wan`: `动作：`, `爽点：`, `喜剧：`).

## 3. Recipes — common 短剧 genres as combinations

`init` reads every axis from `--genre` on its own (the look, the action style, the default
grammar and the comedy style), so `--genre 古装喜剧` already composes the first row. Confirm the
result with the user and override any axis with its flag; a value in *italics* below is one
`init` does not pick from the genre alone, so pass it.

| genre | look | register | default grammar | action | comedy | 打脸 |
| --- | --- | --- | --- | --- | --- | --- |
| 古装喜剧 | `costume-idol` (or `costume-dark` for a dry court comedy) | 古装 | `comedy` | — | `slapstick` / `deadpan` | on the 爽点 |
| 未来动作 / 科幻动作 | `scifi-soft` (or *`scifi-hard`*) | any | `drama` | `bullet-time` (or *`superhero`*) | — | — |
| 硬科幻 | `scifi-hard` | any | `drama` | — | — | — |
| 赛博朋克 | `scifi-soft` | any | `drama` | *`gun-fu` / `street-brawl`* | — | — |
| 艺术古装 / 文艺科幻 / any 艺术 genre | the genre's look | any | the genre's | — | — | — · plus `composition: art-first` |
| 霸总甜宠 | `sweet-romance` | 大陆普通话 | `drama` | — | `romcom` for the gags | on the 爽点 |
| 战神 / 赘婿 / 逆袭 | `low-key` or `none` | any | `drama` | *`street-brawl` / `gun-fu`* | — | **every 爽点** |
| 港式功夫喜剧 | *`none`* | 粤语 | `comedy` | `hk-kungfu` | `slapstick` | — |
| 仙侠 | `costume-idol` | 古装 | `drama` | `wuxia-fantasy` | — | — |
| 宫斗 / 权谋 | `costume-dark` | 古装 | `drama` | `historical-realist` if it fights | — | **every 爽点** |
| 年代喜剧 | `period-nostalgia` | 年代 | `comedy` | — | *`deadpan`* | — |
| 甜宠喜剧 | `sweet-romance` | any | `comedy` | — | `romcom` | — |
| 都市悬疑 | `low-key` | any | `drama` | — | — | — |

`init` also reads `composition: art-first` when the genre says 艺术 / 文艺 / arthouse; for any other
genre, pass `--composition art-first` when the user asks for art-first framing.

How to read a mixed genre:
- **The look is the world**, and there is one. A comedy set in a palace is `costume-*`, not a
  "comedy look".
- **The default grammar is what most scenes are.** In a comedy, most segments are comedy, and the
  straight scene sets `grammar: drama` on itself. In a drama with a few jokes, the default is
  `drama` and the gag segments set `comedy`.
- **Fights, 打脸 and gags are segments.** Mark them where they happen, not on the whole drama.
- **The 爽点 of a 打脸-type episode is a `faceslap` segment.** When the outline's
  `satisfaction.type` is 打脸 / 身份揭露 / 智商碾压 / 复仇, the advisory `grammar-advice` names the
  segment carrying the `satisfactionBeat` if it is not cut as one.

## 4. Exceptions

Every hard grammar rule can be waived for one segment when **the user asks for it**:
`"exceptions": [{ "rule": "<rule>", "reason": "user: <what they asked>" }]`. The rules:
`open-wide` · `one-move` · `impact-reaction` · `no-graphic` (action), `reveal-insert` ·
`reaction-chain` (faceslap), `punchline-reaction` · `setup-first` (comedy), `composition-device` ·
`signature-share` · `art-wide` (art-first). Never add an exception
yourself to turn a gate green. The old `actionExceptions` key and `action: true` still work.

## 5. Gates

| gate | checks |
| --- | --- |
| `grammar` | grammars are known; `params.action` / `params.comedy` are chosen when a segment uses them; exceptions name a rule and carry a reason; `gag` values; each grammar's line in the prompt |
| `action` | the fight rules (`action.md`) |
| `faceslap` | the proof on screen; ≥ 2 reactions after it (this segment and the next one in the scene) |
| `comedy` | a setup before every punchline (in the scene); laugh room after it |
| `action-advice` · `grammar-advice` | rhythm, signature shots, 打脸 craft, comedy craft, the 爽点 link (advisory) |
| `composition` | art-first: every cut's devices named and in the frame, ≥ 50 % negative space / symmetry / monumental scale, a wide per segment |
| `no-ip-names` | no film, franchise or performer names anywhere |

## 6. Adding a grammar or a style

A new **style of an existing grammar** (a fourth comedy style, a ninth action style) is an entry
in `COMEDY_STYLES` / `ACTION_STYLES` with its phrases, rhythm and signature shots, plus a section
in its guide. A new **grammar** (suspense, horror, melodrama…) is a name in `GRAMMARS`, its hard
rules in a gate, its advisory craft in `grammar-advice`, a line in `grammarLines`, and a guide
`grammar-<name>.md` in the same shape as the two here.
