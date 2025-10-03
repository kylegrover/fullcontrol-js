// Parity scenario: fan and temperature control
import { Point, Fan, Hotend, Buildplate, transform } from '../../../../dist/index.js'

// Test fan and temperature control
const steps = []
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))
steps.push(new Fan({ speed_percent: 50 }))
steps.push(new Point({ x: 40, y: 30, z: 0.2 }))
steps.push(new Hotend({ temp: 205 }))
steps.push(new Point({ x: 50, y: 30, z: 0.2 }))
steps.push(new Fan({ speed_percent: 100 }))
steps.push(new Point({ x: 60, y: 30, z: 0.2 }))
steps.push(new Buildplate({ temp: 80, wait: false }))
steps.push(new Point({ x: 70, y: 30, z: 0.2 }))

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
