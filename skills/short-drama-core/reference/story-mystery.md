# Story genre `mystery` — 悬疑

推理 · 刑侦 · 悬疑复仇 · 惊悚. In 短剧 the pure puzzle is rare and hard to sell (红果's 悬疑推理
category drew 200+ titles, very few past 5,000万 heat); the hits **blend suspense with an emotional
payoff** — 《引她入室》 is a family revenge story in a suspense frame. So the default here is
悬疑 + 复仇 / 身份 爽点, with clue-solving as the way the 智商碾压 or the 身份揭露 is delivered.
Shared machinery: `story.md`.

## 1. The promise — curiosity, dread, the click

- **Three pleasures**: curiosity (what happened, who did it), dread (what will happen, when), and
  the click — the answer was in plain view all along.
- **Who knows what** (McKee): mystery (the characters know more → curiosity), suspense (both know
  the same → worry), dramatic irony (the audience knows more → dread).
- **Hitchcock's bomb under the table**: surprise buys 15 seconds; showing the bomb and the clock
  buys 15 minutes. **Keep the central whodunit a mystery, but run most episodes as suspense or
  irony** — the audience sees the threat and the clock, the character does not. Irony delivers
  tension in 60 seconds; a pure puzzle needs setup time the format does not have.

## 2. The series — one question, layered secrets

- **Play the cards early.** Plant every 梗 and 伏笔 in roughly the first 30 episodes and use the
  rest to decode them. The first ten are the golden window: the main line, the core hook, and
  "what kind of story this is".
- **A central question over everything, small questions that last an episode or two** ("a ball of
  questions rolling"). Each answer exposes a deeper question.
- **逻辑闭环**: every step from the crime to the solution is explained, and every detail the
  investigator uses was set up earlier.
- **Case-of-the-week plus a through-line** works (《朱雀堂》: each case closes, the main-line
  伏笔 accumulate); so does a jigsaw of timelines (《漫长的季节》, the two lines merging at the end of
  episode 1 to pay off the device early).

| phase | what |
| --- | --- |
| golden (~E1–10) | the inciting crime or secret in E1; the **central question stated by E3**; the investigator, the victim and all major suspects — **the culprit included** — on screen; a first small question answered by E3; a layer-2 reversal at the paywall |
| escalation | layered secrets; false suspects rise and fall; a **midpoint twist at 40–60 %** that reframes known clues rather than adding new ones |
| climax | the central truth, **assembled from planted clues**, at 80 % or later; the justice or revenge payoff; 1–3 episodes of aftermath |

**Tracked in the outline** (gate `story-mystery`):
- `outline.mysteryMode`: `whodunit` (default) · `inverted` (the audience knows the culprit — the
  question is how they will be exposed) · `thriller` (a threat, not a puzzle: no culprit rule).
- `outline.questions[]: { id, layer: 1 central / 2 major / 3 local, question, openEp, answerEp, clues[] }`.
- `outline.clues[]: { id, kind: true / red-herring, what, plantEp, prop?, echoEps[], dismissedEp? }`.
- `characters[].mysteryRole` (`investigator` `culprit` `accomplice` `suspect` `unreliable-ally`
  `victim` `witness`) and `firstEp`.

**The rules** (researched defaults, waivable on the user's request):

| rule | default | why |
| --- | --- | --- |
| `central-question` | exactly one layer-1 question, opened by E3, answered at ≥ 80 % (runs ≥ 10) | the golden window; the truth in the climax |
| `culprit-early` | exactly one culprit, first on screen by E5 / the golden phase (never after 30 %) | Knox 1, Van Dine: the culprit appears early and plays a real part |
| `clue-count` | an answered question has ≥ 3 true clues (layer 1), ≥ 2 (layer 2), ≥ 1 (layer 3) | fair play: every clue to the solution is shown first |
| `clue-lead` | a clue is planted ≥ 1 episode before a local answer, ≥ 3 before a major one, ≥ max(10, 15 %) before the central one; one central clue in the golden phase | too close and they see it coming; too far and they forget |
| `clue-echo` | a clue planted more than 20 episodes before its payoff is echoed within 15 episodes of it | fragmented viewers need a reminder |
| `red-herrings` | fewer red herrings than true clues; each dismissed before the truth | too many and the audience feels tricked, not tested |
| `open-questions` | at most 6 open at any episode | the fragment viewer is lost past that |
| `clue-on-screen` (script) | the beat that plants a clue is marked `clue: "K1"` in its plant episode | a clue is something the camera shows, never narration |

`story-advice` also notes a whodunit with fewer than 3 or more than 5 viable suspects and 反转
cliffs above 35 % (twist fatigue).

## 3. The episode

- Conflict or a reversal within 15 s, the story moving by 30 s, a suspense beat in the last 10 s;
  95 of 100 endings leave a hook. 红果 asks for three hooks a minute in the first 30 % of a 拉新
  drama.
- **Answer one, open one or two.** Each episode closes or partly answers a small question and
  opens or escalates another. Quality over quantity; alternate 紧张 and 松口气.
- **Hooks** (红果 tutorial): an unfinished accusation; an identity hint ("你真以为我不知道你是
  谁？"); a deadline; the cut at the instant emotion erupts; an unexpected figure; **a familiar face
  flashing across a CCTV frame**.
- **Cliffs** by hook type: 身份 (the anonymous helper is…), 危机 (the bomb clock), 道具 (a clue object
  where it should not be), 反转 (an accepted fact overturned), 结果 (the body, the test result),
  情感 (the ally is lying).

## 4. Characters and suspicion

- **The investigator** has a distinctive skill or persona and solves the case through their own
  reasoning on shown clues; in 悬疑复仇 it is often the wronged protagonist.
- **The culprit** appears early, is someone the audience cares about, is not obvious, and their
  thoughts are **never shown** (no inner voice from the culprit before the truth). One mastermind;
  helpers are accomplices.
- **3–5 viable suspects**, each with motive, means and opportunity on screen. Rotate the prime
  suspect ("前一刻认定的凶手，下一刻可能因新证据被推翻"). Give the real culprit one fair moment of
  suspicion, then clear them with an explanation that is plausible and false.
- **The unreliable ally** — the helper with a hidden agenda — is the standard 反转 engine.

## 5. Clue craft

- **Fair play**: every clue leading to the solution is shown before the reveal; the investigator
  uses nothing the audience has not seen; no supernatural agency or unknown poisons unless the
  genre says so (Knox, Van Dine).
- **Chekhov**: every prop, skill or line introduced is a promise — pay it off or cut it.
- **Hide in plain sight**: plant the true clue inside a beat that is doing something else (a 爽点
  slap, an argument), in the background of a wide shot, or with an innocent explanation (the ring's
  "flaw" read as marital symbolism). Bury it fourth in a list. **Red herrings may get the
  close-up; true clues usually should not at the plant.**
- **Pay off with a close-up and a flashback insert**, so fragmented viewers reconnect it. On the
  storyboard the plant is often an `evidence` cut in a wide, the payoff an `evidence` close-up.
- **Name puns** (吴池 = 无耻, 郑萋 = 正妻) are cheap, legible foreshadowing that suits 短剧.

## 6. Dialogue and tone

Separate what each character **knows** from what they can **prove**; every interrogation question
is a thrust, not a static Q&A. Subtext is want or fear expressed indirectly, carried by the body.
**悬疑创作是克制的艺术**: concrete details, no overflowing emotion. Characters withhold for a
reason of their own, never because the writer needs a delay; every lie told on screen can later
be caught against something already shown. "笑着去讲悲伤的故事" hits harder than heavy lines.

## 7. What fails

强行反转 and 降智 characters; twists for show; the mystery box that never pays off; 高开低走 (a big
opening that collapses); a clue the audience never saw, a late culprit, a supernatural solution;
too many red herrings; relentless intensity with no character growth; too many characters too
early.

## 8. Sources (read as search summaries)

腾讯 / 搜狐 on 逻辑闭环 and clue density; 新浪 (producer 陈璐); 流媒体网 on the 红果 悬疑 category, 古装
悬疑 craft (《朱雀堂》) and 卡点; 腾讯 / CSDN "all cards in the first 30 episodes"; 红果 tutorial 06
(hooks) and 编剧第一课 (3 hooks a minute); 搜狐 (张静思); 电影界 / 百度百科 on 《引她入室》; 网易 / 知乎 on
《漫长的季节》; 界面 (潘依然, 《隐秘的角落》); 知乎 (点灯) on restraint and 高开低走; DataEye 2025; 澎湃 on
红果 2025; Hitchcock / Truffaut and Bordwell on the bomb; Knox's commandments; Van Dine's rules;
McKee on mystery vs suspense; StudioBinder and iwrity on Chekhov's gun; Writer's Digest and The
Write Practice on clues and red herrings; nailyournovel on the ball of questions; InkTip and
Filmustage on vertical drama; interrogation craft (StudioBinder, Bang2write); 文汇报 on 全程高能.
