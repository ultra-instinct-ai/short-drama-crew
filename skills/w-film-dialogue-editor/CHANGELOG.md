# CHANGELOG — w-film-dialogue-editor

版本號跟語料庫規模走：1.x = 只有中文語體有語料庫；2.x = 加入英文／韓文／日文語料庫。

## 2.0.0 — 2026-11-09

### 新增

- **美式英文語料庫 133 條**（`references/data/en/`：core 45／work 45／slang 43）—— small talk、服務台詞、corporate-speak、美式裝修工程（estimate／permit／change order／punch list／up to code）、面試、客服、Gen Z／Millennial、地域（NY／Boston／Southern／California／Midwest）、AAVE 借用（已標語境）。
- **韓文語料庫 133 條**（`references/data/ko/`）—— 합쇼체／해요체／반말 階級、편의점、카페、회식、면접、인테리어 공사、신조어、사투리（已標）。
- **日文語料庫 133 條**（`references/data/ja/`）—— 敬語、コンビニ、飲食、報連相、飲み会、面接、リフォーム、若者言葉、関西弁、バイト敬語／二重敬語。
- **`references/lang-ko.md`**（290 行）—— 三層語域、18 個語尾、호칭 禁忌、敬語三種高度、20 archetype、粗口 p0–p3 對平台尺度、書面→口語 20 組、中→韓 transcreation 陷阱 12 條、번역투 8 條、自檢清單。
- **`references/lang-ja.md`**（312 行）—— 敬語三層對照、19 個終助詞、稱謂與呼び方、ウチ／ソト、關西敬語「〜はる」、粗口分級、書面→口語 20 組、中→日 transcreation 陷阱 12 條、翻訳調 8 條、自檢清單。
- `references/lang-en.md` 加 §九「英文語料庫」。

### 改動

- `scripts/ref.mjs`：新增 `romanization` 欄位（韓文 Revised Romanization、日文 Hepburn，`show` 會顯示）；`LANG_LABEL` 加 `ko`／`ja`，`en` 正名「美式英文」；標籤詞表 61 → 81（新增 便利店／地鐵／居酒屋／街頭／酒吧／咖啡廳／校園／職場／情侶／上司／下屬／同事／敬語／半語／方言／黑話／戀愛／動漫／遊戲／外來語）。
- `SKILL.md`：語體表 8 行、使用時機、品質檢查加韓日、新增「版本」段。
- `references/dialogue_revision_framework.md`：§三 路由表改 8 行（連語料庫欄）。
- `references/data/README.md`：現況 1035 條、新語言標籤表、`romanization` 欄位說明。
- 語料庫總數：372 + 133 + 131 + 133 + 133 + 133 = **1035 條**，6 個語言，8 份 guide。

### 生成物

每個語言一套：`references/data/<lang>.all.json`、`references/<lang>-index.md`、`references/data/<lang>-sentences.md`、`references/data/<lang>-sentences.csv`。全部由 `./scripts/rebuild.sh` 重新生成。

## 1.2.0 — 2026-11-09

- 大陸普通話（zh-cn）133 條、台灣國語（zh-tw）131 條語料庫，各 3 shards。
- `lang-zh-cn.md`、`lang-zh-tw.md` 加「語料庫」段。
- 標籤系統擴充（兩岸角色／場口標籤）。

## 1.1.0 — 2026-11-09

- 香港粵語語料庫 372 條（core 70／rough 45／older 89／workplace 88／gen-z 80）。
- 受控標籤詞表（61 個）+ 每條 entry 自動／手動標籤。
- `scripts/ref.mjs` 查詢 CLI（list／search／show／random／stats／tags／validate／check／build／index／sentences／markdown／langs）。
- `scripts/rebuild.sh`、`references/zh-hk-index.md`、句子清單 md／csv。

## 1.0.0 — 2026-07-27

- 原版：6 份語體 guide（粵語、大陸普通話、台灣國語、港式普通話、古裝／年代戲、英文）、`dialogue_revision_framework.md`、`templates/dialogue_revision_report.md`。
- 未有語料庫、未有查詢工具。
