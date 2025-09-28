# Getting Started

## Install
```bash
npm install fullcontrol-js
```

## Minimal Example
```ts
import { Point, Extruder, ExtrusionGeometry, Printer, transform } from 'fullcontrol-js'

const steps = [
  new Printer({ print_speed: 1000, travel_speed: 8000 }),
  new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: true }),
  new ExtrusionGeometry({ area_model: 'rectangle', width: 0.4, height: 0.2 }),
  [ new Point({ x:0, y:0, z:0.2 }), new Point({ x:20, y:0, z:0.2, extrude:true }) ]
]
const { gcode } = transform(steps, 'gcode', { show_banner:false, show_tips:false })
console.log(gcode)
```

## Using a Primer
```ts
const { gcode } = transform(steps, 'gcode', { initialization_data: { primer: 'travel' } })
```
This injects a travel primer (extruder off → move to first point → extruder on) before the main sequence.

## Using a Community Device
```ts
import { import_printer } from 'fullcontrol-js'

const device = await import_printer('generic', { nozzle_temp: 210, bed_temp: 40 })
// device.initialization_data.starting_procedure_steps now contains banner, temps, fan, etc.
const steps = [ ...device.initialization_data.starting_procedure_steps, /* design */ ]
```
(High-level helper wiring to automatically apply these steps is on the roadmap.)

## Silent Mode
```ts
transform(steps, 'gcode', { silent:true })
```
Suppresses stdout guidance and banners.

## Python Parity Reference
The baseline Python sources mirrored here: `fullcontrol-py/fullcontrol/*`. For transform parity see:
- `fullcontrol/combinations/gcode_and_visualize/common.py`
- `fullcontrol/gcode/steps2gcode.py`

## Type Definitions
All exported classes provide TypeScript definitions; hover in your editor or inspect `dist/index.d.ts` for API surfaces.

## Troubleshooting
- If formatting differs from Python: ensure you are not reformatting lines post-generation.
- If primers not appearing: confirm you passed `initialization_data.primer` and that a Point exists in the design to anchor the primer.
