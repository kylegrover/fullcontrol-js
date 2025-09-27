import { ManualGcode } from '../../../models/commands.js'
import { Extruder } from '../../../models/extrusion.js'
import { Buildplate, Hotend, Fan } from '../../../models/auxiliary.js'
import { default_initial_settings } from './base_settings.js'
import * as generic from './generic.js'
import * as custom from './custom.js'
import * as prusa_mk4 from './prusa_mk4.js'
import * as prusa_i3 from './prusa_i3.js'
import * as prusa_mini from './prusa_mini.js'
import * as ender_3 from './ender_3.js'
import * as ender_5_plus from './ender_5_plus.js'
import * as voron_zero from './voron_zero.js'
import * as bambulab_x1 from './bambulab_x1.js'
import * as cr_10 from './cr_10.js'
import * as wasp2040clay from './wasp2040clay.js'
import * as toolchanger_T0 from './toolchanger_T0.js'
import * as toolchanger_T1 from './toolchanger_T1.js'
import * as toolchanger_T2 from './toolchanger_T2.js'
import * as toolchanger_T3 from './toolchanger_T3.js'
import * as raise3d_pro2_nozzle1 from './raise3d_pro2_nozzle1.js'
import * as ultimaker2plus from './ultimaker2plus.js'
import fs from 'fs'
import path from 'path'

export interface ImportPrinterResult {
  starting_procedure_steps: any[]
  ending_procedure_steps: any[]
  [k: string]: any
}

const moduleMap: Record<string, any> = {
  generic, custom, prusa_mk4, prusa_i3, prusa_mini, ender_3, ender_5_plus, voron_zero, bambulab_x1,
  cr_10, wasp2040clay, toolchanger_T0, toolchanger_T1, toolchanger_T2, toolchanger_T3,
  raise3d_pro2_nozzle1, ultimaker2plus
}

function substitute(text: string, data: Record<string, any>) {
  if (!text) return text
  return text.replace(/\{(\w+)\}/g, (m, k) => (data[k] != null ? String(data[k]) : m))
}

function loadLibraryMap(library: string): Record<string,string> {
  try {
    const rel = path.resolve(process.cwd(), `fullcontrol-py/fullcontrol/devices/${library}/library.json`)
    if (fs.existsSync(rel)) {
      const raw = fs.readFileSync(rel,'utf-8')
      return JSON.parse(raw)
    }
  } catch {}
  return {}
}

export function import_printer(printer_name: string, user_overrides: Record<string, any>): ImportPrinterResult {
  const library_name = printer_name.startsWith('Cura/') ? 'cura' : printer_name.startsWith('community_minimal/') ? 'community_minimal' : 'community_minimal'
  const display_name = printer_name.split('/').slice(1).join('/')
  const libraryMap = loadLibraryMap(library_name)
  const slug = libraryMap[display_name] || display_name.toLowerCase().replace(/[^a-z0-9_]+/g,'_')

  if (moduleMap[slug] && typeof moduleMap[slug].set_up === 'function') {
    return moduleMap[slug].set_up(user_overrides)
  }

  let data: any = { ...default_initial_settings, ...user_overrides }
  const startRaw = substitute(data.start_gcode || '', data)
  const endRaw = substitute(data.end_gcode || '', data)
  const original_start_gcode = startRaw
  const starting_procedure_steps: any[] = []
  if (startRaw) starting_procedure_steps.push(new ManualGcode({ text: startRaw }))
  starting_procedure_steps.push(new ManualGcode({ text: `; Time to print!!!!!\n; Printer name: ${display_name}\n; Library: ${library_name}\n; GCode created with FullControl` }))
  starting_procedure_steps.push(new Extruder({ relative_gcode: data.relative_e }))
  if ('bed_temp' in user_overrides && !original_start_gcode.includes('M1')) starting_procedure_steps.push(new Buildplate({ temp: data.bed_temp, wait: true }))
  if ('nozzle_temp' in user_overrides && !original_start_gcode.includes('M10')) starting_procedure_steps.push(new Hotend({ temp: data.nozzle_temp, wait: true }))
  if ('fan_percent' in user_overrides && !original_start_gcode.includes('M106')) starting_procedure_steps.push(new Fan({ speed_percent: data.fan_percent }))
  if ('print_speed_percent' in user_overrides && !original_start_gcode.includes('M220')) starting_procedure_steps.push(new ManualGcode({ text: 'M220 S' + data.print_speed_percent + ' ; set speed factor override percentage' }))
  if ('material_flow_percent' in user_overrides && !original_start_gcode.includes('M221')) starting_procedure_steps.push(new ManualGcode({ text: 'M221 S' + data.material_flow_percent + ' ; set extrude factor override percentage' }))
  const ending_procedure_steps = endRaw ? [ new ManualGcode({ text: endRaw }) ] : []
  data.starting_procedure_steps = starting_procedure_steps
  data.ending_procedure_steps = ending_procedure_steps
  return data
}
