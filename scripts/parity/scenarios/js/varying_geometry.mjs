// Parity scenario: varying extrusion geometry during print
import { Point, ExtrusionGeometry, transform } from '../../../../dist/index.js'

// Test varying extrusion geometry during print
const steps = []
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))
steps.push(new ExtrusionGeometry({ area_model: 'rectangle', width: 0.4, height: 0.2 }))
steps.push(new Point({ x: 40, y: 30, z: 0.2 }))
steps.push(new ExtrusionGeometry({ area_model: 'rectangle', width: 0.6, height: 0.3 }))
steps.push(new Point({ x: 50, y: 30, z: 0.2 }))
steps.push(new ExtrusionGeometry({ area_model: 'circle', diameter: 0.5 }))
steps.push(new Point({ x: 60, y: 30, z: 0.2 }))

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
