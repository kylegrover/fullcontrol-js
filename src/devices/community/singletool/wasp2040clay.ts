import { ManualGcode, PrinterCommand } from '../../../models/commands.js'
import { Extruder, StationaryExtrusion } from '../../../models/extrusion.js'
import { Point } from '../../../models/point.js'
import { Printer } from '../../../models/printer.js'
import { default_initial_settings } from './base_settings.js'

export function set_up(user_overrides: Record<string, any>) {
  const printer_overrides = {
    extrusion_width: 1.2,
    extrusion_height: 0.6,
    dia_feed: 3.1,
    travel_speed: 4000,
    travel_format: 'G1_E0',
    primer: 'travel'
  }
  let initialization_data: any = { ...default_initial_settings, ...printer_overrides }
  initialization_data = { ...initialization_data, ...user_overrides }

  const s: any[] = []
  s.push(new ManualGcode({ text: '; Time to print!!!!!\n; GCode created with FullControl - tell us what you\'re printing!\n; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok ' }))
  s.push(new PrinterCommand({ id: 'units_mm' }))
  s.push(new PrinterCommand({ id: 'home' }))
  s.push(new PrinterCommand({ id: 'absolute_coords' }))
  s.push(new Extruder({ relative_gcode: initialization_data.relative_e }))
  s.push(new ManualGcode({ text: 'M220 S' + initialization_data.print_speed_percent + ' ; set speed factor override percentage' }))
  s.push(new ManualGcode({ text: 'M221 S' + initialization_data.material_flow_percent + ' ; set extrude factor override percentage' }))
  s.push(new Extruder({ on:false }))
  s.push(new Point({ x:0, y:-90, z:50 }))
  s.push(new StationaryExtrusion({ volume:300, speed:120 }))
  s.push(new Printer({ travel_speed:250 }))
  s.push(new Point({ z:100 }))
  s.push(new Printer({ travel_speed: initialization_data.travel_speed }))
  s.push(new Extruder({ on:true }))
  s.push(new ManualGcode({ text: ';-----\n; END OF STARTING PROCEDURE\n;-----' }))

  const e: any[] = []
  e.push(new ManualGcode({ text: '\n;-----\n; START OF ENDING PROCEDURE\n;-----' }))
  e.push(new PrinterCommand({ id: 'home' }))

  initialization_data.starting_procedure_steps = s
  initialization_data.ending_procedure_steps = e
  return initialization_data
}
