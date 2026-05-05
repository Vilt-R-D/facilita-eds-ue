#!/usr/bin/env bash
# visual-refs after_tasks hook: parse PNG/SVG refs from spec.md `**Input**:` line
# and rewrite the leading delimited block of tasks.md as an idempotent T000 setup task.
#
# Usage: prepend-task.sh <absolute-path-to-feature-dir>
# Exit 0: success (tasks.md possibly mutated)
# Exit non-zero: failure; tasks.md preserved byte-identical; warning emitted to stderr.

set -u

WARN_PREFIX='[specify] Warning: visual-refs after_tasks failed:'
FAIL_TAIL='tasks.md preserved'
START_MARKER='<!-- visual-context-task:start -->'
END_MARKER='<!-- visual-context-task:end -->'

fail() {
  echo "$WARN_PREFIX $1; $FAIL_TAIL" >&2
  exit 1
}

FEATURE_DIR="${1:-}"
[ -n "$FEATURE_DIR" ] || fail "missing feature directory argument"
[ -d "$FEATURE_DIR" ] || fail "feature directory not found at '$FEATURE_DIR'"
SPEC_FILE="$FEATURE_DIR/spec.md"
TASKS_FILE="$FEATURE_DIR/tasks.md"
[ -f "$SPEC_FILE" ] || fail "spec.md not found at '$SPEC_FILE'"
[ -f "$TASKS_FILE" ] || fail "tasks.md not found at '$TASKS_FILE'"
[ -w "$TASKS_FILE" ] || fail "tasks.md not writable at '$TASKS_FILE'"

# Locate **Input**: line
INPUT_LINE=$(grep -m1 -E '^\*\*Input\*\*: User description: ' "$SPEC_FILE" || true)
[ -n "$INPUT_LINE" ] || fail "no '**Input**:' line found in spec.md"

# Strip prefix and surrounding quotes
INPUT_PAYLOAD="${INPUT_LINE#\*\*Input\*\*: User description: }"
case "$INPUT_PAYLOAD" in
  \"*\")
    INPUT_PAYLOAD="${INPUT_PAYLOAD#\"}"
    INPUT_PAYLOAD="${INPUT_PAYLOAD%\"}"
    ;;
  *)
    fail "malformed '**Input**:' quoting"
    ;;
esac

# Collect raw candidate tokens (whitespace-bounded) ending in .png/.svg (with optional ?query)
CANDIDATES=$(printf '%s\n' "$INPUT_PAYLOAD" \
  | grep -oiE '[^[:space:]]+\.(png|svg)([?][^[:space:]]*)?' || true)

# Trim wrap/punct, dedupe preserving first-seen order
declare -A SEEN=()
REFS=()
if [ -n "$CANDIDATES" ]; then
  while IFS= read -r RAW; do
    [ -n "$RAW" ] || continue
    CLEAN=$(printf '%s' "$RAW" | sed -E "s/^[\"'<(]+//;s/[\"'>).,;:]+$//")
    [ -n "$CLEAN" ] || continue
    printf '%s' "$CLEAN" | grep -qiE '\.(png|svg)([?].*)?$' || continue
    if [ -z "${SEEN[$CLEAN]:-}" ]; then
      SEEN[$CLEAN]=1
      REFS+=("$CLEAN")
    fi
  done <<< "$CANDIDATES"
fi

# Working temp files for tasks.md rewrite
TMP_NO_BLOCK=$(mktemp)
TMP_NEW_TASKS=$(mktemp)
TMP_NEW_BLOCK=$(mktemp)
trap 'rm -f "$TMP_NO_BLOCK" "$TMP_NEW_TASKS" "$TMP_NEW_BLOCK"' EXIT

# Strip any existing visual-context block (and the single trailing blank line that follows it)
awk -v start="$START_MARKER" -v end="$END_MARKER" '
  BEGIN { in_block=0; just_closed=0 }
  {
    if (in_block) {
      if ($0 == end) { in_block=0; just_closed=1; next }
      next
    }
    if ($0 == start) { in_block=1; next }
    if (just_closed) {
      just_closed=0
      if ($0 == "") next
    }
    print
  }
' "$TASKS_FILE" > "$TMP_NO_BLOCK" || fail "failed to strip prior visual-context block"

# Decide what to write
if [ "${#REFS[@]}" -eq 0 ]; then
  # No refs to prepend; ensure tasks.md byte-identical when no prior block existed
  if cmp -s "$TASKS_FILE" "$TMP_NO_BLOCK"; then
    exit 0
  fi
  cat "$TMP_NO_BLOCK" > "$TASKS_FILE" || fail "failed to write tasks.md"
  exit 0
fi

# Build new block
{
  echo "$START_MARKER"
  echo "- [ ] **T000** Load visual references from \`spec.md\`"
  for R in "${REFS[@]}"; do
    BASE="${R##*/}"
    BASE="${BASE##*\\}"
    BASE="${BASE%%\?*}"
    [ -n "$BASE" ] || BASE="$R"
    echo "  - $BASE: $R"
  done
  echo "$END_MARKER"
  echo ""
} > "$TMP_NEW_BLOCK" || fail "failed to build new visual-context block"

# Prepend new block to the stripped tasks.md
cat "$TMP_NEW_BLOCK" "$TMP_NO_BLOCK" > "$TMP_NEW_TASKS" || fail "failed to assemble new tasks.md"
cat "$TMP_NEW_TASKS" > "$TASKS_FILE" || fail "failed to write tasks.md"
exit 0
