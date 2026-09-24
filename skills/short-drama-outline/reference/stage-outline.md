# Stage 1 — Outline

Turn the source (novel, synopsis, or an original idea) into the structure everything else hangs
on: what stays, who is who, where the beats land, what happens each episode. **Skeleton before
episodes, sign-off between them.**

## Inputs

1. The source text the user pointed at — read it; never invent content from a title. If it is
   long, summarise per volume in a scratch file first and keep quotes for `keep[].evidence`.
2. The four parameters (episodes × minutes, genre, adapt mode, ratio) — already in `params`.
3. Preferences the user stated (keep this character, keep that scene) — honour them and record
   them in `outline.keep`.

## Order of work (the order is the method)

0. **Brief.** `outline.brief` — the six judgements of `craft-story.md` §1 (logline, audience,
   the 爽点 engine, the main hook, the pressures on both sides, the emotional line, the promise).
   A one-line idea is not enough to fill these; ask the user the focusing questions rather than
   inventing a genre. Then `params.register` (语体) if not given at `init`.
1. **Cut.** A short drama carries one main line and at most one sub-line. Everything else goes to
   `outline.cut` with a `why`. Any adapt mode other than `原创` / `忠实` must cut something.
   Write `cutNote`: what the story's endpoint becomes after the cuts.
2. **Merge people.** Characters with the same function become one face. Then tier them:
   `lead` (1–5, the protagonists and main antagonist, `arc` required), `support` (≤10, named
   secondary characters, `arc` required), `functional` (≤10, a role label as the name, no arc).
   Unnamed background people are not listed. Write `mergeNote`: why these are the leads.
   A character who hides who they are until a reveal (the villain under a false name) gets
   `disguise: { name, revealEpisode }` — the episode documents use the disguise name until then.
3. **Collect scenes.** Primary scenes are capped at `4 + ⌈episodes/10⌉` (5–15) — generated scenes
   are cheap, but every extra one is another consistency asset to maintain. A scene used in only
   one episode needs a `reusePlan` (which existing environment it derives from, what changes) or
   becomes a `variantOf` in Stage 3.
4. **Place the beats (爽点).** Majors first — where the big reveals land — then minors to fill.
   Rules: adjacent beats ≤ `maxBeatGap` (3) episodes apart, a beat in episode 1, a beat in the
   finale, at least one major, and the first major never on the last episode. `type` follows the
   genre (打脸 / 揭破 / 反转 / 逆袭 / 认亲 …).
5. **Pick the narrative props.** After the beats, not before — a prop is a prop because it carries a
   beat. Test: *if it broke, got lost or was swapped, would the plot collapse?* Yes → `props[]`
   with `function` and `beatIds`. No → set dressing; it becomes a scene anchor in Stage 3. At most
   8.
6. **Structure and guideline.** `outline.structure` — golden / escalation / climax with episode
   ranges (first ~20 % / ~50 % / ~30 %; `craft-story.md` §2) and a task, 爽点 plan and hook plan
   each. `outline.guideline` — the 创作指引: tone, emotional intensity, dialogue style, visual
   style, production limits, ≥ 3 forbidden rules, 3–5 priorities. It is the document every later
   stage re-reads (`render guideline`), so write it as rules, not as a summary.

Run `validate --stage outline` now. The `episodes` gate will fail (no episodes yet) — every other
gate should pass before you show the skeleton.

## Sign-off ⛔

Show the user, in plain language: the lines cut, the people merged, the episode of each major beat.
Wait for a yes. Change the skeleton on their feedback and validate again.

## Episodes (batches of ≤10)

Design first, prose second. Per episode the 分集目录 fields: `function` (开局钩子 / 冲突升级 /
身份揭露 / 情感推进 / 大反转 / 清算收束), `task` (`goal` / `obstacle` / `stake`), `change` (这一集改变了
什么 — one sentence; "they talked" means the episode is not strong enough), `satisfaction`
(`type` from the 爽点 library + the visible `action` that does it), `hookType` (身份 / 危机 / 结果 /
情感 / 反转 / 道具). The first three episodes are the retention window: 1 grabs (开局钩子), 2 proves
the 爽点 (its type is the brief's engine), 3 widens the line (冲突升级 / 身份揭露 / 大反转); the finale
includes 清算收束 or 大反转. Then `synopsis` (narrative prose — a quotation mark means you are writing dialogue, which
is Stage 4's job), `hook` (the question that makes them tap the next episode), `suspense` (what is
still buried), `sceneIds`, `characterIds`, `propIds`, `crowdPlan` when three or more characters
appear (how the group is staged: who is foreground, who is over-the-shoulder, or "never in one
frame — separate scenes"), and `warnings` from the fixed list (雨戏 / 肢体接触 / 人群 / 手部特写 —
the things video models get wrong; over-report).

A beat placed on an episode must actually happen in that episode's synopsis. Every character,
scene and prop must be used somewhere — `refs` will name the idle ones.

## Sync

```bash
$SD render <project> outline > /tmp/outline.md
wji dataset new <story folder> "<title> 大纲" -t outline -d "<core sentence>"      # once; bind wji.outlineDatasetId
wji fs set <id> --merge content=@/tmp/outline.md --merge viewMode=content \
  --merge metadata.shortDrama=@/tmp/outline.json                                  # outline block + params
$SD render <project> guideline > /tmp/guideline.md
wji dataset new <story folder> "<title> 创作指引" -t outline -d "<logline>"        # once; bind wji.guidelineDatasetId
wji fs set <id> --merge content=@/tmp/guideline.md --merge viewMode=content \
  --merge metadata.shortDrama=@/tmp/guideline.json                                # {brief, structure, guideline, register}
```

The 创作指引 is its own dataset because it is the thing to open first, every time — before a
character, an episode or a storyboard, print `render guideline` and read it.

Re-run the same `fs set` after every outline change; the dataset is a view of `project.json`.

## Gates (what `validate --stage outline` checks)

`params` · `brief` · `structure` · `guideline` · `adaptation` · `tiers` · `scenes` · `props-cap` ·
`beats` · `episodes` · `episode-design` · `refs` — see the gate labels in the output; each failure
names the entity and the fix.

## Rhythm for a short drama

A 短劇 episode is paced by its 爽点, not its minutes: plan **one beat per 30–45 s** plus the
cliff, so a 1-minute episode carries 1–2 beats and a 90-second one 2–3 (the gates only demand one
per episode and a gap ≤ 3 — the rhythm is on you). Put the hook's image inside the first three
script beats, a beat near the midpoint, and let the cliff be the last thing on screen. Adding beats
to an existing episode is fine — append new ids (`B11`, `B12`), never renumber, and list them in
that episode's `beatsClaimed`.
