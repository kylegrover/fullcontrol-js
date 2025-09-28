# Parity Matrix

Tracks status of JS implementation relative to Python reference.

| Area | Python Module(s) | JS Module(s) | Status | Notes |
| ---- | ---------------- | ------------ | ------ | ----- |
| Transform entry | combinations/gcode_and_visualize/common.py | pipeline/transform.ts | Done | Banner/tips stdout only in JS |
| State assembly | gcode/state.py | pipeline/state.ts | Partial | Core ordering + primers done; multi-tool injection future |
| G-code driver | gcode/steps2gcode.py | pipeline/gcode.ts | Done | Retraction + feedrate sequencing validated |
| Point emission | gcode/point.py | pipeline/gcode.ts | Done | Ordering & formatting matched |
| Extruder logic | gcode/extrusion_classes.py | models/extrusion.ts + pipeline/gcode.ts | Done | M82/M83 + G92 parity |
| Printer feedrates | gcode/printer.py | models/printer.ts + pipeline/gcode.ts | Done | F ordering aligned |
| Extrusion geometry | gcode/extrusion_classes.py | models/extrusion.ts | Done | Area update logic mirrored |
| Stationary extrusion | gcode/extrusion_classes.py | models/extrusion.ts + pipeline/gcode.ts | Done | Formatting parity achieved |
| Primers | gcode/primer_library/* | gcode/primer/index.ts | Done | All built-ins ported |
| Devices (singletool) | devices/community/singletool/* | devices/community/singletool/* | Done | 1:1 ports |
| Dynamic device import | gcode/import_printer.py | devices/.../import_printer.ts | Done | library.json + substitution |
| Tips guidance | gcode/tips.py | pipeline/gcode.ts (stdout) | Partial | Minor wording differences vs Python |
| Buildplate/Hotend/Fan | gcode/auxilliary_components.py | models/auxiliary.ts | Done | Parity lines produced |
| Retraction/unretraction | gcode/printer.py + extruder | pipeline/gcode.ts | Done | Negative then recovery extrusion lines confirmed |
| Visualization | visualize/* | pipeline/visualize.ts | Partial | Structural compatibility only |
| Multi-tool printers | (future/extended) | (not yet) | Planned | Out of scope initial phase |

Legend: Done / Partial / Pending / Planned.

## Version Tracking
The `pythonParity` field in `package.json` records the baseline Python library version reviewed. Update whenever parity milestones land.
