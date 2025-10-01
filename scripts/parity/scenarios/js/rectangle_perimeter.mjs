// Parity scenario: rectangular perimeter (closed loop) with four extrusion segments.
// Mirrors Python tutorial style: explicit extruder on/off, absolute extrusion mode (relative_gcode: false).
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })

// Rectangle dimensions
const w = 20
const h = 10
const z = 0.2

const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:0, y:0, z }),
  new Extruder({ on:true }),
  new Point({ x:w, y:0, z }),
  new Point({ x:w, y:h, z }),
  new Point({ x:0, y:h, z }),
  new Point({ x:0, y:0, z }), // close loop
  new Extruder({ on:false })
]

const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')
