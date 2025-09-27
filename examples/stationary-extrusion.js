import { Point, ExtrusionGeometry, Extruder, StationaryExtrusion, Printer, transform } from '../dist/index.js'

// Simple stationary extrusion example: prime at a point without movement.
// Mirrors Python pattern: [Extruder(on=True), Point(...), StationaryExtrusion(volume, speed)]

const steps = [
  new Extruder({ on: true, units: 'mm', dia_feed: 1.75, relative_gcode: true, travel_format: 'none' }),
  new ExtrusionGeometry({ area_model: 'circle', diameter: 0.4 }),
  new Point({ x: 0, y: 0, z: 0 }),
  new StationaryExtrusion({ volume: 5, speed: 600 }),
]

const { gcode } = transform(steps)
console.log(gcode)
