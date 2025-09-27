import { ManualGcode } from '../../../models/commands.js'
import { Extruder } from '../../../models/extrusion.js'
import { Buildplate, Hotend, Fan } from '../../../models/auxiliary.js'
import { default_initial_settings } from './base_settings.js'

export interface ImportPrinterResult {
  starting_procedure_steps: any[]
  ending_procedure_steps: any[]
  [k: string]: any
}

export function import_printer(printer_name: string, user_overrides: Record<string, any>): ImportPrinterResult {
  // Minimal parity: treat all as community_minimal currently.
  const library_name = printer_name.startsWith('Cura/') ? 'cura' : 'community_minimal'
  const clean_name = library_name === 'cura' ? printer_name.slice(5) : printer_name.slice(10)

  // For now we do not load JSON libraries - future parity: load mapping.
  let data: any = { ...default_initial_settings }
  data = { ...data, ...user_overrides }

  const original_start_gcode = data.start_gcode || ''

  const starting_procedure_steps: any[] = []
  if (data.start_gcode) starting_procedure_steps.push(new ManualGcode({ text: data.start_gcode }))
  starting_procedure_steps.push(new ManualGcode({ text: `; Time to print!!!!!\n; Printer name: ${clean_name}\n; GCode created with FullControl - tell us what you're printing!\n; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok \n; New terms added to start_gcode ensure user-overrides are implemented:` }))
  starting_procedure_steps.push(new Extruder({ relative_gcode: data.relative_e }))
  if ('bed_temp' in user_overrides && !original_start_gcode.includes('M1') ) starting_procedure_steps.push(new Buildplate({ temp: data.bed_temp, wait: true }))
  if ('nozzle_temp' in user_overrides && !original_start_gcode.includes('M10') ) starting_procedure_steps.push(new Hotend({ temp: data.nozzle_temp, wait: true }))
  if ('fan_percent' in user_overrides && !original_start_gcode.includes('M106')) starting_procedure_steps.push(new Fan({ speed_percent: data.fan_percent }))
  if ('print_speed_percent' in user_overrides && !original_start_gcode.includes('M220')) starting_procedure_steps.push(new ManualGcode({ text: 'M220 S' + data.print_speed_percent + ' ; set speed factor override percentage' }))
  if ('material_flow_percent' in user_overrides && !original_start_gcode.includes('M221')) starting_procedure_steps.push(new ManualGcode({ text: 'M221 S' + data.material_flow_percent + ' ; set extrude factor override percentage' }))

  const ending_procedure_steps = [ new ManualGcode({ text: data.end_gcode || '' }) ]

  data.starting_procedure_steps = starting_procedure_steps
  data.ending_procedure_steps = ending_procedure_steps
  return data
}
