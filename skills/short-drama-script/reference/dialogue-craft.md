# Dialogue craft — lines as action, in the right 语体

Distilled from the user's `w-film-dialogue-editor` skill. Read it before writing a script's
lines and before any polish pass (`render dialogue --ep N`). What can be checked is the
**advisory** `dialogue-register` gate — it reports, it never blocks, because a 穿越 character
speaking 古装 in a modern drama is right, not wrong.

## 1. A line is an action under pressure

Not "what would they say", but: what do they want *right now*, how does the other person block
it, why do they not say the true thing, and is the situation different after the line. A line
that does not push the plot, reveal the person, change the relationship, create conflict, carry
the theme or set a rhythm is cut.

| 维度 | 判断问题 | 常见问题 | 修改方向 |
| --- | --- | --- | --- |
| 戏剧功能 | 这句话推动剧情、揭露角色、改变关系或制造冲突吗？ | 交代资料、重复情绪、填空 | 删除、压缩，或改成令对方必须回应的行动 |
| 角色声音 | 遮住名字，还认得出是谁在说吗？ | 所有人同声同气 | 按年龄、阶层、职业、教育、地域、亲密距离改 |
| 潜台词 | 真正想说的有没有藏起来？ | 太直白、太解释 | 试探、否认、迂回、玩笑、攻击、照顾动作或沉默 |
| 资讯处理 | 熟人是否在互相解释已知的事？ | exposition 太方便 | 把资料藏入控诉、责任、交易、威胁、笑话或选择 |
| 节奏 | 有停顿、打断和反应吗？ | 每句完整说明 | 删短、拆句、加反应 |
| 可拍摄性 | 演员能用行动演出来吗？ | 只有心理描述 | 可演动词：逼、哄、避、试探、挑衅、求饶 |

Order of work: structure and function first, then voice, then tone words last. A scene with no
goal, obstacle or turn is not saved by natural-sounding lines.

**`delivery` is an action verb, not an emotion.** `（压着嗓子）`, `（明知故问，带着笑）`, `（逼）`,
`（哄）` — never a bare `（生气）`. The gate notes an emotion-only delivery. The same parenthetical
feeds two places downstream: the storyboard's visible performance state and the video prompt's
speech direction; both derive from it, neither invents a new emotion.

Producer **pull-fit** (blocking, all future scripts): every line must also pass `../short-drama-core/reference/producer-dialogue-performance-qa.md` — (1) emotional context established around the line; (2) concrete 點樣演繹 delivery. Bare emotion tags fail.

## 2. 语体 — `params.register`

Decide it once (`init --register`), per character override in `bible.speech.register`. It also
sets the accent the video model is told to speak when `speechAccent` is empty.

### 粤语／港式

Not written Chinese with 啦 sprinkled on. Age, class, job, education, family language, power
position and closeness decide the particles, the swearing, the English mixed in, the short
sentences and the silences. 短、快、准、狠, 笑中有痛 — but every 金句 grows from the person and the
moment. Do not pile 啦、喇、啫、咋、喎、噃、吖嘛; each one marks an attitude. The gate notes a 粤语
drama where fewer than half the lines of a scene carry a Cantonese marker (咗 嘅 唔 冇 哋 喺 嚟 嗰
啲 咁 乜 佢 睇 諗 …) — that is the 书面中文硬转 smell.

### 大陆普通话

Layered by region, generation and trade, not 播音腔. Particles 啊、呀、吧、嘛、呢、啦、唄、咯、嘞、嗎
mark attitude; 儿化音 only on northern characters. Net slang (卧槽、绝了、破防、emo、整活、麻了、家人们
…) belongs to the 90后／00后 — the gate notes it on anyone whose `ageRange` reads forty or
over. Workplace / 海归 characters mix English (OKR、deadline、卷、躺平) only when it fits. Regional
accents (京片子、东北、川渝、沪普、粤普) are a tag on a few characters, never the whole cast.

### 台湾国语

Softer and rounder: 啊、欸、耶、啦、嘛、嘞、喔、囉、哦、吼、餒; sentence ends 的啦／好不好／是不是／对不对.
Keep 就、然后、其实、真的 from becoming filler. Light English (OK、no、yeah、sorry、case), 闽南语／客语
as identity marks (歹势、阿娘喂、靠北、冲啥小、夭寿喔). Not written Chinese plus 啦.

### 港式普通话

Cantonese syntax leaking through (量词错位「一位朋友」, 后置副词「先」「过」), more English than
mainland speech, particles mixed (啦／囉／嘛／呢／嘅), flat tone. It surfaces when the character is
tired or irritated — not every line, or it reads as a joke.

### 古装／年代

白话 base plus period vocabulary, never 文言. Forms of address by power position (大人、老爷、夫人、
姑娘、公子、在下、卑职、奴婢、本宫、朕、孤). No modern words — OK、没问题、搞定、紧张、压力、约会、上班、项目、
团队、套路 (the gate notes them), no net slang, no Cantonese particles. 年代: 民国 (先生、太太、洋行、
跑街、堂倌), 早期共和国 (同志、单位、组织、批判), 80–90 年代 (万元户、下海、大哥大、BP 机、的士).

### English (美式 main axis, 英式 for authority and threat)

Four hard rules. **Short** — a native actor's line averages 7–12 words; over 20 needs a reason
(the gate notes it). **Contractions are the default** — `I am / do not / cannot / going to` mark
emphasis, formality, threat or a non-native speaker (noted). **Subtext by deflection, not
adjectives** — "I hate you!" is soap opera; the hot scene is the understated one. **Names are
heavy** — English speakers address each other by name once or twice a scene, as a warning,
comfort, pressure or plea (the gate notes more than `maxNameCallsPerScene`). Pauses go in action
lines (`△ She doesn't answer.`), `--` is an interruption from outside, `...` is trailing off inside.

Chinese → English is **transcreation, not translation**: keep the scene goal, the strategies and
the turn; rewrite the surface. Traps: 句句带称谓, 职衔直译 (Boss Wang / Teacher Li), 情绪直述, 反问句
密集, 客套敬语, 成语直译, 主语省略, 语气词 (呵／哼／唉 → action line), 解释型台词, 集体主语 (我们女人).
Check by reading the English with the names covered: if it sounds like subtitles or a TED talk,
it is not done.

American register comes from three axes — class/education, region, community — one or two per
character, General American under it. British English in an American drama is the polite threat
("That's interesting." = I disagree; "With the greatest respect…" = you are an idiot); switch
whole vocabularies (flat / trainers / mobile / queue / holiday), never half. Generation slang has
a 6–18-month half-life: two or three signature words per character, no more. Platform swearing:
vertical short drama allows damn / hell / ass / limited bitch, avoids the f-word; the first three
seconds are clean.

## 3. The polish pass — `render dialogue --ep N`

Produces the reference's 逐句校对表: 原句 filled, 问题 / 修改句 / 修改理由 / 导演／演员提示 to fill,
with each speaker's `bible.speech` summary in the last column. Levels: 轻修 (keep the sentence,
fix tone, rhythm, filler), 中修 (restructure, cut explanation, sharpen the attack and defence),
重修 (re-design the beats and strategies, keep the story intent). Do it when the user asks, when
dialogue is the visible weakness, or when the register gate keeps noting the same scene. The
filled table is appended to the screenplay dataset under `## 对白校对`.

| 原句 | 问题 | 修改句 | 修改理由 |
| --- | --- | --- | --- |
| 我很生气，因为你五年前害死我弟弟。 | 情绪和背景太直白 | 你每年今日都买花，是买给他，还是买给你自己好过点？ | 背景藏入控诉，角色不是解释，是攻击 |
| 我爱你，所以我希望你不要走。 | 情绪直接，缺少防卫 | 外面下雨。把伞拿上再走。 | 照顾动作代替表白 |
| 我不信任你。 | 太概念化 | 你今晚的电话，又刚好没电？ | 具体质疑，可演 |

Director notes are playable actions: "你不是解释，你是在逼对方认错", "这句停半拍，因为角色在决定是否把真
正的话吞回去" — never "自然一点".

## 4. Before delivery

Shorter, more purposeful, more the person, more subtext, easier to play — and not everyone
sounding the same. Read the 粤语 aloud; check the 普通话 for the right particles and no 串味
between 大陆 / 台湾 / 港式; check 古装 for modern words; check English for contractions, name
density, length, emotion declarations and consistent nationality.

