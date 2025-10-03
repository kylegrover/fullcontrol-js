// Parity scenario: midpoint and polar_to_point geometry functions
import { Point, polar_to_point, midpoint, transform } from '../../../../dist/index.js'

// Test midpoint and polar_to_point geometry functions
const pt1 = new Point({ x: 40, y: 40, z: 0.2 })
const pt2 = new Point({ x: 40, y: 60, z: 0.2 })
const pt3 = polar_to_point(pt2, 15, Math.PI / 4)  // tau/8 = 2π/8 = π/4
const pt4 = midpoint(pt1, pt2)

const steps = [pt1, pt2, pt3, pt4]

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
