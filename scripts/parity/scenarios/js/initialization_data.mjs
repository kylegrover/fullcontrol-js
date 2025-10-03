// Parity scenario: initialization_data with custom settings
import { Point, GcodeControls, transform } from '../../../../dist/index.js'

// Test initialization_data with custom settings
const steps = []
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))
steps.push(new Point({ x: 60, y: 30, z: 0.2 }))

const initial_settings = {
    print_speed: 2000,
    travel_speed: 4000,
    nozzle_temp: 280,
    bed_temp: 80,
    fan_percent: 40,
}

const gcode_controls = new GcodeControls({ initialization_data: initial_settings })
const g = transform(steps, 'gcode', gcode_controls).gcode
process.stdout.write(g.trimEnd() + '\n')
