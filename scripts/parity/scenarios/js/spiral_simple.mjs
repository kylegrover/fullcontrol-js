// Parity scenario: spiral using spiralXY geometry function
import { Point, spiralXY, transform } from '../../../../dist/index.js'

// Create a spiral using spiralXY
const centre_point = new Point({ x: 50, y: 50, z: 0.2 })
const start_radius = 10
const end_radius = 8
const start_angle = 0
const n_turns = 5
const segments = 320
const clockwise = true

const steps = spiralXY(centre_point, start_radius, end_radius, start_angle, n_turns, segments, clockwise)

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
