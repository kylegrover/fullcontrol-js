// Parity scenario: stationary extrusion(s) at a single XY location (volume deposition without XY motion).
// Exercises E-only (or Z+E) lines and feedrate consistency.
import { Point, Printer, Extruder, StationaryExtrusion, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 900, travel_speed: 5000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })

// Two stationary extrusions one after another (e.g., priming blobs) at same XY but different Z heights.
const seq = [
  printer,
  extruder,
  new Point({ x:5, y:5, z:0.2 }),
  new StationaryExtrusion({ volume: 2.0 }),
  new Point({ x:5, y:5, z:0.5 }),
  new StationaryExtrusion({ volume: 3.0 }),
]

const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')
