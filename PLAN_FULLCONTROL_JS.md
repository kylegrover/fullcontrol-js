# FullControl JS/TS Rewrite Plan (Draft)

This document outlines the strategy to port the Python `fullcontrol` library to a modern TypeScript implementation targeting both browser and Node environments while preserving API naming and behavior.

## 1. Goals
- Preserve public API: class/function names, high-level parameter semantics.
- Provide idiomatic, modern TypeScript (ES2022+), published as a single npm package initially (e.g. `@fullcontrol/fullcontrol`).
- Output both ESM and CJS builds (if needed) plus type declarations.
- Primary runtime: Browser (tree-shakeable modules); secondary: Node 22+.
- Zero/low runtime dependencies initially (avoid heavy libs unless necessary). Optional future optimization.
- Defer performance optimizations (WASM, workers) until after functional parity.

## 2. Scope of Initial Port
Core Python package pieces only (`fullcontrol/`):
- Data models: BaseModelPlus patterns → lightweight TS classes with validation helpers.
- Geometry utilities (all functions in `geometry/`).
- G-code pipeline: steps → state → gcode string.
- Visualization stub: Provide structure and types; full plotting can be deferred or replaced with plugin architecture (initial minimal placeholder consistent with API).
- Combination layer: `transform()` bridging to `gcode` / `visualize`.
- Extra utilities: flatten, linspace, export/import design (JSON), relative/first/last point, etc.

Excluded in v1 JS:
- Jupyter / notebook specific context.
- Any lab/experimental modules.
- Plotly-based rich visualization (will expose hook interface instead).

## 3. Public API Inventory (Parity Set)
From top-level `__init__` exposure chain:
- Classes: Point, Extruder, ExtrusionGeometry, StationaryExtrusion, PrinterCommand, ManualGcode, Printer, Fan, Hotend, Buildplate, GcodeComment, GcodeControls, PlotAnnotation, PlotControls.
- Functions: transform, gcode, visualize, plus all geometry functions (arcXY, variable_arcXY, elliptical_arcXY, arcXY_3pt, rectangleXY, circleXY, circleXY_3pt, ellipseXY, polygonXY, spiralXY, helixZ, move, move_polar, reflectXY, reflectXY_mc, reflectXYpolar, ramp_xyz, ramp_polar, squarewaveXY, squarewaveXYpolar, trianglewaveXYpolar, sinewaveXYpolar, segmented_line, segmented_path, midpoint, interpolated_point, centreXY_3pt, point_to_polar, polar_to_point, polar_to_vector, distance, angleXY_between_3_points, path_length, copy_geometry, copy_geometry_polar (may remain internal?), plus utilities: points_only, relative_point, flatten, linspace, first_point, last_point, export_design, import_design, check, fix, check_points.
- Types (TS interfaces): Vector, PolarPoint, internal State, PlotData, bounding boxes.

Potential Internal-only in JS (not exported unless needed for parity examples):
- Low-level state machines (State), tips functions, internal mesh builders.

## 4. TypeScript Project Structure (Proposed)
```
/src
  index.ts                (re-export public API)
  core/
    base-model.ts         (BaseModelPlus analogue)
    utils-validation.ts
  models/
    point.ts
    printer.ts
    extrusion.ts          (Extruder, ExtrusionGeometry, StationaryExtrusion)
    components.ts         (Fan, Hotend, Buildplate)
    commands.ts           (PrinterCommand, ManualGcode, GcodeComment)
    controls.ts           (GcodeControls, PlotControls)
    annotations.ts        (PlotAnnotation)
  geometry/
    vector.ts
    polar.ts
    midpoint.ts
    measure.ts
    move.ts
    move-polar.ts
    reflect.ts
    reflect-polar.ts
    segmentation.ts
    shapes.ts
    arcs.ts
    ramping.ts
    waves.ts
  pipeline/
    state.ts              (gcode generation state)
    gcode.ts              (gcode function)
    visualize.ts          (visualize placeholder / data builder)
    transform.ts
  visualize/
    plot-data.ts          (structure only)
    bounding-box.ts
    tube-mesh.ts          (deferred or minimal)
  util/
    extra.ts              (flatten, linspace, etc.)
    io.ts                 (export/import design)
    check.ts              (check, fix, check_points)
  internal/
    tips.ts               (no-op or console messages)

/tsconfig.json
/package.json
/ROLLUP.config.mjs or tsup config (build both ESM + CJS + d.ts)

/tests (optional minimal examples producing expected gcode snapshots)
```

## 5. BaseModelPlus Strategy
Python uses Pydantic for field allowing, update_from, and extra field rejection.
In TS:
- Define simple class with constructor accepting partial init object.
- Keep updateFrom(source) replicating non-undefined property assignment.
- Provide static validateAllowed(obj, allowedKeys) for debug/development mode (tree-shakeable) – opt-out in production.
- Use `readonly` where appropriate to guide consumers.

## 6. Data Mutability Philosophy
- Match Python mutability: objects are mutable (update_from equivalent uses direct property set).
- Avoid deep proxies; trust consumers.
- Provide cloning helpers for deep copy where Python used deepcopy (e.g., point.copy()).

## 7. Geometry Functions Porting Notes
- Maintain function signatures and naming in camelCase if already (most are snake_case in Python). Decision: Preserve snake_case for parity (user requirement). Document that TS consumers can import as-is. (We can optionally export camelCase aliases later—phase 2.)
- Use pure functions returning new arrays/objects, respecting immutability where Python returned new lists.
- Provide internal helper for cloning Points (to keep color or other metadata later).

## 8. G-code Pipeline
Python loop uses dynamic dispatch on objects with gcode(state) method.
In TS:
- Each class with gcode? implements an interface `GcodeRenderable` with `gcode(state: State): string | undefined`.
- `gcode(steps, controls, showTips)` replicates order and side-effects (e.g., state mutation).
- Implement `State` class to mirror Python structure: steps array, i index, gcode lines accumulator, printer/extruder state, etc.
- Controls: GcodeControls.initialize() to preset defaults.

## 9. Visualization Placeholder
- Provide `visualize(steps, controls, showTips)` returning structured `PlotData` if `controls.raw_data` true else a no-op (or console message) until a future real renderer (maybe plug-in pattern). Maintain attributes used by transform().

## 10. Transform Function
- Mirror Python logic: accepts steps list, result_type ('gcode' | 'plot'), optional controls, show_tips default true.
- Calls fix() (ported) first.

## 11. Error / Warning Behavior
- Python prints warnings. In JS:
  - Use console.warn for parity.
  - Throw Errors where Python raises exceptions.
  - Provide optional strict mode in controls later.

## 12. Serialization (export/import design)
- Python exports JSON with { type, data } referencing class names.
- TS will do similar: each class adds static `typeName` and static `fromJSON(data)` and instance `toJSON()` returning data object (not including type). Export function maps steps to { type: typeName, data }.
- Import will map via registry built from exported classes.

## 13. Build & Tooling
- Use TypeScript 5.x.
- Build tool: `tsup` (fast, outputs ESM+CJS+types) or Rollup. Choose `tsup` for speed.
- Lint: ESLint + Prettier (optional for initial pass; can defer).
- Package exports field in `package.json` for conditional exports.

## 14. Minimal Testing Strategy (Given Low Priority)
- Snapshot sample designs to validate geometry and gcode generation deterministic outputs.
- Quick property tests (e.g., distance symmetry) optional.
- Include examples in `examples/` rather than formal test harness initially.

## 15. Port Sequencing (Dependency-Ordered)
1. Core scaffolding: package.json, tsconfig, base-model, point, vector, extruder related models.
2. Utilities: extra functions (flatten, linspace, etc.), check/fix.
3. Geometry primitives: polar, midpoint, measure, move, move_polar, reflect, reflect_polar, segmentation, arcs, ramping, shapes, waves.
4. Extrusion & auxiliary components: extrusion geometry, stationary extrusion, components (fan, hotend, buildplate).
5. Commands & controls & annotations.
6. Gcode state + gcode generation pipeline.
7. Visualization placeholders (plot_data, bounding_box, visualize, tips).
8. Combination layer: transform.
9. Serialization (export/import design) integrating registry.
10. Index exports and documentation stub.
11. Example scripts + snapshots.

## 16. Naming & Conventions
- Keep snake_case for parity of exported function names.
- Internal TS types/interfaces PascalCase.
- Directory names lower-case.
- Avoid default exports; use named exports for tree shaking.

## 17. Potential Future Enhancements (Out of Scope Now)
- Worker-based heavy geometry or slicing tasks.
- Real-time streaming/generator API for large designs (async iterators).
- WASM acceleration for math hot paths.
- Rich WebGL/Plotly replacement plugin.
- Multi-package split (geometry-only, core, viz) for lean bundles.

## 18. Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Silent behavioral drift from Python | High | Add minimal snapshot examples |
| Overly chatty console warnings in browser | Low | Provide controls flag to silence |
| JSON size / performance for large designs | Medium | Consider streaming export in future |
| Lack of strict validation vs Pydantic | Medium | Provide optional dev assertions |
| Name collisions in registry | Low | Enforce unique typeName + build-time check |

## 19. Compatibility Notes
- Node 22+: Top-level await ok (not needed initially). Native ESM baseline; still ship CJS for older bundlers.
- Browser: consumers bundle with Vite/Webpack; ensure no Node-specific imports.
- Avoid fs/path; use JSON stringify/parse only. Provide export/import that return string/object; separate helper for downloading in browser left to user.

## 20. Implementation Details Highlights
- State class: track i, steps, gcode array, maybe current positions, extruder states (mirroring Python if necessary). Evaluate Python state implementation (future step) before full port—placeholder here.
- Use discriminated union for step runtime identification if needed; fallback to `instanceof` for class mapping.
- Provide `isPoint(obj): obj is Point` type guard for clarity.

## 21. Deliverables for Initial Commit
- Project scaffold (package.json, tsconfig, src/index.ts with TODO comments referencing plan).
- Implement sections 1–3 of sequence (core + utils + partial geometry) stubbed functions returning placeholders with TODO tags.
- Add PLAN file (this document).

## 22. Timeline (Rough Effort)
- Day 1: Scaffold + core models + utilities.
- Day 2: Geometry functions port.
- Day 3: Gcode pipeline + controls + serialization.
- Day 4: Visualization placeholder + transform + index polish.
- Day 5: Examples + snapshots + initial README.

## 23. Open Items (Minimal)
- Confirm keeping snake_case export names (default yes per parity requirement).
- Confirm placeholder visualize strategy acceptable (raw data only now).

## 24. Next Action
Proceed with scaffolding and begin port per sequencing.

---
(Draft complete. Will refine as implementation proceeds.)
