import { Point, Printer, Extruder, ExtrusionGeometry, transform } from '../dist/index.js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })

const z = 0.2
const path = [
  new Point({ x: 0, y: 0, z, extrude: false }),
  new Point({ x: 20, y: 0, z, extrude: true }),
  new Point({ x: 20, y: 20, z, extrude: true }),
  new Point({ x: 0, y: 20, z, extrude: true }),
  new Point({ x: 0, y: 0, z, extrude: true })
]

const { gcode } = transform([printer, extruder, geom, path])
console.log(gcode)
