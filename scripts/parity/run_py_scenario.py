#!/usr/bin/env python
"""Execute a Python parity scenario script and emit normalized G-code lines as JSON to stdout.
Normalization here is minimal; full diff logic lives in JS runner.
"""
import sys, json, subprocess, re, pathlib, importlib.util
from pathlib import Path

CONFIG = json.loads(Path(__file__).parent.joinpath('config.json').read_text())
IGNORE_PATTERNS = [re.compile(p) for p in CONFIG.get('ignoreCommentPatterns', [])]

if len(sys.argv) < 2:
    print('Usage: run_py_scenario.py <scenario_name>', file=sys.stderr)
    sys.exit(2)

scenario = sys.argv[1]
script_path = Path(__file__).parent / 'scenarios' / 'py' / f'{scenario}.py'
if not script_path.exists():
    print(f'Scenario not found: {scenario}', file=sys.stderr)
    sys.exit(2)

# Execute in a subprocess to avoid polluting runner state
proc = subprocess.run([sys.executable, str(script_path)], capture_output=True, text=True)
if proc.returncode != 0:
    print(json.dumps({ 'scenario': scenario, 'error': proc.stderr }), end='')
    sys.exit(0)
raw = proc.stdout
lines = [ln.rstrip() for ln in raw.splitlines() if ln.strip()]

# Check if this is a visualization test (starts with viz_)
if scenario.startswith('viz_'):
    # Visualization tests output JSON directly
    try:
        plot_data = json.loads(raw)
        print(json.dumps({ 'scenario': scenario, 'plot_data': plot_data }))
    except json.JSONDecodeError as e:
        print(json.dumps({ 'scenario': scenario, 'error': f'JSON parse error: {str(e)}' }))
    sys.exit(0)

# A conservative G-code line detector: starts with comment ';' or an uppercase letter followed by digit (e.g., G1, M82, T0),
# or begins with a known command letter alone. Everything else is advisory text we drop for parity.
gcodelike = re.compile(r'^(;|[GMTFSXYZEIJKRABP][0-9]|M8|G0|G1)')
norm = []
for ln in lines:
    if not gcodelike.match(ln):
        # Non G-code advisory (warnings, tips) -> skip
        continue
    if ln.startswith(';') and any(p.search(ln) for p in IGNORE_PATTERNS):
        continue
    norm.append(ln)
print(json.dumps({ 'scenario': scenario, 'lines': norm }))
