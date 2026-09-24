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

## Polish (`render dialogue --ep N`)

When the user asks for a polish, when the dialogue is the visible weakness, or when the register
gate keeps noting the same scene: `render dialogue --ep 1` prints the 逐句校对表 (原句 / 问题 / 修改句 /
修改理由 / 导演／演员提示) with each speaker's speech rules in the last column. Fill it per
`dialogue-craft.md` §3, apply the changes to the flow, re-validate, and append the filled table to
the screenplay dataset under `## 对白校对`.

## Sync

```bash
$SD validate <project> --stage script --ep 1
$SD render <project> script --ep 1 > /tmp/E01-script.md      # 短剧 episode format + 创作自检
wji dataset new <story folder> "E01 剧本" -t screenplay -d "<hook>"        # bind --ep 1 wji.screenplayDatasetId
wji fs set <id> --merge content=@/tmp/E01-script.md --merge viewMode=content --merge metadata.shortDrama=@/tmp/E01.json
```

## Gates

`script-shape` · `beat-flow` · `duration` · `hook-cliff` · `beats-claimed` · `script-design` ·
`rhythm` · `filmable` · `dialogue-register` (advisory).

`render script` writes the reference's episode format — `△（from-to秒）` action lines with the
seconds derived, `角色（delivery）：line`, `【爽点标记】` after the 爽点, `【钩子标记】` at the end — and
closes with the 创作自检 table, eight questions answered from the same helpers the gates use. A
green episode is 16/16; a row that says 否 names what to fix.

## Dialogue performance pull-fit (Producer gate)

Before script green / any dialogue re-lock, Producer runs `../short-drama-core/reference/producer-dialogue-performance-qa.md` on **every** spoken line:

1. **對白有冇交代清楚** — emotional state/context at the moment of the line is established in `△` / surrounding beats.
2. **點樣演繹** — delivery specified (tone, physical state, intention — e.g. 怜香惜玉、半闭眼享受、破音尖叫).

FAIL → revise before green. This is recurring for all future episodes.

## Continuity & Blocking Pull-Fit (Producer gate)

Before script green, Producer runs `../short-drama-core/reference/producer-continuity-blocking-qa.md` **in parallel with** the Dialogue performance pull-fit:

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

