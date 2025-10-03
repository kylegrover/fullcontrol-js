// Parity scenario: extrusion settings with mm3 units and different geometry
import { Point, GcodeControls, transform } from '../../../../dist/index.js'

// Test extrusion settings with mm3 units and different geometry
const steps = []
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))
steps.push(new Point({ x: 60, y: 30, z: 0.2 }))

const initial_settings = {
    extrusion_width: 0.8,
    extrusion_height: 0.3,
    e_units: "mm3",
    relative_e: false,
    dia_feed: 2.85,
}

const gcode_controls = new GcodeControls({ initialization_data: initial_settings })
const g = transform(steps, 'gcode', gcode_controls).gcode
process.stdout.write(g.trimEnd() + '\n')
