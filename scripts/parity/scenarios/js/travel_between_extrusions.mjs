// Parity scenario: two separated extrusion segments with a travel move between.
// Tests travel feedrate handling, coordinate suppression, and E continuity.
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 1600, travel_speed: 7000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.42, height: 0.2 })

const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:0, y:0, z:0.2 }),
  new Extruder({ on:true }),
  new Point({ x:12, y:0, z:0.2 }),
  new Extruder({ on:false }),
  new Point({ x:12, y:8, z:0.2 }), // travel (no extrusion)
  new Extruder({ on:true }),
  new Point({ x:25, y:8, z:0.2 }),
  new Extruder({ on:false })
]

const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')
