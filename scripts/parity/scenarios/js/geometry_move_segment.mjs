import { Point, Vector, segmented_line, segmented_path, move, move_polar, transform } from '../../../../dist/index.js'

const p1 = new Point({x:0, y:0, z:0})
const p2 = new Point({x:10, y:10, z:0})

const seg = segmented_line(p1, p2, 5)
const seg_path = segmented_path(seg, 3)

const moved = move(seg_path, new Vector({x:5, y:5, z:5}), true, 2)
const moved_polar = move_polar(seg_path, p1, 5, 0, true, 2)

const steps = [...seg, ...seg_path, ...moved, ...moved_polar]
const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
