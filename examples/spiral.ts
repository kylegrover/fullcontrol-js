import { Point, Printer, Extruder, ExtrusionGeometry, transform, spiralXY } from '../dist/index.js'

const printer = new Printer({ print_speed: 1500, travel_speed: 5000 })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })

const points: Point[] = []
// spiralXY(centre, start_radius, end_radius, start_angle, n_turns, segments)
const spiral = spiralXY(new Point({ x: 0, y: 0, z: 0.2 }), 0.5, 15, 0, 3, 400)
// mark first as travel, rest extrusion
spiral.forEach((p, i) => { p.z = 0.2; p.extrude = i > 0 })
points.push(...spiral)

const { gcode } = transform([printer, extruder, geom, points])
console.log(gcode)
