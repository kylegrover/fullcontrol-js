// Parity scenario: simple square perimeter (single layer) using current API style.
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../../../../dist/index.js'

const layer_height = 0.2
const line_width = 0.4
const side_length = 20
const start_x = 10
const start_y = 10

const printer = new Printer({ print_speed: 40*60, travel_speed: 80*60 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: line_width, height: layer_height })

const z = layer_height
const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:start_x, y:start_y, z }),
  new Extruder({ on:true }),
  new Point({ x:start_x + side_length, y:start_y, z }),
  new Point({ x:start_x + side_length, y:start_y + side_length, z }),
  new Point({ x:start_x, y:start_y + side_length, z }),
  new Point({ x:start_x, y:start_y, z }),
  new Extruder({ on:false })
]
const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')