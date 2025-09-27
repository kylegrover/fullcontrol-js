#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
JS_OUT="$SCRIPT_DIR/out/js"
PY_OUT="$SCRIPT_DIR/out/py"

# Build JS first
npm run --silent build > /dev/null
node "$SCRIPT_DIR/generate_js_gcode.mjs"

# Find python
PY_CMD=""
for c in python python3 py; do
  if command -v "$c" >/dev/null 2>&1; then PY_CMD="$c"; break; fi
done

if [ -z "$PY_CMD" ]; then
  echo "No python interpreter found. Skipping Python comparison (JS only)." >&2
  exit 0
fi

# Attempt direct run; if fullcontrol missing, try uv
if ! "$PY_CMD" -c "import fullcontrol" 2>/dev/null; then
  if command -v uv >/dev/null 2>&1; then
    echo "Installing fullcontrol via uv ephemeral run..." >&2
    UV_RUN=1
  else
    echo "Python found but fullcontrol not installed and uv not available. Skipping Python side." >&2
    exit 0
  fi
fi

if [ "${UV_RUN:-}" = 1 ]; then
  # Run python generator via uv
  if ! uv run --with fullcontrol "$SCRIPT_DIR/generate_py_gcode.py"; then
    echo "uv run failed" >&2; exit 1; fi
else
  "$PY_CMD" "$SCRIPT_DIR/generate_py_gcode.py" || exit 1
fi

# Diff results
RET=0
for f in "$JS_OUT"/*.gcode; do
  base="$(basename "$f")"
  if [ -f "$PY_OUT/$base" ]; then
    if diff -u "$PY_OUT/$base" "$f"; then
      echo "MATCH $base"
    else
      echo "DIFF  $base" >&2
      RET=1
    fi
  else
    echo "Missing Python output for $base" >&2
    RET=1
  fi
done
exit $RET
