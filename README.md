# FullControl JS (TypeScript Port)

Modern TypeScript/JavaScript implementation of the core FullControl design + G-code generation pipeline. Browser-first, Node supported. Mirrors the authoritative Python library; primary development occurs in Python and this package tracks released Python features.

Runtime Support: Node 16+ (ES2020 output) and modern evergreen browsers.


## Using FullControl JS

FullControl JS follows the FullControl python codebase in every way including function names and snake_case. Refer to the FullControl official repo, examples, and documentation for the best up to date information on the library.

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


## Features
- Mutable model objects (`Point`, `Extruder`, `Printer`, etc.)
- Geometry helpers (polar, move, reflect, arcs, segmentation, shapes, waves…)
- Extrusion geometry area models: rectangle, stadium, circle, manual
- G-code pipeline: movement + extrusion E accumulation (absolute or relative)
- **Visualization pipeline**: Structured plot data with path segmentation, color gradients, and bounding box calculation
- Manual / command list G-code insertion + inline comments
- Design export/import (JSON) + class registry hook

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

Generate structured plot data for external rendering:

```ts
import { Point, transform } from 'fullcontrol-js'

const steps = [
  new Point({ x: 0, y: 0, z: 0 }),
  new Point({ x: 10, y: 0, z: 0 }),
  new Point({ x: 10, y: 10, z: 0 }),
]

// Generate visualization data
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'print_sequence'
})

// Access structured data
const plotData = result.plot.toJSON()
console.log(plotData)
// {
//   paths: [{
//     xvals: [0, 10, 10],
//     yvals: [0, 0, 10],
//     zvals: [0, 0, 0],
//     colors: [[0, 1, 1], [0.5, 0.5, 1], [1, 0, 1]],
//     widths: [0.4, 0.4, 0.4],
//     heights: [0.2, 0.2, 0.2],
//     extruder: true
//   }],
//   boundingBox: { minx: 0, maxx: 10, ... },
//   annotations: []
// }
```

### Color Types

- `z_gradient` (default): Blue (low Z) → Red (high Z)
- `print_sequence`: Cyan (start) → Magenta (end)
- `print_sequence_fluctuating`: Oscillating rainbow colors
- `random_blue`: Random blue shades
- Travel moves automatically use gray

Paths are automatically segmented when the extruder turns on/off. See `docs/visualization.md` for full documentation.

**Visualization Parity**: ✅ **100% Complete** - All visualization outputs match the Python reference implementation exactly.

## Examples
See `examples/` for more patterns:
- `basic-line.ts`: one extrusion move
- `square.ts`: perimeter path
- `spiral.ts`: spiral helix demo (uses geometry helpers)

## Development

- `npm run build` - compile the library for local testing
- `npm run parity` - run parity tests against Python reference
- `npm run typecheck` - verify TypeScript types
- `npm run dev` - watch mode for development

### Publishing to npm

**Prerequisites:**
1. Ensure you're logged in: `npm login`
2. Verify authentication: `npm whoami`

**Publishing workflow:**
```bash
# 1. Update version in package.json (e.g., 0.2.0 -> 0.2.1)
# 2. Commit version bump and any changes
git add .
git commit -m "Release v0.2.1"
git tag v0.2.1

# 3. Dry run to verify package contents
npm run publish:dry-run

# 4. Publish to npm (runs parity tests + build + typecheck automatically)
npm run publish:npm

# 5. Push tags to GitHub
git push && git push --tags
```

**Note:** The `prepublishOnly` script automatically runs parity tests, build, and typecheck before publishing to ensure quality.

> **Parity Status**: ✅ **100% Complete** - All 23 automated parity tests passing (20 G-code + 3 visualization). `pythonParity` in `package.json` indicates the Python version matched. The JavaScript implementation produces identical outputs (within numeric tolerances) to the Python version for both G-code generation and visualization.

## Parity Harness
Python remains the source of truth. This repository includes an automated parity harness that runs paired real scripts (one Python, one JS) and performs tolerant G-code diffs.

Run all scenarios:
```
npm run parity
```

Add a new scenario:
1. Create `scripts/parity/scenarios/py/<name>.py` that prints G-code or JSON plot data.
2. Create `scripts/parity/scenarios/js/<name>.mjs` that writes the JS-generated output.
3. Re-run `npm run parity` and ensure no semantic diffs.

Scenario types:
- **G-code scenarios**: Compare line-by-line G-code output with numeric tolerances
- **Visualization scenarios**: Compare JSON plot data (paths, colors, bounding box) with tolerances for coordinates (±0.0005mm), colors (±0.001), and geometry (±0.001mm)

Semantic vs formatting differences: numeric fields (X/Y/Z/E/F for G-code, coordinates/colors for visualization) are compared with small tolerances defined in `scripts/parity/config.json`. Formatting-only differences (spacing, ordering within tolerance) do not fail the run.

See also:
- `PARITY.md` – high-level feature parity matrix covering G-code generation and visualization.
- `docs/visualization.md` – comprehensive visualization system documentation.
- `scripts/parity/README.md` – harness implementation details & roadmap.

## Roadmap
- Additional parity: advanced transforms, color handling modes, richer annotation semantics.
- Optional E/volume normalization strategies.

## License
GPL-3.0 (inherits copyleft requirements; see `license` file). Ensure compliance when redistributing or combining. Upstream Python project licensing guidance applies.
