import { Point, ramp_xyz, ramp_polar, transform } from '../../../../dist/index.js'

const pts = Array.from({length: 5}, (_, i) => new Point({ x: i*5, y: 0, z: 0 }))
const ptz = Array.from({length: 5}, (_, i) => new Point({ x: i*5, y: 0, z: 0 }))
const ptp = Array.from({length: 5}, (_, i) => new Point({ x: i*5, y: 0, z: 0 }))

const r_z = ramp_xyz(ptz, 0, 0, 5)
const r_p = ramp_polar(ptp, new Point({x:0, y:0, z:0}), 10, 0)

const steps = [...pts, ...r_z, ...r_p]
const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
