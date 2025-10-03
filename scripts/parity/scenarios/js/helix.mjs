// Parity scenario: helix using helixZ geometry function
import { Point, helixZ, transform } from '../../../../dist/index.js'

// Create a helix using helixZ
const centre_point = new Point({ x: 50, y: 50, z: 0 })
const start_radius = 10
const end_radius = 10
const start_angle = 0
const n_turns = 5
const pitch_z = 0.4
const segments = 320
const clockwise = true

const steps = helixZ(centre_point, start_radius, end_radius, start_angle, n_turns, pitch_z, segments, clockwise)

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
