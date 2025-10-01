// Parity scenario: relative extrusion mode with two extruded segments.
// Tests M83 handling and E value increments vs Python.
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 1500, travel_speed: 5000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: true, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.5, height: 0.25 })

const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:0, y:0, z:0.2 }),
  new Extruder({ on:true }),
  new Point({ x:15, y:0, z:0.2 }),
  new Extruder({ on:false }),
  new Point({ x:15, y:5, z:0.2 }), // travel move (no extrusion)
  new Extruder({ on:true }),
  new Point({ x:30, y:5, z:0.2 }),
  new Extruder({ on:false })
]

const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')
