# Primers

Primers insert a standardized set of preparatory movements & extrusions before the user design begins. They are selected via `initialization_data.primer`.

| Name | Behavior | Python Reference |
| ---- | -------- | ---------------- |
| `travel` | Extruder off, rapid move to first point, extruder on | `primer_library/travel.py` |
| `front_lines_then_y` | Front rectangle, then print to start X then Y | `front_lines_then_y.py` |
| `front_lines_then_x` | Front rectangle, then print to start Y then X | `front_lines_then_x.py` |
| `front_lines_then_xy` | Front rectangle, then diagonal to start XY | `front_lines_then_xy.py` |
| `x` | Move to Z, enable, print along X then to Y | `x.py` |
| `y` | Move to Z, enable, print along Y then to X | `y.py` |
| `no_primer` | No primer steps | `no_primer.py` |

All primer implementations live in `src/gcode/primer/index.ts`.

## How Primer Injection Works
1. User `steps` are flattened.
2. First `Point` (or first point in a nested array) is identified.
3. Primer steps are generated relative to this point.
4. Final ordered steps: `starting_procedure_steps` + primer + user steps + `ending_procedure_steps`.

## Example
```ts
transform(userSteps, 'gcode', {
  initialization_data: { primer: 'front_lines_then_y' },
  show_banner:false, show_tips:false
})
```

## Custom Primers (Planned)
A future extension will allow supplying a function `(firstPoint: Point) => Step[]` via `initialization_data.custom_primer` that overrides built-ins.
