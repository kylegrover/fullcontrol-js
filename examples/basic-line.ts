import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../dist/index.js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })

const points = [
  new Point({ x: 0, y: 0, z: 0.2, extrude: false }),
  new Point({ x: 10, y: 0, z: 0.2, extrude: true })
]

const { gcode } = transform([printer, extruder, geom, points])
console.log(gcode)
