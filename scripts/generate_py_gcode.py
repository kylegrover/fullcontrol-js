#!/usr/bin/env python
"""Generate G-code for test cases using the Python fullcontrol library.
Writes outputs to scripts/out/py/<case>.gcode
If fullcontrol is not installed, attempts to run via uv on the fly (handled externally by wrapper shell).
"""
import os, sys, textwrap, json, importlib
from pathlib import Path

CASES = {
  'basic_line': textwrap.dedent('''
from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform
printer=Printer(print_speed=1800, travel_speed=6000)
extruder=Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom=ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)
# Python library expects extrusion state changes via Extruder(on=...) objects rather than Point(extrude=True)
seq=[printer, extruder, geom, [Point(x=0,y=0,z=0.2), Extruder(on=True), Point(x=10,y=0,z=0.2), Extruder(on=False)]]
print(transform(seq, result_type='gcode'))
'''),
  'extruder_on_toggle_travel': textwrap.dedent('''
from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform, travel_to
printer=Printer(print_speed=1800, travel_speed=6000)
extruder=Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom=ExtrusionGeometry(area_model='rectangle', width=0.4, height=0.2)
seq=[printer, extruder, geom, [Point(x=0,y=0,z=0.2), Extruder(on=True), Point(x=5,y=0,z=0.2), Extruder(on=False)]]
# travel_to returns [Extruder(on=False), Point(...), Extruder(on=True)]
seq += travel_to(Point(x=10,y=0,z=0.2))
seq += [Point(x=15,y=0,z=0.2), Extruder(on=False)]
print(transform(seq, result_type='gcode'))
'''),
}

out_dir = Path(__file__).parent / 'out' / 'py'
out_dir.mkdir(parents=True, exist_ok=True)

# Quick check for fullcontrol availability
try:
    importlib.import_module('fullcontrol')  # noqa
except Exception as e:
    print('FULLCONTROL_IMPORT_ERROR', e, file=sys.stderr)
    sys.exit(3)

import io
import contextlib

failures = 0
for name, code in CASES.items():
  try:
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
      exec(code, {})
    g = buf.getvalue().strip() + '\n'
    (out_dir / f'{name}.gcode').write_text(g, encoding='utf-8')
    print('PY case', name, 'OK')
  except Exception as ex:
    print('PY case', name, 'ERROR', ex, file=sys.stderr)
    failures += 1

if failures:
    sys.exit(1)
