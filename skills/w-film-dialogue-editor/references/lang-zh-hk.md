# 香港粵語（港式）對白指南

> 呢份係 **zh-hk 專屬 reference guide**。其他語體各有自己一份：zh-cn、zh-tw、zh-hk-mandarin、zh-period、en。
> 語料庫（可查詢）：`references/data/zh-hk/`。改稿時：先讀本文規則，再用 `scripts/ref.mjs` 抽實際講法。

---

## 一、幾時用

- 校對／重寫**香港粵語對白**（電影、短劇、劇集、短片、舞台）。
- 把**書面中文**改成自然港式口語。
- 檢查角色**年齡層**同**人物類型**對唔對嘴。
- 需要真實語料（唔係自己作）去支撐一句對白。

唔係用嚟：寫普通話（去 zh-cn／zh-tw）、寫英文（去 en）、寫古裝（去 zh-period）。

---

## 二、三軸模型：年齡 × 角色 × 語氣

香港粵語唔係一個語體，係一堆**社會方言**。同一句「唔該」喺唔同角色口中重量完全唔同。改稿時逐句問三個問題：

| 軸 | 問題 | 落在邊 |
|---|---|---|
| **年齡** | 呢個角色幾歲？佢幾時開始講嘢？ | kid / teen / young / mid / senior / elder |
| **角色** | 佢係邊種人？職業、階層、權力位置？ | 20 個 archetype（見 §六） |
| **語氣** | 呢句想達到咩？態度、情緒、功能？ | tone / function（見 §七） |

**規則一：唔可以只有年紀，冇角色。** 60 歲茶餐廳伙記同 60 歲退休校長講嘢完全兩回事。
**規則二：唔可以所有角色同一把口。** 一套劇入面最少要有三種句長／語速：快（花姐）、慢（程朗）、短（標叔）。
**規則三：年齡決定詞彙，角色決定語法。** 後生仔用潮語但句子結構一樣；老師傅句子短、主語常省略、多用諺語。

### 查詢（寫稿時真正用）

~~~bash
cd <skill-root>
# 某年齡層、某種角色、某種語氣
node scripts/ref.mjs list --age senior --archetype craftsman --limit 15
# 搵一個講法
node scripts/ref.mjs search 執生
# 睇詳細（意思、例子、用錯會點）
node scripts/ref.mjs show hk-core-046
# 隨機抽幾條找靈感
node scripts/ref.mjs random --archetype housewife -n 8
# 只要乾淨（唔含粗口）
node scripts/ref.mjs list --max-prof 0
# 睇分佈
node scripts/ref.mjs stats
~~~

---

## 三、語氣詞（廣東話對白嘅靈魂）

香港人講嘢嘅態度，七成靠句尾語氣詞。用錯語氣詞＝角色即刻死。**唔好堆砌**：一句最多一個，情緒強烈時可以兩個（「係喎」「得啦」）。

| 語氣詞 | 功能 | 例句 | 誤用後果 |
|---|---|---|---|
| 啦 laa1 | 建議、催促、收尾 | 走啦。 | 連用三個＝煩躁、假 |
| 喇 laa3 | 狀態已變、終於 | 得喇。 | 同「啦」撈亂會變書面 |
| 囉 lo1 | 理所當然、唔耐煩 | 早話你知囉。 | 對客用＝寸 |
| 咯 lok3 | 確認、無奈 | 係咯。 | 太少用，多數老派 |
| 啫 ze1 | 只係、減弱 | 講吓啫。 | 用嚟卸責會變滑頭 |
| 咋 zaa3 | 只係（數量大） | 得三個人咋。 | 同「啫」唔同：咋＝數量少 |
| 咩 me1 | 質疑、反問 | 係咩？ | 對長輩用＝駁嘴 |
| 喎 wo3 | 轉述、提醒、出乎意料 | 佢話唔嚟喎。 | 對客用＝八卦、唔專業 |
| 噃 bo3 | 提醒、補充 | 好貴噃。 | 老派；後生仔少用 |
| 吖嘛 aa1 maa3 | 理所當然 | 你應承過吖嘛。 | 指責味重，慎用 |
| 㗎 gaa3 | 肯定、質問 | 我唔知㗎。 | 質問語氣，對客唔好 |
| 嘅 ge3 | 所有格／肯定 | 係我嘅。 | 誤用會變普通話語感 |
| 呢 ne1 | 緩和疑問 | 你去唔去呢？ | 文藝腔，日常少 |
| 呀 aa3 | 通用、呼喚 | 你做咩呀？ | 最安全，但太多會軟 |
| 吓 haa5 | 輕微命令／確認 | 你等吓。 | 拉長＝不耐煩 |
| 嗱 naa4 | 提請注意 | 嗱，我講最後一次。 | 長輩／師傅專用 |
| 喂 wai3 | 呼喚（稍粗） | 喂，借借。 | 對客＝無禮 |
| 先 sin1 | 先至、次序 | 食飯先。 | 後置副詞，唔好寫成「先吃飯」 |

**句法標記（唔係語氣詞但同樣重要）**

| 標記 | 用法 | 例子 |
|---|---|---|
| 咗 | 完成體 | 食咗飯。 |
| 緊 | 進行體 | 做緊嘢。 |
| 過 | 經驗體 | 去過。 |
| 住 | 持續／暫時 | 等住先。 |
| 晒 | 全部／加強 | 多謝晒。 |
| 埋 | 連埋、一齊 | 食埋佢。 |
| 返 | 回復、返回 | 睇返轉頭。 |
| 起上嚟 | 一旦…就 | 做起身就知。 |

---

## 四、粵語對白嘅節奏特徵

1. **短。** 母語者一句平均 6–10 個字。超過 20 字就要有理由（講道理、鬧人、解釋）。
2. **省略主語。**「食咗未？」唔會講「你吃飯了嗎？」。
3. **副詞後置。**「你行先」「食多啲」「講多次」「等陣先」。
4. **正反問。**「得唔得？」「係唔係？」「有冇？」——唔會講「可以嗎」。
5. **中英夾雜係動詞。**「confirm 咗」「book 咗場」「cancel 咗」「follow 緊」。唔係裝飾，係職業標記。
6. **語氣延長。**「係～」「吓～」「得～啦」——聲音長短就係態度。
7. **重複＝強調或煩躁。**「得啦得啦」「係呀係呀」「唔該唔該」。
8. **停頓用動作代替。** 唔好寫「（停頓）」，寫「△ 佢望一望手機」。

---

## 五、年齡層速查

| 年齡 | 句長／語速 | 語言標記 | 地雷 |
|---|---|---|---|
| **kid 6–12** | 短、跳躍 | 疊字、告狀式、直接講感受 | 唔好寫成大人講嘢 |
| **teen 13–19** | 快、碎 | 潮語、懶音、中英夾雜、寸嘴、敷衍（是但／求其）、討論區語 | 唔好寫到似 30 歲 |
| **young 20–29** | 快、直 | 職場新鮮人語、自嘲、躺平語、直球 | 唔好突然文藝 |
| **mid 30–44** | 中速、有效率 | 職場術語、父母語言、開始叫後生仔「後生仔」 | 潮語要用得克制 |
| **senior 45–59** | 慢、重 | 師奶／師傅語、諺語、命令式、「你唔識」 | 唔好寫成老到行唔到 |
| **elder 60+** | 慢、重複 | 稱謂（阿仔、靚仔）、老派詞（舊時）、惜字如金 | 唔好寫成可愛卡通老人 |

**跨代落差**：同一件事，teen 講「chur 到爆」，mid 講「好忙」，senior 講「做到隻狗咁」，elder 講「以前仲辛苦」。**呢個落差本身就係笑點來源。**

---

## 六、角色類型速查（20 種）

| archetype | 講嘢特徵 | 常用 | 禁忌 |
|---|---|---|---|
| student | 快、碎、潮語、寸 | 是但、求其、勁、chur | 講到似大人 |
| slacker | 慢、懶、拖 | 是咁的、躺平、hea | 太有幹勁 |
| office | 中速、婉轉、術語 | follow 緊、confirm、schedule | 太直接 |
| boss | 短、命令、唔解釋 | 搞好佢、今日要、我唔想聽 | 講太多原因 |
| client | 客氣中帶要求 | 唔該、可唔可以、跟進下 | 太粗魯 |
| craftsman | 短、實、術語 | 差 1mm、收貨、手工、執手尾 | 講長句 |
| waitress | 極快、極短、落單語 | 飲咩、埋單、嚟緊 | 講客套長句 |
| shopkeeper | 快、招呼語、講價 | 靚仔、阿姐、平啲啦 | 太書面 |
| security | 慢、多口、傳話 | 我同你講呀、登記吓 | 講得太精簡 |
| housewife | 快、八卦、比較 | 你個仔、人哋、咁都得 | 太冷淡 |
| designer | 快、利、帶刺 | 你呢句係意見定噪音 | 講廢話 |
| street | 短、狠、術語 | 咩料、收皮、企埋一邊 | 講文藝對白 |
| elder | 慢、重複、教訓 | 舊時、而家啲人、你唔識 | 講潮語 |
| trainer | 大聲、熱情、指令 | 加油、再做十下、你個肩好緊 | 太斯文 |
| mum | 快、擔心、比較 | 食咗未、人哋個仔、你唔聽話 | 太理性 |
| dad | 短、少講、講錢 | 幾多錢、唔好搞咁多 | 講太多感受 |
| kid | 短、直接、告狀 | 我話畀阿媽聽、唔制 | 講成大人 |
| teacher | 中速、清楚、重複 | 同學、明白未、再講一次 | 講潮語 |
| sales | 快、熱情、有套路 | 老細、抵、最後一件 | 太誠實 |
| delivery | 短、趕、電話語 | 到咗、落嚟攞、幾號 | 講長句 |

---

## 七、語氣與功能標籤

- **tone（態度）**：sassy 寸嘴、blunt 直球、cold 冷淡、warm 親切、complain 抱怨、threat 威脅、whiny 撒嬌、helpless 無奈、gossip 八卦、funny 搞笑、polite 客套、angry 嬲、sarcastic 曲線、worried 擔心、proud 認叻、shy 怕醜、flirty 撩、surprised 驚訝
- **function（對白功能）**：greet、farewell、praise、insult、refuse、question、urge、comfort、bargain、gossip、joke、warn、threaten、dismiss、agree、disagree、complain、tease、flirt、apology、thanks、challenge、boast、surprise、encourage、refuse-soft

**寫對白時嘅用法**：先定 function（呢句要達到咩），再揀 tone（點講），最後揀年齡／角色嘅講法。三步都對，句對白就會真。

---

## 八、粗口與攻擊性分級

| 級別 | 定義 | 例子 | 用喺邊 |
|---|---|---|---|
| **0** | 乾淨 | 唔該、得啦、有冇搞錯 | 任何場口 |
| **1** | 發洩／輕微侮辱 | 頂、離譜、癡線、死開、廢柴 | 衝突場口、熟人 |
| **2** | 直接侮辱 | 食屎啦你、低能、白癡 | 極端衝突；角色要有理由 |
| **3** | 真粗口 | 仆街（及其他五大粗口） | 平台／項目要批准 |

**規則**

1. 粗口係**人物標記**，唔係裝飾。同一個角色唔會一時粗一時文。
2. 級別 2 以上一定要有**後果**（對方反應、關係破裂），唔可以講完當冇事。
3. 平台尺度：TikTok／IG Reels／YouTube Shorts 對粗口敏感；Threads 較寬。同一個劇本上唔同平台要分版本。
4. **本項目（裝修管家）預設級別 0。** 級別 1 要 Wayne 明確批准；級別 2–3 唔用。
5. 侮辱女性外貌／身份／身材＝任何級別都唔得。

---

## 九、常見錯誤：書面中文 → 港式粵語

| 錯（書面） | 對（粵語） |
|---|---|
| 我吃咗飯 | 我食咗飯 |
| 他／她 | 佢 |
| 的 | 嘅 |
| 了 | 咗 |
| 沒有 | 冇 |
| 不是 | 唔係 |
| 為什麼 | 點解 |
| 什麼 | 咩／乜 |
| 這個／那個 | 呢個／嗰個 |
| 現在 | 而家 |
| 剛才 | 頭先 |
| 差不多 | 差唔多 |
| 還沒 | 未 |
| 給你 | 畀你 |
| 回家 | 返屋企 |
| 睡覺 | 瞓覺 |
| 上班／下班 | 返工／放工 |
| 多少錢 | 幾多錢 |
| 很好 | 好正／好掂 |
| 可以嗎 | 得唔得 |
| 不要 | 唔好／咪 |
| 一起 | 一齊 |
| 告訴他 | 話畀佢聽 |
| 但是 | 但係 |
| 已經 | 已經（可以） |
| 覺得 | 覺得（可以） |
| 還返（錢） | 畀返（錢） |
| 翻銀包 | 摷銀包 |
| 眼尾望住 | 用眼尾睄住 |

**三個硬指標**（改完稿自己讀一次）：

1. 讀出聲，有冇一句你講唔出口？
2. 有冇一句可以刪走，意思一樣？→ 刪。
3. 有冇一句係「解釋」而唔係「行動」？→ 改成動作。

---

## 十、同其他文件嘅關係

| 文件 | 內容 |
|---|---|
| `SKILL.md` | 主流程：診斷 → 修改幅度 → 逐句改 → 整場重寫 |
| `references/dialogue_revision_framework.md` | 診斷維度、修改優先級、輸出格式（語言中立） |
| `references/lang-zh-hk.md` | **本文：香港粵語規則** |
| `references/lang-zh-cn.md` | 大陸普通話 |
| `references/lang-zh-tw.md` | 台灣國語 |
| `references/lang-zh-hk-mandarin.md` | 港式普通話 |
| `references/lang-zh-period.md` | 古裝／年代戲普通話 |
| `references/lang-en.md` | 英文（美式／英式、transcreation） |
| `references/data/README.md` | 語料庫 schema 同寫作規矩 |
| `scripts/ref.mjs` | 查詢 CLI |

---

## 十一、語料庫（可查詢）

### 規模

| shard | 條數 | 內容 |
|---|---|---|
| core.json | 70 | 萬用：語氣詞組合、客套、婉拒、日常反應 |
| rough.json | 45 | 寸嘴、衝突、威脅、侮辱（含粗口分級） |
| older.json | 89 | 45+：師奶、長輩、茶餐廳、管理員、老師傅、諺語 |
| workplace.json | 88 | 職場、OL、老細、客戶、工程行話 |
| gen-z.json | 80 | 青少年、Gen Z、校園、討論區、潮語 |

每條有：講法、意思、語氣、功能、語體、粗口級別、對象、例句、場口、用錯後果、**標籤**。
人讀索引（自動生成）：`references/zh-hk-index.md`。

### 查詢

~~~bash
cd <skill-root>
node scripts/ref.mjs list --age senior --archetype craftsman --limit 15
node scripts/ref.mjs search 執生
node scripts/ref.mjs show hk-core-046
node scripts/ref.mjs random --tone sassy -n 8
node scripts/ref.mjs list --max-prof 0      # 只要乾淨（0 級）
node scripts/ref.mjs list --json            # 機器讀
node scripts/ref.mjs stats                  # 分佈
node scripts/ref.mjs validate               # 完整性
~~~

### 更新語料庫

1. 照 `references/data/README.md` schema 加 entry。
2. `node scripts/ref.mjs check references/data/zh-hk/<shard>.json`。
3. `node scripts/ref.mjs build`（合併 all.json）。
4. `node scripts/ref.mjs index > references/zh-hk-index.md`（重生成索引）。

### 實際分佈

語言：zh-hk　總數：372 條
shards：core.json(70), gen-z.json(80), older.json(89), rough.json(45), workplace.json(88)

[age]  young=255  mid=229  senior=189  elder=163  teen=139

[archetype]  office=117  (未標)=92  student=84  craftsman=74  street=58  elder=54  housewife=38  boss=32  security=24  shopkeeper=22  sales=20  mum=18  slacker=17  client=17  designer=15  dad=12  waitress=11  delivery=9

[tone]  sassy=71  blunt=68  helpless=54  polite=49  complain=39  cold=38  warm=35  angry=30  sarcastic=29  worried=20  gossip=18  proud=15  funny=13  threat=6  surprised=5  shy=2

[function]  complain=67  dismiss=54  warn=37  urge=26  question=21  tease=19  refuse-soft=18  agree=15  challenge=15  comfort=14  refuse=13  insult=13  greet=11  disagree=11  bargain=11  gossip=10  surprise=9  encourage=8  boast=8  farewell=7  threaten=6  apology=5  praise=4  joke=3  thanks=2

[register]  everyday=185  slang=99  proverb=25  english-mix=22  internet=21  professional=12  idiom=7  profanity=1

[profanity]  p0=334  p1=34  p2=3  p3=1

### 標籤（tags）

每條 entry 有 2–6 個自由標籤，用嚟跨維度檢索。標籤唔取代 facet：角色、語氣、年齡仍然用 `--archetype`／`--tone`／`--age` 查。

| 組 | 標籤 |
|---|---|
| 場口 | 裝修、地盤、茶記、街市、飲茶、公司、學校、家庭、大廈、店舖 |
| 角色 | 師傅、師奶、長輩、後生、老細、客戶、伙記、管理員、學生、OL、外賣 |
| 用途 | 開場、收尾、拒絕、讚、踩、八卦、講價、關心、抱怨、客套、日常、面試、投訴 |
| 語感 | 直球、冷面、惜字如金、潮語、老派、中英夾雜 |

~~~bash
node scripts/ref.mjs list --tag 裝修,拒絕        # 要同時有兩個 tag
node scripts/ref.mjs list --any-tag 讚,踩        # 有其中一個
node scripts/ref.mjs list --tag 直球 --max-prof 0
node scripts/ref.mjs tags --values               # 睇實際 tag 分佈
~~~

規則：角色標籤只取**主要角色**（archetype 第一位）；標籤係輔助檢索，唔係權威分類。可以自由加新標籤，`validate` 會提示唔在受控詞表嘅標籤。
