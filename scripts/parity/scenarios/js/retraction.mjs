import { Point, Printer, Extruder, ExtrusionGeometry, PrinterCommand, transform } from '../../../../dist/index.js'

const printer = new Printer({ print_speed: 1800, travel_speed: 6000, command_list: { retract: 'G10 ; retract', unretract: 'G11 ; unretract' } })
const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0', retraction_length: 2.0 })
const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })
const seq = [
  printer,
  extruder,
  geom,
  new Point({ x:0,y:0,z:0.2 }),
  new Extruder({ on:true }),
  new Point({ x:20,y:0,z:0.2 }),
  new Extruder({ on:false }),
  new PrinterCommand({ id: 'retract' }),
  new Point({ x:25,y:5,z:0.2 }),
  new PrinterCommand({ id: 'unretract' }),
  new Extruder({ on:true }),
  new Point({ x:25,y:25,z:0.2 }),
  new Extruder({ on:false })
]
const g = transform(seq, 'gcode', { show_tips:false, show_banner:false }).gcode
process.stdout.write(g.trimEnd() + '\n')
