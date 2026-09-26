# Story genre `cultivation` — 玄幻 / 修仙 / 系统流

修仙 · 玄幻 · 系统 / 金手指 · 都市异能 · 废柴逆袭 · 神医 / 鉴宝 系统. The level-up genre. Pairs with the
`costume-idol` look (修仙) or `scifi-soft` (都市异能 / 系统), and with the `wuxia-fantasy` or
`superhero` action style. Shared machinery: `story.md`.

## 1. The promise — visible growth

- **The engine is the upgrade loop**: a nobody climbs a fixed ladder, step by step. Each trope pays a
  feeling: 废柴逆袭 ("someday I'll count"), 退婚打脸 (trampled dignity repaid), 捡漏得宝 (unearned luck),
  越级杀敌 (breaking the rules).
- **扮猪吃虎 is an information-gap pleasure**: the hero knows more (time loops, texts from the future,
  the system).
- **系统 suits 短剧**: an instant-payoff 金手指 that pairs with any hot theme (荒年 + 系统 passed a billion
  plays). 男频 has turned toward quality: the grassroots hero growing up, the thrill of controlling
  power.
- **The 女频 version differs**: 满级大佬 (starts at max), 团宠, 升级流 — the biggest 女频修真 hit starts her
  as a goddess who clears villains with a wave. So the genre has a **`startPower`**: `废柴` (climbs),
  `隐藏大佬` or `满级` (hides) — and the rules change with it.
- **The market**: 红果 pushed 男频 in 2025, naming 玄幻仙侠 and 都市异能; on AI 漫剧 charts 玄幻仙侠 leads with
  废柴逆袭 + 升级打怪 + 系统面板.

## 2. The series — a realm ladder and map changes

- **The ladder**: 练气 → 筑基 → 金丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 (→ 渡劫), each with 初期 / 中期 / 后期 / 大圆满.
  Subdivide so small highs come regularly, layered with big ones — but in 短剧 **pick 5–7 realms and
  climb 3–5 on screen**.
- **换地图** is levelling up made visible (village → county → sect → capital → upper realm); each map's
  enemies, resources and ranks climb in step. The loop: beat stronger enemies → gain a skill or a
  treasure → clear the region → move on.
- **On a 60–100 episode run**: golden (E1–10) humiliation → 觉醒 / binding → first gain → first 打脸 →
  first breakthrough; 2–4 map arcs of 15–30 episodes, each with a rival and a boss realm, a major
  breakthrough ending each arc; **the peak held for the last 10–15 %**. A tangible gain every 3–5
  episodes, a major breakthrough every 12–20.
- **Against power collapse (战力崩坏)**: fixed multipliers between realms, few top-tier fighters, seals,
  political duties for the powerful, equivalent-exchange economies — and keep the story short.
  Progression-fantasy craft: power should *buy harder problems*; bottlenecks, not grinding.

**Tracked in the outline** (gate `story-cultivation`): `outline.powerSystem: { realms: [{ id, name,
visual }] }` (low → high), `outline.goldenFinger: { type, name, activationEp, rules[], costs[] }` (one
or two), `outline.startPower`, `outline.upgrades[]: { ep, char, to, cause, cost }`,
`outline.fights[]: { ep, foe, heroRealm, foeRealm, foeRevealedEp, edge? }`.

| rule | default | why |
| --- | --- | --- |
| `golden-finger` | activated by E2, with rules and costs; at most two | the golden opening; limits matter more than powers; a sprawl of cheats bores |
| `upgrade-cadence` (`废柴`) | no 12-episode stretch without a breakthrough; one in the golden phase | the level-up is the promise |
| `no-level-skip` (`废柴`) | one realm at a time; no fall back unless it is a recorded cost | ladder integrity |
| `cause-and-cost` | every breakthrough has a cause and a cost (time, resources, injury, exposure, a debt to the system) | Sanderson: limits > powers |
| `foe-known` | the foe's realm is known before the fight; at most one realm up, and then with an edge set up earlier | makes 越级 legible; no deus-ex-system |
| `peak-held` (`废柴`) | the top realm reached in the last 15 % | keeps the climax |
| `hidden-master-reveals` (`隐藏大佬` / `满级`) | a new layer of 身份揭露 at least every 10 episodes | the tension moves to the hidden identity |

## 3. The episode

- The micro-arc fits one episode: conflict → the system activates → crushing power.
- **Every episode moves a ledger quantity** (a resource, a skill, an item, reputation or a realm) — not
  a full level each time.
- **System notifications are ready-made cliffs**: 【叮！任务发布：…失败惩罚：…】 — a concrete task, a
  reward that builds anticipation, a penalty grasped at once. Task or penalty → 危机; the unopened
  reward box → 道具; "breakthrough in progress…" → 结果; the enemy's realm revealed → 身份 / 反转. At
  most two system hooks in a row.
- **Breakthrough cliffs**: cut on the aura surge or the tribulation cloud; pay off in the next
  episode's first 15 s with an onlooker's shock ("筑基了?!").

## 4. Characters

- **The 废柴 hero**: a visible humiliation (退婚, expelled from the sect) and a goal beyond power
  (family, revenge, someone to protect).
- **The system or the 老爷爷** has a personality, blind spots, limits, even an agenda — never
  omniscient in practice. One or two 金手指 for the whole story.
- **A rival per realm or map**, within about one realm of the hero — the revenge ladder indexed by
  realm (`story-revenge.md`).
- **The love interest** has her own stake; the 退婚 fiancée and the loyal girl are worn out.
- **For 满级 heroes**, the tension is hiding, protecting others and consequences, not whether she wins.

## 5. Beats and freshness

觉醒 / 绑定系统, 系统提示, 退婚, 宗门大比, 越级挑战, 秘境, 丹药 / 法宝, 拍卖会, 天劫, the 扮猪吃虎 reveal, 下山即无敌.
Fresh through **融梗** (a 无情道 system in 女频修真, famine + stockpiling, the time loop, texts from your
future self, 签到, 全民转职, 规则怪谈) and through conviction — "make the unreasonable believable".

## 6. Dialogue and AI video

The system speaks in bracketed UI copy: short, numeric, deadpan. **Onlookers say the realm aloud**
("他竟是金丹后期!") — exposition and payoff in one line. Contempt lines (区区练气) set up the 打脸; understate
the hidden master. **For AI video**: give each realm one fixed visual signature (an aura colour, a
particle, an eye glow) — `powerSystem.realms[].visual`; ration full-screen set pieces (天劫, armies)
for breakthroughs and the climax; prefer glows, runes, UI panels and flying swords over crowds and
long choreography.

## 7. What fails, and regulation

Power creep from open-ended multipliers; a sprawl of 金手指; rules the story does not follow; the
deus-ex-system (a new ability exactly when needed — Sanderson's First Law); the same plot shot a
hundred times. **Regulation**: the micro-drama measures in force from 2026-09-01 ban promoting
superstition and cults and glamorising violence, and require an AI label on every episode; compliance
guides treat 招魂, 鬼上身, 养小鬼, 冥婚, and fortune-telling or exorcism shown as real as red lines. **An
invented world is the safe setting**; a modern-city 神医 / 风水 / 鉴宝 is the risky one — never show
talismans or feng-shui working as real cures or luck, never disparage medicine (`story-advice` flags
it on the mainland).

## 8. Sources (read as search summaries)

CSDN on 修仙 writing and 金手指 design; 知乎 on 金手指, 扮猪吃虎 / 越级 and power-system collapse; 澎湃 网文论 (the
MMORPG loop) and 女主修真赛道; DataEye 2025; 钛媒体 on 系统 hits; Sudowrite and Writer's Daily Practice on
progression fantasy; Royal Road on pacing; Brandon Sanderson's laws; 百度百科 on 升级流 and 系统; 知乎 / 腾讯 on
融梗 and 信息差; 腾讯 on 男频 recovery; 搜狐 and 蓝鲸 on 漫剧 charts; 起点 on realm ladders; 知乎 on homogeneity; 新华网,
NRTA and 17173 on the 2026 measures; Byerisk on superstition red lines; 36氪 and 新京报 on AI 仙侠 costs.
