// Parity scenario: speed changes during print
import { Point, Printer, Extruder, transform } from '../../../../dist/index.js'

// Test speed changes during print
const steps = []
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))
steps.push(new Printer({ print_speed: 1000 }))
steps.push(new Point({ x: 40, y: 30, z: 0.2 }))
steps.push(new Printer({ print_speed: 2000 }))
steps.push(new Point({ x: 50, y: 30, z: 0.2 }))
steps.push(new Printer({ travel_speed: 8000 }))
steps.push(new Extruder({ on: false }))
steps.push(new Point({ x: 60, y: 30, z: 0.2 }))
steps.push(new Extruder({ on: true }))
steps.push(new Point({ x: 70, y: 30, z: 0.2 }))

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
