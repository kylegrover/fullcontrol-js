// Parity scenario: simple line using built dist bundle.
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })
// JS still supports point.extrude, but we mirror Python style using Extruder toggles
const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:0, y:0, z:0.2 }),
  new Extruder({ on:true }),
  new Point({ x:10, y:0, z:0.2 }),
  new Extruder({ on:false })
]
const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')
