import { Point, Vector, squarewaveXY, trianglewaveXYpolar, sinewaveXYpolar, transform } from '../../../../dist/index.js'

const tau = Math.PI * 2
const start = new Point({ x: 0, y: 0, z: 0 })
const vec = new Vector({ x: 1, y: 0, z: 0 })

const sq = squarewaveXY(start, vec, 5, 2, 3)
const tr = trianglewaveXYpolar(start, 0, 5, 2, 3)
const si = sinewaveXYpolar(start, tau/4, 5, 10, 2)

const steps = [...sq, ...tr, ...si]
const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
