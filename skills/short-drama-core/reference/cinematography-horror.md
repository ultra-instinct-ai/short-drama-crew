# Cinematography preset `horror` — 恐怖 / 灵异 / 惊悚 / 都市怪谈 / 伪纪录片

The look: **darkness is the main subject.** Most of the frame is black, and one moving or failing
light carves the space out of it. People are small, alone and turned away from where the danger
is. The camera either refuses to move (dread) or is held by someone who is scared (panic). The
threat is felt long before it is seen. It is shown once, briefly, and never in good light.

This preset is **not** `low-key` with a ghost added. `low-key` makes a thriller *beautiful*:
practicals, bokeh, composed negative space. `horror` makes the viewer *search the frame and dread
what they find*. Use it whenever `params.story` contains `horror`: `init` picks it from a genre that
says 恐怖 / 灵异 / 怪谈 / 诡异 / 鬼 / 驱魔 / 伪纪录 / horror (a bare 惊悚 stays `low-key`), and makes
`horror` the default grammar too. Read it with `story-horror.md` (what the story tracks) and
`grammar-horror.md` (§5 here, how a scare is cut and gated). The mechanics shared by every preset
(the fields, the gates, where the phrases land, the character-sheet exception) are in
`cinematography.md`. Set before electric light (古代 / 聊斋 / 僵尸), the same rules use
`costume-horror` (`cinematography-costume-horror.md`); a zombie apocalypse uses `apocalypse`
(`cinematography-apocalypse.md`). A jump-scare film is `params.horrorStyle: jump`
(`grammar-horror.md` §1a).

> The craft below is a synthesis of practitioner sources (ASC, No Film School, PremiumBeat,
> interviews with horror directors and sound teams, criticism of J-horror and found footage) —
> see Sources at the end. Treat the numbers as rules of thumb, not laws.

---

## 1. Light — one source, mostly black

**The rule of the frame:** at least **60–70 % of every frame is near-black**. You light a *path*
through the dark, not a room.

| technique | 中文 | what it does | how to write it |
| --- | --- | --- | --- |
| one hard motivated source | 单一硬光源 | sharp shadows, high contrast, no fill; the darkness is the point | `lit only by <source>, hard light, no fill, the rest of the frame falls to black` |
| moving source (flashlight, candle carried, phone) | 移动光源 | the light *searches*; what it misses becomes the threat | `the flashlight beam sweeps the corridor and leaves the far end in darkness` |
| failing source (flicker, buzz, dying bulb) | 闪烁 / 坏灯 | a rhythm of seeing / not seeing; perfect for a false alarm and a reveal on the next flash | `the fluorescent tube flickers; in each dark beat the corridor disappears` |
| underlight | 底光（鬼故事光） | unnatural upward shadows over the nose and eye sockets | `lit from below by the phone screen, eye sockets in shadow` |
| top light | 顶光 | eyes fall into black pits; the face becomes a mask | `a single bulb directly overhead, his eyes lost in shadow` |
| backlight / silhouette | 逆光剪影 | the shape without the face — the strongest way to show a ghost early | `a stark silhouette against the doorway light, no detail in the figure` |
| underexposure | 欠曝 | about one stop under; deep blacks with *some* detail kept | `underexposed by a stop, crushed blacks, shadow detail barely readable` |

- **Allowed on a person:** `side-*`, `back-*`, `backlight`, `underlight`, `top` — at least 60 % of
  the cuts with people in a segment (gate `photography`).
  **Banned on a person:** `frontal`, `ambient`. A face fully and evenly lit is not horror.
- **Banned as the main light of a horror frame:** warm golden practicals filling the space,
  glowing magic that lights the whole set, soft bounce, "cinematic" warm tungsten pools with bokeh.
  These make the frame beautiful and safe.
- **Supernatural light stays small.** A talisman flame, a mirror glint or a seal glow lights
  **only what it touches**: a hand, a face edge, a few feet of floor. It never floods the
  corridor with gold. Write `a small flame that lights only his fingers and the edge of her hair`.
  Gated: when `light.source` is a talisman, charm, seal, spell, ritual, glow or mirror glint, the
  frame must say what it `lights only`.
- **Colour:** desaturated and cold (blue-grey, sickly green from old tubes). Keep **one accent
  colour** for danger or the ritual: talisman yellow, blood red, a red bulb. Saturated warm light
  everywhere kills dread.
- **Darkness must still be legible.** Muddy, undifferentiated black loses the audience. Keep an
  edge: a rim on a shoulder, a reflection on wet floor, a lens glint.

## 2. Composition — make the viewer search the frame

The horror frame leaves **dead space**: a part of the frame with nothing in it *yet*, which the
viewer starts scanning. Every cut answers: *where is the viewer afraid to look?*

| device | 中文 | use | phrase |
| --- | --- | --- | --- |
| dead space behind the subject | 身后的空位 | the person on one third, a dark doorway / corridor / corner filling the rest | `she is on the left third, the black doorway behind her fills the right two-thirds` |
| back to the danger | 背对危险 | the character faces the camera, the threat area is behind them where they can't see | `he faces camera, the dark corridor behind his shoulder` |
| background threat, soft focus | 背景失焦的东西 | a figure / shape far behind the subject, out of focus, never pointed at | `far behind her, out of focus, a pale shape stands in the dark at the end of the hall` |
| obstructed view | 遮挡视线 | door frames, gaps, railings, half-open doors; the viewer sees only part of the space | `seen through the gap of the half-open door` |
| low headroom / tight frame | 压迫构图 | a face crammed against the top or edge; no room to escape | `a tight close-up, his face pressed against the right edge of the frame` |
| the small figure in the void | 黑暗中的小人 | a person tiny in a huge black space; isolation | `a tiny figure in the lower third, the rest of the frame black` |
| Dutch angle | 倾斜 | only for one moment of wrongness, never as a style | `a slight Dutch tilt` |

- **Symmetry** (art-first) belongs to horror only when it means *something is too perfect*: a
  corridor of identical doors, rows of identical boxes. It is not a default. A painterly,
  balanced frame reads as safe and beautiful.
- **Lens:** wide (18–25 mm) for space, distance and isolation, and close on a face for unease
  through distortion. Long (75–100 mm) to compress a threat closer behind someone. Shallow focus
  is a tool to **hide**: the threat sits in the blurred zone.
- **Withhold.** A frame shows less than the viewer wants: the edge of the monster, its shadow on
  the wall, its hair on the floor, the reaction on a face. Cutting to the face and *not* the thing
  is often the scarier choice.

## 3. Camera — still for dread, unstable for panic, never decorative

Pick the camera mode from what the scene is doing. Do not run one mode through the whole film.

| mode | 中文 | when | how |
| --- | --- | --- | --- |
| **locked-off hold** | 定镜久持 | dread, waiting, the space before a scare | static, **4–10 s**, longer than comfortable; nothing moves but the light or a sound; the viewer searches the frame |
| **slow push-in** | 缓慢推进 | building tension on a face, a door, a box | 6–10 s, barely perceptible; it ends *before* the reveal |
| **slow drift / creep** | 缓慢游移 | exploring a corridor, the camera as an unseen watcher | slow, smooth, slightly lower than eye level, as if something is following |
| **POV / flashlight handheld** | 主观手持 | found footage, fleeing, searching | the camera is held by a character; the flashlight is on the camera; it pans to look, hunts for focus, shakes when they are scared |
| **the jolt** | 惊吓抖动 | the hit of a scare only | one strong shake or whip-pan in the scare cut, never sustained |
| **pan to empty** | 摇向空处 | false alarm | the camera turns to where the sound came from and finds nothing |

Rules:

- **One camera move per shot.** Several camera directions in one prompt make AI video chaotic.
- **The camera never moves during a reveal**, except the jolt. A slow move into a reveal tells
  the viewer it's coming.
- **Handheld is a character choice, not a filter.** In found footage, the operator's fear drives
  it: steady while sneaking, shaking while running, dropped when attacked. In a classical
  horror film, handheld is reserved for panic and the scare; dread is shot locked off.
- **Don't track the hero like an action film.** Smooth tracking alongside a striding hero reads as
  confidence. Horror walks are shot from behind, from ahead (backing away), or from the dark
  at the end of the corridor.

## 4. Movement of the threat

How the ghost moves matters more than how it looks.

- **Stillness:** the most frightening ghost often does not move at all. It is simply *there*, then
  it is not.
- **Slow approach:** in J-horror, the ghost drifts toward the camera at an unnatural, slow and even
  speed, without cues to signal evil. Dread comes from pacing, not makeup.
- **Wrong motion:** jerky, broken, reversed-feeling, too-fast-then-frozen; limbs bending the wrong
  way. Write it concretely: `she crawls toward the camera with jerky, stop-start movements, each
  stop perfectly still`.
- **Appear / disappear between cuts or light flashes,** not by visible effects.
- **Avoid** combat-readable choreography (dives, blocks, spins) for the ghost. That turns it into
  a fighter and the scene into wuxia.

## 5. Pacing — the scare cycle (grammar `horror`)

Horror is cut by **rhythm**, not by coverage. The fields and gates are in `grammar-horror.md`; the
core unit is the **scare cycle**:

```
quiet (hold) → build (push / sound drops / focus narrows) → false alarm → relief
            → second build → real scare (often from an unexpected angle or in the background)
            → aftermath (silence, a reaction, the space again)
```

| beat | shot length | camera | sound |
| --- | --- | --- | --- |
| quiet / dread | 4–10 s | locked off or slow drift | room tone, a low drone, one small diegetic sound |
| build | 4–8 s | slow push-in, focus narrowing | sound thins out, the drone lowers, breath |
| false alarm | 1–3 s | pan to empty, or a cat-scare | a small sharp sound, then nothing |
| relief | 2–4 s | static, the character relaxes | normal room tone returns |
| **real scare** | **1–2 s** | the jolt, or a still frame with the threat suddenly present | silence just before, then the stinger (post) |
| aftermath | 2–5 s | static, the empty space again | ringing silence |

Rules for the storyboard:

- **Ration the scares.** In a short drama, about **one real scare per 20–30 s** and one false alarm
  per real scare at most. A 60–90 s piece has 2–3 real scares, not one per cut.
- **Every scare is preceded by a hold of ≥ 4 s** in the same segment.
- **The timing slips.** Let the scare come a beat *after* the viewer expects it, or in the middle
  of a mundane moment, so it isn't predictable.
- **Average cut length in dread passages: 4 s or more.** Fast cutting releases tension; staying in
  the shot holds it. Fast cutting belongs only to the panic after a scare.
- **Escalate by taking away**, not by adding: less light, less sound, fewer cuts, until the hit.
- **Know when not to reveal.** Every reveal costs dread; save the full reveal for one moment.

## 6. The reveal ladder

Show the threat in this order across the piece. Each rung is one beat; skipping rungs wastes
the build.

1. **Sound only:** scraping, breathing, a whisper off screen.
2. **Trace:** wet footprints, hair on the floor, the box moved one inch, a door now open.
3. **Shape:** a silhouette, a shadow on the wall, a figure out of focus in the background.
4. **Part:** a hand around a door frame, hair hanging into frame, eyes in the dark.
5. **Full reveal — once:** brief (1–2 s), close, badly lit (under / top / a flash of light), then
   cut away or cut to black.

`story-horror.md`'s `hide-the-monster` rule applies inside one episode too: in a single-episode
film, the full reveal sits in the last third.

## 7. Fights in horror — struggle, not choreography

When a horror story has a fight (an exorcist, a survivor), cut it as a **struggle against
something stronger**, not as a duel.

- The hero is **outmatched**; they survive by a rule, a ritual or luck, not by technique.
- Short, ugly, confused: the threat is partly unseen, the light is swinging, the camera is in the
  middle of it. Readability comes from **one clear image per beat** (the talisman hitting the
  lid, the hand on the throat), not from wide choreography.
- **Ritual tools stay physical:** fire, sparks, smoke, a mirror's glint, a paper charm sticking
  to a wet surface. No glowing energy beams, no swirling qi, no wire-work flight.
- **Do not combine** `params.action: wuxia-fantasy` (graceful wire-work, light trails, slow-motion
  poses) or `superhero` with this preset — the `params` gate refuses it. Use `action:
  horror-struggle` (`action-horror-struggle.md`).
- Every exchange ends worse for the hero than it began, even when they "win" it.

## 8. Found-footage / DV mode (`lookPhrase` variant)

For the camcorder look the camera itself is in the story.

- **Set it up with `init --footage dv`:** the camera package becomes the camcorder
  (`handheld consumer DV camcorder` · `built-in zoom lens` · `f/1.8`, so every frame's camera
  phrase names it) and `lookPhrase` / `lookPhraseZh` become the camcorder look. Gate
  `dv-consistency` fails a DV look on a cinema package (ARRI, Zeiss, Cooke…) and, in sheets mode,
  any frame or prompt that says `cinematic film still`. Use `references: sheets` — keyframes mode
  needs the style's "film still" in every frame.
- **Name the camera inside the fiction:** `footage from a handheld consumer DV camcorder carried
  by the apprentice`. Do **not** also name a cinema package (ARRI / Zeiss) or say
  `cinematic film still` — the two contradict and the model averages toward clean cinema.
- **The flashlight is on the camera** and is the only key: it lights what the camera looks at and
  nothing else; faces it hits are blown out, the rest is black.
- **Imperfections are the look:** video noise in the shadows, blown highlights, auto-exposure
  pumping when the light hits a face, focus hunting, rolling shutter on fast pans, a tracking
  glitch or a frame drop at the scare.
- **Framing is unprofessional on purpose:** off-centre, tilted, cut-off heads, the camera pointed
  at the floor while running. Never painterly symmetry.
- **The operator is a character:** their breathing, their whisper, their fear drive the camera.
  The camera dropped and still recording on the floor is a classic ending.
- Choose the pacing: slow-build (wandering, nothing happens, then everything) or rapid slide into
  chaos.

## 9. Sound — half the scare

The video model generates in-picture sound; the score and stingers are added in post
(`audioTrack: post`).

- **In the clip prompt:** room tone, small diegetic sounds (drip, buzz, scrape, breath), the
  lines, and **"no music"**. The silence must be written: `near silence, only the hum of the tube`.
- **In post (Sound Designer):** a low drone that lowers before the scare; **silence just before
  the hit**; one stinger on the scare; ringing silence after. Never score over a dread hold with
  melody.
- **Off-screen sound is the first rung of the reveal ladder** — the strongest when nothing is
  seen.

## 10. Writing it for AI video (Seedance / Kling / Wan)

AI video models default to clear, evenly exposed, attractive frames and to *showing* everything a
prompt names. Horror needs the opposite, so the prompt must fight those defaults.

1. **Fewer shots per segment.** 3–5 shots per 15 s; 5–7 per 30 s. Dread needs holds; a prompt of
   10 shots in 24 s becomes an action montage.
2. **Shorter prompts.** Aim for **≤ 4,000 characters** per segment. A 10,000-character prompt
   with long legends and many devices per shot averages into a bland, bright frame.
3. **One event and one camera move per shot.**
4. **Write what is hidden.** `the end of the corridor stays black; nothing is visible there yet`.
   Do not name the ghost in a shot where it should not be seen; models put everything named on
   screen.
5. **Name the darkness and the exposure:** `70 % of the frame is black`, `underexposed`,
   `crushed blacks`, `only the flashlight beam is lit`.
6. **Ban the beautifiers:** avoid `cinematic warm`, `golden`, `glowing`, `bokeh`, `beautiful`,
   `painterly`, `symmetrical` in horror shots. Negative line: `no warm golden light, no glowing
   effects flooding the scene, no evenly lit faces, no clean cinematic look`.
7. **The scare in its own short generation.** Generate the reveal as a separate 4–6 s clip (or a
   keyframe/first-frame shot) so it can be retimed in the edit. Long clips spread a scare's
   timing unpredictably.
8. **Monster design from a still first.** Lock the ghost's look in a sheet (done), then direct the
   reveal with light and position, not with more description.
9. **Pacing and dread are finished in the edit,** with holds, silence and stingers, not with more
   gore in the prompt.
10. **Style reference:** a horror style still (grain, scan lines, cold tint) is bound as
    *look only*; if the clips come out clean, add the texture in post (DV filter) rather than
    regenerate.

### What the engine holds you to

| key | value |
| --- | --- |
| `framePhrase` (every cut frame, every scene lighting state) | `horror low-key lighting, most of the frame in darkness` |
| `videoPhrase` (the Look line, sheets mode) | `horror cinematography: most of the frame in deep darkness, a single hard motivated source, cold desaturated colour, faces only partly lit from the side, below or behind, underexposed with crushed blacks, long uneasy holds, the threat kept in shadow or out of focus, no warm golden light, no glow flooding the scene, no evenly lit faces` |
| `videoPhraseZh` (`画面：` line, wan) | `恐怖片摄影：画面大部分沉入黑暗，单一硬光源，冷调低饱和，人脸只被侧光、底光或逆光照亮一部分，欠曝暗部压黑，长时间不安的停留，威胁藏在阴影或失焦处，不要暖金色光，不要光效铺满画面，不要均匀照亮的人脸` |
| `bannedLight` (person) | `frontal`, `ambient` |
| `preferredLight` | `side-*`, `back-*`, `backlight`, `underlight`, `top` (≥ 60 % of cuts with people) |
| `maxStop` | T2.8 |
| refused in frames | `golden`, `bokeh`, `beautiful`, `painterly`, `soft fill`, `cinematic warm`, `warm glow` — say `out of focus` for a soft foreground |
| supernatural light | a talisman / charm / seal / spell / ritual / glow source must be written as what it `lights only` |

The negative line of §10.6 is inside the gated `videoPhrase` (`no warm golden light, no glow
flooding the scene, no evenly lit faces`), so every horror prompt carries it.

| gate | what it holds | kind |
| --- | --- | --- |
| `photography` | the phrases, the light, the refused words, small supernatural light | hard |
| `horror` | `horror-hold` · `still-reveal` · `dread-pace` · `scare-ration` · `reveal-ladder` — see `grammar-horror.md` | hard, waivable per segment |
| `timing` | a cut in a horror segment may hold up to 10 s (past `params.maxCutSeconds`) | hard |
| `params` | `cinematography: horror` with `action: wuxia-fantasy` or `superhero` → use `horror-struggle` | hard |
| `dv-consistency` | a DV / found-footage look on a camcorder kit, never `cinematic film still` | hard |
| `horror-advice` | the promised scares, frames that name their darkness, handheld only for fear, no hero tracking, art-first symmetry, prompts ≤ 4,000 characters | advisory |

The fight style for a horror story is `action: horror-struggle` (`action-horror-struggle.md`):
`Action: a desperate struggle in the dark, the fighter outmatched, short ugly confused moves lit
only by the swinging light, the threat half-seen, ritual tools kept physical with fire, sparks and
smoke, every exchange ending worse for the hero.`

## 11. Review questions

- How much of this frame is black? If it is less than half, darken it.
- Where is the viewer afraid to look, and is there something — or nothing — there?
- Is the face fully lit? Then it is not horror.
- Does this shot *show* the ghost? Should it only suggest it (sound, trace, shape, part)?
- Before this scare, is there a hold of 4 s or more where nothing happens?
- Is this a scare, or just an event? How many real scares are in this minute?
- Does the camera move because a scared person is holding it, or because it looks cool?
- Is any light here "beautiful"? Remove it.
- In the fight, is the hero outmatched? Does any frame look like wuxia?

## Appendix A — case study: why 《天地玄門》 E01 (v1) was not scary

The four Seedance clips (2026-11-22) followed `low-key` + `art-first` + `wuxia-fantasy` + `action`
grammar. Each choice pushed away from horror:

| problem seen in the clips | cause in the project | fix under this preset |
| --- | --- | --- |
| corridors evenly visible, warm tungsten, faces clearly lit | `low-key` practical pools + "cinematic film still" + ARRI phrase | 60–70 % black, one hard source, cold grade, faces partly lit |
| the ghost seen whole and often, her face in close-up mid-fight | storyboard named her in 12+ shots; no reveal ladder | sound → trace → shape → part → one reveal at the end |
| reads as a fantasy action film | `wuxia-fantasy` line (wire-work, light trails, qi), gold mirror beam and glowing ring flooding the set | `horror-struggle`; ritual light small and local |
| no dread; every 2–3 s something happens | 8–11 cuts per 20 s segment, 15 moves in 87 s, `action` grammar | 3–5 shots per 15 s, holds of 4–10 s, 2–3 real scares total |
| beautiful symmetrical frames | `art-first` composition (symmetry, monumental scale, "patient steady camera") | dead space, back to the danger, background threat, obstructed view |
| handheld drift everywhere but no fear in the camera | `Shake Slightly` on every static cut | locked-off dread, jolt only on the scare, or true DV POV held by the apprentice |
| DV look barely visible | DV `lookPhrase` fighting the ARRI phrase and `cinematic film still` | name the camcorder inside the fiction; drop the cinema camera phrase |
| paper effigies flat and giant, roach swarm unreadable | too many effects in one 21 s prompt | one effect per short clip; swarms as edge-of-frame motion and sound |
| prompts at 9,000–10,000 characters | long legends × many shots | ≤ 4,000 characters per segment |

## Sources

- [Horror Cinematography: How Fear Uses Light, Lens & Composition — Tyler Williams DP](https://www.tylerwilliamsdp.com/blog/the-cinematography-of-fear)
- [Horror Movie Lighting: Techniques that the Masters Use — Scary Studies](https://www.scarystudies.com/horror-movie-lighting/)
- [How to Light a Terrifying Horror Scene on an Indie Budget — No Film School](https://nofilmschool.com/light-a-horror-scene-on-budget)
- [Horror Film Lighting On a Budget — Videomaker](https://www.videomaker.com/article/c13/15436-horror-film-lighting-on-a-budget/)
- [Horror film lighting: techniques and tips — Colbor](https://www.colborlight.com/blogs/articles/horror-film-lighting-techniques-and-tips)
- [Film Lighting Techniques — Backstage](https://www.backstage.com/magazine/article/film-lighting-techniques-76277/)
- [How Lighting Creates Mood in Horror Movies — We Are Cult Classics](https://www.wearecultclassics.net/how-lighting-creates-mood-in-horror-movies/)
- [Terror Through Lighting — American Cinematographer](https://theasc.com/article/terror-through-lighting/)
- [Scare Tactics — American Cinematographer](https://theasc.com/article/scare-tactics/)
- [Cinematography tips for horror filmmakers — PremiumBeat](https://www.premiumbeat.com/blog/cinematography-tips-for-horror-filmmakers/)
- [Horror cinematography, lighting and darkness — No Film School](https://nofilmschool.com/horror-cinematography-lighting-darkness)
- [The Real Reason Horror Movies Have So Many Blurry Shots — Looper](https://looper.com/656584/the-real-reason-horror-movies-have-so-many-blurry-shots)
- [It Follows and the Negative Space of Horror Films](https://niallosullivan.substack.com/p/it-follows-and-the-negative-space)
- [Backrooms: liminal horror — Creative Screenwriting](https://www.creativescreenwriting.com/backrooms-kane-parsons-liminal-horror-adaptation/)
- [Horror Cinematography: Camera Shots and Angles — Rhonda Fletcher](https://authory.com/RhondaFletcher/a/a003927350af9445bb81ad4caef8bc46f)
- [How Are Jump Scares Made? — DFI Rentals](https://www.dfirentals.com/news/how-are-jump-scares-made)
- [The Best (and Worst) of Modern Jump Scares — Dread Central](https://www.dreadcentral.com/editorials/462897/the-best-and-worst-of-modern-jump-scares/)
- [5 Tips to Achieve a Memorable Jump Scare — Sparks Film School](https://sparksarts.co.uk/5-tips-to-achieve-a-memorable-jump-scare/)
- [Why Horror Films Cut So Fast — FrameShifter](https://www.nottldr.com/FrameShifter/why-horror-films-cut-so-fast-the-editing-rhythm-of-fear-0gy74ty)
- [Jump scare — Wikipedia](https://en.wikipedia.org/wiki/Jump_scare)
- [How James Wan Delivers the Perfect Jump Scare — No Film School](https://nofilmschool.com/2016/10/how-conjuring-director-james-wan-delivers-perfect-jump-scare)
- [The Conjuring 2 review — RogerEbert.com](https://www.rogerebert.com/reviews/the-conjuring-2-2016)
- [The Conjuring's careful, quiet visual build-up — PopMatters](https://www.popmatters.com/173778-the-conjuring-another-day-another-haunted-house-2495738012.html)
- [Building fear: James Wan — GamesRadar](https://www.gamesradar.com/building-fear-how-the-conjuring-2s-james-wan-is-redefining-modern-horror)
- [Hereditary sound design — A Sound Effect](https://www.asoundeffect.com/hereditary-sound/)
- [Drone of Dread — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/DroneOfDread)
- [The ghost walk in Kurosawa's Kairo — Far Out](https://faroutmagazine.co.uk/the-horrifying-ghost-walk-in-kiyoshi-kurosawas-kairo/)
- [The scariest scene in Pulse — /Film](https://slashfilm.com/scariest-scene-in-pulse)
- [Defining J-horror — The Japan Times](https://japantimes.co.jp/culture/2016/12/10/books/defining-j-horror-terror-deep-time)
- [10 great Japanese ghost stories — BFI](https://www.bfi.org.uk/lists/10-great-japanese-ghost-stories)
- [Found footage (film technique) — Wikipedia](https://www.Wikipedia.org/wiki/Found_footage_(film_genre))
- [How the 'Coochie Coo' segment was shot for V/H/S Halloween — No Film School](https://nofilmschool.com/powell-robinson-interview-vhs)
- [How to Make a Terrifying Found Footage Horror — GamesRadar](https://www.gamesradar.com/how-to-make-a-terrifying-found-footage-horror)
- [How to Make AI Horror Videos — getimg.ai](https://getimg.ai/blog/how-to-make-ai-horror-videos)
- [Horror AI Video Prompts — Kling](https://kling.ai/blog/horror-ai-video-prompts-color-grading-sound)
- [Horror AI video prompts — Luma](https://lumalabs.ai/news/horror-ai-video-prompts)
