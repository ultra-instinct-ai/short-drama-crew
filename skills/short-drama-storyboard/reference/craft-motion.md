# Motion craft — what happens over the seconds, and how the prompt says it

The method behind `motion`, `cameraNote`, `sound` and the prompt-hygiene rules, distilled from
the user's `short-drama-video-prompts` skill. The frame says how a cut starts; **the motion
sentence says what changes between the start and the end boundary**, and the prompt is delivery
text for a machine, not prose for a reader.

## 1. The seven parts of a motion (gates `motion`, `sound`)

1. **Start anchor** — the start boundary, in the present tense, static: "her hands are crossed on
   her knees, her eyes on the puddle". Never "she is about to stand" (that is already motion).
2. **Ordered subject motion** — `motion.trigger` (the cue: a sound, a line, a look), `motion.action`
   (one visible state chain: who, what, direction, contact, landing — a hand-over names the giver,
   the receiver, the hand and where the object lands) and `motion.result` (the end state, or
   `hold`). Causal order, not a list: "hearing the latch, her eyes go to the door first; her left
   hand stops on the page; only then does her back leave the chair". "Slowly, naturally,
   cinematic" are not paths.
3. **Performance arc** — never emotion labels in sequence (calm → tense → shocked). Trigger →
   what is received → one or two visible signals in a channel the size can read (gaze, breath,
   body set, object handling) → the decision (an action taken or withheld) → the landing at the
   end boundary. A wide cannot carry an eyelid; a close-up cannot carry a full-body retreat.
   Keeping still is a valid performance when it is the character's strategy — and even then they
   breathe and blink (`idle: "still"`).

### Everyone on screen is alive (gate `idle-motion`, sheets mode)

A model freezes whoever the prompt gives no motion, so a sub-character stands in the background like
a photo. `motion` is the one action that carries the cut; everyone else who is visible gets a small
motion of their own in `cut.idle: { C02: "shifts her weight, picking at her sleeve" }`. The skeleton
writes it into the shot. The rule, per cut with two or more visible people: all but the one carrying
the action have one (an over-the-shoulder's shoulder does not count). Give the speaker one too when
they would otherwise only talk.

- **Take it from why they are there.** Waiting: shifts weight, fiddles with a strap, checks the door.
  Working: the work carries on. Listening: a small nod, the eyes moving over the other's face. Tense:
  a tightening jaw, a thumb rubbing a finger. Do not reuse one motion across people or cuts: two people
  breathing in time reads as a loop.
- **Small enough not to steal the cut:** one motion, in place. A line, a moving mouth or a change of
  place is a cut's action, not an idle (gated, as is a length over 90 characters).
- **It must not break the boundaries:** hands, held props and positions end where `end` says.
- **Crowds and extras** with no sheet go in `background` as a motion, not a list of people: "shoppers
  drifting past far behind her".



## 2. Timing is arithmetic (gate `timing`)

The cut seconds are the explicit timing plan and they sum to the segment. Both directions are
defects: **overflow** is truncated — the closing action, the line's tail and the end pose go with
it; **shortfall** is not a held frame — the model fills the unallocated seconds with motion that
has no source. A line needs a lead-in before the mouth opens (`speechLeadSeconds`, 0.5) and a
landing after it; a 4.0 s line does not fit a 4 s cut. Measured on H3 Chinese: ~4.1 speakable
characters a second, with rushing first and silent truncation after — lengthen the cut, split
it, or ask the script to cut the line; never quicken the delivery to make the sum work.

## 3. Delivery text carries only what is to be filmed (gate `prompt-hygiene`)

Inside the prompt there is no room for how the work was done:

| never in the prompt | why |
| --- | --- |
| file names, versions, paths (`sheet_v3.png`) | rendered as text on screen |
| entity ids, segment ids, rule ids, status words | the same, or read as an instruction to draw them |
| sketch references ("as in panel 2"), retake notes ("fix the hands this time") | meaningless to the model, and "hands" becomes a subject |
| walls of negatives ("no extra people, no deformed hands, no text…") | the nouns become the picture; write the positive fact instead ("only the two of them in frame, both hands complete and visible") |
| `…` left from the skeleton | an unfilled slot |

Bind on **every** mention or on none. In sheets mode a person is `@imageK` in every shot they
are in; bound once and then "she" is read as two different people. The skeleton does this for the
lines; the gate checks it per shot.

**Subtitles are off unless asked.** Same-pass models add captions on their own; every prompt
says so in its own language (`no subtitles, no captions, no on-screen dialogue text` / `全程无字幕`)
— `params.subtitles: true` to allow them. Readable on-screen text (a prop with `textPolicy:
readable`) is exact, everywhere it is shown, and never cancelled by a global "no text".

## 4. Per model, measured

**MiniMax H3** (`minimax-h3-ref`). Structured fields in English, dialogue kept in the original
language inside `<d>[Chinese] …</d>` — only the line, no parenthetical, no seconds. On first
mention a speaker is placed on- or off-screen with a timbre; **when another face is on screen
during a line, write that they `do not speak; lips remain completely closed`** — 3/3 correct
lip-sync against 2/3 without it, because the model puts the mouth on the most visible face; better
still, have the non-speaker turned away or out of frame. `non_diegetic_music: N/A` when there is
no score (omitting it produced music). Cut timestamps land near but not exactly; `<scenetrans>`
carries a line across an in-generation cut, `<cutoff>` ends a clip mid-line only when the script
wants it. Duration is any integer 4–15 (WJI's form: 5–15); first/last-frame inputs and reference
inputs are mutually exclusive, so a start frame plus sheets all go in as references.

**Seedance 2.5 / 2.0** (`seedance-*-ref`). `镜头 k [0:00–0:03]` timelines with no gaps and the
last endpoint equal to the total; bind on every mention; 2.5 takes `extend` (continue from an
actual clip plus its actual tail frame as `@image1`) and `edit`; tail frames improve the last
frame's landing but hand the path between two frames to interpolation — an action the cut exists
for must not rest on that gap. Two-frame chaining is not available on WJI today; `videoReferences:
previous` passes the previous clip only.

**Seed Audio 1.0** (`seed-audio-1.0`) — the soundtrack node. One prompt is a mini script:
name the environment, each element and how the scene unfolds; `[start s:end s]` in front of an
element pins it to that interval (100 ms precision), which is how the bed lines up with the cuts
and how music is made to duck, swell or fall silent at a moment ("Let the music drop before the
key line" is the documented idiom). Up to 120 s per generation, 2048 characters, three reference
voices as `@Audio1..3` **or** one reference image, never both; a reference clip is under 30 s.
Ask for `instrumental` when there are to be no vocals, and say "no dialogue" on a bed — left
open, it invents a narrator. `prompt audio` derives all of this from `segment.sound`.

**Wan 3.0** (`wan-3.0-ref`). Chinese prompt, same-pass audio, the 音频 line is the whole sound
design; the content filter judges the assembled prompt's *length* (`stage-storyboard.md`), so the
motion and camera clauses stay terse.

## 5. Self-check before generating

Does the prompt start from the exact start boundary and restate only what this execution needs?
Is every person and prop that acts, reacts or is handed over resolvable — bound or described? Do
two people on screen resolve to two different bindings on every mention? Has every performance
change a trigger and a visible channel? Do the seconds add up in both directions, with the
lead-in? Does the sound section cover the whole cut — lines, ambience between, music declared?
Is there any file name, id, note or negative dump left? Would the end the prompt describes match
the `end` boundary field by field?
