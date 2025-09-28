#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
JS_OUT="$SCRIPT_DIR/out/js"
PY_OUT="$SCRIPT_DIR/out/py"
JS_SILENT_OUT="$SCRIPT_DIR/out/js_silent"
PY_SILENT_OUT="$SCRIPT_DIR/out/py_silent"

# Build JS first
npm run --silent build > /dev/null
node "$SCRIPT_DIR/generate_js_gcode.mjs" --mode noisy
node "$SCRIPT_DIR/generate_js_gcode.mjs" --mode silent

PY_CMD=""
for c in python python3 py; do
  if command -v "$c" >/dev/null 2>&1; then PY_CMD="$c"; break; fi
done

# If no system python, we will attempt using uv run directly (assuming uv has a managed python already)
USE_UV_DIRECT=0
if [ -z "$PY_CMD" ]; then
  if command -v uv >/dev/null 2>&1; then
    USE_UV_DIRECT=1
    echo "No system python; will attempt 'uv run' for Python generation (no downloads)." >&2
  else
    echo "No python or uv found. JS-only comparison." >&2
  fi
fi

RUN_PY_WITH_UV=0
RUN_PY_WITH_UV=0
if [ -n "$PY_CMD" ]; then
  if "$PY_CMD" -c "import fullcontrol" 2>/dev/null; then :; else
    if command -v uv >/dev/null 2>&1; then RUN_PY_WITH_UV=1; else PY_CMD=""; fi
  fi
fi

if [ $USE_UV_DIRECT -eq 1 ]; then
  # Try import fullcontrol via uv run; if missing we still ask uv to provide it ephemeral with --with
  RUN_PY_WITH_UV=1
fi

PY_ACTIVE=0
if [ -n "$PY_CMD" ]; then
  if [ $RUN_PY_WITH_UV -eq 1 ]; then
  if uv run --with fullcontrol "$SCRIPT_DIR/generate_py_gcode.py"; then PY_ACTIVE=1; else echo "uv run failed" >&2; fi
  if [ $PY_ACTIVE -eq 1 ]; then UV_RUN=1 uv run --with fullcontrol "$SCRIPT_DIR/generate_py_gcode.py" --silent; fi
  else
  if "$PY_CMD" "$SCRIPT_DIR/generate_py_gcode.py"; then PY_ACTIVE=1; fi
  if [ $PY_ACTIVE -eq 1 ]; then "$PY_CMD" "$SCRIPT_DIR/generate_py_gcode.py" --silent || true; fi
  fi
elif [ $USE_UV_DIRECT -eq 1 ]; then
  if uv run --with fullcontrol "$SCRIPT_DIR/generate_py_gcode.py"; then PY_ACTIVE=1; else echo "uv run failed" >&2; fi
  if [ $PY_ACTIVE -eq 1 ]; then uv run --with fullcontrol "$SCRIPT_DIR/generate_py_gcode.py" --silent || true; fi
fi

if [ $PY_ACTIVE -eq 0 ]; then
  echo "Proceeding without Python outputs." >&2
fi

# Diff results
RET=0
echo "=== Diff (noisy) ==="
for f in "$JS_OUT"/*.gcode; do
  base="$(basename "$f")"
  if [ $PY_ACTIVE -eq 1 ]; then
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
  else
    echo "JS_ONLY $base" >&2
  fi
done

if [ $PY_ACTIVE -eq 1 ]; then
  echo "=== Diff (silent) ==="
  for f in "$JS_SILENT_OUT"/*.gcode; do
    base="$(basename "$f")"
    if [ -f "$PY_SILENT_OUT/$base" ]; then
      if diff -u "$PY_SILENT_OUT/$base" "$f"; then
        echo "MATCH_SILENT $base"
      else
        echo "DIFF_SILENT $base" >&2
        RET=1
      fi
    else
      echo "Missing Python silent output for $base" >&2
      RET=1
    fi
  done
fi
exit $RET
