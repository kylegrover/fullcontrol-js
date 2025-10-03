// Parity scenario: arc using arcXY geometry function
import { Point, arcXY, transform } from '../../../../dist/index.js'

// Create an arc using arcXY
const centre_point = new Point({ x: 50, y: 50, z: 0.2 })
const radius = 10
const start_angle = 0
const arc_angle = 0.75 * Math.PI * 2  // 0.75 * tau
const segments = 64

const steps = arcXY(centre_point, radius, start_angle, arc_angle, segments)

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
