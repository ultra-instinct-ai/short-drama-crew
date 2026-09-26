# Story genre `comedy` — 喜剧

沙雕 · 无厘头 · 情景喜剧 · 甜宠喜剧 · 古装喜剧. This is the **writing** of comedy; how a gag is cut
is `grammar-comedy.md`. Shared machinery: `story.md`.

## 1. The promise — the laugh as the texture of a story

- **Comedy is incongruity**: an expectation set up, then broken (错位, 误会与巧合, 情境置换, 语误,
  元素嫁接). Vorhaus calls the engine the **comic premise** — the gap between comic reality and
  real reality.
- **In 短剧 the laugh is packaged with 情绪价值.** The biggest comedy-adjacent hit of 2025, 《十八岁
  太奶奶驾到》, combines 反差萌 (an old soul in a young body) with 打脸 (爽) and a tear-jerking family
  reunion (温情). 《成何体统》 split "笑点、虐点、爽点" and put one of each in an episode.
- **Comedy rides the story; it does not replace it.** The 太奶奶 team tried a sitcom form for a
  later season and the audience rejected it — they wanted the story and its emotion, with the
  comedy inside. Keep the revenge, romance or family through-line and its 爽点 cadence; comedy is
  the texture and the delivery, not the spine. (That is why `comedy` usually sits beside another
  story genre in `params.story`.)
- **"Distance makes us laugh; humanity makes us stay."** Audiences now reject piled-up
  physiological gags (堆砌式的笑点); they want structure and real-life resonance (接地气).

## 2. The series

- **The comic premise** (`outline.brief.comicPremise`, gated): the normal world, the comic world,
  the gap. *An 18-year-old body with a great-grandmother inside. Office workers transmigrated into
  a palace-intrigue novel, running the court with KPIs and spreadsheets.* Vorhaus' clash of
  context: force incompatible things together.
- **Running gags and callbacks** (`outline.runningGags[]`, gated): a gag repeated at least three
  times, **varied and escalated** each time and tied to the plot — without escalation, repetition
  is dead weight. The Chinese form is 三翻四抖: a 包袱 threaded through the piece, laid out over
  several 翻 and shaken open at the end. Pay the running gag off late (in the climax).
- **Escalation** (UCB): each move "in keeping with, yet more absurd than" the last — "if this is
  true, what else is true?" and "why is it true?".
- **The 爽点 cadence still applies** (每集一个小爽点，三集一个大爽点). The best 爽点 double as
  punchlines: the 打脸 played as a reversal gag.
- **Sitcom tools**: A/B stories, a cold open, a tag; the trouble resolved and harmony restored at
  the end (大事化小，小事化了, the 温馨收 close).

## 3. The episode

- **Density.** There is no 短剧-specific benchmark. Sitcoms run from one laugh every 8–11 s (the
  fastest) to 16–22 s; stand-up aims for 4–6 a minute. A 短剧 also carries plot and 爽, so for a
  1–2-minute episode: **3–6 gags for 沙雕 / 无厘头, 2–3 for a romcom or a 古装 comedy carrying plot**
  (gated at the script: `gag-density`, 3 for `slapstick` / `deadpan`, 2 otherwise, 2 for one-minute
  episodes). Count the laughs after every draft.
- **The hook can be a gag** within the first 10–15 s. **The biggest laugh lands in the last
  third**, on the 爽点 or just before the cliff.
- **The comic cliff** is an impending exposure: the dramatic irony about to break, the
  misunderstanding about to be discovered (揭秘→发现 — once the audience knows a secret, the writer
  owes them the moment a character finds it out). Do not let three comic-only cliffs in a row
  replace the plot hook.
- **In the script**, mark the beats: `gag: setup` where the joke is planted, `gag: build` for the
  repeats of a rule of three, `gag: punchline` where it lands, and `runningGag: "G1"` on a beat that
  calls back a running gag. The storyboard's `grammar-comedy` cuts pick these up.

**Script rules** (gate `story-script`; waivable on the user's request):

| rule | default | why |
| --- | --- | --- |
| `gag-density` | ≥ 3 punchlines an episode (`slapstick`, `deadpan`), ≥ 2 otherwise and in one-minute episodes | sitcom benchmarks, set lower for a plot-carrying 短剧 |
| `gag-setup` | every punchline has a setup earlier in the episode, or calls back a running gag first seen in an earlier episode | 铺平垫稳 — no payoff without a plant |
| `punchline-brevity` | a punchline line is ≤ 20 characters (≤ 12 English words) | 笑点直接干脆; the funny word last, nothing explaining it after |

## 4. Comic characters

- **Every lead and support has a comic flaw** (`characters[].comic.flaw`, gated), and the leads' flaws
  differ. Vorhaus' four elements: a **comic perspective** (a worldview at odds with normal
  reality), **flaws**, **humanity** ("for every flaw an equal and opposite humanity" —
  `comic.humanity`), and **exaggeration**.
- **逗 and 捧** (`comic.role`): the 逗哏 makes the laughs; the 捧哏 frames them, gives the next line
  its footing and controls the rhythm. **Somebody plays it straight** (gated) — the voice of
  reason, the audience surrogate. "If everyone is unusual, no one is." 一头沉 (one partner
  dominates) or 子母哏 (both trade gags).
- **Base reality first**: the scene establishes the normal world before the first unusual thing.
- **Pairs built on contrast** (开心麻花: 从人物关系入手去锤炼包袱) — the butler who acts like the young
  master and the young master who acts like the butler; the 欢喜冤家 sparring lovers; 读心 (he
  hears her thoughts); exaggerated family love.
- **Ensembles** as opera role types (老生 / 小生 / 花旦 / 青衣), each distinct.

## 5. Building a joke

1. **Setup and punchline — 铺平垫稳**: the setup natural (平) and logically tight (稳); no little
   zingers inside the setup, they drain the punchline.
2. **The rule of three (三拍子)**: two normal items, the third breaks the pattern.
3. **Reversal** (反转, 人设反转).
4. **Exaggeration** of perspective, flaw and humanity — the heart of 无厘头.
5. **Misunderstanding and dramatic irony**: the audience knows, the character does not, so plain
   lines carry a double meaning. Pay it off: the discovery must come.
6. **错位**: the wrong person does the wrong thing, or walks into the wrong place.
7. **Clash of context and anachronism**: high and low, old and modern flipped together; office
   jargon in a palace.
8. **The game** (UCB): find the first unusual thing, then heighten and justify it.
9. **Callbacks**: an earlier 笑点 returns in a new context, escalated.
10. **The wildly inappropriate response** (Vorhaus).
11. **Wordplay (谐音梗)** — only when it starts from what you want to say; a pun worked backwards is
    a 烂梗.

**What survives AI video.** Robust: situational irony and misunderstanding (the situation carries
it, not the performance); contrast in costume, prop or setting; exaggerated static reaction faces;
an insert (the object, the text message) as the punchline; a voice-over inner monologue (读心 gags
need no lip-sync); sound effects and freezes; a rule of three cut as three shots. Fragile: precise
pratfall timing, collisions, rapid overlapping 抢话, a gag that depends on a micro-expression or a
lip-synced funny word. **Let the punchline land on a cut or a reaction, not mid-shot acting.**

## 6. Dialogue

- **Brevity** — 笑点直接干脆，不能拖泥带水, and never explain after the laugh.
- **The funny word last** — end the line on the point of highest tension; in Chinese, put the
  包袱 word or the reversal at the end of the clause.
- **Memes** add 代入感 but date quickly ("老套的梗跟不上潮流，太高级的梗不接地气"): at most one an
  episode, never the only gag.
- **Avoid 尬**: gags that make the leads irrational just to get a laugh; predictable reused 梗;
  straining too hard (用力过猛).
- **Dialect** for flavour, tested on outsiders.

## 7. What fails

Gags that break character logic; repetition without escalation; switching form mid-series and
losing the emotional line; everyone zany with no straight man; explaining the joke or cluttering
the setup; stacked gags with no structure; dated or niche memes; a misunderstanding planted and
never paid off; comedy that depends on physical or lip-sync precision the video model cannot give;
punching down at the sympathetic lead instead of at the antagonist's pretension.

## 8. Sources (read as search summaries)

知乎 on 结构喜剧 (三拍子, call back, 温馨收); 界面 on 开心麻花 and 短剧, on 语误, on 情景喜剧; 豆瓣 on comedy
technique and 三翻四抖; Cracked / No Film School / Ken Levine on jokes per minute; 知乎 on
seconds-per-laugh benchmarks; the UCB Comedy Improvisation Manual (game, base reality,
heightening); John Vorhaus, The Comic Toolbox (comic premise, perspective, flaw, humanity, clash of
context, rule of three); MasterClass and No Film School on sitcom structure; comedy callbacks and
escalation (Medium, New York Improv Theater); 流媒体网 三点论 and CSDN on 短剧 爽点 cadence; 短剧编剧
九九; 澎湃 / ETtoday on 《十八岁太奶奶驾到》; 腾讯 (范博洋 on the failed sitcom season); 网易 / 知乎 on
《成何体统》; 界面 / 腾讯 on 《家里家外》; 澎湃 on 无厘头 and 《一年一度喜剧大赛》; zh.wikipedia on 捧哏;
Backstage on the straight man; 知乎 on 戏剧性反讽; Luma and arXiv on comedy in AI video; Descript and
PremiumBeat on comedy editing; Greg Dean on punchlines; 腾讯 / 澎湃 on 谐音梗; 搜狐 on why 短剧 comedy
fails. No 短剧-specific laughs-per-minute figure was found; the density thresholds are extrapolated.
