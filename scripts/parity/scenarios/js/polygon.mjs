// Parity scenario: hexagon using polygonXY geometry function
import { Point, polygonXY, transform } from '../../../../dist/index.js'

// Create a hexagon using polygonXY
const centre_point = new Point({ x: 50, y: 50, z: 0.2 })
const enclosing_radius = 10
const start_angle = 0
const sides = 6
const clockwise = true

const steps = polygonXY(centre_point, enclosing_radius, start_angle, sides, clockwise)

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
