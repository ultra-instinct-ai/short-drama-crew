# Story genre `revenge` — 复仇 / 逆袭

战神 · 赘婿 · 重生复仇 · 真假千金 · 扮猪吃虎 · 大女主复仇. The best-selling theme in 短剧 (DataEye
2025: 逆袭 leads by heat and by title count; 打脸虐渣 in most top titles) and overseas (revenge,
hidden identity, heiress on ReelShort / DramaBox). Shared machinery: `story.md`.

## 1. The promise — certainty, not surprise

The audience does not pay to be surprised; it pays for **a payoff it knows is coming**. The viewer
sits in the god seat (信息差): they know the hero's real strength, watch the antagonist dig their
own grave, and wait for "a certain result in a certain way". That is why 扮猪吃虎 is pleasurable
even in the pig phase, and why every humiliation is a promise the drama must repay.

- **先抑后扬.** Suppression buys the release; how much depends on the audience. Male-audience
  shows want a fast rise with light humiliation; female-audience shows tolerate heavier
  suppression because it deepens the reversal. Either way, never suppress without the audience
  knowing a payback is owed.
- **The curve is 憋屈 → 小爽 → 更憋屈 → 大爽**, and it is sliced into every episode, not spread
  over the season.
- **Regulators want it 爽而有度** (NRTA 2025): no venting-style 怼 / 打脸 for its own sake, no
  全能正派 / 极端反派, no 以暴制暴 or 极端复仇, 重生 that follows real-world logic. Land the big
  paybacks through exposure, law, wits and consequence, not private violence (`story-advice`
  flags 私刑 / 以暴制暴 / 灭门 / 虐杀 in the outline).

## 2. The series — a payback ladder

| phase | where | what happens |
| --- | --- | --- |
| golden | E1 → the first paywall (卡一, E8–12 in an 80-episode run) | maximum humiliation **and one full 压→爽 loop by E03** against a tier-1 petty oppressor; the first identity hint; the paywall lands on a 身份 / 反转 / 危机 hook |
| escalation | to ~75–80 % | cycles of 5–10 episodes: a higher antagonist presses harder (更憋屈), small paybacks accumulate, the cycle ends on a **big** payback and the next identity layer; the antagonists win some rounds (a setback near the midpoint and an all-is-lost at 70–85 %) |
| climax | last 15–20 % | the arch-nemesis and the full reveal; the most public, most witnessed 打脸; closure through 情感释放 |

**The antagonist tiers climb like game bosses (换地图):**

| tier | who | leverage | falls |
| --- | --- | --- | --- |
| 1 | petty oppressors: the snobbish relative, the mother-in-law, the ex, the gatekeeper | contempt, gossip | early, often; the first small paybacks |
| 2 | power holders: the rival heir, the fake daughter, the boss | money, position, family | across escalation, in big paybacks |
| 3 | the arch-nemesis behind the original wrong | everything; hidden or untouchable | once, in the climax, at 80 % or later |

**Tracked in the outline** (gate `story-revenge`):
- `characters[].antagonist: { tier, firstPressEp, motive }` for every antagonist. `motive` is
  required: an antagonist with no reason of their own is an 极端反派 and a 降智 villain.
- `outline.paybacks[]: { ep, target, scale: small / big / final, by, how }` — every payback.
  Every antagonist is finished (`final`) exactly once.

**The rules** (researched defaults; waivable on the user's request):

| rule | default | why |
| --- | --- | --- |
| `first-payback` | a payback 爽点 (打脸 / 复仇 / 身份揭露 / 智商碾压) in E1–3 | the golden three episodes close one loop |
| `payback-gap` | ≤ 3 episodes in a row without one (≤ 5 when mixed with another genre) | 每集小爽点、三集大爽点 |
| `setup-before-payback` | an antagonist's first payback comes ≥ 1 episode after they first press (≥ 3 for tier 2–3) | the payback is as strong as the pressure before it |
| `tiers-ascending` | antagonists are finished in tier order; the top tier at ≥ 80 % of the run | the ladder climbs |
| `big-payback-cadence` | in escalation, a big or final payback at least every 10 episodes (runs ≥ 20) | small reversals every 5–10 episodes, big ones every 20–30 |
| `hero-delivers` | the arch-nemesis is finished by a lead | the backer (靠山) confirms the hero's power, never replaces it |

## 3. The episode

- **Hook in the first 3–5 s** (a humiliation, a threat, a secret shown); conflict by ~6 s.
- **The 爽点 mid- or late-episode, then the cliff reopens the threat**: right after a payback,
  a bigger problem, so the viewer does not leave satisfied.
- **Episode 1** shows who the hero is, their status and their state through events, and puts a
  concrete crisis on them (thrown out, stripped, threatened).
- **A premise that sells has "a secret, a clock and a witness"**: something to reveal,
  something running out, someone to walk in.
- **The 打脸 beat**: the antagonist mocks (setup) → the reveal (the card, the call, the document) →
  **the crowd reacts** (一定要有围观群众的反应) → new characters bow. On the storyboard this is the
  `faceslap` grammar (`grammar-faceslap.md`).
- **Revenge cliffs** by hook type: 身份 (someone kneels, a title is spoken), 危机 (the
  antagonist's counter-move, a threat to family), 结果 (will they believe it?), 反转 (an ally is the
  villain's mole), 道具 (the token, the medal, the call).

## 4. Characters

- **Protagonists**: the humiliated 赘婿 with a hidden 战神 / 神豪 identity; the reborn victim
  with foreknowledge; the 真千金 who schemes (蓄势、谋势、借势) rather than wails; the 大女主
  avenger who does the 打脸 herself. Give the hidden strength a *reason* to stay hidden.
- **The backer** (a loyal subordinate, an old comrade, a kneeling general) is the witness who
  walks in and confirms the hero's rank. In 大女主 dramas the man helps; she lands the blow.
- **Antagonists stay credible**: real leverage (money, law, family, information), wins of their
  own after the paywall, and disbelief that comes from pride or interest — never the 智障
  villain who refuses evidence in front of him.
- **Cast**: about 6–12 named, at least two antagonist tiers, one ally or backer.

## 5. Keeping the stock beats fresh

Stock beats: the humiliating banquet or wedding; the divorce-agreement slap; the phone call that
makes a tycoon kneel; the black card / medal / token; the relative begging forgiveness; the fake
daughter's frame-up; the reborn heroine pre-empting a trap; evidence played on screen before
everyone.

- **Rotate how the payback lands**: identity, wits (智商碾压), proof, a turned ally, the villain's
  own trap backfiring. **Rotate who witnesses it**: family, the company, the whole society, the
  press. **Let some paybacks cost the hero something.**
- **Stack hot genres** (战神 + 赘婿 + 虐恋) and **play against type** (the obedient-looking
  heroine who plots through information control). The market is moving from repeated hooks to
  complete plots and distinct characters; the fixed "ch1 conflict, ch2 金手指, ch3 hook" opening
  is now fatigue.
- **Layer the identity reveal** (`story-advice`): at least three 身份揭露 episodes for a
  hidden-identity premise, at most one in the golden phase, the full reveal in the climax.

## 6. Dialogue

Plain spoken language; 用最少的字让人物打脸. Lines of about 15 characters, no monologues. Many watch
without sound, so the reveal must read as a picture (the kneel, the slap of the document). **Let
the villain's taunt set up the exact words the payback throws back.** The hero's lines are terse
and cold; emotion is saved for the 情感释放 beats.

## 7. What gets rejected

A weak first ten episodes (they decide approval); unoriginal characters; logic holes and
dumbed-down villains; the formula opening; all the 爽点 spent early; literary lines; unshootable
scale; venting-style or extra-legal revenge (regulatory).

## 8. Sources (read as search summaries)

流媒体网 卡点 (卡一 at E8–12) and 三点论; 电影界 on paywalls and 《无双》; hailuoshe on 憋屈—小爽—
更憋屈—大爽 and reversal cadence; 知乎 短剧编剧黄金手册; 36氪/澎湃 on 爽 as the first principle;
腾讯 on gradual 战神 reveals and 大女主 revenge; 投中网 on kneeling and the 智障 villain; 虎嗅 on
episode-1 requirements; 澎湃 on 重生复仇; douban on the god seat; 界面 on male vs female 爽点; DataEye
2025; NRTA 管理提示 "爽而有度" (2025); ScreenWeaver (hook/turn/cliff, four tent-poles, secret-clock-
witness); InkTip; John August on microdramas; Save the Cat (Fool Triumphant, Superhero); revenge
tragedy conventions; thewritepractice on revenge and underdog stories.
