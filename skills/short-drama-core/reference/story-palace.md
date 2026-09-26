# Story genre `palace` — 宫斗 / 权谋

宫斗 · 宅斗 · 嫡庶之争 · 夺嫡 · 权谋复仇 · 女帝 / 女相 大女主. It pairs with the `costume-dark` or
`costume-idol` look and the `古装` register. Shared machinery: `story.md`.

## 1. The promise — winning with the mind

- **智性爽**: watching the heroine read the room, set a trap and flip the verdict. In 琅琊榜 "most
  strategies rely on predicting how another person will react"; 《冒姓琅琊》 (2025) sold "知识即武器的智性爽感".
  Revenge rewards a *power* reversal; 宫斗 rewards a *mind* reversal — the payoff is "she saw it
  coming", not "she turned out to be rich".
- **升级**: the rank ladder is the progress bar (延禧攻略: becoming stronger alongside her).
- **道德资本**: the winner must deserve it — "I didn't want to fight; you forced me". Losers lack skill
  or are exposed doing evil.
- **A tragic undertow** (optional): 甄嬛 won at the cost of love; 庆余年 is "a 爽文 shell over a cruel
  truth" — in 短剧, one bittersweet beat near the end.

## 2. The series — schemes, a ladder, factions

| act | ~episodes (of 80) | function |
| --- | --- | --- |
| 入局 | 1–10 | low-rank entry (选秀, 庶女, 替身, 重生); the first humiliation and small counter-win; the first rank gain; the antagonist's faction in action; the 卡一 cliff (E8–12) is **a scheme near-exposure** |
| 立足 | 11–30 | scheme rounds of 3–6 episodes; allies, promotions, a patron; **the antagonist wins at least once** |
| 低谷 | 30–50 | a big frame-up succeeds (冷宫, demotion, 禁足, a lost child); an ally betrays; she starts the long plant |
| 反攻 | 50–70 | intel gathered, the antagonist's servants turned; factions realign; she rises faster |
| 夺权 | 70–end | **the master counter-scheme planted in Acts II–III pays off**; the final verdict, the top rank or the regency |

- **Long plants are the backbone**: 甄嬛传 plants "得一人心" in episode 1 and pays it off dozens later;
  梅长苏's twelve-year setup unfolds as numbered moves (北燕, the 兰园藏尸案, 南楚); the 滴血验亲 counter-trap
  begins the empress faction's collapse — **one scheme changes the factions**.
- **Each scheme across 3–6 episodes**: 埋 (a prop or intel in passing) → 发 (the accusation; a 危机
  hook) → 危 (the verdict seems certain; a cliff) → 反 (the counter from what was planted; 智商碾压, a 反转
  hook) → 罚 / 升 (the antagonist punished, her rank changes). **Overlap the arcs**: scheme B is planted
  during scheme A's reversal.
- **Two modes of irony**, about half and half: the audience sees the poison go in (will she notice?),
  or the heroine's plan is withheld (the reveal is the payoff). Too much withholding feels like a cheat.

**Tracked in the outline** (gate `story-palace`): `outline.rankLadder: { track, levels[] low → high }`,
`outline.rankEvents[]: { char, ep, to }`, `outline.schemes[]: { id, schemer, target, stakes: minor /
major / master, setupEp, revealEp, outcome: success / countered / backfired, counteredBy: { type:
intel / prop / ally / counter-trap / authority, ref, plantEp }, flaw, justice? }`,
`outline.factions[]`, `outline.allegiance[]: { char, ep, from, to, motive, foreshadowEp }`.

| rule | default | why |
| --- | --- | --- |
| `scheme-setup` | ≥ 2 / 5 / 20 episodes between setup and reveal (minor / major / master, the master scaled to the run); a master scheme planted in the first half | the long plant is the genre |
| `no-teleported-evidence` | every counter is planted before the reveal; every countered scheme records the loser's flaw | no evidence out of nowhere; every loss has a cause |
| `authority-not-rescue` | at most one scheme per phase countered by the emperor alone | the arbiter has an agenda |
| `competent-antagonist` | an antagonist scheme succeeds against the heroine before the midpoint | a strong enough villain saves a story |
| `rank-climb` | the first rank event by E12; ≥ N / 15 rises; no 15-episode gap; a low point at 30–60 %; the top rung in the last 10 % | the progress bar and its dip |
| `faction-realignment` | 2–4 factions; every switch of sides has a motive and foreshadowing ≥ 5 episodes earlier | betrayals are foreshadowed |
| `moral-capital` | the heroine only schemes against someone who schemed against her first (or records a justice goal) | 道德资本, and regulatory safety |

## 3. The episode

A cliff, a conflict and a reversal every episode (情绪未完、剧情刚翻新、人物状态临界值); the loop is
冲突 → 行动 → 反转 → 爽点. A trigger or danger episode ends on 危机 / 反转; the reveal episode pays in
智商碾压 / 打脸 / 复仇 / 身份揭露. Every accusation scene needs a witness chain: the maid → the 太医 → the
evidence prop.

## 4. Characters

- **The heroine** goes naive → burned → strategist; with 重生 she starts as a strategist and the arc
  is the *cost* (an ally, a child, love).
- **The antagonist decides quality** — never a whetstone; every exit should feel regretful.
- **The emperor** is the prize and the root of all evil (the 欢宜香); an arbiter with his own agenda,
  never a free rescue. A fresh variant: the emperor as a two-way opponent (《枕边刃》).
- **Allies play their own games** (安陵容 scoring a point in the chaos); **servants are pieces** — the
  channel for intel and planted evidence; turning the antagonist's maid is the Act IV move.
- **Every schemer has a motive** (宫斗 is driven by family, 宅斗 by individual will).

## 5. Beats and freshness

The kit: 麝香 in ointment, the 红麝香珠, 假孕, 滴血验亲, 巫蛊 and poison, the 私通 frame, 选秀, 请安立规矩,
翻牌子, 冷宫, 禁足, 降位 / 晋封, 落水, 狸猫换太子, forged letters, scents, the 太医 testifying, 嫡庶, 分家, 夺嫡 and
站队. **Fresh**: knowledge as the weapon (冒姓琅琊); comedy and workplace framing (《我在皇宫搞内卷》, 《谁在说朕
坏话》); two strong leads with the emperor as the opponent; **reverse a stock trope** (the 滴血验亲 bowl
rigged by the accuser; the 假孕 exposed by a prop) for a fresh payoff at the same budget.

## 6. Dialogue

A threat phrased as concern ("妹妹身子弱，可要当心"); rank in the pronouns (本宫, 臣妾, 嫔妾, 奴婢);
punishment that sounds like mercy; truth said in public, meaning in private. Semi-classical but
readable in a minute; the reversal line is a crisp trap-question ("那这香囊，为何在你宫里的绣娘手里？").

## 7. What fails, and regulation

降智 schemers (找事逻辑); evidence from nowhere; the emperor as deus ex machina; too many consorts too
early; a rank that never moves; a heroine who only defends; an unforeshadowed betrayal. **Regulation**:
宫斗 left prime-time satellite TV in 2011 and was targeted again in 2019; NRTA opposes 历史虚无主义; the
2026 micro-drama measures ban distorting national history and require an AI label per episode;
critics call 宫斗 anti-intellectual. **In practice**: a fictional dynasty, no real emperors as
villains, scheming shown as costly, no cruelty to servants for gain, abortion, torture and 房中术 off
screen, 巫蛊 exposed as a frame-up, never real magic (`story-advice` flags them).

## 8. Sources (read as search summaries)

知乎 on 宫斗剧法则, 女频宫斗 and 滴血验亲; CSDN on 短剧 structure; 界面 / 澎湃 / 36氪 on 宅斗; 豆瓣 后宫指南; 维舟 on
宫斗 and 道德资本; 腾讯 / 搜狐 on 梅长苏's moves; 新华网 on 宫斗 and personality; 澎湃 / 虎嗅 (王倦); 腾讯 and 光明网
on 《冒姓琅琊》; 腾讯 红榜 (《我在皇宫搞内卷》); 网易 on 《谁在说朕坏话》; 流媒体网 三点论 and 卡点; 电影界 on 红果
编剧第一课; 360doc 编剧红宝书; 知乎 黄金手册; 三联 on 《甄嬛传》; 知乎 on 《女相师》; 百度百科 (《枕边刃》); CDT / 虎嗅 on
15 years of bans; 澎湃 (2019); NRTA 2025-02 notice and 2026-06 draft measures; 澎湃 on 宫斗 and workplace; 腾讯
/ 搜狐 on 降智; 中新网 (流潋紫); Strange Horizons on 琅琊榜; 界面 on 延禧攻略.
