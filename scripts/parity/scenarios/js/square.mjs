// Parity scenario: simple square perimeter (single layer) matching Python version exactly.
import { Point, transform } from '../../../../dist/index.js'

const side_length = 20
const layer_height = 0.2
const start_x = 50
const start_y = 50

const steps = []

// Starting position
steps.push(new Point({ x: start_x, y: start_y, z: layer_height }))

// Square corners
steps.push(new Point({ x: start_x + side_length, y: start_y, z: layer_height }))
steps.push(new Point({ x: start_x + side_length, y: start_y + side_length, z: layer_height }))
steps.push(new Point({ x: start_x, y: start_y + side_length, z: layer_height }))
steps.push(new Point({ x: start_x, y: start_y, z: layer_height }))

const g = transform(steps, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')