import { ManualGcode, PrinterCommand } from '../../../models/commands.js'
import { Extruder } from '../../../models/extrusion.js'
import { Point } from '../../../models/point.js'
import { Buildplate, Hotend, Fan } from '../../../models/auxiliary.js'
import { default_initial_settings } from './base_settings.js'

export function set_up(user_overrides: Record<string, any>) {
  const printer_overrides = { e_units: 'mm3', dia_feed: 2.85 }
  let initialization_data: any = { ...default_initial_settings, ...printer_overrides }
  initialization_data = { ...initialization_data, ...user_overrides }

  const s: any[] = []
  s.push(new ManualGcode({ text: '\n;FLAVOR:UltiGCode\n;TIME:0\n;MATERIAL:1\n' }))
  s.push(new ManualGcode({ text: '; Time to print!!!!!\n; GCode created with FullControl - tell us what you\'re printing!\n; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok ' }))
  s.push(new PrinterCommand({ id: 'home' }))
  s.push(new Buildplate({ temp: initialization_data.bed_temp, wait: false }))
  s.push(new Hotend({ temp: initialization_data.nozzle_temp, wait: false }))
  s.push(new Buildplate({ temp: initialization_data.bed_temp, wait: true }))
  s.push(new Hotend({ temp: initialization_data.nozzle_temp, wait: true }))
  s.push(new PrinterCommand({ id: 'absolute_coords' }))
  s.push(new PrinterCommand({ id: 'units_mm' }))
  s.push(new Extruder({ relative_gcode: initialization_data.relative_e }))
  s.push(new Fan({ speed_percent: initialization_data.fan_percent }))
  s.push(new ManualGcode({ text: 'M220 S' + initialization_data.print_speed_percent + ' ; set speed factor override percentage' }))
  s.push(new ManualGcode({ text: 'M221 S' + initialization_data.material_flow_percent + ' ; set extrude factor override percentage' }))
  s.push(new Extruder({ on:false }))
  s.push(new Point({ x:5, y:5, z:10 }))
  s.push(new Point({ x:10, y:10, z:0.3 }))
  s.push(new Extruder({ on:true }))
  s.push(new ManualGcode({ text: ';-----\n; END OF STARTING PROCEDURE\n;-----' }))

  const e: any[] = []
  e.push(new ManualGcode({ text: '\n;-----\n; START OF ENDING PROCEDURE\n;-----' }))
  e.push(new PrinterCommand({ id: 'retract' }))
  e.push(new ManualGcode({ text: 'G91 ; relative coordinates' }))
  e.push(new ManualGcode({ text: 'G0 Z20 F8000 ; drop bed' }))
  e.push(new ManualGcode({ text: 'G90 ; absolute coordinates' }))
  e.push(new Fan({ speed_percent:0 }))
  e.push(new Buildplate({ temp:0, wait:false }))
  e.push(new Hotend({ temp:0, wait:false }))
  e.push(new ManualGcode({ text: 'M84 ; disable steppers' }))
  e.push(new ManualGcode({ text: '\n; This GCode is just padding because some printer firmwares need it'.repeat(25) }))

  initialization_data.starting_procedure_steps = s
  initialization_data.ending_procedure_steps = e
  return initialization_data
}
