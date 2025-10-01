# FullControl JS (TypeScript Port)

Modern TypeScript/JavaScript implementation of the core FullControl design + G-code generation pipeline. Browser-first, Node supported. Mirrors the authoritative Python library; primary development occurs in Python and this package tracks released Python features.

Runtime Support: Node 16+ (ES2020 output) and modern evergreen browsers.

> Parity: `pythonParity` in `package.json` indicates the Python version matched (currently 0.0.0 placeholder for first publish). Patch releases may fix JS-specific issues without adding new Python features.

## Parity Harness
Python remains the source of truth. This repository includes an automated parity harness that runs paired real scripts (one Python, one JS) and performs tolerant G-code diffs.

Run all scenarios:
```
npm run parity
```

Add a new scenario:
1. Create `parity/scenarios/py/<name>.py` that prints G-code.
2. Create `parity/scenarios/js/<name>.mjs` that writes the JS-generated G-code.
3. Re-run `npm run parity` and ensure no semantic diffs.

Semantic vs formatting differences: numeric fields (X/Y/Z/E/F) are compared with small tolerances defined in `parity/config.json`. Formatting-only differences (spacing, ordering within tolerance) do not fail the run.

See also:
- `PARITY.md` – high-level feature parity matrix.
- `parity/README.md` – harness implementation details & roadmap.

## Features
- Mutable model objects (`Point`, `Extruder`, `Printer`, etc.)
- Geometry helpers (polar, move, reflect, arcs, segmentation, shapes, waves…)
- Extrusion geometry area models: rectangle, stadium, circle, manual
- G-code pipeline: movement + extrusion E accumulation (absolute or relative)
- Manual / command list G-code insertion + inline comments
- Design export/import (JSON) + class registry hook
- Plot data builder for external visualization (structured only)

## Install
```bash
npm install fullcontrol-js
```

## Quick Start
```ts
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from 'fullcontrol-js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })

// Simple square path (extruding)
const z = 0.2
const path = [
  new Point({ x: 0, y: 0, z, extrude: false }),
  new Point({ x: 20, y: 0, z, extrude: true }),
  new Point({ x: 20, y: 20, z, extrude: true }),
  new Point({ x: 0, y: 20, z, extrude: true }),
  new Point({ x: 0, y: 0, z, extrude: true })
]

const { gcode } = transform([printer, extruder, geom, path])
console.log(gcode)
```

## G-code Generation Notes
- Per-move feedrate appended only when changed (Printer sets `speed_changed` internally via point `speed` override).
- `Extruder.units`:
  - `mm3`: E equals volumetric mm^3 (ratio = 1)
  - `mm`: E equals filament length; ratio computed from `dia_feed` diameter
- `Extruder.relative_gcode = true` resets volume reference after each move.
- `travel_format: 'G1_E0'` appends `E0` on non-extrusion moves (useful for some slicer conventions).

## Area Models
| Model | Parameters | Formula |
|-------|------------|---------|
| rectangle | width, height | `width * height` |
| stadium | width, height | `(width - height)*height + PI*(height/2)^2` |
| circle | diameter | `PI*(d/2)^2` |
| manual | area (set directly) | (unchanged) |

Call `ExtrusionGeometry.update_area()` automatically handled in pipeline when geometry present.

## Export / Import
```ts
import { export_design, import_design } from 'fullcontrol-js'
const steps = [printer, extruder, geom, path]
const json = export_design(steps)
// Provide your own registry mapping type name -> class
const registry = { Printer, Extruder, ExtrusionGeometry, Point }
const restored = import_design(registry, json)
```

## Visualization Data
`transform().plot` returns `{ points: [{x,y,z,color?}], annotations: [] }` – feed into your own renderer.

## Examples
See `examples/` for more patterns:
- `basic-line.ts`: one extrusion move
- `square.ts`: perimeter path
- `spiral.ts`: spiral helix demo (uses geometry helpers)

## Roadmap
- Additional parity: advanced transforms, color handling modes, richer annotation semantics.
- Optional E/volume normalization strategies.

## License
GPL-3.0 (inherits copyleft requirements; see `license` file). Ensure compliance when redistributing or combining. Upstream Python project licensing guidance applies.
