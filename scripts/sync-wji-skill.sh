#!/usr/bin/env bash
# Mirror the `wji` skill from the wji-cli repo (its owner) into skills/wji.
# Never edit skills/wji by hand — change wji-cli/skill/wji and re-run this.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
cli_dir="${WJI_CLI_DIR:-$here/../wji-cli}"
# wji-cli is a pnpm workspace now: the skill lives in packages/cli/skill.
# Older checkouts keep it at the repo root.
src="$cli_dir/packages/cli/skill/wji"
[ -f "$src/SKILL.md" ] || src="$cli_dir/skill/wji"
if [ ! -f "$src/SKILL.md" ]; then
  # fall back to the globally installed CLI package
  src="$(npm root -g 2>/dev/null)/@wji.ai/cli/skill/wji"
fi
[ -f "$src/SKILL.md" ] || { echo "no wji skill at $src (set WJI_CLI_DIR)" >&2; exit 1; }
mkdir -p "$here/skills/wji"
rsync -a --delete --exclude .sync-source "$src/" "$here/skills/wji/"
sha="$(git -C "$src" rev-parse --short HEAD 2>/dev/null || echo unknown)"
printf 'source: %s\ncommit: %s\nsynced: %s\n' "$src" "$sha" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$here/skills/wji/.sync-source"
echo "synced skills/wji from $src ($sha)"
