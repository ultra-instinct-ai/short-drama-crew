# Story genre `family` — 家庭伦理

婆媳 · 豪门恩怨 · 萌宝 · 亲情 · 认亲 / 寻亲 · 养老 · 家庭复仇 · 年代家庭. The genre of 《家里家外》 and
《十八岁太奶奶驾到》, and of the fastest-growing audience in 短剧. Shared machinery: `story.md`.

## 1. The promise — being needed, being loved

- **Who watches**: in 2024 viewers aged 40–59 were 37 % of the short-drama audience and 60+ were 12 %
  and rising fast; 中老年 titles take close to half of some monthly heat charts, and older men are a
  large share of payers. Hits like 《家里家外》 and 《我在八零年代当后妈》 also reach students; 原生家庭
  stories (《好一个乖乖女》) pull in younger women. **Serve both poles**: the parent (the wronged
  mother, the unfilial child) and the child (the 原生家庭 wound, the found family).
- **The underlying need is 被需要 and 被爱.** The older viewer's first pain is their children: the
  mother who sold her flat for her son's wedding home. The payoff is the ungrateful child finally
  seeing the sacrifice — and a double happy ending, love and family.
- **The shift is 从强刺激到强共鸣**: 情怀, 家和亲情, "家才是顶流剧本"; family as the unit, not the company or
  the couple.
- **Four emotions**: 共鸣 (that's my mother-in-law), 泪点 (sacrifice seen too late), 家的温暖 (a found or
  blended family), 扬眉吐气 (the wronged one vindicated before everyone who looked down on her). The
  last overlaps with `revenge` — but the target is kin, so the end is 和解 or 清醒的切割, not destruction.

## 2. The series — a family web that reorganises

- **Pressure runs long**: 中老年 titles hold the heroine down for twenty or thirty episodes before the
  big payoff, much longer than 爽剧 — so give small wins early (a reason to stay) and the full public
  vindication in the middle third, then a larger one in the climax.
- **A web, not a line**: three lines work — the present line drives the plot, a memory line explains
  the past, a hidden line plants motives, with an emotional anchor every few episodes. Pivotal
  revelations happen in **ensemble scenes where everyone is present**.
- **Family as a system**: the 偏心 parent runs the golden-child / scapegoat engine; the 老实人 son or
  husband is the enabler; the 萌宝 is the mascot and truth-teller; the wronged daughter-in-law is the
  scapegoat who breaks the role. The series is the system reorganising — so **every member ends
  somewhere**.
- **Secrets**: tell the audience the blood secret early (信息差, by E5); reveal it character by
  character (the intercepted DNA result, the 信物, the witness); stage the full public 认亲 at a
  gathering at 55–85 %; leave episodes for the fallout.
- **爽 and 泪 alternate**: humiliation → small 爽 → a warm or tearful beat → bigger humiliation →
  bigger 爽. Never more than about three 爽 episodes without a tear — that is what separates family
  drama from revenge.

**Tracked in the outline** (gate `story-family`): `characters[].family: { generation, role,
minor?, endState: 和解 / 清醒切割 / 惩戒 / 离世 }`, `outline.secrets[]: { id, content, audienceKnowsEp,
plantEp, hintEps[], revealEp, revealTo }`, `outline.vindications[]: { char, ep, venue, witnesses[] }`,
`outline.reconciliations[]: { pair, woundEp, triggerEp, turnEp, endState }`.

| rule | default | why |
| --- | --- | --- |
| `family-web` | ≥ 5 family members over ≥ 2 generations | the genre is a system, not a duel |
| `every-member-resolves` | every lead and support family member has an end state | the system visibly reorganises |
| `tear-cadence` | ≥ 20 % 情感释放 episodes, never more than 6 in a row without one | 泪 is the promise |
| `public-vindication` | a vindication with ≥ 3 family witnesses at 25–70 %, a larger one in the climax | "压到二三十集", then before everyone |
| `secret-hygiene` | every secret planted before it is revealed with ≥ 2 hints between; the main secret known to the audience by E5, revealed at 50–85 % | 信息差; room for the fallout |
| `earned-reconciliation` | wound < trigger (evidence of sacrifice) ≤ turn; ≥ 10 episodes from wound to turn | repentance earned by sacrifice, not by her wealth (富贵门前皆孝子) |
| `child-compliance` | a minor never lands an 打脸 / 复仇 / 智商碾压 | NRTA 2026 儿童类微短剧 notice: no adultification, no 啃小, no children as tools |

## 3. The episode

- **Cold open on a concrete family wound**: the mother eating leftovers while the in-laws feast, the
  soup knocked away, the old woman outside her own house. The wound, not the violence — takedowns
  cite 刻意渲染.
- **The tear beat in the back half**, usually a memento (the old photo, the handmade shoes, the
  存折, the medical report) or a silent sacrifice seen by a third party; cut on it (情感) or undercut it
  with a threat (危机).
- **Cliffs**: the DNA envelope unopened (道具 / 身份); the elder collapses, a diagnosis (危机); the
  unfilial child about to sign away the house (结果); the 信物 seen by the wrong person (道具); the 萌宝
  blurts "you're my daddy" (情感 / 身份); the banquet door opens (身份 / 反转).
- **End a vindication on the key relative's face** — shame and regret. The villain's comeuppance is
  not enough; the repentance face is what this audience pays for.

## 4. Characters

- **The wronged mother / daughter-in-law / elder**: 为了孩子, 委屈求全, and hidden value (a status, a
  skill, a past sacrifice). Give her the moment of choosing herself — 半生为母，余生为己. Pure martyrdom
  is dated. (The 2024 婆婆爽剧 wave flipped it: the mother-in-law as the protagonist.)
- **The 萌宝**: builds arcs (the cold father warms), drives 认亲, fulfils fantasy — as an **innocent
  truth-teller or bridge** who notices, asks or carries a 信物. Never a schemer, a 霸总 or a bully; no
  adult lines.
- **The unfilial child, the 偏心 parent, the 白眼狼**: they repent — earned by evidence of sacrifice.
- **The elder** is the arbiter at the 寿宴 and the holder of the will.
- **Antagonists stay human**: a real motive (fear of poverty, an inherited 偏心, protecting their own
  child), one scene of their own pain, a proportionate consequence (loss of standing, not violence).
  《家里家外》 won by treating women's relationships warmly instead of 斗小三.
- **Ensemble**: every core member wants something; rotate the focus; gather everyone for the
  revelations.

## 5. Beats and freshness

Staples: 认亲 / 寻亲, 真假千金, 抱错, the DNA test, the 寿宴 / 满月宴 / 订婚宴 humiliation and reveal, 分家产 /
遗嘱, selling the house for the son, being thrown out, 萌宝助攻, 闪婚老伴, 黄昏恋, 重组家庭, 后妈, 年代. Fresh
through **period and dialect specificity** (1981 Sichuan, the women's volleyball team, 天府可乐),
**lived detail** (the writers interviewed hundreds of locals), **生活流 over 套路** (代际和解, 国企改制),
**inversions** (the good stepmother, the victim mother-in-law, the 18-year-old great-grandmother), and
**series-ability** (more of what viewers loved). Plan at least two whole-family gatherings (寿宴,
年夜饭, 满月, 婚宴, 葬礼, 分家) — one in escalation, one in the climax.

## 6. Dialogue

**Dialect** is a selling point (《家里家外》, the first all-Sichuanese short drama). **Plain language**;
each character's styling fits their life. **No 说教**: put the moral in an object or an act (the
存折, the unworn new clothes, the mother walking in the rain); one quotable line per arc is enough.

## 7. What fails, and regulation

Homogeneous 婆媳 slap-fests; caricatured women; money-worship endings; logic sacrificed for emotion;
repentance triggered by wealth; relatives left unresolved; a 萌宝 as a plot vending machine.
**Regulation**: the NRTA 2025-02 notice; takedowns for 刻意夸大渲染婆媳矛盾 and violence; the 2026-01
儿童类微短剧 notice (反成人化, 防啃小, 防工具化); the June 2026 campaign (harm to minors, wealth worship,
distorted marriage values, violence and revenge). Keep at least two hierarchical pairs (婆媳, 母子,
父女…), not 婆媳 alone, and end every abuse resolved.

## 8. Sources (read as search summaries)

人民日报 on 中老年微短剧 (audience shares); 36氪 / AgeClub "被需要与被爱"; 虎嗅 on how 中老年短剧 跑通; 36氪 on
霸道总裁俏阿姨 and 婆婆爽剧; 21经济网 on 银发经济 and payers; 澎湃, 新华网, 每经 and 界面 on 《家里家外》; 网易 /
澎湃 on 听花岛 (《太奶奶》); 搜狐 on 《太奶奶》; 虎嗅 on 年代短剧 生活流 (2026); 中国作家网 on 《好一个乖乖女》; 新浪 on
《我在八零年代当后妈》; 搜狐 / DataEye, 网易 and 央广网 on 萌宝短剧; 新华网 on the 儿童类 notice (2026-01) and the 2026
专项治理; NRTA 2025-02 notice; 新华报业 on takedowns; 光明网 on distorted family images; 流媒体网 on 卡点; 新浪财经
on the three-line structure; 知乎 on 真假千金; No Film School and Writers Helping Writers on ensembles;
Simply Psychology on family-system roles.
