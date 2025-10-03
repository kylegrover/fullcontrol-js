// Parity scenario: ManualGcode insertion
import { Point, ManualGcode, transform } from '../../../../dist/index.js'

// Test ManualGcode insertion
const steps = []
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))
steps.push(new ManualGcode({ text: "G4 P2000 ; pause for 2 seconds" }))
steps.push(new Point({ x: 40, y: 30, z: 0.2 }))
steps.push(new ManualGcode({ text: "G4 P1000 ; pause for 1 second" }))
steps.push(new Point({ x: 50, y: 30, z: 0.2 }))

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
