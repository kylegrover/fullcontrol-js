# FullControl JS Detailed Parity & Modernization Report (2025-09-28)

This report audits the current JavaScript/TypeScript implementation against the Python reference in `fullcontrol-py/fullcontrol` and recommends further improvements for 100% functional parity plus idiomatic JS ergonomics.

## Summary
Overall parity for core geometry and G-code generation is HIGH (≈95% feature coverage). Remaining differences are mostly structural (visualization stack, richer tips, advanced printer profiles) or opportunities to streamline the JS API.

| Area | Parity | Notes |
|------|--------|-------|
| Geometry primitives & generators | ✅ | Arcs, shapes, waves, segmentation, ramping all ported; numeric formatting consistent. |
| Extruder logic (on/off, relative/absolute, volume tracking) | ✅ | Supports M82/M83 & G92; improvement: consolidate e-ratio recalculation triggers. |
| Retraction / Unretraction | ✅ | Matches Python negative then recovery E emission ordering. |
| Stationary extrusion | ✅ | Output ordering (G1 F.. E..) correct. Add regression tests. |
| travel_to helper | ✅ | Present (`travel_to.ts`). Align docs (PARITY.md updated). |
| Printer command merging | ✅ | `new_command` merge implemented on encountering runtime Printer instance. |
| Auxiliary components (Fan/Hotend/Buildplate) | ✅ (basic) | Placeholder semantics; could expose explicit start/finish phases. |
| Tips guidance | 🟡 | Simplified; Python’s contextual warnings partially replicated. |
| Visualization | 🟡 | Minimal; Python’s mesh/plot generation deferred. |
| Device profiles loading | 🟡 | Profiles exist; initialization auto-wiring light. |
| Design import/export registry | 🟡 | Registry builder provided; auto-registration on import optional. |
| Combined transform (gcode + visualize) | 🟡 | `transform` covers; full dual-output parity deferred. |
| Advanced error checking (check/fix nuance) | 🟡 | Core checks exist; some Python-specific messages differ. |

## Confirmed Functional Equivalence
- Numeric formatting uses helper functions: coordinates 3 decimals, E values up to 6 decimals; trailing zero trimming matches typical slicer readability. Python variants rely on formatted f-strings; tolerances considered equivalent.
- Feedrate (F) emission strategy: only when speed changes or first move—matching semantics, though further micro-diffing against Python test corpus recommended.
- Relative vs absolute extrusion correctly resets reference (G92) when switching to absolute; resets volume reference for relative accrual.

## Divergences & Recommendations
### 1. Extruder / Point Coupling
Python relies on `Extruder(on=True/False)` objects in the step sequence; JS still tolerates `point.extrude` flags.
- Recommendation: Deprecate `point.extrude` in a minor release: add runtime warning when encountered unless `suppressDeprecated` flag set.
- Benefit: Cleaner mental model and simpler pipeline branching.

### 2. Registry & Serialization
Current `build_default_registry()` must be invoked manually.
- Recommendation: Auto-register on module import (tree-shakable) by exporting a singleton registry map. Provide `serializeSteps(steps, { registry })` and `deserializeSteps(json, { registry })` convenience wrappers.
- Add checksum/version stamp into exported JSON for forward compatibility.

### 3. Tips System
Python’s `tips.py` applies contextual heuristics.
- Recommendation: Extract current inline guidance to `tips.ts` with pure functions computing suggestion objects. Allows unit testing and optional UI surfaces.
- Add categories (warning, info, performance) and machine-readable codes.

### 4. Visualization Parity (Deferred Milestone)
- Port prioritized subset: bounding box, tube mesh generation (without Plotly dependency) using lightweight geometry arrays so downstream consumers can plug into three.js or regl.
- Provide adapter interface `toMesh({ sides, flatSides })` returning triangles + normals arrays.

### 5. Command / Component Abstraction
Aux components presently embed G-code line knowledge implicitly.
- Introduce interface `Emittable { toGcode(state: GcodeStateLike): string | string[] }` implemented by Fan, Hotend, Buildplate, PrinterCommand, ManualGcode for uniform pipeline ingestion.
- Pipeline then reduces special-case branches.

### 6. Error & Check Layer
Align Python `stop()` semantics that raise explicit termination conditions.
- Provide `FullControlError` subclasses: `GeometryError`, `ExtrusionError`, `DeviceConfigError`.
- Map Python fatal checks to thrown errors; keep non-fatal as structured warnings.

### 7. TypeScript Ergonomics
- Distribute declaration maps (`--declarationMap`) to improve source jump for TS consumers.
- Add JSDoc with Python docstring ports for all exported functions (some geometry functions currently lack full docs in TS).

### 8. Package Export Shape
Current single entrypoint fine; consider conditional exports for ESM-only builds in future major.
- Provide side-effect-free subpath exports (e.g., `fullcontrol-js/geometry`) to enable selective bundling.

### 9. Performance Micro-Optimizations
- Precompute sine/cosine arrays in high-resolution wave/arc generation when segments large and angle increments uniform (optional). Provide `arcXYCached` strategy for repeated radius/segments combos.
- Defer string concatenation in `generate_gcode` via small builder object to reduce intermediate arrays for very large path counts (>100k points).

### 10. Testing Enhancements
Add snapshot parity tests comparing Python vs JS for canonical fixtures. Suggested fixtures:
1. Simple line (no extrusion) with travel_format variations.
2. Rectangle with extrusion (absolute & relative modes).
3. Spiral with variable arc radii verifying E accumulation monotonicity.
4. Retraction/unretraction sequence around a travel move.
5. Stationary extrusion (single volume deposit) verifying F ordering.
6. Primer sequences from each built-in profile.

Integrate by extending existing `scripts/compare.py_js_gcode.mjs` to emit JUnit or TAP summary for CI.

### 11. Developer Experience
Add an optional fluent builder API:
```ts
import { FC } from 'fullcontrol-js/builder'
const gcode = FC.printer('prusa_mk4')
  .extruder({ diameter: 1.75 })
  .path(p => p.rectangleXY({ x:0, y:0, z:0 }, 20, 10).spiralOut(5))
  .retraction(1.2)
  .buildGcode()
```
Implemented as a thin layer over existing primitives; increases adoption approachability.

### 12. Documentation Sync
Ensure `PARITY.md` and this report reflect the same status categories; add a CI guard that fails if doc timestamp older than N days compared to last source commit touching `/src`.

## Prioritized Roadmap (Proposed)
| Order | Task | Effort | Impact |
|-------|------|--------|--------|
| 1 | Snapshot parity tests + compare harness upgrade | Medium | High (confidence) |
| 2 | Deprecate `point.extrude` with warning | Small | Medium |
| 3 | Registry auto-build & serialize/deserialize helpers | Small | Medium |
| 4 | Unified tips module & structured outputs | Small | Medium |
| 5 | Emittable interface refactor | Medium | Medium |
| 6 | Error class hierarchy + fatal check parity | Small | Medium |
| 7 | Visualization minimal mesh port | Medium | Medium |
| 8 | Builder/fluent API (experimental) | Medium | Medium |
| 9 | Performance optimizations (lazy) | Small | Low |
| 10 | Conditional subpath exports & docs polish | Small | Low |

## Concrete Next Steps
1. Create `src/tips.ts` exporting `generateTips(state: State, controls: GcodeControls): Tip[]`.
2. Add test fixtures under `scripts/tests` or `tests/` with auto Python generation.
3. Update `generate_js_gcode.mjs` to optionally accept tolerance JSON and produce diff summary.
4. Introduce `src/internal/errors.ts` with specialized error classes and refactor `util/check.ts` to throw where Python calls `stop()`.
5. Provide `registrySingleton` + auto-registration in `index.ts` (non-breaking for tree-shaking if property access only). Document usage in README.

## JS Idiomatic Adjustments Quick Wins
- Replace multiple inline formatting impls with a centralized `format.ts` module exporting `fmtCoord`, `fmtExtrude`, `fmtFeedrate` to aid consistent rounding changes.
- Accept plain object literals for geometry centers (duck typing) by normalizing to `Point` internally—reduce verbosity for quick scripts.
- Export pure utility versions of shape functions returning arrays of POJOs `{x,y,z}` for contexts not needing class overhead (option flag: `raw=true`).

## Risk Assessment
| Change | Risk | Mitigation |
|--------|------|------------|
| Deprecating `point.extrude` | Medium (user scripts rely) | Warn for one minor, remove next major. Provide codemod script. |
| Emittable interface refactor | Medium | Keep backward-compatible branches; add unit tests before removing. |
| Auto-registration | Low | Allow opt-out via env flag `FC_NO_AUTOREG=1`. |

## Acceptance Criteria for Full (Phase 2) Parity
- All geometry, gcode, extruder, and device differences either resolved or intentionally documented with rationale.
- Snapshot tests pass within numeric tolerance (coord ±0.0005, E ±0.000001, feedrate identical or ±1 rounding unit).
- Tips system returns structured array covering at least 5 Python-equivalent heuristics.
- Visualization minimal mesh generation reproduces Python tube triangulation for a reference path (triangle count match).

---
Generated: 2025-09-28
