# Reference binding — 參考圖綁定

A video prompt is **one string** read by a model that has never seen the storyboard, the project
or the canvas. It cannot tell `@image2` from `@image3`, cannot tell the room from a prop, and
defaults to whatever it saw in the previous shot for anything the shot does not name. So the
picture plan has to be written twice: once as a legend that says **what each picture is**, and once
inside every shot that depends on it.

Gate: `ref-binding` (stage `storyboard`, sheets mode). Proofreader for text that is not in the
project file: `prompt-audit.mjs` (shipped in `reference/`).

## The six roles — and what may not be copied from each

| Role | Legend says | Take | Explicitly NOT take |
| --- | --- | --- | --- |
| 場景 environment | `@image1` 係邊個場景 | 佈局、材質、磨損、比例 | 人物（場景圖本身冇人） |
| 光影 lighting | `@image5` 係光影參考 | 光比、反差、色溫、光源位置 | 構圖、人物、衣著 |
| 人物 character | `@image2` 係邊個人 | 面容、髮型、衣著 | 其他鏡頭嘅表情／姿勢 |
| 道具 prop | `@image4` 係邊件道具 | 外形、材質、尺寸、標記 | 枱面、背景、手 |
| 瞬間 moment | `@image6` 係「撞擊一瞬間」 | 打光方向、反差、剪影形狀 | 背景細節、其他鏡頭嘅走位 |
| 風格 style | `@image7` 係風格板 | 質感、顆粒、調色 | 題材、人物、構圖 |

Two consequences the model actually obeys:

- **一張圖一行。** 兩張人物圖寫在同一句（`@image2、@image3 是人物參考圖`）＝ 兩張圖冇分別 ＝ 面孔互換。
- **唔係人物嘅圖，一定要寫「唔照」。** 光影圖／瞬間圖如果唔寫「只照光比，不要照它的構圖與人物」，
  模型會連圖裡面嘅人一齊抄落去。

## Legend — good and bad

```
✗ @image2、@image3 是人物參考圖，照他們的面容、髮型與衣著
✗ @image4 is the character sheet of one person in this segment — match face, hair and clothes exactly
```

```
✓ @image2 是女主角三視圖（二十五六歲，齊蔭 bob 頭、oversized 黑 tee、白波鞋）：只照面容、髮型、衣著
✓ @image3 是男主角三視圖（二十七八歲，豎起黑髮、小鬍子、白 tee）：只照面容、髮型、衣著
✓ @image1 是車廂場景（右軚電動車、近黑、中控屏微光）：只照空間、材質、磨損，場景圖裡沒有人
✓ @image4 是白衣女鬼服裝與妝容參考：濕透白袍、長濕黑髮、赤腳
✓ @image5 是車廂光影參考：只照光比、反差、色溫、光源位置，不要照它的構圖與人物
✓ @image6 是「車撞女鬼一瞬間」：只照打光方向、反差與剪影形狀，不要照它的背景
✓ @image7 是風格板：只照質感、顆粒、調色
```

Every character line must carry at least two facts from the character bible (age / gender / hair /
clothes), because that is the only thing that makes two sheets distinguishable.

## Shot binding — the shot names what it depends on

```
✓ 鏡頭 1（…）：@image2 坐直指住屏幕，@image3 單手扶軚伸手去點…
✓ 鏡頭 4（…）：@image4 走出馬路正中間（照 @image6 的剪影與打光）…
✓ 鏡頭 8（…）：@image4 的白臉貼喺玻璃外；屏幕上的導航界面照 @image5 的 UI
✓ 整段都在 @image1 的空間裡：佈局、材質與舊痕不變，不要重新設計場景。
```

- 每個有角色／道具嘅鏡頭，**逐個 label 寫一次**；唔係寫喺 legend 就當夠。
- 場景 label 每段講一次就夠（「整段都在 @image1 的空間裡」）。
- Handheld / 行車感 / 鏡頭語言呢類**全段共通**嘅指令，用獨立一段寫，唔好混入逐鏡描述。
- Hand-written production prompts: run `prompt-audit.mjs` before generation; it reports unbound
  people and props per shot, indistinguishable legend lines, unused pictures, and refs that are not
  in the derived plan (so the canvas will renumber them).

```bash
node reference/prompt-audit.mjs --project <project> --ep 1 --segment E01-02 --prompt prompt.txt
```

## Ref budget

- **≤ 4 pictures per segment** unless every extra picture has a role from the table above.
- More than 3 people in one shot → every person in that shot is named; a group sheet still needs
  the individual labels if faces must be right.
- The engine caps a segment by model (`minimax-h3-ref` 9, `seedance-2.5-ref` 30, `wan-3.0-ref` 10);
  the gate `ref-binding` now also fails a sheets segment over the model's cap.

## Checklist before generating

1. 每張圖有一行 legend，寫明係邊個／邊件／邊度／邊種參考。
2. 兩張人物圖唔會讀起來一樣（年齡、性別、髮型、衣著至少兩樣）。
3. 非人物圖有「唔照」句。
4. 場景每段講一次；每個出場人物、每件道具喺自己嘅鏡頭有 label。
5. 額外接嘅圖（光影／瞬間／風格）寫入 `segment.refOverride`，否則 canvas 一接線全部編號會移。
6. `$SD validate --stage storyboard` 綠；或者 `prompt-audit.mjs` 零 error。
