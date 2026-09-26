# Format — short drama, medium drama, movie (`params.format`)

The skill makes three kinds of work with **the same pipeline and the same story structure**: an
outline of units, a script per unit, a storyboard per unit, the sheets, the clips. What changes is
how long a unit is and the pulse it is held to.

| | `short` 短剧 | `medium` 中剧 | `movie` 电影 |
| --- | --- | --- | --- |
| unit | 集 (episode) | 集 (episode) | 段 (part) of one film |
| length | 1–3 min | 4–15 min | 3–8 min (≈ 5) |
| count | 30–100 | 10–40 | ≈ 18 for a 90-minute film |
| default ratio | 9:16 | 16:9 | 16:9 (21:9 for scope) |
| hook | a cold open every episode, on screen by 15 s | every episode, by 30 s | **the first part only**, by 60 s |
| turns | every 30 s | every 60 s | every 90 s |
| lines in a row | ≤ 3 | ≤ 4 | ≤ 5 |
| action beside dialogue | ≥ 35 % | ≥ 30 % | ≥ 25 % |
| cliff | every episode | every episode | at the act breaks (the end of golden and escalation); a part ends on a turn or a question |
| paywall logic | 卡点 at E8–12, ~E30 | the first cliffs of the season | none — the audience has paid for the whole film |

`init` reads the format from the genre (电影 / 微电影 / movie → `movie`, 中剧 / 横屏剧 → `medium`) or from
the length (over 3 minutes → `medium`); `--format` overrides it. The rhythm values above are
defaults: a project may still set `hookSeconds`, `turnSeconds`, `maxConsecutiveLines` or
`minActionRatio` itself. `validate` flags a unit length outside the format's range.

## What stays the same

- **The outline**: the brief (the six judgements), the three phases, the 创作指引, beats, and one
  outline unit per episode or part, each with its function, task, change, 爽点 and hook. In a movie,
  **golden / escalation / climax are acts one, two and three**, and each part's "hook" is the question
  or turn it hands to the next part.
- **The bibles, the script beats, 谈话+行动, filmability**, the storyboard, the canvases (one per unit),
  the references and the gates.
- **The looks, the action styles, the grammars, the composition and the story genres** — all of them.

## How the genre rules scale

The story-genre rules are mostly **shares of the run** (the turn at 25–45 %, the arch-nemesis at
80 %, the black moment at 70–90 %), which mean the same thing in every format. The few written as
counts ("a payback by E3", "no more than 3 episodes without sugar", "a breakthrough every 12") were
researched on 1–2-minute episodes, so they convert:

- **medium — by runtime.** Three 1.5-minute episodes are one 5-minute episode: "by E3" becomes "by
  E1", "every 12 episodes" becomes "every 4".
- **movie — by share of the film**, because a film is not paced like a paywalled series: "the first
  payback by E3" becomes "by 20 % of the film" (part 4 of 18), "at most 3 without sugar" becomes
  "at most ~20 %".
- **"long enough"** conditions (a rule that only applies to runs of 20+ episodes) compare runtime,
  so a 90-minute film or a 24 × 5-minute season qualifies.

Messages then speak of *units* rather than episodes. The comedy density converts by the minute
outside `short`: at least `0.8 × minutes` punchlines a unit for `slapstick` / `deadpan`,
`0.5 × minutes` otherwise (4 and 3 in a 5-minute unit).

## Medium drama (中剧)

The 4–15-minute episode (横屏微短剧 and the short series of the long-video platforms) keeps the 短剧
engine — a hook, turns, a 爽点, a cliff in every episode — with room to breathe:

- **Each episode has an A story and, from 8 minutes up, a B story**; two or three turns; the 爽点 in
  the back half; the cliff at the end.
- **Scenes can run longer** (a 90-second confrontation plays), but keep the turn every minute.
- **The season still front-loads**: the first three episodes build retention (the `episode-design`
  gate still checks E1 grabs, E2 proves the 爽点, E3 widens the line).
- **16:9** opens the frame: two-shots and wides carry more; the `composition` and `cinematography`
  guides apply as written.

## Movie in parts (电影)

A feature written as ~5-minute parts is still one story. Think of the parts as **sequences** — each
with a local goal, an obstacle and a turn — grouped into three acts:

| act | phase | share | what happens |
| --- | --- | --- | --- |
| 1 | golden | ~25–30 % | the opening image and the hook in part 1; the world and the want; the catalyst at ~10 %; the break into act two |
| 2 | escalation | ~45–50 % | fun and games — the genre's promise delivered; **the midpoint** at 50 % (a false win or a false loss, the stakes raised); the bad guys close in |
| 3 | climax | ~20–25 % | all is lost at ~75 %; the dark night; the finale that pays every plant; the closing image |

- **A part ends on a button, not a cliffhanger** — a turn, a decision, a question — except at the two
  act breaks, where the film does cliff. The part's `hookType` names what it hands on.
- **Plant and pay off across the whole film**: the mystery clue ledger, the revenge ladder, the
  romance milestones and the running gags all work on the film's parts exactly as on episodes.
- **The 爽点 per part** becomes the part's payoff — a small win, a reveal, a laugh, a scare — so a film
  written this way keeps the 短剧's density of payoffs without its cliff at every cut.
- **Production**: each part is still a unit of work — its own script file, its own storyboard (about
  twenty 15-second generations for 5 minutes), its own canvas. Continuity across parts is the same
  continuity across segments (`../../short-drama-storyboard/reference/craft-shots.md`), carried by the sheets.
- **The frame**: 16:9 by default, 21:9 for a scope film; the `art-first` composition suits cinema.

## Choosing

Ask at the parameters question. A vertical, paywalled, many-episode series is `short`; a
horizontal series of longer episodes is `medium`; a single story meant to be watched in one go is a
`movie`, whatever its length. When in doubt, ask where it will be released and how it will be
watched.
