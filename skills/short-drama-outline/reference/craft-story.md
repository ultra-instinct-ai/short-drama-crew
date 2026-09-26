# Story craft — how a commercial 短剧 is written

The method behind stages 1, 2 and 4, distilled from the user's `w-short-drama-editor` and
`w-screenplay-character-creator` skills. **Read this before the outline and again before the
first character.** What can be checked is a gate (named in each section); the rest is the job.

The one idea underneath everything: a 短剧 is not a story told fast, it is **audience emotion
managed per 30 seconds** — an opening conflict keeps them, a turn every half minute keeps them
expecting, and a cliff makes the next tap involuntary.

## 1. The six judgements — `outline.brief` (gate `brief`)

Nothing is written until these are answered. A one-line idea from the user is not enough; ask
the focusing questions first, do not pad a synopsis around a blank.

| 判断项 | 必须回答的问题 | 合格标准 | field |
| --- | --- | --- | --- |
| 题材定位 | 复仇、逆袭、甜宠、豪门、悬疑、古装、家庭伦理，还是混合？ | 类型清晰，不能只写“爱情”或“都市” | `params.genre`, `params.story` (the genre rules: `../../short-drama-core/reference/story.md`) |
| 受众定位 | 主要观众追求什么情绪补偿？ | 能说出观众想看的爽感、痛点或幻想 | `audience` |
| 一句话卖点 | 主角、困境、反击与最大看点，一句话 | 句子内同时有角色、冲突、反转或利益点 | `logline` |
| 核心爽点 | 打脸、复仇、强宠、身份揭露、智商碾压还是情感释放？ | 爽点可以反复变奏，不是一场戏就用完 | `satisfactionEngine` |
| 主角压力 | 被谁压迫、被什么困住、最怕失去什么？ | 压力具体可拍，有人、有事、有代价 | `protagonistPressure` |
| 商业钩子 | 前 3 集凭什么令观众留下？ | 羞辱、危机、秘密、身份差、强反转或强欲望 | `mainHook` |

Plus `antagonistPressure` (how the opposition stays effective — a villain who loses IQ to move
the plot is a fault), `emotionalLine` (爱情 / 亲情 / 友情 / 师徒 / 复仇执念) and `promise` (the
emotional payment the audience is owed at the end).

## 2. Three phases — `outline.structure` (gate `structure`)

The commercial rhythm of an 80–100 episode drama is 黄金窗口 (1–10) / 稳固发展 (11–30) / 高潮收束
(31+). Scale it: **the first ~20 % is the retention window, the middle ~50 % escalates, the
last ~30 % pays**. A three-episode drama is 1 / 1 / 1. For six or more episodes the golden
window is never shorter than the first three.

| 阶段 | 功能 | 写作任务 | 常见错误 |
| --- | --- | --- | --- |
| 黄金窗口期 `golden` | 建立人设、困境、主线、最大钩子 | 快速展示主角被压迫、关键秘密、反击能力与核心关系 | 开场铺垫太久、背景讲解太多、爽点太迟出现 |
| 发展升级期 `escalation` | 反复升级冲突与关系拉扯 | 每 3–5 集一个小高潮，每 8–10 集一次大反转 | 只换事件不升级矛盾；反派重复羞辱但主线无进展 |
| 高潮收束期 `climax` | 集中爆发秘密、终局对抗、情感选择 | 回收伏笔，逼主角作终极选择，完成最大爽点 | 反转失控、支线过多、高潮与主题无关 |

Each phase carries `task`, `satisfactionPlan`, `hookPlan`.

## 3. The first three episodes (gate `episode-design`)

| 集 | 功能 | 建议内容 |
| --- | --- | --- |
| 第 1 集 | 立刻抓人 | 主角被羞辱、被迫选择、遇到重大危机；结尾抛出身份或危机钩子 |
| 第 2 集 | 证明爽点 | 主角第一次反击或被强力角色撑腰 — **`satisfaction.type` equals the brief's engine** |
| 第 3 集 | 放大主线 | 更大阴谋、真正反派或长线情感矛盾 — function includes 冲突升级 / 身份揭露 / 大反转 |

The finale's function includes 清算收束 or 大反转. The same `hookType` four episodes in a row
is a monotony the gate refuses.

## 4. One episode — 分集目录 fields (gate `episode-design`)

Every `outline.episodes[]` entry answers, before any prose:

- `function` — 开局钩子 / 冲突升级 / 身份揭露 / 情感推进 / 大反转 / 清算收束 (one or more).
- `task` — `goal` (what they must do), `obstacle` (who stops them), `stake` (what losing costs).
- `change` — **这一集改变了什么？** If the honest answer is "they discussed something", the
  episode is not strong enough. Relationship, task, secret or situation must move.
- `satisfaction` — `type` from the library below and `action`: the visible action that does it.
  A 爽点 is never a feeling; it is a document slammed on a table, a recording played, a crowd
  changing how they address someone.
- `hookType` — 身份 / 危机 / 结果 / 情感 / 反转 / 道具.

### 爽点类型库

| 类型 | 使用方法 | 可拍摄表现 |
| --- | --- | --- |
| 打脸 | 被看低后用证据、身份、能力或盟友即场反压 | 文件甩桌、监控播放、众人改口、反派失态 |
| 身份揭露 | 低位角色忽然暴露高位身份或关键关系 | 名片、印章、电话、车队、众人称呼转变 |
| 复仇 | 曾经伤害主角的人付出明确代价 | 合约作废、职位被撤、婚礼中断、假面被拆 |
| 强宠 | 权力角色公开选边站 | 挡刀、撑腰、牵手离场、公开承认关系 |
| 智商碾压 | 主角提前布局，反派自投罗网 | 反派说出的每句话都被录下或反成证据 |
| 情感释放 | 长期压抑的爱、恨、委屈或歉意终于爆发 | 含泪对峙、沉默拥抱、戒指落地、转身离开 |

### 钩子类型库

| 类型 | 典型情境 | 适用 |
| --- | --- | --- |
| 身份 | 「你叫她什么？她才是真正的……」 | 豪门、替身、真假千金、复仇 |
| 危机 | 门被踢开、主角被包围、证据被抢走 | 动作、悬疑、商战、家庭伦理 |
| 结果 | 比赛结果、亲子鉴定、合约判决即将公布 | 需要观众等答案的剧情 |
| 情感 | 一方告白、误会揭穿、选择二选一 | 甜宠、虐恋、婚恋 |
| 反转 | 观众刚以为赢了，真正幕后者出现 | 任何需要升级的中后段 |
| 道具 | 手机讯息、录音笔、戒指、遗嘱、诊断书出现 | 低成本高信息量 |

## 5. The 创作指引 — `outline.guideline` (gate `guideline`)

The top-level rule document of the drama. `render guideline` publishes it as its own dataset,
and **the skill re-reads it before writing any character, episode or storyboard** — that
discipline, not the fields, is what the reference skill is built on. `tone`,
`emotionalIntensity`, `dialogueStyle`, `visualStyle`, `productionLimits`, at least three
`forbidden` rules, three to five `priorities` (不可偏离重点). When the user changes a core
requirement — genre, register, episode length, the ending — the guideline changes first, then the
episodes.

## 6. Inside an episode — the formula (gate `rhythm`, stage 4)

The seconds below are the `short` format's. A `medium` episode hooks by 30 s and turns every
60 s; a `movie` part turns every 90 s and only the first part needs the cold open — `../../short-drama-core/reference/format.md`.

| 段落 | 目标 | 必须出现 | 检查问题 |
| --- | --- | --- | --- |
| 0–15 秒 | 立即留住观众 | 冲突、羞辱、危机、奇观、秘密、反转 | 观众不看上一集，是否仍会想继续看？ |
| 前 30 秒 | 建立本集任务 | 要做什么、阻力是谁、输了的代价 | 任务是否清楚？谁在阻止主角？ |
| 中段 | 推进主线与情绪 | 新信息、新阻碍、新反击、新误会、新选择 | 是否只是聊天？ |
| 最后 30 秒 | 迫观众追下一集 | 身份揭露、危机升级、结果悬念、情感选择、反转打脸 | 下一集是否非看不可？ |

In the JSON: `hookBeat` within `hookSeconds` (15) of cumulative time; beats that bring new
information / obstacle / counter / choice carry `turn: true`; the 爽点 is `satisfactionBeat`
(an action beat, or a line with an action beside it); the last beat is the cliff. The gate
measures the gaps hook → turns → 爽点 → cliff against `turnSeconds` (30).

**谈话 + 行动.** Dialogue is accompanied by a visible action, resistance, reaction or change
of pressure. Never more than `maxConsecutiveLines` (3) lines without an action beat; action beats
at least `minActionRatio` (35 %) of the line count.

| 规则 | 不合格写法 | 合格写法 |
| --- | --- | --- |
| 可拍摄 | 她心里很难过，想起多年委屈。 | △她捏皱鉴定报告，指节泛白，却没有掉泪。 |
| 有对抗 | 两人坐着解释背景。 | 一人要走，一人堵门；一人要藏证据，一人逼他交出。 |
| 台词短准 | 「其实这件事的前因后果是……」 | 「你早就知道，对吗？」 |
| 每集有进展 | 重复上一集吵架。 | 吵架导致证据曝光、关系破裂或新任务出现。 |

Words that are prose and not pictures (心想 / 内心 / 回忆起 / 脑海 / 感到无比 / 说不出的) are
refused by the `filmable` gate, as are inferred states (像是 / 似乎 / seems to) and more than
three hand verbs in one beat — see `craft-shots.md` §generability for why a video model cannot
perform them.

## 7. The character bible — `characters[].bible` (gates `bible`, `relationships`)

A bible answers three questions: **how did they become this, how do they act now, how will the
story force them to change or pay**. It is not a résumé.

Method, in order:

1. **剧情功能** — 主角 / 共同主角 / 反派 / 爱情线 / 导师 / 盟友 / 镜像 / 压力测试者 / 喜剧调节. Not
   the tier: a `support` character can be the 反派.
2. **一句话人物钩子** — 身份 + 核心矛盾 + 外在欲望 + 风险. "一个靠揭穿谎言成名的记者，却为保护女儿
   必须掩盖一宗真相。"
3. **Outside in** — the visible first (`profile.appearance`, `identityEn`, `speech`), then the
   wound, the misbelief, the want, the need.
4. **Want vs Need** — `want` is the concrete goal they chase on screen; `need` is the truth they
   must face; the gate refuses them being the same sentence. `misbelief` is the wrong world-view
   the wound taught them; `contradiction` is the tension they live in ("相信正义，但靠犯罪养家").
5. **Conflict map** — inner / interpersonal / task / social / moral; each becomes a scene.
6. **关系网** — for every important pair: `surface` (表面关系), `real` (真正关系), `power`
   (权力差), `secret`, `turnEpisode`. A relationship that is only a title has no drama in it.
   Somewhere in the cast there is a secret; that is where the reversals come from.
7. **微叙事小传** — `wound` (150–250 字: not the event, the choice they made and what they
   believed after) and `pastChoices` (≥ 2 for leads: when / pressure / choice / gained / lost /
   residue).
8. **Arc** — 开场 → 第一转折 → 中段 → 低谷 → 高潮选择 → 结局, each stage bound to an episode; a
   lead has at least three stages and the 高潮选择 is one of them.
9. **Scene tools** — `pressureResponse` (what the body does under pressure), `speech`
   (`rhythm`, `catchphrase`, `silence`, `forbiddenWords`, optional `register` override), three
   `forbidden` (things that break the character) and three `mustFace`.

| 错误 | 修正 |
| --- | --- |
| 人物只有背景，没有现在行动 | 加入外在目标、场景选择与赌注 |
| 人物很惨但不主动 | 设计角色在压力下的主动策略 |
| 缺点只是讨厌 | 改成角色如何阻碍自己 |
| 关系只有称谓 | 补上权力差、秘密、需求、欠债与转折 |
| 矛盾只是标签 | 让矛盾在至少三场戏中被测试 |
| 弧线只写“变成熟” | 写出具体新行为与付出的代价 |

`voice.videoDirection` and every line's `delivery` are written *from* `bible.speech` — the
rhythm, the way they go silent, the words they never use. `seed script` prints them in the
`seedNote` so they are in front of you while writing.

## 8. Writing order, per the reference skill

1. Save the user's brief and constraints (`source`, `params`, `register`).
2. `outline.brief` — the six judgements. Ask before inventing.
3. Characters: outline entries, then bibles and the relationship web.
4. `outline.structure`, `beats`, `guideline`.
5. `outline.episodes` — the 分集目录 (function / task / change / 爽点 / 钩子) before any synopsis.
6. Validate, sign off with the user, then episodes in batches.
7. Scripts, one at a time, re-reading `render guideline` and the speakers' bibles first.
8. `render script` — the 创作自检 table at the bottom is the reference's 16-point check; a green
   episode is 16/16 by construction, anything less names the row to fix.

Sources: 红果短剧官方《短剧编剧教程》节奏设计 (juben.pro), 知乎《如何从0到1成为短剧编剧》, 远见《两分钟一个钩子》,
Stage 32 *How To Develop Complex Characters*, September C. Fawkes *Want vs Need*, Writers Helping
Writers *Complex Characters and the Power of Contradiction*, Industrial Scripts *Conflict in a
Story*, Movie Outline *Unusual Character Relationships*, Writers in the Storm *Creating a Bible
for Characters*.
