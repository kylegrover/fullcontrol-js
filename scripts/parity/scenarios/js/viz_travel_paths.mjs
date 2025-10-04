// Visualization test: multiple paths with travel moves
import { Point, Extruder, transform } from '../../../../dist/index.js'

const steps = [
  new Point({ x:0, y:0, z:0.2 }),
  new Extruder({ on:true }),
  new Point({ x:10, y:0, z:0.2 }),
  new Extruder({ on:false }),
  new Point({ x:10, y:10, z:0.2 }),  // travel move
  new Extruder({ on:true }),
  new Point({ x:20, y:10, z:0.2 }),
  new Extruder({ on:false })
]

const result = transform(steps, 'plot', { raw_data: true, color_type: 'z_gradient', show_tips: false })
const output = result.plot.toJSON()
process.stdout.write(JSON.stringify(output, null, 2) + '\n')
