# Stage 4 — Script

One episode per task, batches of ≤3 episodes before moving on — the script is the layer that gets
rewritten most; small batches fail cheaply. **The script handles drama; the storyboard handles
shooting** — no shot numbers, no camera, no prompts here.

## Start from the seed

```bash
$SD seed <project> script --ep 1
```

`episodes/E01.json` now has `targetSeconds`, an empty `hook` (the opening image — yours to write),
`cliff` (seeded from the outline's `hook`: the question that makes them tap the next episode),
`beatsClaimed`, `hookBeat: [1, 1]`,
the episode design copied from the outline (`function`, `task`, `change`, `hookType`),
`satisfactionBeat: null` (to be set) and a `seedNote` with the synopsis, the 爽点 to realise, the
register, the outline's `suspense`, the guideline's priorities and forbidden rules, every speaker's
`bible.speech` (under the disguise name before a `disguise.revealEpisode`), the ids
allowed in this episode, the crowd plan, the warnings, the previous episode's cliff and the beat
budget. **Before writing: `render guideline`, then the scene bibles (anchors, lighting states) and
the speakers' `render character` — the bible's `speech` is where the lines come from** (see
`dialogue-craft.md`). Delete `seedNote` when the scenes are written.

`seedNote.dialogue` points at the user's dialogue skill, **`w-film-dialogue-editor`** (installed
beside this one): the revision framework, the language guide of every 语体 in the episode
(`lang-zh-hk.md`, `lang-zh-cn.md`, `lang-zh-tw.md`, `lang-zh-hk-mandarin.md`, `lang-zh-period.md`,
`lang-en.md`) and, per speaker, the corpus query for someone of their age:

```bash
node <skills>/w-film-dialogue-editor/scripts/ref.mjs --lang zh-hk list --age young --limit 30
node <skills>/w-film-dialogue-editor/scripts/ref.mjs --lang zh-hk search 搞掂       # one word
```

Read the guide before writing the first line and pull phrasing from the corpus — particles, slang,
swearing levels and trade talk come from there, never from memory. The corpus is a vocabulary of
real usage, not lines to paste: a line still grows from the person and the moment.

## Hard rules (all gated)

1. **The duration budget is the wall.** Lines cost `chars ÷ 4.5` s, action beats 2.5 s; the
   episode must land within ±15 % of `targetSeconds`. 60 s ≈ 18–22 beats, 120 s ≈ 35, 180 s ≈ 50.
   Over: cut action beats first. Under: add conflict, never small talk.
2. **One line, one breath**: ≤ 35 non-whitespace characters. Split long lines with a reaction
   beat in between.
3. **Speakers are in the scene** (`characters`), or `VO` (inner voice — whose, in `delivery`, by
   pronoun or role: 她的心声, never a name — in a Chinese (`wan`) prompt the delivery is pasted beside
   the line, and `beat-flow` refuses a delivery that names anyone).
   VO is emphasis, not a crutch: two or three per episode at most.
4. **Action beats: one thing each, narrative, common actions only, no quotation marks.** The video
   model performs actions it has seen a million times — walk in, sit down, hand over, nod, turn,
   grab, hold tight. Precise physical interactions (block a pole with an oar), micro-expressions
   (lashes tremble), inch-level moves, metaphors — rewrite or delete. Drama comes from the
   *combination and timing* of ordinary actions.
5. **Every scene has an action beat.** Three lines with nothing happening is radio.
6. **Cold open.** The hook's concrete image is on screen within the first 3 beats (`hookBeat`
   points at it; gated) and it is *in motion* — running with the suitcase, not a still close-up of
   it. Static detail close-ups belong to the second appearance.
7. **The last beat is the cliff** — an unfinished sentence, an unexplained action, a sound with no
   source. `cliff` describes the effect; the flow delivers it.
8. **Claimed beats are performed.** Each id in `beatsClaimed` (seeded from the outline) needs a run
   of consecutive beats that actually realises setup → payoff.
9. **The 短剧 rhythm** (`rhythm`): the hook image by `hookSeconds` (15 s) of cumulative time; a
   turn — new information, an obstacle, a counter, a choice — at least every `turnSeconds` (30 s),
   marked `turn: true` on the beat; the 爽点 (`satisfactionBeat`) after the hook, before the last
   beat, on an action beat or a line with an action beside it; never more than
   `maxConsecutiveLines` (3) lines in a row; action beats at least `minActionRatio` (35 %) of the
   lines. The seconds come from the same duration math as the budget.
10. **The design is realised** (`script-design`): `function`, `task`, `change`, `hookType` equal
    the outline episode's; the 爽点 type the outline promised is what `satisfactionBeat` delivers.
11. **Filmable** (`filmable`): no 心想 / 内心 / 回忆起 / 脑海, no 像是 / 似乎 / seems to, no more than
    three hand verbs in a beat (`craft-shots.md` §generability).
12. **The register** (`dialogue-register`, advisory): lines match `params.register` — Cantonese
    markers only in 粤语, no modern words in 古装, no net slang on the middle-aged, English short and
    contracted with names used sparingly. It reports and never blocks; a character who breaks the
    register on purpose gets `bible.speech.register`.

Scene fields: `sceneId` and `lighting` must exist upstream (a new lighting state is added to the
scene in `project.json` first, never bypassed), `characters` / `props` ⊆ the outline's ids for
this episode.


## Editing discipline


- **Change one beat, re-read three.** Position, who holds the prop, who is present — spatial state
  lives in your head while writing and vanishes while editing. Re-reading the neighbours is the
  only way to get it back.
- **A picture change is a sound change** downstream — remember it when the storyboard exists.

## Genre markers (gate `story-script`)

- **Mystery**: the beat that plants a clue carries `clue: "K1"` (or a list) in the clue's plant
  episode — a clue is something the camera shows, never narration. Plant it inside a beat doing
  something else (`../../short-drama-core/reference/story-mystery.md` §5).
- **Comedy**: `gag: setup` where a joke is planted, `gag: build` for the repeats of a rule of three,
  `gag: punchline` where it lands (at least 2–3 an episode), `runningGag: "G1"` on a callback. Every
  punchline has a setup before it (or calls back a running gag); a punchline line is ≤ 20 字 and
  ends on the funny word (`../../short-drama-core/reference/story-comedy.md`).

## Feel (not gated, decides whether it plays)

Short lines, dense action: an action or reaction every two or three lines, never four lines in a
row. Subtext goes in `delivery` ("says sit, doesn't move"), not spoken. Stage groups per the
outline's `crowdPlan`. Scene changes are free for the generator but cost the viewer — tighten one
scene rather than hopping four.

| Fault | Symptom | Fix |
| --- | --- | --- |
| radio play | lines only | insert a visual action every 2–3 lines |
| literary | actions as prose (oar blocks the pole, lashes tremble) | common actions |
| dead opening | first beat is a still close-up | give the same image in motion |
| space jump | on the path, next beat on the pier | add the crossing beat; re-read three |
| padding | greetings, tea, directions | delete; every beat advances or flips |
| speech | one person, four lines | split to the partner or break with action |
| omniscience | lines explain everything | move information into action and delivery |
| flat ending | ends calm | last beat becomes the cliff, even just a whistle |

## Dialogue review — required after the script (`dialogue-review`)

A script is not done when its structural gates are green: every line is then reviewed against the
语体 guide, the way `w-film-dialogue-editor` reviews a scene, and the review is kept in the episode.
The storyboard stage cannot start until it is (`validate --stage storyboard` runs the script gates
too). `params.dialogueReview: off` skips it — only when the user asks.

```bash
$SD seed  <project> dialogue --ep 1   # dialogueReview: one row per line + the guides to read
$SD apply <project> dialogue --ep 1   # write the revised lines (and deliveries) into the flow
$SD validate <project> --stage script --ep 1
$SD render <project> dialogue --ep 1  # the filled 对白校对 table
```

1. **Read** the framework (`references/dialogue_revision_framework.md`) and the guide of every 语体
   `seed dialogue` prints; query the corpus for each speaker it lists.
2. **Diagnose the episode first** (`diagnosis`: `goal` 场面目标, `conflict` 主要冲突, `subtext` 潜台词核心,
   `voice` 角色声音问题, `rhythm` 节奏问题) and pick `level` 轻修 / 中修 / 重修. A scene with no goal,
   obstacle or turn is a script problem — fix the beats, not the words.
3. **Every row**: `issue` (the problem, or `无：<why it stands>`), `revised` (the new line, or the
   same line), `reason` when it changed, `note` — the 导演／演员提示 as a playable action
   ("你不是解释，你是在逼对方认错"), never a mood (自然一点 / 生气 are refused). A row may set
   `delivery` to replace the beat's parenthetical.
4. **`selfCheck`**: the guide's 自检清单 (its 快速自檢 / 檢查清單 section; `lang-zh-hk.md` has none —
   for 粤语 use its §九 常見錯誤 plus the 品質檢查 in the skill's SKILL.md), item by item
   (`{ item, ok, note }`, at least three); an item that fails says why it stands or the lines are
   fixed.
5. `apply dialogue`, then re-validate — a shorter or longer line moves the duration and the dialogue
   fit downstream.

Editing a line later reopens it: the gate compares every row's `revised` with the script, so a
changed line fails until it is reviewed again. `seed dialogue` re-run keeps the rows of unchanged
lines and opens only the moved ones (`--force` resets them all). Cutting or adding a line is done in
the flow first, then re-seed.

The gate checks: a review exists, the level, all five diagnosis fields, the guide of every speaker's
语体 listed in `guides`, one row per line and none for a beat that is not a line, the revision
applied, an issue on every row, a reason on every change, a playable note on every row, and the
self-check. `render dialogue` prints the filled table — append it to the screenplay dataset under
`## 对白校对`; `render script`'s 创作自检 gains the row 对白是否已按语体 guide 逐句校对.

## Sync

```bash
$SD validate <project> --stage script --ep 1
$SD render <project> script --ep 1 > /tmp/E01-script.md      # 短剧 episode format + 创作自检
wji dataset new <story folder> "E01 剧本" -t screenplay -d "<hook>"        # bind --ep 1 wji.screenplayDatasetId
wji fs set <id> --merge content=@/tmp/E01-script.md --merge viewMode=content --merge metadata.shortDrama=@/tmp/E01.json
```

## Gates

`script-shape` · `beat-flow` · `duration` · `hook-cliff` · `beats-claimed` · `script-design` ·
`rhythm` · `filmable` · `dialogue-review` · `dialogue-register` (advisory).

`render script` writes the reference's episode format — `△（from-to秒）` action lines with the
seconds derived, `角色（delivery）：line`, `【爽点标记】` after the 爽点, `【钩子标记】` at the end — and
closes with the 创作自检 table, nine questions answered from the same helpers the gates use (the
ninth is the dialogue review; eight with `dialogueReview: off`). A green episode is 18/18; a row
that says 否 names what to fix.

## Dialogue performance pull-fit (Producer gate)

Before script green / any dialogue re-lock, Producer runs `../../short-drama-core/reference/producer-dialogue-performance-qa.md` on **every** spoken line:

1. **對白有冇交代清楚** — emotional state/context at the moment of the line is established in `△` / surrounding beats.
2. **點樣演繹** — delivery specified (tone, physical state, intention — e.g. 怜香惜玉、半闭眼享受、破音尖叫).

FAIL → revise before green. This is recurring for all future episodes.

## Continuity & Blocking Pull-Fit (Producer gate)

Before script green, Producer runs `../../short-drama-core/reference/producer-continuity-blocking-qa.md` **in parallel with** the Dialogue performance pull-fit:

- Character position transitions explicitly bridged (坐→跪, 站→跪, 拖起, 扳转…) — no silent jumps
- Relative sit/stand places clear each beat
- Props pre-placed early and tracked to final use
- No character vanishes without stated exit/hide/re-entry
- Every physical action has a connecting movement beat

Severity: **P0** blocks greening and burning; **P1** before burn; **P2** when convenient.

### Screenwriter reminder (every physical beat)

When writing any physical beat, **always** include:

1. **Entry movement** into the new position (how they get to kneel / stand / sit / cross the room)
2. **Exit / next-bridge** out of that position when the next beat needs a different pose
3. **Prop track** — first visible placement before first use; handoff/hold/insert state until last frame that needs it

