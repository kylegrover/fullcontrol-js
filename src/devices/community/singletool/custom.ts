import { ManualGcode } from '../../../models/commands.js'
import { Extruder } from '../../../models/extrusion.js'
import { Buildplate, Hotend, Fan } from '../../../models/auxiliary.js'
import { default_initial_settings } from './base_settings.js'

export function set_up(user_overrides: Record<string, any>) {
  const printer_overrides = { primer: 'no_primer', relative_e: false }
  let initialization_data: any = { ...default_initial_settings, ...printer_overrides }
  initialization_data = { ...initialization_data, ...user_overrides }

  const starting_procedure_steps: any[] = []
  starting_procedure_steps.push(new ManualGcode({ text: '; Time to print!!!!!\n; GCode created with FullControl - tell us what you\'re printing!\n; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok' }))
  if ('relative_e' in user_overrides) starting_procedure_steps.push(new Extruder({ relative_gcode: initialization_data.relative_e }))
  if ('bed_temp' in user_overrides) starting_procedure_steps.push(new Buildplate({ temp: initialization_data.bed_temp, wait: false }))
  if ('nozzle_temp' in user_overrides) starting_procedure_steps.push(new Hotend({ temp: initialization_data.nozzle_temp, wait: false }))
  if ('bed_temp' in user_overrides) starting_procedure_steps.push(new Buildplate({ temp: initialization_data.bed_temp, wait: true }))
  if ('nozzle_temp' in user_overrides) starting_procedure_steps.push(new Hotend({ temp: initialization_data.nozzle_temp, wait: true }))
  if ('fan_percent' in user_overrides) starting_procedure_steps.push(new Fan({ speed_percent: initialization_data.fan_percent }))
  if ('print_speed_percent' in user_overrides) starting_procedure_steps.push(new ManualGcode({ text: 'M220 S' + initialization_data.print_speed_percent + ' ; set speed factor override percentage' }))
  if ('material_flow_percent' in user_overrides) starting_procedure_steps.push(new ManualGcode({ text: 'M221 S' + initialization_data.material_flow_percent + ' ; set extrude factor override percentage' }))

  const ending_procedure_steps: any[] = []

  initialization_data.starting_procedure_steps = starting_procedure_steps
  initialization_data.ending_procedure_steps = ending_procedure_steps
  return initialization_data
}
