// Visualization test: simple line matching Python version
import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })

const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:0, y:0, z:0.2 }),
  new Extruder({ on:true }),
  new Point({ x:10, y:0, z:0.2 }),
  new Extruder({ on:false })
]

// Get raw plot data
const result = transform(seq, 'plot', { raw_data: true, show_tips: false, show_banner: false })
const plotData = result.plot

// Convert to JSON output
const output = plotData.toJSON()
process.stdout.write(JSON.stringify(output, null, 2) + '\n')
