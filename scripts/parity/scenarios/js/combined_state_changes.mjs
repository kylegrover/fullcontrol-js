// Parity scenario: combination of multiple state changes
import { Point, Printer, ExtrusionGeometry, Fan, Hotend, Extruder, transform } from '../../../../dist/index.js'

// Test combination of multiple state changes
const steps = []

// Initial point
steps.push(new Point({ x: 30, y: 30, z: 0.2 }))

// Change multiple settings
steps.push(new Printer({ print_speed: 1500 }))
steps.push(new ExtrusionGeometry({ area_model: 'rectangle', width: 0.5, height: 0.25 }))
steps.push(new Fan({ speed_percent: 75 }))

// Move
steps.push(new Point({ x: 40, y: 30, z: 0.2 }))

// Change more settings
steps.push(new Hotend({ temp: 215 }))
steps.push(new Printer({ print_speed: 2500 }))

// Move
steps.push(new Point({ x: 50, y: 30, z: 0.2 }))

// Travel move
steps.push(new Extruder({ on: false }))
steps.push(new Point({ x: 60, y: 30, z: 0.2 }))

// Resume printing
steps.push(new Extruder({ on: true }))
steps.push(new Point({ x: 70, y: 30, z: 0.2 }))

const g = transform(steps, 'gcode', { show_tips: false, show_banner: false }).gcode
process.stdout.write(g.trimEnd() + '\n')
