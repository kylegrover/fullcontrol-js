// Parity scenario: variable_arcXY with radius and z changes
import { Point, variable_arcXY, transform } from '../../../../dist/index.js'

// Test variable_arcXY with radius and z changes
const centre_point = new Point({ x: 50, y: 50, z: 0 })
const radius = 10
const start_angle = 0
const arc_angle = 0.75 * Math.PI * 2  // 0.75 * tau
const segments = 64
const radius_change = -6
const z_change = 2.0

const steps = variable_arcXY(centre_point, radius, start_angle, arc_angle, segments, radius_change, z_change)

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
