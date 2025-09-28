# Overview

`fullcontrol-js` is a TypeScript/JavaScript implementation of the FullControl design → G-code pipeline, mirroring the Python library's modeling concepts:

Core concepts:
- Point / geometry utilities
- Extruder / ExtrusionGeometry (volumetric extrusion tracking)
- Printer (speeds, command list)
- State / transform → gcode or plot
- Primers & starting / ending procedure injection
- Dynamic device (printer profile) loading via `import_printer`

### Design Goals
1. API Familiarity: Method and class naming aligns with Python for ease of porting examples.
2. Deterministic Formatting: Coordinate (3dp), extrusion (up to 6dp trimmed), feedrate (1dp trimmed) formatting matches Python output style.
3. Separation of Concerns: Transformation (`transform`) builds a `State` which is then consumed by `generate_gcode` and visualization.
4. Progressive Parity: Where Python offers behaviors not yet ported, placeholders are documented in `PARITY.md` and here.

### Architecture Parallels (Python ↔ JS)
| Concept | Python Source | JS Module |
| ------- | ------------- | --------- |
| transform() | `fullcontrol/combinations/gcode_and_visualize/common.py` | `src/pipeline/transform.ts` |
| State assembly | `fullcontrol/gcode/state.py` | `src/pipeline/state.ts` |
| G-code emission | `fullcontrol/gcode/steps2gcode.py` + `point.py`, `extrusion_classes.py`, `printer.py` | `src/pipeline/gcode.ts` + models |
| Primers | `fullcontrol/gcode/primer_library/*` | `src/gcode/primer/index.ts` |
| Devices (singletool) | `fullcontrol/devices/community/singletool/*` | `src/devices/community/singletool/*` |
| Dynamic printer import | `fullcontrol/gcode/import_printer.py` | `src/devices/community/singletool/import_printer.ts` |

### Current Parity Highlights
- Relative/Absolute extrusion toggling with `M83` / `M82` + `G92 E0` sequence.
- Travel formatting supports `G1_E0` mode.
- Feedrate emission ordering now matches Python (`G1 F... X.. Y.. E..`).
- Primers fully ported (travel, axis, front lines variants).
- Banner & tips moved to stdout only (not embedded in G-code) in silent-friendly mode.

### Still Under Review / Future Work
- Additional visualization parity beyond data shape.
- Edge-case feedrate parity: complex retraction patterns.
- Multi-tool / advanced devices (if/when Python adds or if not yet ported).

See [parity.md](./parity.md) for an itemized list.
