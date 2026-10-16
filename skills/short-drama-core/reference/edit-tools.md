# Picture edit and mix

Cut the episode before scoring it. The timeline stays in the drama folder, next to `project.json`, so a later session can reopen the cut. The mp4 uploaded to WJI is only the deliverable.

- Picture: [FilmCraft](https://getartcraft.com/apps/filmcraft), command `filmcraft-cli`. On macOS the CLI is a separate zip; the `.app` does not put it on `PATH`.
- Audio: [SoundCraft](https://getartcraft.com/apps/soundcraft), command `soundcraft-cli`.
- If `filmcraft-cli` is not installed, cut with ffmpeg. If `soundcraft-cli` is not installed, lay the mix with ffmpeg.

Look commands up. Do not invent ids.

```bash
command -v filmcraft-cli && filmcraft-cli commands place
filmcraft-cli describe timeline.razor
command -v soundcraft-cli && soundcraft-cli commands
```

## Picture

Download each bound clip into `edits/E01/clips/` (segment id as the filename, story order) before cutting, so the project points at files that stay with the drama.

**FilmCraft** when `filmcraft-cli` is on `PATH`:

```bash
filmcraft-cli --project edits/E01.fcproj --save import \
  edits/E01/clips/E01-01.mp4 edits/E01/clips/E01-02.mp4
filmcraft-cli --project edits/E01.fcproj inspect sequence
filmcraft-cli --project edits/E01.fcproj export edits/E01-edit.mp4
```

`--save` writes the timeline back to `edits/E01.fcproj`. Import puts media in the project; place and trim with a command you have `describe`d, clips in story order. `inspect sequence` is the cut list the score conforms to. Export the locked picture with no score yet. Leave `E01.fcproj` in the project after the upload. If `--project` refuses a missing file, follow `filmcraft-cli help` and still save to `edits/E01.fcproj`.

**ffmpeg** when `filmcraft-cli` is missing. Say that you fell back. There is no timeline to reopen; take cut times from the scene filter in the mix-over-video steps.

```bash
# clips.txt, one line each: file 'edits/E01/clips/E01-01.mp4'
ffmpeg -f concat -safe 0 -i clips.txt -c copy edits/E01-edit.mp4
```

Re-encode (`-c:v libx264 -c:a aac`) only when `-c copy` fails because the clips do not share a codec or timebase.

Upload `edits/E01-edit.mp4` and bind `wji.assets.edit`. Picture lock: do not change the cut's length after the cue sheet is written. A later trim means conforming the sheet again.

## Audio

Lay the score sections under the locked picture. Dialogue already in the clips stays the anchor.

**SoundCraft** when `soundcraft-cli` is on `PATH`. The session is `edits/E01/E01.scraft`; SoundCraft keeps its media in `edits/E01/Audio Files/` beside that file. Discover import and edit ids with `soundcraft-cli commands`, then:

```bash
soundcraft-cli run --in edits/E01/E01.scraft --cmd '<id>={...}'
soundcraft-cli run --in edits/E01/E01.scraft --bounce edits/E01/E01-mix.wav
```

The bounce JSON reports integrated LUFS (`lufs`) and true peak (`true_peak_db`). Leave the `.scraft` and `Audio Files/` in the project.

**ffmpeg** when `soundcraft-cli` is missing: offset each stem with `adelay` and `amix`, and measure with `ffmpeg -af ebur128=peak=true`.

Mux a wav bounce onto the locked picture so WJI receives an mp4:

```bash
ffmpeg -i edits/E01-edit.mp4 -i edits/E01/E01-mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -shortest edits/E01-mix.mp4
```

Upload `edits/E01-mix.mp4` and bind `wji.assets.mix`.
