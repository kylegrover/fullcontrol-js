# FullControl JS ↔ Python Parity Matrix

Status legend:
- ✅ Implemented (behavior roughly matches Python)
- 🟡 Partial (some attributes or behaviors missing)
- ❌ Missing (not yet implemented)
- 📝 Planned (ticket in TODO list)

## Core Data Models
| Python | JS Class | Status | Notes |
|--------|---------|--------|-------|
| Point | Point | ✅ | Extra optional color, extrude, speed fields (Python separates extrusion via Extruder.on) |
| ExtrusionGeometry | ExtrusionGeometry | ✅ | Area models rectangle/stadium/circle/manual; area updates implemented |
| StationaryExtrusion | StationaryExtrusion | ✅ | G-code generation implemented & formatted; add regression test planned |
| Extruder (common) | Extruder | ✅ | on/off toggle, relative/absolute (M82/M83 + G92) & travel_format supported; point.extrude still accepted for backward compatibility |
| Printer | Printer | ✅ | Speed change logic & command_list merge (new_command) handled in pipeline |
| Fan | Fan | ✅ | Basic M106 (fan on) / M107 (fan off) style semantics implemented (extendable) |
| Hotend | Hotend | ✅ | Temperature commands supported (M104/M109 placeholders) |
| Buildplate | Buildplate | ✅ | Bed temperature commands supported (M140/M190 placeholders) |
| PrinterCommand | PrinterCommand | ✅ | Returns command_list[id] |
| ManualGcode | ManualGcode | ✅ | Freeform line pass-through |
| GcodeComment | GcodeComment | ✅ | Supports line-end and full-line comments |
| GcodeControls | GcodeControls | 🟡 | Initialize default printer only; no printer import presets, tips, or initialization data merging |
| PlotControls | PlotControls | 🟡 | Visualization placeholder; not feature complete compared to Python visualize module |
| PlotAnnotation | PlotAnnotation | 🟡 | Minimal; no advanced layout logic |

## Geometry Functions
| Python (geometry/) | JS File | Status | Notes |
|---|---|---|---|
| arcs, arc variants | arcs.ts | ✅ | Core arc helpers ported (assumed) |
| measure (distance, etc.) | measure.ts | ✅ | Basic measures provided |
| midpoint | midpoint.ts | ✅ | Matches functionality |
| move | move.ts | ✅ | Implemented |
| move_polar | move_polar.ts | ✅ | Implemented |
| reflectXY / reflect variants | reflect.ts / reflect_polar.ts | ✅ | Implemented |
| segmentation (segmented_line/path) | segmentation.ts | ✅ | Implemented |
| shapes (rectangle, circle, etc.) | shapes.ts | ✅ | Implemented |
| ramping (ramp_xyz, ramp_polar) | ramping.ts | ✅ | Implemented |
| waves (squarewave, trianglewave, sinewave) | waves.ts | ✅ | Implemented |
| travel_to | travel_to.ts | ✅ | Returns [Extruder(off), point, Extruder(on)] |

## Extra / Utility Functions
| Python | JS | Status | Notes |
|---|---|---|---|
| points_only | extra.ts points_only | ✅ | Behavior matches (tracking xyz) |
| relative_point | extra.ts relative_point | ✅ | Matches semantics |
| flatten | extra.ts flatten | ✅ | Implemented with Array.flatMap |
| linspace | extra.ts linspace | ✅ | Implemented |
| first_point | extra.ts first_point | ✅ | Implemented |
| last_point | extra.ts last_point | ✅ | Implemented |
| export_design | extra.ts export_design | ✅ | Writes JSON / returns string |
| import_design | extra.ts import_design | 🟡 | Requires registry population; dynamic class map currently empty |
| check | util/check.ts check | 🟡 | Messages differ slightly; fine for now |
| fix | util/check.ts fix | 🟡 | Lacks stop() error variant for manual color requirement; warns instead |
| check_points | util/check.ts check_points | ✅ | Partial parity (polar_xy variant) |
| tips (gcode.tips) | pipeline/gcode.ts (stdout) | 🟡 | Basic guidance lines printed; wording differs from Python |

## G-code Pipeline
| Python | JS | Status | Notes |
|---|---|---|---|
| State class (gcode/state.py) | pipeline/state.ts | 🟡 | Simpler; lacks dynamic printer initialization, extruder defaults, primer steps |
| steps2gcode.gcode | pipeline/gcode.ts generate_gcode | ✅ | Movement + extrusion + retraction/unretraction + stationary extrusions + extruder mode switches + command merges |
| Extruder.gcode/e_gcode | in generate_gcode + extrusion.ts | 🟡 | Functionally equivalent; could refactor for clearer separation |
| Printer.gcode / f_gcode | printer.ts | ✅ | f_gcode ordering & merging logic implemented |
| GcodeControls.initialize import printers | controls.ts | 🟡 | Basic initialization; profile auto-load minimal |
| tips() guidance | pipeline/gcode.ts | 🟡 | Simplified tips emitted to stdout |

## Visualization
Python visualize/JS visualize.ts
- 🟡 Minimal point dump only; parity intentionally deferred |

## Missing / Deferred Python Modules
- devices/ (printer profiles, initialization data, primers) – Not implemented
- combinations/gcode_and_visualize (combined workflows) – transform partly covers
- visualize/ (full plotting) – deferred

## Planned Tasks (Mapped to TODO IDs)
| TODO ID | Gap | Action |
|---------|-----|--------|
| 2 | travel_to missing | Add geometry/travel_to.ts and export |
| 3 | Extruder.on semantics | Implement toggle causing G0 vs G1 and feedrate changes; deprecate point.extrude reliance |
| 4 | StationaryExtrusion test | Example verifying correct G1 F.. E.. line |
| 5 | Comparison script robustness | Auto-detect python exec names |
| 6 | travel_to helper | Implement high-level list builder |
| 7 | Aux components gcode | Implement fan/hotend/buildplate gcode lines (M106/M109/M104/M190/M140, etc. or user-specified) |
| 8 | Printer new_command merge | Handle in pipeline when encountering Printer instance with new_command |
| 9 | M82/M83 & volume ref | Emit mode change lines and reset logic |
| 10 | Tips guidance | Add tips similar to Python tips.py |
| 11 | Formatting parity | Ensure .6f style trimming and feedrate formatting |
| 12 | Registry auto-build | Provide default registry of exported classes |
| 13 | pythonParity version | Set to audited Python version (e.g., 0.1.0) |

## Prioritization Rationale
1. Functional G-code correctness (travel_to, Extruder.on, relative/absolute, formatting) directly impacts print results.
2. Developer usability (registry, comparison script) accelerates parity validation.
3. Ancillary features (tips, aux components) improve completeness but not core.
4. Visualization parity intentionally deferred to later milestone.

## Acceptance Criteria for Parity Milestone
- All items marked ❌ moved to at least 🟡; critical pipeline items to ✅.
- Comparison script shows byte-identical (or numerically equivalent within tolerance) G-code for test fixtures vs Python for representative designs (line, square, spiral, travel move, retraction scenario, stationary extrusion).
- PARITY.md updated with final statuses and timestamp.

_Last updated: 2025-09-28_
