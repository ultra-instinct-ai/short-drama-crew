# 對白語料庫（dialogue reference database）

每個語言／語體一個獨立目錄：`references/data/<lang>/<shard>.json`。
每個語言亦有一份獨立閱讀版指南：`references/lang-<lang>.md`。

| 語言／語體 | 指南 | 語料庫 |
|---|---|---|
| zh-hk 香港粵語（港式） | `lang-zh-hk.md` | ✅ `data/zh-hk/` 372 條 |
| zh-cn 大陸普通話 | `lang-zh-cn.md` | ✅ `data/zh-cn/` 133 條 |
| zh-tw 台灣國語 | `lang-zh-tw.md` | ✅ `data/zh-tw/` 131 條 |
| zh-hk-mandarin 港式普通話 | `lang-zh-hk-mandarin.md` | — |
| zh-period 古裝／年代戲 | `lang-zh-period.md` | — |
| en 美式英文（American English） | `lang-en.md` | ✅ `data/en/` 133 條 |
| ko 韓文（韓國語） | `lang-ko.md` | ✅ `data/ko/` 133 條 |
| ja 日文（日本語） | `lang-ja.md` | ✅ `data/ja/` 133 條 |

未建語料庫嘅語體，照下面 schema 開 `data/<lang>/` 即可，`scripts/ref.mjs` 會自動發現。

**語料庫版本：2.0.0**（2026-11-09）—— 6 個語言、1035 條、8 份 guide；版本紀錄見 `CHANGELOG.md`。

## 現況（6 個語言，共 1035 條）

**zh-hk 香港粵語（372）**

| shard | 條數 | 內容 |
|---|---|---|
| `core.json` | 70 | 萬用：語氣詞組合、客套、婉拒、日常反應 |
| `rough.json` | 45 | 寸嘴、衝突、威脅、侮辱（含粗口分級） |
| `older.json` | 89 | 45+：師奶、長輩、茶餐廳、管理員、老師傅、諺語 |
| `workplace.json` | 88 | 職場、OL、老細、客戶、工程行話 |
| `gen-z.json` | 80 | 青少年、Gen Z、校園、討論區、潮語 |

**zh-cn 大陸普通話（133）**

| shard | 條數 | 內容 |
|---|---|---|
| `core.json` | 45 | 日常、客套、婉拒、服務業、小區街坊 |
| `work.json` | 45 | 互聯網黑話、老闆下屬、裝修工程、面試 |
| `slang.json` | 43 | 網絡用語、吵架不帶髒、東北／川渝／京腔 |

**zh-tw 台灣國語（131）**

| shard | 條數 | 內容 |
|---|---|---|
| `core.json` | 44 | 語氣詞、客套、婉拒、家庭、超商／飲料店 |
| `work.json` | 44 | 職場、慣老闆、裝修工班、報價 |
| `slang.json` | 43 | 網路用語、傻眼、衝突 |

**en 美式英文（133）**

| shard | 條數 | 內容 |
|---|---|---|
| `core.json` | 45 | small talk、服務台詞（咖啡店／diner／超商）、問路、鄰里、家庭、婉拒、道別 |
| `work.json` | 45 | corporate-speak、上司下屬、面試、美式裝修工程、客服、談判 |
| `slang.json` | 43 | Gen Z／Millennial、衝突升級、網絡、地域、AAVE 借用（已標語境） |

**ko 韓文（133）**

| shard | 條數 | 內容 |
|---|---|---|
| `core.json` | 45 | 인사／존댓말、편의점、카페、식당、길 묻기、가족、婉拒、收尾 |
| `work.json` | 45 | 회사（팀장／과장／대리）、보고、야근／회식、면접、인테리어 공사、고객 응대 |
| `slang.json` | 43 | 신조어、반말、衝突、인터넷、少量 사투리（已標） |

**ja 日文（133）**

| shard | 條數 | 內容 |
|---|---|---|
| `core.json` | 45 | あいさつ、コンビニ、飲食、道を尋ねる、家族、婉拒（大丈夫です 陷阱）、締め |
| `work.json` | 45 | 敬語／報連相、上司部下、残業／飲み会、面接、リフォーム工事、クレーム対応 |
| `slang.json` | 43 | 若者言葉、タメ口、衝突、ネット、少量関西弁（已標） |

合共 1035 條。

生成物（每個語言一套，跑 `./scripts/rebuild.sh` 會全部更新）：

- `<lang>-index.md` — 索引（核心／年齡／角色，帶標籤）
- `<lang>-sentences.md` — 全部對白句（句 ｜ 講法 ｜ 意思 ｜ 標籤）
- `<lang>-sentences.csv` — 同上，CSV（Excel／Sheets 直接開）
- `<lang>.all.json` — 合併版單一 JSON
## 查詢

~~~bash
node scripts/ref.mjs list --age young --tone sassy
node scripts/ref.mjs list --age senior --archetype craftsman --limit 15
node scripts/ref.mjs search 咩料
node scripts/ref.mjs show hk-core-001
node scripts/ref.mjs random --archetype housewife -n 5
node scripts/ref.mjs list --max-prof 0        # 只要乾淨（粗口 0 級）
node scripts/ref.mjs list --json              # 機器讀
node scripts/ref.mjs list --tag 裝修,拒絕            # 要同時有兩個 tag
node scripts/ref.mjs list --any-tag 讚,踩            # 有其中一個
node scripts/ref.mjs stats                    # 分佈
node scripts/ref.mjs tags                     # 所有可用標籤
node scripts/ref.mjs validate                 # 整個語言語料庫
node scripts/ref.mjs check <file>             # 單一 shard
node scripts/ref.mjs build                    # 合併 <lang>.all.json
node scripts/ref.mjs index                    # 生成人讀索引（redirect 成 .md）
node scripts/ref.mjs markdown --by age        # 生成 markdown 表
node scripts/ref.mjs --lang ko list --tag 敬語    # 韓文
node scripts/ref.mjs --lang ja list --tag 居酒屋  # 日文
node scripts/ref.mjs --lang en list --tag 職場    # 美式英文
node scripts/ref.mjs langs                    # 列出所有語言
~~~

## 檔案格式

~~~json
{
  "lang": "zh-hk",
  "entries": [
    {
      "id": "hk-core-001",
      "phrase": "唔該",
      "variants": ["唔該晒"],
      "jyutping": "m4 goi1",
      "meaning": "勞煩／多謝（服務、幫忙）",
      "literal": "not should",
      "categories": {
        "age": ["teen", "young", "mid", "senior", "elder"],
        "archetype": ["office", "craftsman"],
        "tone": ["polite"],
        "function": ["thanks"],
        "register": "everyday",
        "profanity": 0,
        "socialDistance": ["stranger", "friend", "colleague", "client"]
      },
      "example": "唔該借借。",
      "situation": "人多地方要人讓路",
      "avoid": ["送禮物用「多謝」，唔係「唔該」"],
      "note": "服務／幫忙用唔該；禮物／讚美用多謝。",
      "tags": ["客套", "日常"],
      "source": "general"
    }
  ]
}
~~~

### 欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | ✅ | `hk-<shard>-<序號>`，全語言唯一 |
| `phrase` | ✅ | 最常見寫法，正字或慣用寫法 |
| `variants` | | 同義／縮略／變體寫法 |
| `jyutping` | | 粵拼（粵語專用）；唔肯定就省略，唔好亂寫 |
| `romanization` | | 韓文用 Revised Romanization、日文用 Hepburn；英文省略 |
| `meaning` | ✅ | 香港人實際點解，唔好照字面 |
| `literal` | | 字面意思（幫母語非粵語讀者） |
| `categories.age` | | `kid` 6-12、`teen` 13-19、`young` 20-29、`mid` 30-44、`senior` 45-59、`elder` 60+；省略＝任何年齡 |
| `categories.archetype` | | 角色類型（可多個，第一位＝主要角色）；省略＝任何角色 |
| `categories.tone` | ✅ | 態度／情緒，可多個 |
| `categories.function` | ✅ | 對白功能（打招呼、拒絕、踩、安慰…） |
| `categories.register` | ✅ | `everyday` \| `slang` \| `internet` \| `proverb` \| `idiom` \| `professional` \| `english-mix` \| `profanity` |
| `categories.profanity` | ✅ | 0 乾淨、1 輕微發洩（頂／離譜／癡線）、2 侮辱／攻擊（食屎啦你）、3 真粗口（仆街及五大粗口） |
| `categories.socialDistance` | | `family` \| `friend` \| `colleague` \| `client` \| `stranger` \| `conflict` |
| `example` | ✅ | 一句真實會講嘅對白，可拍攝 |
| `situation` | ✅ | 咩場口會講 |
| `avoid` | | 用錯會點（對象、場合、語體） |
| `tags` | | 2–6 個自由標籤，見下 |
| `note` | | 語感補充、年齡／階層差異 |
| `source` | | `general` 或網址 |

### 標籤（tags）

自由標籤用嚟跨維度檢索；**佢唔取代 facet**（角色／語氣／年齡仍然用 `--archetype`／`--tone`／`--age` 查）。

| 組 | zh-hk（粵語） | zh-cn（大陸） | zh-tw（台灣） |
|---|---|---|---|---|
| 場口 | 裝修、地盤、茶記、街市、飲茶、公司、學校、家庭、大廈、店舖 | 裝修、工地、餐廳、菜市場、茶樓、公司、學校、家庭、小區、店舖 | 裝修、工地、餐廳、菜市場、公司、學校、家庭、社區、店舖 |
| 角色 | 師傅、師奶、長輩、後生、老細、客戶、伙記、管理員、學生、OL、外賣 | 師傅、大媽、阿姨、老闆、客戶、服務員、保安、外賣員、司機、白領、學生、老師、年輕人 | 師傅、阿姨、老闆、客戶、店員、警衛、外送員、司機、上班族、學生、老師、年輕人 |
| 用途（共用） | 開場、收尾、拒絕、讚、踩、八卦、講價、關心、抱怨、客套、日常、面試、投訴 | | |
| 語感 | 直球、冷面、惜字如金、老派、中英夾雜、潮語 | 直球、冷面、惜字如金、老派、中英夾雜、網絡用語 | 直球、冷面、惜字如金、老派、中英夾雜、網絡用語 |

英文／韓文／日文用：

| 組 | en（美式英文） | ko（韓文） | ja（日文） |
|---|---|---|---|
| 場口 | 公司、學校、家庭、餐廳、酒吧、街頭、便利店、地鐵、咖啡廳、校園、職場 | 公司、學校、家庭、餐廳、便利店、咖啡廳、地鐵、職場 | 公司、學校、家庭、餐廳、居酒屋、便利店、地鐵、咖啡廳、職場 |
| 角色 | 老闆、客戶、上司、下屬、同事、店員、服務員、司機、保安、白領、學生、老師、年輕人、長輩 | 老闆、客戶、上司、下屬、同事、店員、服務員、司機、保安、白領、學生、老師、年輕人、長輩 | 老闆、客戶、上司、下屬、同事、店員、服務員、司機、保安、白領、學生、老師、年輕人、長輩 |
| 用途（共用） | 開場、收尾、拒絕、讚、踩、八卦、講價、關心、抱怨、客套、日常、面試、投訴 | | |
| 語感 | 直球、冷面、老派、潮語、網絡用語、黑話、方言、外來語 | 直球、冷面、老派、敬語、半語、方言、網絡用語、外來語 | 直球、冷面、老派、敬語、方言、網絡用語、外來語、黑話 |

唔喺受控詞表嘅標籤只會出 warning，唔算錯；加新標籤請同時加入 `scripts/ref.mjs` 嘅 `TAGS`，方便日後檢索。

`ref.mjs` 用一套**共用詞表**（`node scripts/ref.mjs tags` 可睇全部）；上表只係各語言實際會用嘅子集。

規則：

1. 角色標籤只取**主要角色**（archetype 第一位）；其餘角色用 `--archetype` 查。
2. 場口標籤由 phrase／example 關鍵詞 + 主要角色推導；寧缺勿濫。
3. 可以自由加新標籤；`node scripts/ref.mjs validate` 會提示唔在受控詞表嘅標籤（warning，唔算錯）。
4. 加完跑 `node scripts/ref.mjs validate` → `build` → `index`。

### archetype 一覽

`student` 學生・`slacker` 廢青躺平・`office` 打工仔 OL・`boss` 老細／老闆・
`client` 客人／業主・`craftsman` 師傅／技工・`waitress` 茶餐廳伙記・`shopkeeper` 街市／小店・
`security` 管理員・`housewife` 師奶・`designer` 設計／創意・`street` 江湖／地盤・
`elder` 長輩・`trainer` 健身／運動・`mum` 阿媽・`dad` 阿爸・`kid` 細路・
`teacher` 老師・`sales` 銷售／客服・`delivery` 外賣／司機

### tone 一覽

`sassy` 寸嘴・`blunt` 直球・`cold` 冷淡・`warm` 親切・`complain` 抱怨・`threat` 威脅・
`whiny` 撒嬌／扭計・`helpless` 無奈・`gossip` 八卦・`funny` 搞笑・`polite` 客套・
`angry` 嬲・`sarcastic` 曲線／反串・`worried` 擔心・`proud` 認叻・`shy` 怕醜・`flirty` 撩・`surprised` 驚訝

### function 一覽

`greet` `farewell` `praise` `insult` `refuse` `question` `urge` `comfort` `bargain`
`gossip` `joke` `warn` `threaten` `dismiss` `agree` `disagree` `complain` `tease`
`flirt` `apology` `thanks` `challenge` `boast` `surprise` `encourage` `refuse-soft`

## 寫作規矩

1. 只收**該語言母語者真實會講**嘅說法；唔好自創、唔好書面語直譯。粵語嘅見 `lang-zh-hk.md`，英文／韓文／日文見各自 guide。
2. 每條最少一句真對白（`example`），要拍到、講得出。
3. 標清楚年齡同角色；同一句喺唔同年齡層可能已經過時。
4. 粗口一定要標 `profanity`，唔好為齊全而濫收。
5. 只加自己有信心嘅粵拼；唔肯定就留空。
6. 加完 entry 跑 `check`，最後 `build` ＋ 重生成 `zh-hk-index.md`。