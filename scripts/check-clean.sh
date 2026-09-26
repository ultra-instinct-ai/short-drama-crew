#!/usr/bin/env bash
# Content and structure checks for the crew pack. Exit 1 on any finding.
#  - no adult material anywhere in the pack
#  - every skill's frontmatter name equals its folder, description <= 1024 chars
#  - no host-specific link syntax or retired surface text left in the skills
#  - the discovery symlinks resolve
set -uo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
cd "$here"
fail=0
say() { printf '%s\n' "$*"; }

# 1. adult terms — case-insensitive, whole pack (skills, agents, docs, scripts, crew.json)
targets=(skills agents scripts/sync-wji-skill.sh crew.json AGENTS.md README.md)
adult='NSFW|情色|色情|做爱|做愛|性爱|性愛|性器|\bsex(ual|y)?\b|nude|naked|bunny|blowjob|\boral\b|intimacy|intimate|erotic|dirty talk|痴女|\badult\b|\bpussy\b|\bcock\b|titjob|乳交|騎乘|骑乘|前戲|前戏|插入|orgasm|颜射|顏射|moan|porn'
# Craft and regulatory uses of the flagged words, the same way 高潮 is allowed below:
# Hitchcock / cockpit (substring accidents), "intimate" as a framing term, the fake-dating trope
# name, the instruction that a child never speaks adult lines, and quotes of the NRTA red lines.
adult_ok='Hitchcock|cockpit|intimate (close-up|dialogue|two-shot|wide)|Borrowed intimacy|adult lines|red lines are'
if hits=$(grep -rniE "$adult" "${targets[@]}" 2>/dev/null | grep -vE "$adult_ok"); [ -n "$hits" ]; then
  say "✗ adult terms found:"; say "$hits"; fail=1
fi
# 高潮 is fine as a story-structure word (高潮收束 / 高潮选择 / 大高潮 / 高潮或结局); anything else is not
if hits=$(grep -rn "高潮" "${targets[@]}" 2>/dev/null | grep -vE '高潮(收束|选择|選擇|或)|[大小]高潮'); [ -n "$hits" ]; then
  say "✗ 高潮 outside the story-structure sense:"; say "$hits"; fail=1
fi

# 2. skill frontmatter
for dir in skills/*/; do
  skill="${dir%/}"; base="$(basename "$skill")"
  f="$skill/SKILL.md"
  [ -f "$f" ] || { say "✗ $skill has no SKILL.md"; fail=1; continue; }
  name="$(awk '/^---$/{c++; next} c==1 && /^name:/{sub(/^name:[ ]*/,""); print; exit}' "$f")"
  [ "$name" = "$base" ] || { say "✗ $f: name '$name' != folder '$base'"; fail=1; }
  desc="$(awk '/^---$/{c++; next} c==1 && /^description:/{d=1; sub(/^description:[ ]*>?-?[ ]*/,""); print; next} c==1 && d && /^[a-z-]+:/{exit} c==1 && d{print}' "$f" | tr -d '\n')"
  len=$(printf '%s' "$desc" | wc -m | tr -d ' ')
  [ "$len" -le 1024 ] || { say "✗ $f: description is $len chars (> 1024)"; fail=1; }
  [ "$len" -ge 40 ] || { say "✗ $f: description too short ($len)"; fail=1; }
done

# 3. link syntax and retired surface text (the mirrored wji skill is exempt from the crew rules)
if hits=$(grep -rnE 'sand-workflow:|\{short-drama-core\}|operations-wji|short_drama_validate|canvas_\*' skills agents --exclude-dir=wji 2>/dev/null); [ -n "$hits" ]; then
  say "✗ host-specific links / retired surface text:"; say "$hits"; fail=1
fi
if hits=$(grep -rn '{baseDir}' skills agents --exclude-dir=wji 2>/dev/null | grep -v 'OpenClaw'); [ -n "$hits" ]; then
  say "✗ {baseDir} outside the OpenClaw hint:"; say "$hits"; fail=1
fi
# cross-skill links must resolve
while IFS= read -r line; do
  f="${line%%:*}"; rest="${line#*:}"; target="${rest#*(}"; target="${target%%)*}"
  case "$target" in http*|\#*) continue;; esac
  target="${target%%#*}"
  [ -e "$(dirname "$f")/$target" ] || { say "✗ $f: link $target does not resolve"; fail=1; }
done < <(grep -rnoE '\]\((\.\./|reference/)[^)]+\)' skills --exclude-dir=wji 2>/dev/null)

# 4. symlinks
for l in .claude/skills .claude/agents .agents/skills; do
  [ -L "$l" ] && [ -e "$l" ] || { say "✗ symlink $l missing or dangling"; fail=1; }
done

# 5. crew.json ↔ agents/*.md
node - <<'EOF' || fail=1
const fs = require('fs');
const crew = JSON.parse(fs.readFileSync('crew.json', 'utf8'));
let bad = 0;
for (const [slug, a] of Object.entries(crew.agents)) {
  const src = fs.readFileSync(a.prompt, 'utf8');
  const fm = src.split(/^---$/m)[1] || '';
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1];
  if (name !== slug) { console.log(`✗ ${a.prompt}: name ${name} != ${slug}`); bad++; }
  const skills = [...fm.matchAll(/^\s+-\s+([a-z0-9-]+)$/gm)].map((m) => m[1]);
  const want = [...a.skills].sort().join(','), got = [...skills].sort().join(',');
  if (want !== got) { console.log(`✗ ${a.prompt}: skills [${got}] != crew.json [${want}]`); bad++; }
  for (const s of a.skills) if (!fs.existsSync(`skills/${s}/SKILL.md`)) { console.log(`✗ ${slug}: skill ${s} missing`); bad++; }
  for (const d of a.delegatesTo) if (!crew.agents[d]) { console.log(`✗ ${slug}: delegatesTo ${d} unknown`); bad++; }
  const tools = (fm.match(/^tools:\s*(.+)$/m) || [])[1] || '';
  if (!a.capabilities.write && /\b(Edit|Write)\b/.test(tools)) { console.log(`✗ ${slug}: read-only seat lists ${tools}`); bad++; }
  if (a.capabilities.spawn && !/\bAgent\b/.test(tools)) { console.log(`✗ ${slug}: spawns but has no Agent tool`); bad++; }
}
for (const [id, c] of Object.entries(crew.channels)) for (const m of c.members) if (!crew.agents[m]) { console.log(`✗ channel ${id}: member ${m} unknown`); bad++; }
process.exit(bad ? 1 : 0);
EOF

[ "$fail" -eq 0 ] && say "✓ pack is clean" || exit 1
