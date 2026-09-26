# Story genre `horror` — 恐怖 / 灵异 / 惊悚

心理恐怖 · 规则怪谈 · 民俗恐怖 · 都市怪谈 · 怪兽 · 灵异. It builds on `mystery` (questions and clues) and adds
the threat, its rules and the dread. **The market decides what is allowed** (`params.market`,
§7). Shared machinery: `story.md`.

## 1. The promise — safe fear

- **Recreational fear**: fear enjoyed because the frame is safe — a flight simulator for anxiety
  (adrenaline junkies, white-knucklers, dark copers). The genre promises rising fear, then release:
  you survived, and you understood.
- **King's ladder**: terror (what you imagine — the best) > horror (seeing something wrong) >
  gross-out (the lowest, and effectively banned on the mainland). Live at terror and horror.
- **Dread is an information gap in the audience's favour** (Hitchcock's bomb): mystery withholds *what
  happened*; horror shows *that something is coming* and withholds when, where and what.
- **Curiosity about the rules** (规则怪谈): the viewer rebuilds the hidden world from contradictory
  rules (细思恐极) — in 短剧 an 智商碾压 payoff when the lead decodes the true rule.
- **The market**: overseas, thriller and horror are reported to grow fast among 18–30 viewers
  (trade-blog figures); psychological, domestic and paranoia thrillers suit 9:16 better than chases.

## 2. The series

- **Knowledge drives the acts**: unaware → suspecting → certain. The golden segment establishes
  normality and puts **the first sign of wrongness in E1, within 15 s**, and one threat event (a victim,
  a disappearance, a near miss). Escalation raises the stakes in stages (property → a secondary
  character → a loved one → the lead). **The midpoint** is usually the rule or nature reveal, often
  after a false win — the lead stops reacting and starts driving. Late escalation shows the monster
  more (the Jaws rule: hold the full reveal as long as possible); allies fall; the "safe" rule turns out
  corrupted. **The climax is won by exploiting the rules**, not force.
- **规则怪谈 anatomy**: the rulebook is the setting (a hospital, a school, a hotel, a compound, a zoo);
  a human side writes rules to protect, an abnormal side contaminates them; contradictions (the
  student vs the teacher handbook; red ink) force the characters to tell true rules from false. Beat
  map: enter the instance and receive the rulebook → the first rule-breaker dies (the rules are real)
  → the lead spots an anomaly → a contradiction exposes a false rule (midpoint) → the hidden true rule →
  the rules turned against the monster → the way out, and a sting.
- **Endings**: overseas and J-horror allow a sting (the curse spreads); **mainland endings close
  rationally with a positive value** (《蛇影谜踪》 closes on 敬畏自然).

**Tracked in the outline** (gate `story-horror`): `outline.horror: { subgenre, threat: { nature,
firstSignEp, glimpseEps[], revealEp, explanation: { type: 人为 / 幻觉 / 科学 / 骗局 / 精神 / 超自然, revealEp,
clueEps[] } } }`, `outline.horrorRules[]: { id, text, isTrue, shownEp, brokenEp?, consequence }`, and on
each outline episode `scares: [氛围 / 假警报 / 惊吓 / 揭示 / 规则惩罚]`.

| rule | default | why |
| --- | --- | --- |
| `scare-cadence` | a real scare (惊吓 / 揭示 / 规则惩罚) in ≥ 80 % of episodes | "a cliffhanger every minute"; the core promise |
| `false-alarms` | a false alarm is followed by a real scare in the same episode, never two episodes running | the cat scare sets up the real one |
| `early-threat` | the first sign in E1 | the 15-second hook |
| `hide-the-monster` | the full reveal past the half, with ≥ 2 glimpses before it | the unseen is scarier; the Jaws rule |
| `fair-rules` | a rule is shown before anyone is punished by it | dread needs the audience to know the rule |
| `rule-horror` (规则怪谈) | ≥ 5 rules, the first by E2, a false or contradicting rule by the midpoint | true vs contaminated rules is the game |
| `mainland-explanation` (`market: mainland`) | the threat is explained by 人为 / 幻觉 / 科学 / 骗局 / 精神, revealed in the climax, with ≥ 2 clues planted ≥ 2 episodes before | ghosts confirmed real, fortune-telling that comes true and 封建迷信 are red lines; an unplanted "it was a dream" cheats |

## 3. The episode

- **The scare cycle**: quiet → build (sound drops, focus narrows) → a false alarm → relief → the real
  scare, often from a misdirected angle. Ration the false alarms.
- **The 60-second template** (TikTok horror): 0–3 s a hook (a sound, an image, a line of text); set up a
  pattern and crack it a little each pass; the turn; a lingering image — the cliff.
- **Imply, don't show**: "let the mind supply the rest" — Blumhouse avoids CGI because the imagined is
  scarier; this is also what makes horror cheap for AI video.
- **Cliffs** are mostly 危机 (the threat imminent) and 反转 (the ally is the monster; the rule was false).
- **Vary the mechanism**: 《逃出绝命岛》 was criticised for repeating "狼来了" (she warns, nobody listens,
  someone dies) until it bored. Mark the escalation with an `intensity` per episode if you track it; put a
  quieter breather after a peak.

## 4. Characters

- **The survivor (final girl)**: watchful, level-headed, the first to sense something amiss and the
  only one to piece the pattern together — in 短剧 each 爽点 is often her reading the rules right.
- **The skeptic** denies the threat and dies or converts; on the mainland the skeptic can be *right
  about the mechanism* (a human is behind it) while wrong about the danger.
- **The expert** (the folklorist, the old caretaker, the rules veteran) delivers the backstory and is
  lost by the late escalation so the lead acts alone.
- **The first victim** proves the threat and the rules, by E3.
- **The human antagonist** (the snake dealer, the one faking the haunting) — required on the mainland,
  useful everywhere for 打脸 / 复仇.
- **No idiot plot**: every bad choice has a motive — forced, deceived, protecting someone, a false rule
  believed in good faith.

## 5. Beats and freshness

The rulebook reveal; the first rule-breaker's death; "don't look back / don't answer"; the wrong
mirror or door; the count off by one; the ally who knows too much; the false safe zone; the red-ink
rule; the monster at the frame edge; the curse spreading like information (J-horror); the wronged
dead with a grievance (onryō, the K-horror family trauma). **Fresh**: 民俗 / 志怪 anthologies (the pawnshop
that takes cursed objects), creature features (《逃出绝命岛》, 《蛇影谜踪》, hundreds of millions of plays),
规则怪谈 / 诡异 / 末世 漫剧, and blends (horror + family, + 探案, + comedy). **Mainland-forbidden or high-risk**:
ghosts confirmed real, fortune-telling or feng-shui that works, karma as a real mechanism, detailed
religious or cult ritual, gore and "画风观感不适", minors in terror scenes, pure ghost horror in AI 漫剧.

## 6. Dialogue and tone

Short, plain, concrete. **Rules in a flat bureaucratic register** — the authority is where the fear
comes from ("even nonsense sounds reasonable written as a rule"). Understatement over exposition:
silence, a sound cue, one wrong detail; characters do not narrate their fear. A dry line after a false
alarm resets the baseline so the next build lands harder. On the mainland: 爽而有度, fear resolved into
reason, a closing value (反迷信, 敬畏自然, 惩恶).

## 7. The market — mainland and overseas

- **Mainland** (`params.market: mainland`, the default): the 2017 content review code bans promoting
  superstition and rendering terror; the absolute red lines are 色情低俗, 血腥暴力恐怖, 封建迷信 and 错误价值观;
  tiered review and 先审后播, and since 2026 platforms review every uploaded micro-drama. **The practical
  line**: 灵异 as atmosphere is allowed **when the ending explains it** (hallucination, fraud, a human,
  the mind); never confirm ghosts, never let fortune-telling come true. The "建国后不许成精" rule is a myth,
  but the pattern is real; period and 聊斋-style settings get more leeway. The 红果 / 抖音 漫剧 rules (from
  2026-04-07) ban 风险迷信 and 画风观感不适 and reportedly pure ghost horror and supernatural 金手指 for AI
  漫剧; the viral "three banned genres" list for live action was officially denied — treat 灵异 as
  high-risk, not banned.
- **Overseas** (`params.market: overseas`): the supernatural may be a real mechanism (cursed manors,
  werewolves, onryō curses); the limits are app-store and ad policies on gore and minors; keep the
  threat's rules consistent and answer the central question even if the ending stings.

## 8. Sources (read as search summaries)

Wikipedia on 红果 and 规则怪谈; 知乎 and 腾讯频道 on 规则怪谈 craft; 萌娘百科 on 规则类怪谈 and 建国后不许成精; 中国作家网 on
规则怪谈 and control; Filmustage on vertical genres (trade figures); 新浪财经 on 2025 漫剧; Byerisk on superstition
red lines and the red-line table; IT之家 on 红果's denial; 36氪 / 腾讯 on 《蛇影谜踪》 and 《逃出绝命岛》; Far Out
(Hitchcock); No Film School on Jaws and Blumhouse; Wikipedia on horror and terror and the final girl;
Psychology Today on recreational fear; Kuciak on horror's three acts; Stone Age Herbalist on J-horror;
Backstage on jump scares; TIME and Little House of Horrors on TikTok horror; Filmora on ReelShort; Asian
Movie Pulse on K-horror; 腾讯 红榜 on 民俗志怪; 腾讯 on the 红果 漫剧 rules; 界面 on the decline of Chinese horror
film; 新华网 on the 2017 review code, the 2025 tiered review and 凡播必审 (2026).
