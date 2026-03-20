import { Point, reflectXY, reflectXYpolar, transform } from '../../../../dist/index.js'

const pts = [new Point({x: 10, y: 5, z: 0.2}), new Point({x: 20, y: 15, z: 0.4})]
const p1 = new Point({x: 0, y: 0, z: 0})
const p2 = new Point({x: 10, y: 0, z: 0})
const p3 = new Point({x: 0, y: 10, z: 0})
const tau = Math.PI * 2

const ref_x = pts.map(p => reflectXY(p, p1, p2))
const ref_y = pts.map(p => reflectXY(p, p1, p3))
const ref_p = pts.map(p => reflectXYpolar(p, new Point({x: 15, y: 10, z: 0}), tau/4))

const steps = [...pts, ...ref_x, ...ref_y, ...ref_p]
const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
