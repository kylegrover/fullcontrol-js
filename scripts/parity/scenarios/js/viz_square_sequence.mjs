// Visualization test: square with print_sequence color
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

const result = transform(steps, 'plot', { raw_data: true, color_type: 'print_sequence', show_tips: false })
const output = result.plot.toJSON()
process.stdout.write(JSON.stringify(output, null, 2) + '\n')
