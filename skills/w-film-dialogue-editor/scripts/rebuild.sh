#!/usr/bin/env bash
# 重新生成所有語言嘅產物：all.json、索引、句子清單（md + csv）
set -euo pipefail
cd "$(dirname "$0")/.."
for lang in $(node scripts/ref.mjs langs | cut -f1); do
  echo "== $lang"
  node scripts/ref.mjs --lang "$lang" validate
  node scripts/ref.mjs --lang "$lang" build
  node scripts/ref.mjs --lang "$lang" index > "references/${lang}-index.md"
  node scripts/ref.mjs --lang "$lang" sentences > "references/data/${lang}-sentences.md"
  node scripts/ref.mjs --lang "$lang" sentences --csv > "references/data/${lang}-sentences.csv"
done
echo "done"
