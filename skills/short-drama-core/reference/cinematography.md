# Cinematography — choosing and applying a look (`params.cinematography`)

A cinematography preset is the drama's **lighting and composition**. It sits on top of the render
style (`params.style`: photoreal, painterly, anime…) and the camera package (`params.camera`), and
the gates hold every scene lighting state, every cut and every video prompt to it. One preset
covers the whole drama, the same way one style does.

| preset | for | the look in one line | guide |
| --- | --- | --- | --- |
| `low-key` | 悬疑 · 犯罪 · 惊悚 · 复仇 · 都市暗黑 | the scene's own practicals, people in shadow, side / back / rim light, negative space | `cinematography-low-key.md` |
| `sweet-romance` | 甜宠 · 恋爱 · 韩风唯美 · 偶像剧 · 浪漫 | bright soft light on the face, a warm halo in the hair, pastel air, the distance between two people as the story | `cinematography-sweet-romance.md` |
| `period-nostalgia` | 年代 · 怀旧 · 民国 · 七八九十年代 | a memory shot on film: warm faded grade, grain, window sun and bare bulbs, steady frames full of period detail | `cinematography-period-nostalgia.md` |
| `costume-idol` | 古装偶像 · 古偶 · 仙侠 · 古装甜宠 | a luminous painted world: faces glowing through gauze, backlit silk, mist and petals, jade and moon-white | `cinematography-costume-idol.md` |
| `costume-dark` | 古装写实 · 权谋 · 武侠 · 宫斗 · 复仇 | history lit by fire: candles, torches and lattice windows, faces carved from shadow, smoke, earthy texture | `cinematography-costume-dark.md` |
| `scifi-hard` | 硬科幻 · 太空 · 工程写实 | the future as engineering: instrument panels, work lamps and one harsh sun, cold neutral palette, no magic or floating holograms | `cinematography-scifi-hard.md` |
| `scifi-soft` | 软科幻 · 赛博朋克 · 未来都市 · 科幻 | the future as feeling: holograms and neon, dual-tone colour light, haze and reflections | `cinematography-scifi-soft.md` |
| `none` | projects created before the presets, or a look the user describes that fits neither | only the base `photography` rules | — |

**Choosing.** `init` picks from `--genre` (`cinematographyForGenre`), costume and period first:

1. 古装 / 古偶 / 仙侠 / 宫廷 / 武侠 / 权谋… → `costume-idol` when the genre also says 古偶, 仙侠,
   玄幻 or romance; `costume-dark` when it says 暗黑, 写实, 权谋, 武侠, 江湖, 宫斗, 悬疑, 复仇 or
   历史; a bare `古装` gets `costume-idol` — **confirm that one with the user**, the two looks are
   opposites.
2. 硬科幻 → `scifi-hard`; 软科幻 / 科幻 / 未来 / 赛博朋克 / 星际 → `scifi-soft` (a bare 科幻 gets
   `scifi-soft` — confirm it with the user).
3. 年代 / 怀旧 / 复古 / 民国 / 八十年代… → `period-nostalgia`.
4. 甜宠 / 恋爱 / 爱情 / 浪漫 / 韩风 / 偶像 / romance → `sweet-romance`.
5. Anything else → `low-key`.

Composition is a separate axis: `params.composition: art-first` (艺术优先) frames any of these
looks for negative space, symmetry and monumental scale — see `composition-art-first.md`.

`--cinematography` overrides it. When the genre mixes two (a 甜宠 with a revenge plot, a 年代 drama
that is really a thriller), ask the user which way the *picture* should lean; the story can still
be dark in a bright look. Write the choice into
`outline.guideline.visualStyle` too, so the 创作指引 and the pictures agree.

Read the preset's guide before writing the scene lighting states (stage 3) and before the first
storyboard (stage 5).

## What every preset gates

| where | what must be there | gate |
| --- | --- | --- |
| `scenes[].lighting[].prompt` | the preset's `framePhrase`, plus the sources that light the space | `scene-design` |
| every `cut.frame` | the `framePhrase`, the direction phrase, `light.source` verbatim, the camera phrase, the foreground | `photography` |
| every `cut.light` | `direction` (never one of the preset's `bannedLight` on a person), `source`, `note` | `photography` |
| each segment | at least `preferredShare` of the cuts with people keyed from `preferredLight`; at least half with a foreground | `photography` |
| every `cut.aperture` / `params.camera.aperture` | `maxStop` or faster | `photography` |
| video prompt, `sheets` mode | the Look line carries the preset's `videoPhrase` (for `wan`: a `画面：` line with `videoPhraseZh`). `prompt segment` writes it for you | `video-prompt` |

| preset | `framePhrase` | `bannedLight` on a person | `preferredLight` (≥ 50 % of cuts with people) | `init` package | `maxStop` | also gated | refused sources |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `low-key` | `low-key practical lighting` | `frontal`, `ambient` | `side-*`, `back-*`, `backlight` | default (T1.5) | T2.8 | — | — |
| `sweet-romance` | `soft romantic lighting` | `underlight`, `top` | `front-left`, `front-right`, `back-*`, `backlight` | Master Prime **T1.3** | **T2** | ≥ 50 % of frames name their `bokeh` | — |
| `period-nostalgia` | `nostalgic period film look` | `frontal`, `underlight` | `front-left`, `front-right`, `side-*`, `back-left`, `back-right` | default (T1.5) | **T4** | — | LEDs, smartphones, laptops, tablets, flat screens, ring lights |
| `costume-idol` | `ethereal costume drama lighting` | `underlight`, `top` | `front-left`, `front-right`, `back-*`, `backlight` | Master Prime **T1.3** | **T2** | ≥ 50 % `bokeh`; every segment has a `wide` / `extreme-wide` whose frame says `negative space` | anything electric |
| `costume-dark` | `low-key firelit period lighting` | `frontal`, `ambient` | `side-*`, `back-*`, `backlight` | default (T1.5) | T2.8 | every segment has a `wide` / `extreme-wide` whose frame says `negative space` | anything electric |
| `scifi-hard` | `grounded hard science fiction lighting` | `frontal`, `ambient` | `side-*`, `back-left`, `back-right`, `top` | default (T1.5) | T2.8 | — | magic, holograms, force fields, energy glows |
| `scifi-soft` | `luminous soft science fiction lighting` | `frontal`, `ambient` | `side-*`, `back-*`, `backlight` | default (T1.5) | T2.8 | — | — |

"Refused sources" is checked against `light.source` only: a frame may still say what is *not*
there.

In `keyframes` mode each keyframe is generated from its frame, so the frames carry the look and
the video prompt does not repeat it.

**The phrases never name a nationality.** "Korean drama" or 韩剧 in a look phrase pulls every
face toward that ethnicity, whatever the character sheets say. The look is described by its
light, colour and lens; the faces come from the sheets.

**Character sheets are the exception.** A sheet is an identity reference, not a shot. It keeps its
own lighting (a soft directional key in the portrait zone, flat and even in the turnaround zones;
see stage-characters), because a face the model cannot read on the sheet is a face it cannot
match. The preset is applied in the shot, not on the sheet.

## Adding a preset

A new look is an entry in `CINEMATOGRAPHY_PRESETS` (`scripts/short-drama.mjs`) with the fields
above (plus, where the look needs them, `anachronisms`, `kit`, `bokehShare`, `widePerSegment`), a `cinematography-<key>.md` guide in the same shape as the two here (light, colour,
composition, lens, camera and motion, review questions), a row in the tables above, and selftest
cases. Add a genre pattern to `cinematographyForGenre` if `init` should pick it on its own.
