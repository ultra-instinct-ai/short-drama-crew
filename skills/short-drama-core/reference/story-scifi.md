# Story genre `scifi` — 科幻

末世 / 末世重生囤货 · 时间循环 · 穿越时空 · AI 觉醒 · 克隆 · 赛博朋克 · 星际. This is the **story** side; the
look is `scifi-hard` / `scifi-soft` (`cinematography-scifi-*.md`). Shared machinery: `story.md`.

## 1. The promise — one "what if", followed all the way

- **The novum as a contract**: change one element and work out what follows — the 核心设定 and its
  衍生设定 across technology, society and people (Suvin's novum, "cognitive estrangement": the
  impossible reported as plain fact).
- **Four emotions sell**: wonder (奇观 — and AI makes a rocket cost the same as a cup), dread of the
  future (Black Mirror: technology amplifies a human flaw — "a human problem, not a technological
  one"), the 爽 of foreknowledge (末世重生囤货: reborn before the disaster, sell the house, build the
  fortress, stock up, the 空间 cheat, refuse the relatives who betrayed you), and mastery through
  repetition (the time loop as a game level replayed until beaten — 《开端》).
- **The market**: 男频 live action fell a third from its 2024 peak while **末世 漫剧 topped the Douyin
  charts**; 三幻 (sci-fi, fantasy, supernatural) lead AI drama because effects are cheap; overseas
  apps run apocalypse-vault and time-travel lines.

## 2. The series

- **Wells' law**: one impossible assumption, developed with the strictest logic — "a rigid exclusion
  of other marvels". **Sanderson's first law**: resolving a conflict with a power satisfies in
  proportion to how well the audience understands it; **the second**: limits and costs are more
  interesting than powers.
- **The arc**: the novum (or its consequence) in E1 — the 末世 pattern opens on a past-life death or
  betrayal, the rebirth, and **an explicit countdown** ("the cold wave in 30 days"); two or three rules
  through action → **escalation** of scope (personal → building → city → world; heat → cold → quake →
  fog), each tier adding or testing one rule → **the midpoint turn** (the countdown hits zero, or a rule
  proves incomplete — the loop has a second trigger, the AI a hidden directive, someone else was
  reborn too; in 《开端》 sleeping triggers the loop as well as dying) → **the climax** resolved through a
  rule the audience knows; a loop breaks because the character changed (Edge of Tomorrow breaks by
  sacrifice).
- **Hard vs soft**: 硬科幻 makes the idea the subject; 软科幻 uses it for plot and emotion. 短剧 is almost
  always soft sci-fi with one hard-feeling rule.

**Tracked in the outline** (gate `story-scifi`): `outline.brief.novum: { statement, category (末世 /
时间循环 / 穿越 / AI / 赛博 / 星际 / 克隆 / 其他), mode, firstEp }`, `outline.worldRules[]: { id, rule, kind:
power / limit / cost / trigger / exception, shownEp, decidesEps[], brokenEp?, revealSetupEp? }`,
`outline.countdown: { label, zeroEp, log: [{ ep, value }] }`, `outline.loops[]: { n, ep, trigger,
newInfo, changed }`, `outline.foreknowledge[]: { event, plantedEp, payoffEp, deviated }`,
`outline.secondaryNovums[]: { id, derivesFrom }`.

| rule | default | why |
| --- | --- | --- |
| `novum-first` | the novum stated, on screen in E1 | the genre promise lands in the hook |
| `one-novum` | at most one marvel that does not derive from the novum (rebirth + system is one package) | Wells' law |
| `rule-costs` | at least one limit or cost rule per power rule | Sanderson's second law |
| `show-before-use` | a rule is shown before it decides a turn; a climax-deciding rule ≥ 3 episodes before the climax; a rule bends only as a set-up exception | Sanderson's first law; no contradictions |
| `countdown` | a 末世 drama runs on one; it only counts down; on screen in ≥ 60 % of the episodes before the climax | the spine and the free cliffhanger |
| `loops` | every loop brings new information, skill or cost; never two in a row where the hero changes nothing | repetition without new context is monotony |
| `foreknowledge` | paid off within 10 episodes of being planted | the 爽 of knowing |
| `midpoint-turn` | at 40–60 %: the countdown reaches zero or an exception / trigger rule appears, on a 反转 / 危机 hook | the rule proves incomplete |

## 3. The episode

- **Hooks from the novum**: 危机 (the countdown, the disaster through a window), 道具 (the system
  panel, the 空间 glow, a device), 结果 (a future outcome — "in the last life she died here"), 反转 (a
  rule exception).
- **The countdown on screen** (a HUD number) gives a free cliff every episode and cheap continuity.
  State the rules early and repeat them.
- **Loop episodes**: show the reset fast (a 3–5 s repeated motif), spend the rest on what is
  different.
- **One piece of foreknowledge pays off per episode** ("last life X happened, so this time…") — it
  fills the 智商碾压 and 打脸 slots. Add a butterfly-effect deviation by the midpoint so foreknowledge
  can go wrong.

## 4. Characters

- **The ordinary person facing the novum** carries it (郭帆's tests: does it relate to "me"? a strong
  everyday metaphor? a character with emotion?). The Chinese sci-fi emotional core is family.
- **The 三体 lesson**: keep one idea intact and simplify everything else.
- **The expert** shows a rule working, paired with a skeptic so explanation comes out as argument.
- **The AI character**: one explicit directive and one limit; its awakening a choice that breaks or
  reinterprets the directive, set up earlier.
- **末世 antagonists**: the past-life betrayer, the neighbours who 道德绑架, the scavengers — the novum
  makes human greed visible.

## 5. Premises and freshness

末世重生囤货 (fresh now through an odd angle — running an apocalypse business with zombie employees,
raising a child, a cozy or comic tone); 时间循环 (fixed-start, death-triggered, self-consistent);
穿越 (mostly modern skills in the past — respect history); AI 觉醒 / 克隆 / 意识上传 (identity drama that pairs
with 身份揭露 — ration "it was all a simulation" to once); 外星入侵 / 星际 (one location per arc);
规则怪谈 (a model for the rules ledger).

## 6. Exposition

Need-to-know, when it matters to the point-of-view character; images carry it; no "as you know".
**Rule through consequence**: someone tests the rule, a visible cost, then one line names it —
from a panicking character, not a narrator; or the rule on screen as text (a panel, a warning sign, a
HUD). **One new rule a scene**, one or two an episode. Don't explain *why* the loop happens if its
rules are clear (《开端》 never does). `story-advice` flags lecture lines (众所周知 / 你知道的 / 原理是).

## 7. What fails, and regulation

A climax solved by a rule never shown; stacked marvels; a contradicted rule; spectacle without a
personal stake; loops without new information; foreknowledge that never goes wrong; "science" that
dates; copy-paste 末世. **Regulation**: the 2026 micro-drama measures ban rendering violence and terror
(zombie gore, scavenger violence), false information (no invented "facts" about real diseases or
disasters), superstition (keep the novum science), harm to minors, and historical nihilism (no real
countries as invaders, no mocking real historical figures in 穿越). The 2025 "微短剧+" plan encourages
科普 dramas; the 2020 科幻十条 signals goodwill. Keep 末世 hopeful and cooperative by the end.

## 8. Sources (read as search summaries)

SFE on Wells' law; Strange Horizons on Suvin; Brandon Sanderson's laws; 中国作家网 on 设定 and 硬/软科幻, and on
《开端》; 澎湃 on 《开端》; Overthinking It and Dazed on Black Mirror; Uncanny and Arc Studio on exposition;
time-loop craft (Prose and Quans, PremiumBeat, 百度 TA说); 界面 (郭帆) and 观察者 (《流浪地球3》); 中新网 and 界面
on 三体 adaptations; 豆瓣, 腾讯 and 网易 on 末世囤货; 电影界 on the 抖音 漫剧 chart; 第一财经 and TVtalk on AI drama;
澎湃 on 红果 2025; 百度百科 (《觉醒》); 维基 on 规则怪谈; DramaBox; 国家电影局 and 界面 on 科幻十条; 新华网 and 南方网 on
the 2026 measures; 新华网 on tiered review; 澎湃 on 微短剧+; 中新网 on the 2011 time-travel restrictions.
