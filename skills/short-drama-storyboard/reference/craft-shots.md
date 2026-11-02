# Shot craft — how a cut earns its place

The method behind the storyboard fields added to stage 5, distilled from the user's
`short-drama-storyboard` skill. It applies in **both** reference modes: in `keyframes` the frame
becomes an image, in `sheets` it is the shot's description inside the segment prompt — either
way the cut carries the same shot grammar, and `prompt segment` composes it. What can be checked
is a gate, named per section; the rest is judgement.

## 1. A cut has one job — `purpose` (gate `shot-purpose`)

A cut exists to change what the audience knows, who holds power, the pressure in the room, the
space, or the rhythm. "Medium shot of her talking" is not a purpose. Design in this order:

1. find the key action in the beats the cut claims — an act, a line, a discovery, a refusal, a
   hand-over, a reveal;
2. say what changes for the audience or a character because of it (`purpose.change`);
3. decide whose experience the picture is organised from;
4. fix what must be visible at the start and the end;
5. only then choose the size, the camera move and the cut point.

`purpose.kind`: `establish` (space, who is where), `reveal` (new information enters), `evidence`
(the object the audience must read), `reaction` (the receiver's face or hands), `pressure`
(distance closes, an exit is taken), `decision` (a visible choice), `consequence` (the result
lands), `performance` (the line and the body that says it), `transition`.

**Cut on a change.** Adjacent cuts differ in at least one of size, angle or who is on screen —
the same framing twice is a jump cut with a number. **A turn needs a reader.** A cut claiming a
script `turn` beat or the 爽点 is a reveal-class cut (`reveal / evidence / decision /
consequence`), or the next cut is a `reaction` on someone who did not speak the line — a blow
nobody is seen to receive did not land. **The cliff cut** (the episode's last beat) is `reveal /
consequence / reaction / pressure`; it never resolves.

**Cross-scene boundary (gate `boundary-contrast`).** The last `K` cuts of scene N must not share
the same `size` + `angle` + on-screen `characters` set with any of the first `K` cuts of scene
N+1 (`params.boundaryContrastCuts`, default 2). Same-scene segment handoffs stay under
`continuity` (bodies and props carry over — they should match). Intentional match cuts: put
`match-cut` in the cut's `note`. Across episodes the same check is advisory
(`boundary-contrast-episode`).

## 2. The size ladder

| 景别 | what it carries |
| --- | --- |
| 远景 `extreme-wide` | geography, the person swallowed by the space; no expression |
| 全景 `wide` | the room, who controls the door, group power |
| 中景 `medium` | interaction, hands, two-person strategy, blocking |
| 近景 `close` | a decision, evidence, a hidden reaction |
| 特写 `extreme-close` | one face, one hand, one wound — the only fact in frame; the space is gone |

A scene opens one step wider than it will play, lands on its **working size** on the second
cut, then steps a size up or down around it; a wide or an extreme close-up is an excursion,
used once and returned from. Do not use the size as an emotion dial — the question is always
*where does the information the audience must read live*: on the knuckles, give the extreme
close-up; in the distance between two people, do not cut in. A segment that only tightens has
nowhere to go by its middle (`storyboard-advice`).

**9:16 narrows the ladder.** Wides carry information sideways, and a phone has a third of the
width. Vertical drama plays in medium / close / extreme-close, and space is built in **depth**:
foreground, mid-ground, background — a doorframe, a counter edge, a shoulder in front, the room
behind (`foreground`, `background`). A wide on 9:16 must say why (`note`) or carry a `background`
that does the geography.



## 3. Three axes, three fields (gate `framing-axis`)

"A motivated angle" hides three separate decisions, and the common accident is writing 俯拍 when
what was meant was "from behind her shoulder".

| field | vocabulary | what it answers |
| --- | --- | --- |
| `angle` | `front` 正面 · `three-quarter` 斜侧 · `profile` 正侧 · `rear-three-quarter` 后斜侧 · `back` 背面 | how much face the audience may read, and whose side they stand on |
| `height` | `ground` · `low` 仰 · `eye` 平视 · `high` 俯 · `top` | who is bigger than whom this instant — `eye` is a *choice* for equals |
| `focal` | the lens (`FOCAL_BY_SIZE` or your own) | how far apart two people look |

They do not derive from each other: a low angle from behind is "we follow him as he grows", a
low angle from the front is "he is coming down on us"; a long lens on a wide flattens two people
across a room into one. Height is expensive on 9:16 — a tilt eats the vertical room the person
has — so carry power with angle and distance first.

## 4. The axis — `segment.axis`, `axisSide`, `facing`

The 轴线 is the line between two named people. Write it as three checkable assertions, not an
adjective:

```json
"axis": { "between": ["C01", "C02"], "workingSide": "the customer side of the counter, camera looking at the clerk over the oden warmer",
          "screenLeft": "C02", "screenRight": "C01" }
```

- **Bare left / right always means screen left / right.** A person's own side carries the
  subject: "her right hand", "his left shoulder". Mixing the two readings is the usual cause of a
  reversed reverse-shot, and every sentence looks fine on its own.
- **Reverse shots are complementary**: if A faces `screen-right` in her single, B faces
  `screen-left` in his. Two singles facing the same way read as both looking at a third person.
  Match the eyeline height to the real height difference; an asymmetric pair (one higher, one
  tighter) is a statement of power — make it on purpose.
- **Over-the-shoulder** names whose shoulder is in the foreground (`foreground`); that decides
  whose shot it is.

### Two people talking

A model puts into the shot everyone the shot names, and "looking at him" gives it no direction. In
sheets mode the gate `two-person-framing` holds every two-person segment to these, and `prompt
segment` writes the phrases for you:

- **Default pattern:** a two-shot once to set who stands where → **over-the-shoulder**, alternating,
  for the exchange → a **clean single** for the punchline or the biggest reaction. A reaction lands
  harder alone, so do not put every shot over a shoulder.
- **A single is single.** `characters` holds one person, the shot opens `Only @imageK in frame.`, and
  the rest of the shot never describes the other person. Their reaction gets its own cut.
- **Every look has a direction.** `eyeline: { C01: "screen-left down" }` — `screen-left` or
  `screen-right`, then `level`, `up` or `down`. The direction is toward the other person, so it follows
  from the side they stand on. `"away screen-left"` is a deliberate look elsewhere; `"task"` keeps the
  eyes on what the hands are doing. Height comes from the blocking: a person kneeling looks up, the
  one standing looks down.
- **The sides are locked.** `axis.screenLeft` / `screenRight` become a `Sides:` line in the prompt, and
  every shot holds them. Moving a person across needs `axisSide: cross` with a `note`.
- **Over-the-shoulder is its own setting.** `ots: "C01"` is the person whose shoulder is near the lens;
  `characters` holds both people. The prompt says their face is not visible, so only one face is left
  for the lip-sync and the eyes. It counts as a foreground for `params.foregroundLevel`, and that person
  needs no `eyeline`. When one person is much lower, shoot up past the low shoulder or down past the
  high one, and keep the sides.
- **Crossing the axis** is legal with a neutral shot, an in-shot crossing, a deliberate
  disorientation or a re-established geography — `axisSide: cross` with a `note` that says which;
  the new working side is then inherited by the cuts after it.
- Three or more people: draw the **directed relationship** first (who protects / presses /
  watches whom, from which beat), then place bodies, facing, distance and lines of action; one
  representative reaction beats a row of identical gasps; background people do not change sides
  between cuts without a reason.

## 5. Start → one action → end (gate `continuity`)

Every cut has two boundaries, and the boundaries are the continuity system:

```json
"start": { "positions": { "C01": "behind the counter" }, "facing": { "C01": "screen-left" }, "gaze": { "C01": "at the bag" },
           "hands": { "C01": "both hands on the counter edge" }, "heldProps": { "C01": [] }, "state": ["the bag lying on the counter"] },
"end":   { … the same fields … }
```

- `start` is written on a segment's **first** cut only; every later cut begins where the previous
  one ended (the script derives it), and a segment in the same scene begins where the previous
  segment ended — positions and held props are compared.
- Each boundary is an absolute fact readable without the last cut ("on the stool" — never "same
  as before"). A person who enters on a cut has no start; `render segment` marks them 入画.
- **A prop changes hands only on an action beat.** A hand-over between two lines is teleporting.
- `state[]` are short visible facts ("the drawer slightly ajar", "steam rising off the bowl").
  A state that only exists in `end` may not be named in `frame` — that is **keyframe drift**,
  the picture already showing the result.

## 6. The frozen frame — `frame`

The frame is the **start instant**, in both modes: the still a photographer could take at
second 0.00 of the cut. Twelve things make it renderable without the artist inventing any of
them; ~400–500 characters is full, 800 is padding:

| write | or the model decides it for you |
| --- | --- |
| where each person is and how far apart | spacing drifts cut to cut, the room seems to change |
| foreground / mid-ground / background | depth collapses into one layer |
| where the eye should land (the shot's one fact) | the frame is evenly weighted, nobody knows what to look at |
| composition and size phrase | each cut composed at random; they do not cut together |
| which side of the axis, height, lens | the reverse angle does not match |
| where the light comes from and its quality — its *result* on the face | the key jumps between cuts of one scene |
| every present person's pose, facing, hands, held props | the next cut cannot pick them up |
| what is the same as the previous cut, in one clause | "unwritten" is read as "free to change" |

**Static test**: no ordered verbs (then / before / after that / begins to / 先 / 再 / 然后),
no expression *changing*, no camera move, no weather *transforming* — those belong to `motion`.
A held pose can imply tension; it cannot require two moments. **No names**, no ids, no file
names: the frame is delivery text.

Lighting: `light.direction` is relative to the camera; `light.note` describes what the light
*does* on the face or the object ("the cabinet glow holds the right of his face; nothing moves
but the light on his jaw") — the result reads more stably than the position alone, and it must
say whether left / right is the screen's or the subject's.

## 7. Generability (gates `filmable`, `motion`; advice in `storyboard-advice`)

A video model performs what it has seen a million times: walk in, sit, stand, turn, nod, hand
over, take, hold, push a door, set something down, reach. Four risk classes it does not perform:

| risk | example | rewrite |
| --- | --- | --- |
| precise interception | blocking a closing lid with a palm | close it, then keep the hand on it (two common actions + a hold) |
| invisible inner state | 像是听见了什么 · seems to realise | the visible action that shows it |
| the negative action | 没有接话 · does not press it | the action that happens instead — a hold, a hand that stays |
| a hand chain | four steps of two-hand work in four seconds | hand the change to an object, split the cut, or end on the result |

Drama lives in the **combination and timing** of ordinary actions, not in their precision. The
test: read the action to someone who has not seen the script — can they mime it at once?

## 8. Key scenes — `storyboard.visualPlans[]` (gate `visual-plan`)

Only for scenes where the directing choice changes the experience: a first appearance, a reveal
of identity or evidence, a reversal, the climax or the cliff. `seed storyboard` writes the
worksheet for the 爽点 scene and the cliff scene; before cutting them answer 戏剧转向 (`turn`),
观众立场 (`alignment`: where we stand at the start, where we are moved to), 空间压力
(`pressure`: entrances, distance, blocking, exits), 视觉推进 (`progression`: what lands first —
information, reaction or space), 摄影节奏 (`rhythm`: what triggers a lock, a move, a cut-in, a
hold), 反应落点 (`landing`: whose choice ends the scene) and 声音策略 (`sound`). Ordinary scenes
go straight to cuts.

## 9. Review questions

Which beats does this cut realise, omit or repeat? What has changed when it ends? Why this size
and this camera behaviour? Can every person stand, see and move where the space puts them? Is the
end a start the next cut can pick up? If this cut were deleted or merged, what story meaning would
be lost — and if the answer is nothing, merge it.
