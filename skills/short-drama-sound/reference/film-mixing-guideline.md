---
title: "電影／短劇混音指引（Film & Short-Drama Sound Mixing Guideline）"
subtitle: "AI 短劇製作版：WJI + Seed Audio（配樂）× Seedance（影片連內置聲音）"
date: "2026-10-11"
---

# 0. 點樣用呢份指引

- 每一節都按「**定義 → 場景例子 → 點用 → 幾時用／幾時唔好用**」寫。
- 所有響度（loudness）同電平數字都有標明出處，用 **[S#]** 表示，對應文末〈參考來源〉。**如果唔同來源講法唔同，會直接寫明。** 冇正式來源嘅地方（例如 ducking 要壓幾多 dB），會寫明「冇標準數字，靠耳朵判斷」，唔會作數字出嚟。
- 標示「**建議（推論）**」嘅位置，係根據已引用標準推出嚟嘅做法，唔係任何平台嘅官方規格。

---

# 1. 聲軌結構（Stem Structure）

業界把聲音分成三大類 **D / M / E**：Dialogue（對白）、Music（音樂）、Effects（效果）。Netflix 要求 5.1 原語言版本交 Dialog、Music、Effects 三條 stems，**三條加埋要等於 5.1 混音**；Atmos 物件同 bed 要標成 “Dialog”、“Narration”、“Group ADR”、“Music”、“Effects”、“Backgrounds”、“Foley” 等組別 [S1]。

## 1.1 DX — 對白（Dialogue）

- **定義**：所有台詞，包括現場收音（production dialogue / PFX 裡面嘅對白）、ADR（後期配音）、旁白（narration / VO）、Group ADR（群眾配音）。
- **場景例子**：茶餐廳兩個人吵交，兩句主要台詞＋背景另一枱人講嘢（後者屬 group／walla）。
- **點用**：DX 係全片嘅「錨」（anchor）。美國 ATSC A/85 同 AES 都建議長片用「錨元素（Anchor Element，通常係對白）」嚟量度響度 [S7][S8]；Netflix 亦用對白門控（dialog-gated）量度 [S1]。所以混音一定**先定對白位置，其他聲音圍住佢擺**。
- **幾時唔好**：唔好將對白同音樂、效果混埋一條無法分拆嘅軌（AI 影片內置聲音就有呢個問題，見第 9 節）。

## 1.2 MX — 音樂（Music）

| 類型 | 中文 | 定義 | 例子 |
|---|---|---|---|
| BGM (Background Music) | 背景音樂 | 亞洲製作常用講法，泛指襯底音樂；英文業界多講 score / underscore | 男女主對望時嘅鋼琴襯底 |
| Score / Underscore | 配樂、原創配樂 | 為該片作曲、角色聽唔到嘅非劇情音樂（non-diegetic） | 追逐戲嘅弦樂 |
| Source music / Diegetic music | 現場音樂、劇情內音樂 | 聲源喺故事世界入面（收音機、酒吧樂隊）[S12] | 酒吧電視播緊嘅流行曲 |
| Needle drop | 授權現成歌曲 | 直接用一首現成錄音（commercial track），可以係 source 亦可以係 score 用途 | 結尾 montage 放一首廣東歌 |

- **點用**：source music 要「放入空間」——跟住畫面位置、加房間殘響、透過門牆時削高頻。iZotope 舉例「隔離屋傳嚟嘅音樂」：削高頻、推低頻 [S11]。Score 則通常乾淨、闊、唔跟空間。
- **幾時唔好**：需要聽清楚對白嘅位置唔好用人聲歌（有歌詞嘅 needle drop 同對白會「打交」）；Netflix 亦把有可辨認歌詞嘅片段列為 M&E 嘅 optional 處理 [S2]。

## 1.3 FX — 效果（Effects）

包括 Hard FX、Foley、Backgrounds（BGs）、Design FX 等，詳見第 3 節。Netflix 將 “Effects”、“Backgrounds”、“Foley” 列為可獨立標示嘅組別 [S1]。

## 1.4 M&E（Music & Effects）

- **定義**：除咗對白之外嘅所有聲音，用嚟做外語配音版。
- **Netflix 要求**：要「fully filled」——原本藏喺對白軌入面嘅環境聲同 Foley 都要補返（fill），「主混音入面任何非對白聲音都要喺 M&E 出現」；音樂電平完全唔准改 [S1][S2]。帶語言嘅 walla、角色嘅呼吸／喘氣、唱歌人聲等放 **Optional Tracks** [S2]。
- **場景例子**：街市戲，現場收音裡面有叫賣聲（有語言）同人群雜聲；M&E 要用冇語言嘅 walla 補返人群感，叫賣聲放 optional track。
- **幾時用**：要賣海外、要出普通話／英文配音版，就一定要做。純粹只出一個廣東話版本上社交平台，可以唔做，但**保留分軌工程檔**都係好習慣。

## 1.5 Mix Stems 與 Printmaster

- **Mix stems**：最終混音按 D / M / E（或更細）分開輸出，每條已經帶齊混音處理；**全部 stems 加埋＝printmaster** [S1]。
- **Printmaster（PM）**：最終完整混音母帶。Netflix 嘅 printmaster、M&E、stems 可以帶標準 8 秒 Academy leader 同 2-pop [S1]。
- **例子**：一集 2 分鐘短劇，交：`EP01_PM_2.0.wav`、`EP01_DX.wav`、`EP01_MX.wav`、`EP01_FX.wav`、`EP01_ME.wav`。
- **規格參考**：Netflix 原語言 mix／M&E／stems 要 48 kHz / 24-bit、無壓縮 LPCM WAV/BWAV [S1]。

---

# 2. BGM vs BGE：亞洲製作用語

| 縮寫 | 全寫 | 中文 | 對應英文業界用語 |
|---|---|---|---|
| BGM | Background Music | 背景音樂、配樂 | Score / underscore / music |
| BGE | Background Effects（亦有人讀作 Background Environment） | 背景音效、環境聲 | Backgrounds (BGs)、Ambience、Atmos |
| SE | Sound Effect(s) | 效果音、音效 | SFX / FX |

- **重要說明**：**BGE 唔係國際標準術語**，冇任何標準組織（EBU、AES、SMPTE）正式定義。佢係日本、中國內地、香港製作現場、音效庫分類同 cue sheet 常見嘅習慣寫法，意思大致等於英文嘅 **Backgrounds / Ambience**。日本相關用語可作旁證：日本遊戲工具 RPG Maker 將「BGS」定義為「背景音（環境音）」（雨聲、街道嘈雜聲、火燒聲）[S19]；日本作曲學校解釋「環境音（アンビエンス）係效果音嘅一種，製造場所嘅空氣感」[S20]。我搵唔到一個權威來源專門定義「BGE」，所以同外國團隊溝通時，**請改用 BGs / Ambience**，避免誤會。
- **BGE 底下包含**：
  - **Ambience / Atmos（環境聲）**：持續嘅空間聲——風、雨、冷氣機、街道車聲、蟬叫。
  - **Room tone（房間底噪）**：「冇人講嘢時」嗰個房間本身嘅聲，用嚟填補對白剪接之間嘅空隙，令剪接位唔會突然靜晒 [S21]。
  - **Walla（人群雜聲）**：聽唔清內容嘅群眾低語。Netflix 規定冇語言嘅 walla 留喺 M&E 主體，有可辨認語言嘅放 optional track [S2]。
  - **Backgrounds (BGs)**：英文後期對以上整類嘅統稱。
- **場景例子**：深夜醫院走廊——BGM＝低沉 pad；BGE＝冷氣機 hum＋遠處監察儀嘀嘀聲＋偶爾護士站 walla。
- **點用**：BGE 決定「觀眾覺得自己喺邊」。每個場景至少一層 BG loop；轉場換 BG 就等於換地方。
- **幾時唔好**：BGE 唔好大聲到搶對白頻段；情緒高峰（例如表白）可以刻意抽走 BGE 做「主觀靜」效果。

---

# 3. SFX — 效果聲

| 類別 | 定義 | 場景例子 | 幾時用 | 幾時唔好用 |
|---|---|---|---|---|
| Hard effects（硬效果） | 同畫面動作逐格對位嘅具體聲：關門、車門、槍聲、手機震 | 女主「啪」一聲合上手提電腦 | 每個觀眾會「期待聽到」嘅動作 | 畫面已有 AI 內置同一聲時，唔好再疊一層（會 phasing／雙響） |
| Design effects（設計效果） | 現實中唔存在或經誇張處理嘅聲：超自然、回憶閃回、時間停頓 | 重生穿越一刻嘅「嗡——」 | 類型片、奇幻、情緒放大 | 寫實對白戲，太多會好假 |
| Foley（擬音） | 跟住畫面重新錄製嘅日常聲：footsteps 腳步、cloth／moves 衣服摩擦、props 道具 [S20][S21] | 高跟鞋行入辦公室、西裝摩擦、放低咖啡杯 | 令角色「有重量」、M&E 必須補齊 [S2] | 遠景、或配樂主導嘅 montage 可以省略 |
| Sound design（聲音設計） | 整體構思並創作聲音世界嘅工作，唔只係一粒聲 | 為「霸總」角色設計一套低頻、厚實嘅出場聲標記 | 建立風格、角色主題 | — |
| Whoosh（呼嘯聲） | 物件／鏡頭快速移動嘅風聲 | 快速 swish pan、文字飛入 | 動態轉場、鏡頭運動 | 每個 cut 都加會好廉價 |
| Riser（升調音效） | 音高／音量逐步上升，製造期待 | 揭曉身世前 3 秒 | 鋪墊 reveal、cliffhanger | 連續用會麻木 |
| Impact / Hit（撞擊） | 短促、重低頻嘅「咚」 | 巴掌、真相揭曉、標題出現 | 情緒重拍、剪接重拍 | 對白中間（會蓋過字） |
| Stinger（刺點音效） | 一兩秒嘅短音樂／音效，標記戲劇時刻 | 「你居然係我親生仔？！」後一下 stinger | 劇情轉折、喜劇 punchline | 每句都加 |
| Transition（轉場音效） | 連接兩場戲嘅聲音（whoosh、reverse cymbal、tape stop） | 由回憶跳返現在 | 時空轉換 | 寫實、平靜嘅剪接 |

---

# 4. 劇情內／劇情外聲音（Diegetic / Non-diegetic / Meta-diegetic）

- **Diegetic（劇情聲）**：聲源屬故事世界，角色聽得到，可以喺畫內（on-screen）或畫外（off-screen）——對白、物件聲、劇中收音機音樂（source music）[S12]。
  - 例子：角色開收音機，播出情歌。
- **Non-diegetic（非劇情聲）**：聲源喺故事世界之外，角色聽唔到——旁白、情緒配樂、為戲劇效果加嘅音效 [S12]。
  - 例子：表白時嘅弦樂 swell。
- **Meta-diegetic（後設／主觀劇情聲）**：學者 Claudia Gorbman 喺 *Unheard Melodies*（1987）提出，指只存在於某角色腦海嘅聲音——回憶、幻想、幻聽 [S13]。
  - 例子：女主聽到男友把聲（其實係回憶），周圍環境聲逐漸消失。
- **點用**：FilmSound.org（摘自 Bordwell & Thompson《Film Art》）指出，玩弄劇情／非劇情界線可以製造驚嚇（恐怖片）或意外（喜劇）[S12]。常見技巧：音樂由「劇情內收音機」平滑變成「全闊配樂」（source → score），表示角色投入情緒。
- **處理差別**：diegetic 要跟空間（加 reverb、跟 pan、隔牆削高頻）；non-diegetic 通常乾淨、闊、唔跟畫面位置；meta-diegetic 常用濾波、殘響、壓走環境聲嚟表達「主觀」。

---

# 5. 混音技巧（Mix Techniques）

## 5.1 Ducking 與 Sidechain

- **定義**：Ducking＝有對白時自動壓低音樂／BGE。Sidechain＝用另一條軌（對白）嘅訊號觸發壓縮器。
- **例子**：BGM 一路播，角色開口時 BGM 自動降低，講完回升。
- **點用**：iZotope 文章做法：喺音樂 bus 放 sidechain compressor，由對白 bus 送訊號觸發，「等對白自己控制音樂電平」[S11]。進階：只壓音樂嘅 1.5–4 kHz 頻段（多頻段壓縮，sidechain 由對白觸發），即係「只在有對白時挖走語音清晰度頻段」[S11]。
- **壓幾多 dB？** 冇標準數字，按耳朵：對白清楚、而音樂唔會明顯「抽動」（pumping）為準。
- **幾時唔好**：音樂本身係情緒主角（冇對白嘅 montage）時唔好 duck；動作快嘅對白戲如果 duck 太快會聽到音樂一上一落，改用手動 automation。

## 5.2 EQ carving（為對白挖頻）

- **定義**：喺音樂／效果度削低同對白相撞嘅頻段。
- **來源數據**：iZotope 指出通常係削音樂嘅 **1–4 kHz**，而語音清晰度集中喺 **1.5–4 kHz** [S11]。
- **問題**：靜態削 EQ 會令冇對白時音樂發悶，所以用上面嘅動態（sidechain 多頻段）做法更好 [S11]。

## 5.3 壓縮（Compression）

- iZotope 建議：「呢個唔係搖滾」，壓縮唔好多過約 **-6 dB gain reduction**；bus limiter 唔多過約 **-2 dB** [S11]。對白對過度壓縮特別敏感，句尾變細聲可用 clip gain 逐句扶起 [S11]。
- Netflix 建議 dialog LRA（響度範圍）≤ 10 LU、全片 LRA 4–18 LU 播放效果最好 [S1]——即係對白要相對平穩，但全片可以有起伏。

## 5.4 Reverb／空間匹配（Space matching）

- **定義**：令 ADR、AI 生成對白、Foley 聽落同畫面空間一致。
- **例子**：iZotope 例子：籃球場嘅 ADR 要加 reverb 先夾到畫面 [S11]。電話聲、廣播聲用 EQ／失真做「futz」[S11]。
- **幾時唔好**：旁白（VO）通常保持乾淨，唔加場景殘響。

## 5.5 Panning 與 LCR 規則（對白放中間）

- **規則**：主要對白放 **Center（C）聲道**。Dolby 解釋：只用 center 喇叭可以令每個座位嘅觀眾都聽到穩定嘅中央聲像；phantom center（L/R 平均）就要求觀眾坐正中，家中同車上好難做到；可以把 center 嘅 reverb 擴散到 L/R，避免太窄 [S10]。
- **立體聲（2.0）**：對白 L/R 等量＝正中；Netflix 要求 2.0 Lo/Ro 要「mono compatible」[S1]。
- **幾時例外**：畫外角色喺畫面最左右邊緣、或刻意製造方位感時可輕微偏 pan，但短劇（手機）建議對白一律正中。

## 5.6 Surround 與 LFE 基本

- **LFE（.1）**：專門嘅低頻效果聲道；Dolby Digital 嘅 LFE 頻寬 3–120 Hz [S10]；校準時 LFE 每個 1/3 倍頻帶比全頻喇叭高 **10 dB** [S10]；consumer 低音管理分頻點要求 80 Hz [S10]。Dolby 亦提醒 LFE「未必係唯一或最好嘅重低音手段」[S10]。
- **5.1 → 2.0 縮混（Netflix）**：Center -3 dB 放入 L、R；Surround 最少 -3 dB 摺入對應 L/R；LFE 可選以 -8 至 -12 dB 加入，並 200 Hz 或以下低通 [S1]。Netflix Best Practices 亦指 ITU-R BS.775-1（LFE 靜音）係國際標準縮混 [S1]——**兩個做法對 LFE 處理唔同，交貨前要問清楚**。
- **短劇**：手機外放基本冇低頻，**唔好將重要資訊只放喺 LFE／超低頻**。

## 5.7 Automation（自動化）

- 逐句、逐場畫 fader 曲線。iZotope 指 automation 配合適度動態處理可以補償大量電平變化 [S11]。
- 例子：BGM 喺對白前 0.5 秒先開始下降，對白完後慢慢回升（比 sidechain 更自然）。

## 5.8 Crossfade（交叉淡化）

- 剪接位兩段聲重疊淡入淡出，避免「咔」聲。BGE 換場用較長 crossfade；對白剪接用極短 crossfade＋room tone 填底。

## 5.9 J-cut、L-cut、Pre-lap、Sound bridge

- **Split edit（分離剪接）**：聲畫唔同時切換。Apple Final Cut Pro 說明：J-cut＝下一場聲音先出現，L-cut＝上一場聲音延續到下一個畫面 [S15]。
- **Pre-lap**：即 J-cut 嘅用法——下一場對白／聲音提早出現。例子：仲見緊男主喺辦公室，已經聽到下一場女主喺醫院嘅一句「醫生點講？」
- **Sound bridge（聲音橋）**：用一段聲（音樂、環境、對白）連住兩場戲，令觀眾感覺連續；通常用 J/L-cut 實現。
- **幾時唔好**：喜劇 punchline、驚嚇位通常要硬切（hard cut）先夠力。

## 5.10 Hard cut to silence 與對比（Contrast）

- **定義**：喺最大聲嗰刻突然完全靜音，或者由靜突然大聲。
- **例子**：車禍前一刻所有聲突然消失，只剩心跳；或者 cliffhanger 最後一個字出完即黑畫＋靜。
- **點用**：「靜」要靠前面嘅「滿」嚟襯托；靜音時建議保留極低 room tone 以免觀眾以為壞機（純數碼零聲喺某些平台會好突兀）——但刻意全靜都可以，係創作選擇。
- **幾時唔好**：唔好喺每集重複同一招。

---

# 6. 響度與電平（Loudness & Levels）

## 6.1 基本概念

- **LUFS / LKFS**：兩者相同，都係 ITU-R BS.1770 嘅響度單位；EBU 用 LUFS，ITU 用 LKFS [S3][S6]。1 LU＝1 dB 差距。
- **Integrated loudness（整體響度）**：成個節目平均響度，BS.1770 量度設有門控：絕對門限 -70 LKFS、相對門限低於平均 10 LU [S18]（EBU 2011 年將相對門限由 -8 改為 -10 LU [S3]）。
- **True Peak（dBTP，真峰值）**：用超取樣估計樣本之間嘅真實峰值；BS.1770 定義算法 [S6]。
- **Dialogue-gated loudness（對白門控響度）**：只計有對白時段嘅響度。Netflix 用 BS.1770-1 dialog-gated [S1]；ATSC A/85 長片用「錨元素」（通常對白）量度 [S7][S18]。
- **LRA（Loudness Range）**：響度起伏範圍（EBU Tech 3342）。

## 6.2 主要標準與平台數字（全部有出處）

| 用途 | 響度目標 | 真峰值上限 | 量度方式 | 來源 |
|---|---|---|---|---|
| 戲院（Theatrical） | **冇 LKFS 要求**；以 85 dB SPL 參考監聽電平混音 | 可到 0 dBTP | 校準：粉紅噪音參考電平時前方每聲道 85 dBC、film 房 surround 82 dBC | Netflix [S1]；Dolby [S10] |
| Netflix 串流（near-field 5.1／2.0／Atmos） | **-27 LKFS ±2 LU**（對白門控） | **-2 dBTP**（建議 limiter 設 -2.3） | BS.1770-1 dialog-gated，全片量度；監聽 79 或 82 dB SPL | [S1] |
| Netflix：對白少於 15% 嘅節目 | -24 LKFS ±2 LU（全節目） | -2 dBTP | BS.1770-3/-4 | [S1] |
| 歐洲廣播 EBU R128 | **-23.0 LUFS ±0.5 LU**（直播 ±1 LU） | **-1 dBTP** | 全節目 | [S3] |
| 電影內容上廣播／串流（EBU R128 s4） | 預設全節目 -23 LUFS；或對白錨定最高 -23 LUFS（全節目可因此高至約 -18 LUFS） | -1 dBTP | 全節目或對白錨定 | [S5] |
| 美國電視 ATSC A/85 | **-24 LKFS**（約 ±2 dB 量度誤差可接受） | 低於 **-2 dBTP** | 長片：錨元素（對白） | [S7] |
| 日本（AES 表列） | -24 ±1 LKFS | -1 dBTP | 全節目 | [S8] |
| OTT／網上影片（AES TD1006） | 跟所在地區廣播規格；**最大響度建議 -16 ±1 LUFS** | -1 dBTP | — | [S8] |
| 串流（EBU R128 s2） | 首選照 -23 LUFS 播出；如冇 metadata，過渡期可用 **-20 至 -16 LUFS** | （跟 R128） | — | [S4] |
| 純音頻串流（AES TD1008，非影片） | 有語音內容約 -18 LUFS；音樂 -16 LUFS | — | — | [S9] |
| YouTube | **官方未公佈目標**；只會調低過大聲嘅影片，唔會推高過細聲嘅；可喺 “Stats for nerds” 睇 content loudness | — | 自家算法 | [S16] |
| TikTok／抖音／Reels／小紅書 | **搵唔到官方公佈嘅響度規格**（查閱 TikTok 開發者上載指引時未見響度要求） | — | — | [S22] |

**來源之間嘅差異（要留意）：**

1. 串流目標由 **-27（Netflix 對白門控）** 到 **-23／-24（歐美廣播）** 到 **-16（AES OTT 上限、EBU s2 過渡上限）**，相差超過 10 LU——**量度方法唔同（對白門控 vs 全節目）都會令數字唔可直接比較**。
2. 真峰值：EBU／AES 用 -1 dBTP [S3][S8]；ATSC 同 Netflix 用 -2 dBTP [S7][S1]。ATSC 解釋 -2 dBTP 係為下游有損編碼留空間 [S7]；EBU 亦指出不同發行系統同低碼率可能需要更低峰值 [S3]。
3. 戲院冇響度目標，靠校準監聽電平（85 dB SPL）控制 [S1][S10]；家用 near-field 用 79／82 dB SPL [S1]。Dolby 指電視混音參考 79–82 dBC，因為家居平均收聽電平約 70–75 dBC [S10]。

## 6.3 建議（推論）：交貨版本

> 以下係根據上表推出嚟嘅實務建議，**唔係任何平台官方規格**。

| 版本 | 建議目標 | 依據 |
|---|---|---|
| 社交平台直版短劇（抖音／TikTok／Reels／Shorts） | Integrated 約 **-16 LUFS**，True Peak **≤ -1 dBTP**（想多啲有損編碼安全空間可用 -2 dBTP） | AES TD1006 OTT 上限 -16 ±1／-1 dBTP [S8]；EBU R128 s2 過渡範圍 -20 至 -16 [S4]；ATSC 對有損編碼留空間嘅理由 [S7] |
| 交電視台（香港／海外） | **向播映方索取規格**；冇規格時：歐洲 -23 LUFS／-1 dBTP，美國 -24 LKFS／-2 dBTP | [S3][S7] |
| 交 Netflix 類串流 | -27 LKFS ±2 LU 對白門控，-2 dBTP | [S1] |

**實務提醒**：先做一個「有動態、對白穩定」嘅 master，再按平台輸出不同響度版本，**唔好用一個極大聲嘅版本通殺**——YouTube 等平台會將過大聲嘅片調低，大聲版本只會失去動態而唔會更大聲 [S16]。

---

# 7. 工作流程次序（Workflow Order）

參考 Boom Box Post（美國動畫後期公司）嘅流程 [S14] 同 iZotope [S11]，加入電影常見步驟：

| # | 步驟 | 做乜 | AI 短劇對應 |
|---|---|---|---|
| 1 | Picture lock（剪接定稿） | iZotope：未鎖定剪接唔好開始混音 [S11] | Seedance 片段剪好、唔再改長度 |
| 2 | Spotting session（定點會議） | 同導演／監製睇一次，逐場傾聲音要求、每個時刻要乜 [S14] | 自己睇一次，列 cue sheet：邊度要 BGM、stinger、靜 |
| 3 | Dialogue edit（對白剪輯） | 揀 take、清噪、補 room tone、標記要 ADR 嘅句子 | 檢查 AI 對白：口型、字錯、音質爆裂（Seedance 官方承認仍有偶發失真）[S17] |
| 4 | ADR（後期配音） | 重錄唔可用嘅對白，並配合場景空間 [S11] | 用 TTS／重新生成，或真人配音覆蓋 |
| 5 | Foley | 腳步、衣服、道具 | 只補 AI 冇生成或生成得差嘅 |
| 6 | SFX edit（效果剪輯） | Hard FX、BGs、design FX | 加 stinger、whoosh、impact；**避免重複** AI 已有嘅聲 |
| 7 | Music edit（音樂剪輯） | 剪 BGM 長度、對準剪接點、做 swell／ending | Seed Audio BGM 剪成每場一段，對準情緒點 |
| 8 | Premix / Pre-dub（預混） | 先各自平衡 DX、MX、FX；Boom Box Post 形容係「洗車」，大部分功夫喺呢度 [S14] | 分別處理 AI 原聲 bus、BGM bus、SFX bus |
| 9 | Final mix（終混） | 精修、按客戶意見調整 [S14]；iZotope 建議實時播放輸出而唔係 offline bounce，以便全程聽一次 [S11] | 全集由頭聽到尾，手機＋耳機各一次 |
| 10 | QC（品質檢查） | 響度、真峰值、同步、爆音、靜音位、縮混 | 用響度表量 integrated／TP |
| 11 | Deliverables（交付） | Printmaster、stems、M&E、不同響度版本 | 社交版＋存檔分軌 |

---

# 8. 短劇專用章節（Short-Drama Specific）

## 8.1 直版 9:16 與手機外放

- **現實**：大部分觀眾用手機外放或耳機、喺嘈雜環境睇。AES 嘅流動裝置初步測試發現：-24／-20／-16 LKFS 三個目標喺安靜環境都聽得清，但嘈雜環境下「某種動態範圍控制係需要嘅」[S8]。EBU 亦提到流動裝置增益同 headroom 不足係串流用較高響度嘅原因 [S4]。
- **做法**：
  1. **對白優先、動態收窄**：對白要穩（參考 Netflix dialog LRA ≤10 LU 嘅精神 [S1]），社交短劇可以再窄啲（推論，冇官方數字）。
  2. **唔好靠低頻表達重點**：手機外放細喇叭重播唔到深低頻；impact 要加中高頻「頭」（click／transient）先聽到。
  3. **單聲道兼容（mono compatible）**：Netflix 要求 2.0 要 mono compatible [S1]；手機外放、藍牙喇叭好多時接近單聲道，寬立體聲效果（相位處理）可能抵消。用 mono 監聽檢查。
  4. **字幕唔等於可以犧牲對白**：好多人靜音睇，但開聲嘅觀眾一聽唔清就滑走。

## 8.2 喜劇節奏（Comedy hit timing）

- **Punchline sting**：笑位一句講完**之後**先入 sting（短促音效／音樂），唔好蓋住最後一隻字。
- **Rimshot**（「咚咚—嚓」）：老派、自嘲式笑位；短劇用嚟做「冷笑話」效果。
- **常見手法**：笑位前一刻把 BGM 抽走（record scratch／tape stop），製造真空，punchline 後再入一個搞笑 BGM。

## 8.3 愛情 Swell（Romance swell）

- **定義**：音樂喺情緒高峰（擁抱、表白、對望）逐漸加大、加樂器層次。
- **做法**：swell 嘅高峰對準動作（kiss／擁抱）或剪接點；對白期間 BGM 要壓低，講完先爆出嚟。可配合 BGE 抽走（主觀化）。
- **幾時唔好**：對白仲講緊時唔好 swell 到頂。

## 8.4 Cliffhanger：Sting＋靜音

- 每集最後一句（「其實……我先係你親生媽媽。」）→ 0.2–0.5 秒停頓 → impact／stinger → 黑畫／靜（或只留尾音殘響）。秒數係常見做法參考，冇標準，按節奏調整。
- 前面 2–3 秒可用 riser 推高張力，然後**硬切到靜**（hard cut to silence），令觀眾想撳下一集。

## 8.5 中式短劇常見聲音套路（Tropes）

| 套路 | 典型聲音處理 |
|---|---|
| 霸總出場 | 慢動作＋低頻 impact＋厚重 BGM（常見 trap／epic 鼓），腳步 Foley 放大 |
| 打臉／逆襲 | 巴掌 impact＋短 stinger＋BGM 突然轉調或爆出 |
| 身份揭曉（真千金、戰神歸來） | riser → impact → 靜 → 主題 BGM 入 |
| 重生／穿越 | design FX（嗡鳴、倒轉、心跳）＋濾波、殘響（meta-diegetic 處理） |
| 回憶殺 | 環境聲淡出、對白加殘響／濾波、柔和鋼琴 BGM |
| 心動瞬間 | 心跳聲＋風鈴／閃光音效＋romance swell |
| 震驚反應鏡頭 | 「當！」stinger 或 whoosh＋zoom 同步 |
| 喜劇反差 | record scratch、烏鴉叫、rimshot |

## 8.6 對應 AI 流程：Seedance 內置聲音＋Seed Audio BGM

**背景**：Seedance 2.0 官方說明佢採用「音畫聯合生成」架構，輸出雙聲道（立體聲）聲音，支援背景音樂、環境音效同角色配音「多軌並行輸出」並對齊畫面節奏；官方亦承認仍有「偶發音頻失真」[S17]。實際你攞到嘅檔案可能係**已混埋嘅一條立體聲**，要先確認你嘅平台／版本能否分開下載各軌（我未能核實你用嘅介面）。

**建議流程（推論）：**

1. **生成時控制**：喺 Seedance prompt 寫明「無背景音樂」（no background music），只要對白＋環境聲（Seedance 官方示例亦有 “no background music” 嘅寫法 [S17]）。咁 BGM 全部由 Seed Audio 控制，避免兩層音樂打交。
2. **軌道結構**：
   - Bus A — **AI 原聲（DX＋BGE）**：Seedance 輸出。
   - Bus B — **BGM**：Seed Audio（WJI）生成嘅配樂床（bed）。
   - Bus C — **加料 SFX**：stinger、whoosh、impact、補 Foley。
3. **Duck BGM**：Bus B 放 sidechain compressor（或多頻段 1.5–4 kHz），key input＝Bus A [S11]。**注意**：Bus A 入面有環境聲，環境聲都會觸發 ducking——如果 BGE 太大聲，BGM 會成日被壓。解決：用 automation 手畫，或用語音分離工具抽出對白做 sidechain 源。
4. **避免重複 SFX（doubling）**：加任何 SFX 前，先 solo 聽 AI 原聲有冇已經生成咗（關門、腳步、雨聲）。兩個唔完全同步嘅同一聲會變「雙響」或相位抵消。原則：**AI 有而且夠好 → 唔加；AI 有但弱 → 輕輕疊一層同步嘅加強；AI 冇 → 補。**
5. **場與場之間嘅一致性**：每段 Seedance 片（最長 15 秒 [S17]）嘅環境聲同對白音色可能唔同。做法：(a) 每段之間 crossfade BGE；(b) 全場鋪一條統一嘅 BG loop 喺 AI 原聲之下，遮蓋接駁位；(c) 對白 bus 用一致嘅 EQ／壓縮令音色統一。
6. **BGM 剪接**：Seed Audio BGM 要按場景剪，情緒點（揭曉、表白）對準音樂重拍或 swell；cliffhanger 前 BGM 硬停。
7. **最後**：量響度（見第 6.3 節），手機外放＋耳機各聽一次。

---

# 9. 詞彙表（Glossary）

| Term | 中文 | 一句解釋 |
|---|---|---|
| DX / Dialogue | 對白 | 所有台詞（現場、ADR、旁白） |
| MX / Music | 音樂 | 配樂、現場音樂、授權歌曲 |
| FX / SFX | 效果聲 | 所有非對白、非音樂嘅聲 |
| D/M/E | 對白／音樂／效果 | 三大分軌類別 |
| Stem | 分軌 | 某類聲音嘅獨立混音輸出 |
| M&E | 音樂及效果版 | 冇對白嘅完整版本，用嚟配外語 |
| Optional track | 可選軌 | 帶語言、配音時可能要換嘅聲（walla、呼吸、歌聲） |
| Printmaster (PM) | 最終混音母帶 | 完整終混檔 |
| BGM | 背景音樂 | 亞洲用語，襯底配樂 |
| BGE | 背景音效／環境聲 | 亞洲習慣用語，非國際標準，約等於 BGs／Ambience |
| BGs / Backgrounds | 背景聲 | 英文後期對環境聲類嘅統稱 |
| Ambience / Atmos | 環境聲、氛圍聲 | 持續空間聲（風、車、冷氣） |
| Room tone | 房間底噪 | 空房間本身嘅聲，用嚟填對白空隙 |
| Walla | 人群雜聲 | 聽唔清內容嘅群眾低語 |
| Group ADR | 群眾配音 | 後期錄製嘅群眾聲 |
| Score / Underscore | 原創配樂 | 為片創作、角色聽唔到嘅音樂 |
| Source music | 現場音樂 | 劇情內有聲源嘅音樂 |
| Needle drop | 授權歌曲 | 直接使用現成錄音 |
| Hard effects | 硬效果 | 同動作逐格對位嘅具體聲 |
| Design effects | 設計效果 | 誇張或虛構嘅聲音 |
| Foley | 擬音 | 跟畫面重錄嘅腳步、衣服、道具聲 |
| Footsteps | 腳步聲 | Foley 主要一類 |
| Cloth / Moves | 衣服摩擦聲 | Foley 一類 |
| Props | 道具聲 | Foley 一類（杯、鎖匙、紙） |
| Sound design | 聲音設計 | 構思及創作整體聲音世界 |
| Whoosh | 呼嘯聲 | 快速移動／轉場風聲 |
| Riser | 升調音效 | 逐漸上升製造期待 |
| Impact / Hit | 撞擊聲 | 短促重拍 |
| Stinger / Sting | 刺點音效 | 標記戲劇時刻嘅短聲 |
| Rimshot | 鼓邊笑點聲 | 「咚咚嚓」喜劇標記 |
| Transition | 轉場聲 | 連接兩場戲嘅效果 |
| Swell | 音樂漸強 | 情緒高峰嘅音樂推高 |
| Diegetic | 劇情聲 | 角色聽得到嘅故事內聲音 |
| Non-diegetic | 非劇情聲 | 角色聽唔到（配樂、旁白） |
| Meta-diegetic | 主觀劇情聲 | 只存在角色腦海嘅聲音 |
| On-screen / Off-screen | 畫內／畫外 | 聲源喺唔喺畫面內 |
| Ducking | 避讓壓低 | 有對白時壓低音樂 |
| Sidechain | 側鏈 | 用另一條訊號觸發處理器 |
| EQ carving | 挖頻 | 削走相撞頻段 |
| Compression | 壓縮 | 收窄動態範圍 |
| Limiter | 限幅器 | 防止超過峰值上限 |
| Reverb | 殘響 | 模擬空間反射 |
| Futz | 失真化處理 | 電話、對講機效果 |
| Panning | 聲像定位 | 左右／環繞位置 |
| LCR | 左中右 | 前方三聲道 |
| Phantom center | 幻象中置 | L/R 等量產生嘅中間聲像 |
| LFE | 低頻效果聲道 | 5.1 嘅 .1 |
| 5.1 / 7.1.4 / Atmos | 環繞聲格式 | 多聲道／物件式格式 |
| Lo/Ro | 立體聲縮混 | 一般立體聲 fold-down |
| Downmix / Fold-down | 縮混 | 多聲道縮成少聲道 |
| Automation | 自動化 | 記錄推子／參數變化 |
| Crossfade | 交叉淡化 | 兩段聲重疊過渡 |
| J-cut | J 型剪接 | 聲音早過畫面出現 |
| L-cut | L 型剪接 | 聲音延續到下一畫面 |
| Pre-lap | 預先入聲 | 下一場聲音提前出現 |
| Sound bridge | 聲音橋 | 用聲音連接兩場戲 |
| Hard cut to silence | 硬切靜音 | 突然完全靜 |
| LUFS / LKFS | 響度單位 | BS.1770 響度量度單位 |
| LU | 響度單位差 | 1 LU＝1 dB |
| Integrated loudness | 整體響度 | 全節目平均響度 |
| Dialogue-gated | 對白門控 | 只計對白時段 |
| Anchor element | 錨元素 | 量度響度嘅參考元素，通常對白 |
| True Peak (dBTP) | 真峰值 | 樣本間真實最高電平 |
| LRA | 響度範圍 | 節目響度起伏 |
| dBFS | 數碼滿刻度分貝 | 0 dBFS＝數碼最高 |
| dB SPL / dBC | 聲壓級 | 監聽校準用 |
| Near-field | 近場 | 家用規模監聽 |
| Spotting session | 定點會議 | 逐場決定聲音要求 |
| ADR | 後期配音 | 重錄對白 |
| Premix / Pre-dub | 預混 | 各類聲音先行平衡 |
| Final mix | 終混 | 最後整體混音 |
| Re-recording mixer | 終混混音師 | 負責終混嘅人 |
| QC | 品質檢查 | 交貨前技術檢查 |
| Deliverables | 交付物 | 要交嘅檔案清單 |
| 2-pop / Leader | 同步嗶聲／片頭 | 對位用 |
| Picture lock | 剪接定稿 | 畫面唔再改長度 |
| Cue sheet | 音樂／聲音清單 | 記錄每段聲音位置 |

---

# 10. 一頁混音檢查清單（Quick Mix-Pass Checklist）

**開工前**
- [ ] 畫面已 lock；session 幀率＝影片幀率 [S11]；48 kHz / 24-bit [S1]
- [ ] 分好 bus：DX（AI 原聲）／BGE／MX（BGM）／SFX／Foley
- [ ] 做咗 spotting：列出每個 stinger、swell、靜音、cliffhanger 位置

**對白（DX）**
- [ ] 每句對白清楚，手機外放都聽得明
- [ ] 對白放正中（2.0 L/R 等量；5.1 放 C）[S10]
- [ ] 壓縮適度（約 ≤ 6 dB GR）[S11]；句尾冇跌失
- [ ] AI 對白冇爆音、失真、錯字 [S17]

**音樂（MX）**
- [ ] BGM 有 duck 或 automation 避開對白 [S11]
- [ ] 冇兩層音樂同時播（Seedance 已設 no BGM）
- [ ] Swell／sting 對準情緒點，冇蓋住 punchline 最後一隻字

**效果（FX／BGE）**
- [ ] 冇重複 AI 已生成嘅 SFX（solo 檢查）
- [ ] 每段 15 秒片之間環境聲冇斷層（crossfade／BG loop）
- [ ] Impact 有中高頻，手機都聽到

**空間與轉場**
- [ ] ADR／補錄對白殘響同畫面空間一致
- [ ] J-cut／L-cut／sound bridge 用得其所；笑位驚嚇位用硬切
- [ ] Cliffhanger：riser → 最後一句 → sting → 靜

**技術 QC**
- [ ] 量 Integrated loudness 同 True Peak：社交版建議（推論）約 -16 LUFS、≤ -1 dBTP [S4][S8]；其他平台按 6.2 表
- [ ] Mono 檢查冇抵消 [S1]
- [ ] 手機外放＋耳機＋（如有）喇叭各聽一次
- [ ] 頭尾冇爆音、冇 click、冇意外靜音
- [ ] 實時播放一次全集（唔只睇波形）[S11]

**交付**
- [ ] Printmaster＋DX/MX/FX stems（加埋＝PM）[S1]
- [ ] 如要海外配音：fully filled M&E＋optional tracks [S2]
- [ ] 檔名有版本、響度標記（例：`EP01_PM_2.0_-16LUFS_v2.wav`）[S11]

---

# 參考來源（Sources）

- **[S1]** Netflix, *Sound Mix Specifications & Best Practices*（OC-1-6, 2024-10-29）— https://partnerhelp.netflixstudios.com/hc/en-us/articles/360001794307-Netflix-Sound-Mix-Specifications-Best-Practices-v1-5
- **[S2]** Netflix, *M&E Creation & Delivery Guidelines* — https://partnerhelp.netflixstudios.com/hc/en-us/articles/115006122187-M-E-Creation-Delivery-Guidelines
- **[S3]** EBU, *R 128 – Loudness Normalisation and Permitted Maximum Level of Audio Signals*（V5, Nov 2023）— https://tech.ebu.ch/docs/r/r128.pdf
- **[S4]** EBU, *R 128 s2 – Loudness in Streaming*（2023）— https://tech.ebu.ch/files/live/sites/tech/files/shared/r/r128s2.pdf
- **[S5]** EBU, *R 128 s4 – Loudness Normalisation of Cinematic Content*（2023）— https://tech.ebu.ch/files/live/sites/tech/files/shared/r/r128s4.pdf
- **[S6]** ITU-R, *BS.1770-5 – Algorithms to measure audio programme loudness and true-peak audio level*（11/2023）— https://www.itu.int/rec/R-REC-BS.1770
- **[S7]** ATSC, *A/85:2013 Techniques for Establishing and Maintaining Audio Loudness for Digital Television*（with Corrigendum No. 1）— https://www.atsc.org/wp-content/uploads/2025/06/A85-2013-with-Corrigendum-No-1.pdf ；ATSC 於 2026-07 發佈修訂版，見 https://www.atsc.org/atsc-documents/a85-techniques-for-establishing-and-maintaining-audio-loudness-for-digital-television/ （本指引數字取自 2013 版本文；交美國電視前請核對新版）
- **[S8]** AES, *TD1006.1.17-10 Loudness Guidelines for OTT and OVD Content* — https://aes.org/wp-content/uploads/2024/01/AESTD1006_1_17_10.pdf
- **[S9]** AES, *TD1008.1.21-9 Recommendations for Loudness of Internet Audio Streaming and On-Demand Distribution* — https://aes.org/community/technical-council/technical-document-aestd1008/ ；摘要：Production Expert — https://www.production-expert.com/production-expert-1/aes-update-loudness-recommendations-for-audio-only-streaming
- **[S10]** Dolby Laboratories, *5.1-Channel Production Guidelines* — https://www.associationdesmixeurs.fr/wp-content/uploads/2015/10/Dolby-5.1-Channel-Production-Guidelines.pdf
- **[S11]** iZotope, *Mixing Audio for Video, Part 4: Mixing Techniques*（2018）— https://www.izotope.com/en/learn/mixing-audio-for-video-part-4-mixing-techniques
- **[S12]** FilmSound.org, *Diegetic and non-diegetic sounds*（摘自 Bordwell & Thompson, *Film Art*；Reisz & Millar, *The Technique of Film Editing*）— https://www.filmsound.org/terminology/diegetic.htm
- **[S13]** Claudia Gorbman, *Unheard Melodies: Narrative Film Music*（Indiana University Press, 1987）；相關討論：Kučinskas, *Diegetic Ambiguity of Film Music*（LMTA *Ars et Praxis*）— https://xn--urnalai-cxb.lmta.lt/wp-content/uploads/2020/04/Ars-et-praxis-VI_Kucinskas.pdf
- **[S14]** Boom Box Post, *Step-By-Step Audio Post-Production Workflow*（2022）— https://www.boomboxpost.com/blog/2022/4/26/step-by-step-audio-post-production-workflow
- **[S15]** Apple, *Create split edits in Final Cut Pro for Mac* — https://support.apple.com/en-gb/guide/final-cut-pro/ver1632d82c/mac
- **[S16]** Ian Shepherd / Production Advice, *YouTube Stats For Nerds – volume normalization values* — https://productionadvice.co.uk/stats-for-nerds/
- **[S17]** ByteDance Seed, *Seedance 2.0 Official Launch*（2026-02-12）— https://seed.bytedance.com/en/blog/seedance-2-0-official-launch
- **[S18]** TV Technology, *Measuring Content for CALM Compliance* — https://www.tvtechnology.com/opinions/measuring-content-for-calm-compliance
- **[S19]** RPG ツクールMV 用語（BGM/BGS/ME/SE）— http://tkoolmv.blogspot.com/p/terms.html
- **[S20]** JBG音楽院, 効果音 (SE) の作り方（環境音＝アンビエンス、フォーリー）— https://jbg-ongakuin.com/staff-blog/20250628/
- **[S21]** Tools for Film, *Audio Glossary*（room tone、Foley）— https://www.toolsforfilm.com/glossary/audio
- **[S22]** TikTok for Developers, *Media Transfer Guide*（上載格式指引；查閱時未見響度要求）— https://developers.tiktok.com/docs/en/content-posting-api-media-transfer-guide
