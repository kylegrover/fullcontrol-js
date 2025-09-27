#!/usr/bin/env python
"""Generate G-code for test cases using the Python fullcontrol library.
Writes outputs to scripts/out/py/<case>.gcode
If fullcontrol is not installed, attempts to run via uv on the fly (handled externally by wrapper shell).
"""
import os, sys, textwrap, json, importlib
from pathlib import Path

CASES = {
  'basic_line': textwrap.dedent('''\
    from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform
    printer=Printer(print_speed=1800, travel_speed=6000)
    extruder=Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
    geom=ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)
    pts=[Point(x=0,y=0,z=0.2), Point(x=10,y=0,z=0.2, extrude=True)]
    print(transform([printer, extruder, geom, pts])['gcode'])
  '''),
  'extruder_on_toggle_travel': textwrap.dedent('''\
    from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform, travel_to
    printer=Printer(print_speed=1800, travel_speed=6000)
    extruder=Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
    geom=ExtrusionGeometry(area_model='rectangle', width=0.4, height=0.2)
    pts=[Point(x=0,y=0,z=0.2), Point(x=5,y=0,z=0.2, extrude=True)]
    seq=[printer, extruder, geom, pts] + travel_to(Point(x=10,y=0,z=0.2)) + [Point(x=15,y=0,z=0.2, extrude=True)]
    print(transform(seq)['gcode'])
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

failures = 0
for name, code in CASES.items():
    proc_code = compile(code, f'<case:{name}>', 'exec')
    local_ns = {}
    try:
        exec(proc_code, local_ns, local_ns)
        # code prints gcode to stdout; to capture we re-run in a controlled scope
        # Simpler: re-exec with capture
        import io
        buf = io.StringIO()
        sys_stdout = sys.stdout
        sys.stdout = buf
        exec(proc_code, {})
        sys.stdout = sys_stdout
        g = buf.getvalue().strip() + '\n'
        (out_dir / f'{name}.gcode').write_text(g, encoding='utf-8')
        print('PY case', name, 'OK')
    except Exception as ex:
        print('PY case', name, 'ERROR', ex, file=sys.stderr)
        failures += 1

if failures:
    sys.exit(1)
