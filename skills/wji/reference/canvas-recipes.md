# Canvas recipes

Worked examples for `wji canvas`. Each starts from the same place: the user has
the canvas open in the browser, has pressed the **link** button in its top bar,
and has selected the nodes they are talking about.

```bash
wji canvas status          # confirms the link and lists the selected nodes
```

If it says *Not linked*, ask the user to press the link button (and select the
nodes) instead of guessing. If it fails with `Cannot GET /canvas-link`, the CLI
profile points at a different backend than the browser (e.g. `prod` while the
link URL is `localhost:3000`) — fix the profile first (see SKILL.md, Canvas).
The link lasts 5 minutes after the tab stops renewing it, so re-check `status`
if the user comes back later.

All ids below are placeholders — always take them from `status`, `nodes` or
`get`.

---

## 1. Selected images → suggest a video prompt → create the video node

> "Use the images I selected to make a video node. Suggest a prompt first."

1. Read the selection and keep the image nodes, in the order the user
   selected them (that becomes `@image1`, `@image2`):

   ```bash
   wji canvas status --json | jq '.selected[] | select(.kind=="image") | {id, name, assetId}'
   ```

2. Look at the pictures before writing about them:

   ```bash
   wji asset download <assetId1> <assetId2> -o /tmp/canvas-refs
   ```

   Open the downloaded files and describe what is actually there — subject,
   setting, light, mood.

3. Pick a model that takes image references and read its limits:

   ```bash
   wji models list --feature video -k <family>   # REFS column must be non-empty
   wji models get "<model>"        # ratios, duration range, max references, --set keys (exact case)
   ```

   If the user asked for a model by family name ("wan 3.0", "seedance"), choose
   the member that accepts references (`Wan 3.0 Ref`, `seedance-2.0-fast-ref`)
   and tell them why.

4. Settle the settings the user didn't mention: ratio (workspace default vs.
   9:16 for a portrait subject), fixed duration or auto, audio. Then propose
   2–3 prompts in the chat. Refer to the images as `@image1`,
   `@image2`, matching the order you will connect them. Mention the model,
   ratio and duration you would use. Wait for the user to pick or edit one.

5. Create the node. Nothing is charged yet:

   ```bash
   wji canvas add video -n "Lake reunion" \
     --from <imageNode1> <imageNode2> \
     -m <model> -r 16:9 -d 8 --resolution 720p \
     -p "@image1 paddles a canoe across a still turquoise lake at dawn; as she reaches the shore, @image2 trots down the forest path to greet her. Soft morning light, reflections, shallow depth of field."
   ```

   The node appears next to the images in the user's canvas, wired to both,
   with the prompt and settings filled in. Tell the user its name and that it is
   ready to generate from the canvas or from here (recipe 4).

## 2. Write or rewrite the prompt of an existing generate node

> "This video node has two references wired in — write a better prompt for it."

```bash
wji canvas get <videoNode>                  # prompt, model, settings, references with labels
wji canvas get <referenceNode>              # for each reference: kind, assetId, text
wji asset download <assetId…> -o /tmp/canvas-refs
```

Draft the prompt against the **labels `get` printed** (`@image1 ← <nodeId>`),
not against the order the user happened to mention things. Then:

```bash
wji canvas set <videoNode> -p "…"           # only the prompt changes; model and settings stay
```

Text nodes connected into a generate node are sent ahead of the prompt as
`[node name]` + text. Don't repeat their content in the prompt.

## 3. Change generation settings

> "Make it vertical, 10 seconds, 720p, and fix the seed."

```bash
wji models get <model>                      # check 9:16 exists, duration range, seed key
wji canvas set <node> -r 9:16 -d 10 --resolution 720p --set seed=1234
```

`set` rejects values the model does not support and names the valid ones. It
merges `--set` into the existing parameters. Passing `-d` switches the
model's auto-duration off.

To switch model, pass `-m`. Settings the new model does not support fall back to
its defaults; check with `wji canvas get <node>` and tell the user what changed.

## 4. Generate directly

> "Go ahead and generate it."

**An image node just runs** (see the spending policy in SKILL.md *Rules*):

```bash
wji canvas gen <node> --yes --wait
```

Report the `credits` line from the result so the user sees what it actually
cost.

**A video or audio node needs a yes first** — so does any batch of nodes, and
`-auto` in the user's message waives both:

```bash
wji canvas gen <node>                       # prints the cost and refuses (no terminal)
```

Tell the user the cost from that message. With auto-duration it is an
estimate for the node's configured seconds; say so, or set `-d` first for a
fixed price. Only after they agree:

```bash
wji canvas gen <node> --yes --wait
```

The result becomes the node's asset, so the user sees it on the canvas. Video
can take minutes: with a long wait, prefer submitting without `--wait` and
checking `wji canvas get <node>` (status `generating` → `done`/`failed`) later.
Never resubmit a node whose status is `generating` — that charges twice.

## 5. Storyboard fan-out

> "Here are my two character images. Make one video node per shot for this
> 4-shot scene."

1. Write the shot list in the chat and agree on it.
2. Optionally drop the script on the canvas:

   ```bash
   wji canvas add text -n "Scene 3 shots" -t - < shots.txt
   ```

3. One generate node per shot, all wired to the same character images. Each
   node is placed beside the references and below the previous one:

   ```bash
   wji canvas add video -n "Shot 1" --from <char1> <char2> -m <model> -r 16:9 -d 5 -p "…shot 1…"
   wji canvas add video -n "Shot 2" --from <char1> <char2> -m <model> -r 16:9 -d 5 -p "…shot 2…"
   ```

4. Total the cost (`wji canvas gen <node>` for each, without `--yes`) and get a
   yes on that total before generating any of them. A fan-out is a batch, so
   this applies even when every node is an image — unless the request carried
   `-auto`, in which case generate them all and report the total charged.

## 6. Fix which image is `@image1`

References are numbered in connection order. To swap `@image1` and `@image2`,
reconnect the first one so it moves to the end:

```bash
wji canvas get <node>                       # @image1 ← A, @image2 ← B
wji canvas disconnect <A> <node>
wji canvas connect <A> <node>               # now @image1 ← B, @image2 ← A
wji canvas set <node> -p "…"                # update the prompt to the new labels
```

## 7. Image variation from a selected image

> "Make a watercolor version of the selected photo."

```bash
wji canvas add image -n "Watercolor" --from <photoNode> -m <imageModel> -r 16:9 \
  -p "Turn @image1 into a soft watercolor illustration, keep the composition"
wji canvas gen <newNode>                    # cost → user agrees → --yes --wait
```

## Cleaning up

`wji canvas rm` deletes nodes and every connection touching them. It is on the
confirm list: name the nodes (and how many connections go with them) in the
chat, wait for a yes, then pass `--yes`.
