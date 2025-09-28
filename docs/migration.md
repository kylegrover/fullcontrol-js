# Migration: Python → JS

This guide helps translate existing Python FullControl designs to `fullcontrol-js`.

## 1. Imports
Python:
```python
from fullcontrol import Point, Extruder, ExtrusionGeometry, Printer, transform
```
JS/TS:
```ts
import { Point, Extruder, ExtrusionGeometry, Printer, transform } from 'fullcontrol-js'
```

## 2. Lists of points
Python often allows implicit coercion; in JS ensure arrays are used explicitly for grouped moves:
```ts
const path = [ new Point({ x:0, y:0, z:0.2 }), new Point({ x:10, y:0, z:0.2, extrude:true }) ]
```

## 3. Relative vs Absolute Extrusion
Same pattern:
```ts
new Extruder({ relative_gcode: true }) // M83
new Extruder({ relative_gcode: false }) // M82 + G92 E0
```

## 4. Printer Speeds
```ts
new Printer({ print_speed: 1200, travel_speed: 8000 })
```
Feedrates are emitted only on speed changes or first relevant move—matching Python behavior.

## 5. Primers
Python:
```python
controls = GcodeControls(initialization_data={'primer':'travel'})
```
JS:
```ts
transform(steps, 'gcode', { initialization_data: { primer: 'travel' } })
```

## 6. Device Import
Python:
```python
from fullcontrol.gcode.import_printer import import_printer
printer_profile = import_printer('generic', {'nozzle_temp':210})
```
JS:
```ts
import { import_printer } from 'fullcontrol-js'
const printer = await import_printer('generic', { nozzle_temp:210 })
```

## 7. Manual Gcode
Same intent:
```ts
import { ManualGcode } from 'fullcontrol-js'
steps.push(new ManualGcode({ text: 'M117 Printing...' }))
```

## 8. Differences / Caveats
- Guidance tips & banner are stdout-only in JS (not embedded in G-code) for cleaner diffing.
- Visualization API currently a thin placeholder pending fuller parity.
- Multi-tool functionality not yet implemented.

## 9. Troubleshooting Mapping
| Symptom | Python Fix | JS Equivalent |
| ------- | ---------- | ------------- |
| Missing primer moves | Ensure primer set in controls | Pass `initialization_data.primer` in transform controls |
| No extrusion (E=0) | Check ExtrusionGeometry set | Provide `ExtrusionGeometry({ width, height })` |
| Wrong feedrate | Confirm speed_changed set | Adjust `Printer` speeds or point `.speed` overrides |

## 10. Updating Parity
When a Python change lands, bump `pythonParity` in `package.json` and update `docs/parity.md` accordingly.
