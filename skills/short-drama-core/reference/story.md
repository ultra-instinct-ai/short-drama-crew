# Story genres — how the story is written (`params.story`)

The storyboard axes (look, action, comedy, grammar, composition) decide how a drama is **shot**.
The story genres decide how it is **written**: which promise the audience is paying for, how the
series is paced to keep it, which characters it needs, and what the outline has to track so the
promise is kept. They sit on top of the universal 短剧 method (`../../short-drama-outline/reference/craft-story.md`: the six
judgements, three phases, the 15-second hook and the 30-second turns, 谈话+行动), which still
applies to every genre.

| genre | 中文 | the promise | tracked in | guide |
| --- | --- | --- | --- | --- |
| `revenge` | 复仇 / 逆袭 (战神, 赘婿, 重生, 真假千金) | the certain payback: 憋屈 → 小爽 → 更憋屈 → 大爽, up a ladder of antagonists | `outline.paybacks[]`, `characters[].antagonist` | `story-revenge.md` |
| `sweet` | 甜宠 (霸总, 先婚后爱, 契约婚姻) | being seen and chosen: 高糖低虐, sugar in most episodes, milestones on time, a happy ending | `outline.romance[]` | `story-sweet.md` |
| `mystery` | 悬疑 (推理, 刑侦, 悬疑复仇, 惊悚) | curiosity, dread and the click: a question asked early, answered late, from clues shown fairly | `outline.questions[]`, `outline.clues[]`, `characters[].mysteryRole` | `story-mystery.md` |
| `comedy` | 喜剧 (沙雕, 无厘头, 甜宠喜剧, 古装喜剧) | the laugh as the texture of the story: a comic premise, comic flaws, gags set up and paid off | `outline.brief.comicPremise`, `outline.runningGags[]`, `characters[].comic`, script `gag` | `story-comedy.md` |
| `angst` | 虐恋 / 追妻火葬场 (替身, 白月光, 带球跑) | delayed justice in love: 虐 ≤ 30 %, 悔 ≈ 40 %, 追 ≈ 30 %, his regret outweighing her pain | `outline.angst`, `brief.redLines` | `story-angst.md` |
| `family` | 家庭伦理 (婆媳, 豪门恩怨, 萌宝, 认亲, 年代家庭) | being needed and loved: a family web that reorganises, tears on a beat, the wronged one vindicated before everyone | `characters[].family`, `outline.secrets[]`, `outline.vindications[]`, `outline.reconciliations[]` | `story-family.md` |
| `palace` | 宫斗 / 权谋 (宅斗, 夺嫡, 女帝) | winning with the mind: schemes planted long before, a rank ladder with a low point, factions that realign | `outline.rankLadder`, `rankEvents[]`, `schemes[]`, `factions[]`, `allegiance[]` | `story-palace.md` |
| `cultivation` | 玄幻 / 修仙 / 系统 (都市异能, 废柴逆袭) | visible growth: a 金手指 with costs, a realm ladder climbed one step at a time | `outline.powerSystem`, `goldenFinger`, `startPower`, `upgrades[]`, `fights[]` | `story-cultivation.md` |
| `scifi` | 科幻 (末世囤货, 时间循环, 穿越, AI) | one "what if" followed all the way: a novum, rules with costs, a countdown, loops that learn | `outline.brief.novum`, `worldRules[]`, `countdown`, `loops[]`, `foreknowledge[]` | `story-scifi.md` |
| `horror` | 恐怖 / 灵异 / 惊悚 (规则怪谈, 民俗) | safe fear: the threat felt early and shown late, rules shown before they kill, a rational close on the mainland | `outline.horror`, `horrorRules[]`, episode `scares[]` | `story-horror.md` |

**Genres combine.** `params.story` is a list. 复仇 + 甜宠 is the commonest 短剧 there is; 悬疑 +
复仇 is how suspense sells (the clue-solving delivers the 智商碾压); 甜宠 + 喜剧 is the romcom.
Every rule of every listed genre applies; where two genres compete for the same episodes (sugar vs
payback) the thresholds relax when the drama is mixed (`story-revenge` allows a longer gap
between paybacks, `story-sweet` a lower share of sugar).

**Choosing.** `init` reads the list from `--genre` (复仇 / 逆袭 / 战神 / 赘婿 / 重生 / 真假千金 →
`revenge`; 甜宠 / 恋爱 / 霸总 / 先婚后爱 / 契约婚 → `sweet`; 悬疑 / 推理 / 刑侦 / 惊悚 → `mystery`;
喜剧 / 搞笑 / 沙雕 / 无厘头 → `comedy`; 虐恋 / 追妻 / 火葬场 / 替身 / 白月光 → `angst`; 家庭 / 伦理 / 婆媳 / 萌宝 / 认亲 →
`family`; 宫斗 / 宅斗 / 权谋 / 夺嫡 → `palace`; 修仙 / 玄幻 / 系统 / 异能 / 神医 → `cultivation`; 科幻 / 末世 / 时间循环 /
赛博 / 星际 / 囤货 → `scifi`; 恐怖 / 灵异 / 惊悚 / 怪谈 / 民俗 → `horror`), or `--story revenge,sweet`. Confirm it
with the user at the parameters question — it decides what the outline has to contain.

**The market** (`params.market`: `mainland`, the default, or `overseas`) decides what the
supernatural may be: on the mainland a horror threat is explained rationally in the end and the
cultivation / horror compliance notes apply; overseas the supernatural may be real. Ask where the
drama will be released.

## When the ledgers are written

All in stage 1 (outline), with the 分集目录, before sign-off:

| genre | outline | characters (stage 1 block) | script (stage 4) |
| --- | --- | --- | --- |
| revenge | `paybacks[]: { ep, target, scale: small / big / final, by, how }` | `antagonist: { tier 1–3, firstPressEp, motive }` | — |
| sweet | `romance[]: { ep, milestone, until?, note }` | — | — |
| mystery | `mysteryMode`, `questions[]: { id, layer 1–3, question, openEp, answerEp, clues[] }`, `clues[]: { id, kind: true / red-herring, what, plantEp, prop?, echoEps[], dismissedEp? }` | `mysteryRole`, `firstEp` | beat `clue: "K1"` where a clue is planted |
| comedy | `brief.comicPremise`, `runningGags[]: { id, premise, eps[] }` | `comic: { flaw, humanity, role: 逗 / 捧 / both }` | beat `gag: setup / build / punchline`, `runningGag` |
| angst | `angst: { ending, turnEp, exitEp, reconcileEp, misbelief, beats[] }`, `brief.redLines` | — | — |
| family | `secrets[]`, `vindications[]`, `reconciliations[]` | `family: { generation, role, minor?, endState }` | — |
| palace | `rankLadder`, `rankEvents[]`, `schemes[]`, `factions[]`, `allegiance[]` | — | — |
| cultivation | `powerSystem`, `goldenFinger`, `startPower`, `upgrades[]`, `fights[]` | — | — |
| scifi | `brief.novum`, `worldRules[]`, `countdown`, `loops[]`, `foreknowledge[]`, `secondaryNovums[]` | — | — |
| horror | `horror: { subgenre, threat }`, `horrorRules[]`, `episodes[].scares` | — | — |

`render outline` publishes the ledgers as tables (复仇阶梯 · 感情里程碑 · 悬念问题 · 线索账本 ·
贯穿笑点) so the user reviews them at sign-off with the 分集目录.

## Gates

| gate | stage | checks |
| --- | --- | --- |
| `story-revenge` | outline | first payback by E03; no long gap without one; the ladder (every antagonist finished once, lower tiers first, the arch-nemesis in the climax, by a lead); pressure before payback; a big payback every ≤ 10 episodes of escalation |
| `story-sweet` | outline | sugar share and gap; meet E1, bind ≤ E3, touch ≤ E5, kiss by half, confession at 40–60 %; misunderstandings ≤ 3 episodes (one may run to 5 in the climax); one black moment at 70–90 %, mended within 5; a happy ending |
| `story-mystery` | outline | one central question asked by E03 and answered in the climax; the culprit on screen early; clues per answer and their lead time; echoes for long plants; red herrings fewer than true clues and dismissed; ≤ 6 open questions |
| `story-comedy` | outline | comic premise; every lead and support has a comic flaw, leads differ, someone plays it straight; running gags recur ≥ 3 times, spaced, and pay off in the climax |
| `story-angst` | outline | the ending declared; 虐 capped at ~35 %; the turn at 25–45 %; 悔 + 追 ≥ 1.5 × 虐; every wound released within 2; an engineered misbelief the audience knows by E3; she leaves by choice; costly, public pursuit; HE reconciles late with sugar after; the male lead's red lines |
| `story-family` | outline | ≥ 5 members over 2 generations, every one resolved; tears ≥ 20 % and ≤ 6 apart; a public vindication with ≥ 3 witnesses mid-run and a larger one in the climax; secrets hinted twice and revealed at 50–85 %; reconciliation earned over ≥ 10 episodes; children never the ones who land a blow |
| `story-palace` | outline | schemes set up 2 / 5 / 20 episodes ahead, a master scheme in the first half; counters planted first, losses with a flaw; the emperor rescues at most once a phase; an antagonist win before the midpoint; the rank ladder (first by E12, rises, a low point, the top at the end); 2–4 factions, foreshadowed betrayals; moral capital |
| `story-cultivation` | outline | the 金手指 by E2 with rules and costs; breakthroughs ≤ 12 apart, one realm at a time, each with a cause and a cost; the foe's realm known, ≤ 1 up with an edge; the peak in the last 15 %; hidden masters reveal a layer every 10 |
| `story-scifi` | outline | the novum in E1; one novum; a limit or cost per power; rules shown before they decide; a countdown that only counts down; loops that learn; foreknowledge paid within 10; a midpoint turn |
| `story-horror` | outline | a real scare in ≥ 80 % of episodes; false alarms rationed; the first sign in E1; the reveal past the half with glimpses; rules shown before they kill; 规则怪谈 anatomy; on the mainland a rational explanation, late and planted |
| `story-script` | script | mystery: each clue is on screen (a beat marked `clue`) in its plant episode; comedy: punchlines per episode, a setup (or a running gag called back) before each, punchlines short |
| `story-advice` | outline | hook variety; identity layers; extra-legal violence and money-only 强宠 (regulatory risk); public sugar in the climax; suspects; twist fatigue (advisory) |

The thresholds scale with the episode count and skip what makes no sense in a very short run
(a 3-episode pilot has no midpoint). They are researched defaults, not laws. They were researched on
1–2-minute episodes; in a `medium` drama or a `movie` in parts the counts convert — by runtime for a
series, by share of the film for a movie (`format.md`).

## Exceptions

A rule can be waived for the whole drama when **the user asks for it**:
`"storyExceptions": [{ "rule": "hero-delivers", "reason": "user: the old general finishes him" }]`
in `outline`. The rules: `first-payback` `payback-gap` `payback-ledger` `setup-before-payback`
`tiers-ascending` `big-payback-cadence` `hero-delivers` (revenge) · `sweet-share` `sweet-gap`
`meet-bind` `first-touch` `first-kiss` `midpoint-confession` `misunderstanding-run`
`black-moment` `he-ending` (sweet) · `central-question` `culprit-early` `clue-count` `clue-lead`
`clue-echo` `red-herrings` `open-questions` `clue-on-screen` (mystery) · `comic-premise`
`comic-cast` `running-gags` `gag-density` `gag-setup` `punchline-brevity` (comedy) · `abuse-cap`
`turn-timing` `regret-outweighs` `pursuit-length` `release-cadence` `engineered-misbelief`
`exit-by-choice` `costly-regret` `ending-contract` `male-lead-red-lines` (angst) · `family-web`
`every-member-resolves` `tear-cadence` `public-vindication` `secret-hygiene`
`earned-reconciliation` `child-compliance` (family) · `scheme-setup` `no-teleported-evidence`
`authority-not-rescue` `competent-antagonist` `rank-climb` `faction-realignment` `moral-capital`
(palace) · `golden-finger` `upgrade-cadence` `no-level-skip` `cause-and-cost` `foe-known` `peak-held`
`hidden-master-reveals` (cultivation) · `novum-first` `one-novum` `rule-costs` `show-before-use`
`countdown` `loops` `foreknowledge` `midpoint-turn` (scifi) · `scare-cadence` `false-alarms`
`early-threat` `hide-the-monster` `fair-rules` `rule-horror` `mainland-explanation` (horror). Never
add one yourself to turn a gate green. (`mainland-explanation` and the child rule track regulation:
waive them only for a release where they do not apply, and say so.)

## With the storyboard axes

| story genre | naturally pairs with |
| --- | --- |
| revenge | `grammar: faceslap` on the payback segments (the 爽点 of a 打脸 / 身份揭露 / 智商碾压 / 复仇 episode is flagged if it is not); an action style if the paybacks fight |
| sweet | the `sweet-romance` or `costume-idol` look; the 甜宠 set pieces in `cinematography-sweet-romance.md` §6; `comedy: romcom` for the gags |
| mystery | the `low-key` look; clue inserts (`evidence` cuts); `composition: art-first` for a contemplative 悬疑 |
| angst | the `sweet-romance` look turned cold in the 虐 phase, or `low-key`; `grammar: faceslap` for the antagonist's comeuppance |
| family | the `period-nostalgia` look for 年代家庭; `grammar: faceslap` on the 寿宴 vindication; `comedy` for 《太奶奶》-style warmth |
| palace | the `costume-dark` or `costume-idol` look; `register: 古装`; `grammar: faceslap` on the reveals; `historical-realist` fights |
| cultivation | `costume-idol` (修仙) or `scifi-soft` (都市异能); `wuxia-fantasy` or `superhero` fights; a fixed visual signature per realm |
| scifi | the `scifi-hard` / `scifi-soft` look; `bullet-time` / `superhero` fights; the countdown as a HUD prop |
| horror | the `low-key` look; `composition: art-first` for dread in empty space; `mystery` alongside for the clues |
| comedy | `grammar: comedy` (the default for a comedy genre) with its `gag` cuts in the storyboard; the story's punchline beats become `gag: punchline` cuts |

## Sources

The research behind the four guides is summarised in each guide's last section. It came from
Chinese industry writing (红果 编剧课, 流媒体网, 36氪, 虎嗅, 澎湃, 界面, 知乎 craft columns, DataEye
reports, NRTA notices) and English craft sources (Gwen Hayes, Billy Mernit, Knox / Van Dine,
Hitchcock / McKee, UCB, Vorhaus, Save the Cat, vertical-drama guides). The research agents read
search-result summaries rather than full articles, so single-source numbers are marked as such
and the thresholds are tunable.
