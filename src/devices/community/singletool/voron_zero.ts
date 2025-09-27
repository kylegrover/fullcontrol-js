import { ManualGcode, PrinterCommand } from '../../../models/commands.js'
import { Extruder, StationaryExtrusion } from '../../../models/extrusion.js'
import { Point } from '../../../models/point.js'
import { Printer } from '../../../models/printer.js'
import { Fan } from '../../../models/auxiliary.js'
import { default_initial_settings } from './base_settings.js'

export function set_up(user_overrides: Record<string, any>) {
  const printer_overrides = { primer: 'travel', chamber_temp: 50, z_offset: null, include_purge: true }
  let initialization_data: any = { ...default_initial_settings, ...printer_overrides }
  initialization_data = { ...initialization_data, ...user_overrides }

  const s: any[] = []
  s.push(new ManualGcode({ text: '; Time to print!!!!!\n; GCode created with FullControl - tell us what you\'re printing!\n; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok ' }))
  s.push(new ManualGcode({ text: 'print_start EXTRUDER=' + initialization_data.nozzle_temp + ' BED=' + initialization_data.bed_temp + ' CHAMBER=' + initialization_data.chamber_temp }))
  s.push(new PrinterCommand({ id: 'absolute_coords' }))
  s.push(new PrinterCommand({ id: 'units_mm' }))
  s.push(new Extruder({ relative_gcode: initialization_data.relative_e }))
  s.push(new Fan({ speed_percent: initialization_data.fan_percent }))
  s.push(new ManualGcode({ text: 'M220 S' + initialization_data.print_speed_percent + ' ; set speed factor override percentage' }))
  s.push(new ManualGcode({ text: 'M221 S' + initialization_data.material_flow_percent + ' ; set extrude factor override percentage' }))
  if (initialization_data.z_offset !== null && initialization_data.z_offset !== undefined) {
    s.push(new ManualGcode({ text: 'SET_GCODE_OFFSET Z=' + initialization_data.z_offset + ' MOVE=1' }))
  }
  if (initialization_data.include_purge) {
    s.push(new Extruder({ on:false }))
    s.push(new Point({ x:5, y:5, z:10 }))
    s.push(new StationaryExtrusion({ volume:50, speed:250 }))
    s.push(new Printer({ travel_speed:250 }))
    s.push(new Point({ z:50 }))
    s.push(new Printer({ travel_speed: initialization_data.travel_speed }))
    s.push(new Point({ x:10, y:10, z:0.3 }))
  }
  s.push(new Extruder({ on:true }))
  s.push(new ManualGcode({ text: ';-----\n; END OF STARTING PROCEDURE\n;-----' }))

  const e: any[] = []
  e.push(new ManualGcode({ text: '\n;-----\n; START OF ENDING PROCEDURE\n;-----' }))
  e.push(new ManualGcode({ text: 'print_end    ;end script from macro\n; this final gcode line helps ensure the print_end macro is executed' }))

  initialization_data.starting_procedure_steps = s
  initialization_data.ending_procedure_steps = e
  return initialization_data
}
