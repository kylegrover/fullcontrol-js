import { Point } from '../../../models/point.js'
import { Printer } from '../../../models/printer.js'
import { Extruder, StationaryExtrusion } from '../../../models/extrusion.js'
import { ManualGcode, PrinterCommand, GcodeComment } from '../../../models/commands.js'
import { Buildplate, Hotend, Fan } from '../../../models/auxiliary.js'
import { default_initial_settings } from './base_settings.js'

// Placeholder auxilliary component model implementations to be created if not present
// (Fan, Buildplate, Hotend, etc.) For now we assume they mirror Python class names.

export function set_up(user_overrides: Record<string, any>) {
  const printer_overrides = {}
  let initialization_data: any = { ...default_initial_settings, ...printer_overrides }
  initialization_data = { ...initialization_data, ...user_overrides }

  const starting_procedure_steps: any[] = []
  starting_procedure_steps.push(new ManualGcode({ text: '; Time to print!!!!!\n; GCode created with FullControl - tell us what you\'re printing!\n; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok ' }))
  starting_procedure_steps.push(new ManualGcode({ text: '; For BambuLab Carbon X1, when using custom GCode, the first print after start-up may stop extruding shortly after starting. Just re-print' }))
  starting_procedure_steps.push(new Buildplate({ temp: initialization_data.bed_temp, wait: false }))
  starting_procedure_steps.push(new Hotend({ temp: 150, wait: false }))
  starting_procedure_steps.push(new Buildplate({ temp: initialization_data.bed_temp, wait: true }))
  starting_procedure_steps.push(new Hotend({ temp: 150, wait: true }))
  starting_procedure_steps.push(new PrinterCommand({ id: 'home' }))
  starting_procedure_steps.push(new GcodeComment({ end_of_previous_line_text: ' ; including mesh bed level' }))
  starting_procedure_steps.push(new PrinterCommand({ id: 'absolute_coords' }))
  starting_procedure_steps.push(new PrinterCommand({ id: 'units_mm' }))
  starting_procedure_steps.push(new Extruder({ relative_gcode: initialization_data.relative_e }))
  starting_procedure_steps.push(new Fan({ speed_percent: initialization_data.fan_percent }))
  starting_procedure_steps.push(new ManualGcode({ text: 'M106 P2 S255 ; enable aux fan' }))
  starting_procedure_steps.push(new Point({ x:20, y:20, z:10 }))
  starting_procedure_steps.push(new ManualGcode({ text: 'G92 X0 Y0 ; offset print to avoid filament cutting area' }))
  starting_procedure_steps.push(new Point({ x:5, y:5, z:10 }))
  starting_procedure_steps.push(new Hotend({ temp: initialization_data.nozzle_temp, wait: true }))
  starting_procedure_steps.push(new Extruder({ on:false }))
  starting_procedure_steps.push(new StationaryExtrusion({ volume:50, speed:250 }))
  starting_procedure_steps.push(new Printer({ travel_speed:250 }))
  starting_procedure_steps.push(new Point({ z:50 }))
  starting_procedure_steps.push(new Printer({ travel_speed: initialization_data.travel_speed }))
  starting_procedure_steps.push(new Point({ x:10, y:10, z:0.3 }))
  starting_procedure_steps.push(new Extruder({ on:true }))
  starting_procedure_steps.push(new ManualGcode({ text: 'M220 S' + initialization_data.print_speed_percent + ' ; set speed factor override percentage' }))
  starting_procedure_steps.push(new ManualGcode({ text: 'M221 S' + initialization_data.material_flow_percent + ' ; set extrude factor override percentage' }))
  starting_procedure_steps.push(new ManualGcode({ text: ';-----\n; END OF STARTING PROCEDURE\n;-----' }))

  const ending_procedure_steps: any[] = []
  ending_procedure_steps.push(new ManualGcode({ text: '\n;-----\n; START OF ENDING PROCEDURE\n;-----' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'M83\nG0 E-0.8 F3000 ; retract ' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'G91 ; relative coordinates' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'G0 Z20 F8000 ; drop bed' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'G90 ; absolute coordinates' }))
  ending_procedure_steps.push(new Fan({ speed_percent:0 }))
  ending_procedure_steps.push(new Buildplate({ temp:0, wait:false }))
  ending_procedure_steps.push(new Hotend({ temp:0, wait:false }))
  ending_procedure_steps.push(new ManualGcode({ text: 'M221 S100 ; reset flow' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'M900 K0 ; reset LA' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'M106 P2 S0 ; disable aux fan' }))
  ending_procedure_steps.push(new ManualGcode({ text: 'M84 ; disable steppers' }))

  initialization_data.starting_procedure_steps = starting_procedure_steps
  initialization_data.ending_procedure_steps = ending_procedure_steps
  return initialization_data
}
