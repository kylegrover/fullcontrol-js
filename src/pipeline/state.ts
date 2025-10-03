import { Point } from '../models/point.js'
import { Extruder, ExtrusionGeometry } from '../models/extrusion.js'
import { Printer } from '../models/printer.js'
import { flatten } from '../util/extra.js'
import { buildPrimer, PrimerName } from '../gcode/primer/index.js'
import { ManualGcode } from '../models/commands.js'
import { default_initial_settings } from '../devices/community/singletool/base_settings.js'

export interface StepContext {
  prevPoint?: Point
  lastGcodeLine?: string
  state: State
}

export type Step = any // loosely typed for now until all models are ported

export class State {
  steps: Step[]
  gcodeLines: string[] = []
  points: Point[] = []
  extruders: Extruder[] = []
  printer?: Printer
  annotations: any[] = []
  // Python-style single tracking instances
  point: Point = new Point()
  extruder!: Extruder // will assign during init (first extruder)
  extrusion_geometry!: ExtrusionGeometry
  _last_mode_emitted?: boolean

  constructor(steps: Step[] = [], options?: { initialization_data?: any }) {
    // Flatten user steps first
    const flat = flatten(steps)
  // Merge initialization overrides early so starting procedure uses correct relative_e
  const initData = { ...default_initial_settings, ...(options?.initialization_data || {}) }
    // capture starting / ending procedure if provided (like Python passes via import_printer)
    const starting: any[] = initData.starting_procedure_steps || []
    const ending: any[] = initData.ending_procedure_steps || []
    // Determine primer name and target first point of user geometry
    const primerName: PrimerName = initData.primer || 'no_primer'
    let firstPoint: Point | undefined = undefined
    for (const s of flat) {
      if (s instanceof Point) { firstPoint = s; break }
      if (Array.isArray(s)) {
        const p = s.find(x => x instanceof Point)
        if (p) { firstPoint = p; break }
      }
    }
    let primerSteps: any[] = []
    if (firstPoint && primerName && primerName !== 'no_primer') {
      primerSteps = buildPrimer(primerName, firstPoint)
    }
    this.steps = [...starting, ...primerSteps, ...flat, ...ending]
    // If the first explicit extruder sets relative_gcode false but Python default would emit an initial relative true, inject that for parity
    const firstExtruderIdx = this.steps.findIndex(s => s instanceof (Extruder as any))
    const firstPrinterIdx = this.steps.findIndex(s => s instanceof (Printer as any))
    if (firstExtruderIdx >= 0) {
      const firstExt = this.steps[firstExtruderIdx] as Extruder
      if (firstExt.relative_gcode === false) {
        // Insert relative=true extruder AFTER printer (if printer exists before extruder) else at start
        const insertIdx = (firstPrinterIdx >= 0 && firstPrinterIdx < firstExtruderIdx) ? firstExtruderIdx : firstExtruderIdx
        this.steps.splice(insertIdx, 0, new Extruder({ relative_gcode: true }))
      }
    }
    // Initialize core printer/extruder/geometry like Python State
    if (!this.printer) {
      this.printer = new Printer({
        print_speed: initData.print_speed,
        travel_speed: initData.travel_speed,
        speed_changed: true,
        command_list: initData.printer_command_list
      })
    }
    if (!this.extruders.length) {
      this.extruder = new Extruder({
        units: initData.e_units,
        dia_feed: initData.dia_feed,
        total_volume: 0,
        total_volume_ref: 0,
        relative_gcode: initData.relative_e,
        travel_format: initData.travel_format === 'G1_E0' ? 'G1_E0' : 'none',
        on: false
      })
      this.extruder.update_e_ratio()
      if (initData.manual_e_ratio != null) this.extruder.volume_to_e = initData.manual_e_ratio
      this.extruders.push(this.extruder)
  // Initialize as undefined so that the first explicit Extruder step always emits its mode line (Python behavior)
  this._last_mode_emitted = undefined
    } else {
      this.extruder = this.extruders[0]
  this._last_mode_emitted = undefined
    }
    // Provide an initial geometry (mirrors Python default initialization) if not explicitly present
    const hasGeom = this.steps.some(s => s instanceof (ExtrusionGeometry as any))
    if (!hasGeom) {
      const g = new ExtrusionGeometry({
        area_model: initData.area_model,
        width: initData.extrusion_width,
        height: initData.extrusion_height
      })
      this.steps.unshift(g)
      this.extrusion_geometry = g
      try { g.update_area() } catch {}
    } else {
      // find first geometry
      const gstep = this.steps.find(s => s instanceof (ExtrusionGeometry as any)) as ExtrusionGeometry | undefined
      if (gstep) { this.extrusion_geometry = gstep; try { gstep.update_area() } catch {} }
    }
  }

  addPoint(p: Point) {
    this.points.push(p)
  }

  addGcode(line: string) {
    if (line.includes('\n')) {
      for (const l of line.split(/\r?\n/)) if (l.trim().length) this.gcodeLines.push(l)
    } else {
      this.gcodeLines.push(line)
    }
  }

  register(step: Step) {
    if (step && typeof step === 'object') {
      if (step.type === 'Extruder' || step.constructor?.name === 'Extruder') this.extruders.push(step as Extruder)
      if (step.type === 'Printer' || step.constructor?.name === 'Printer') this.printer = step as Printer
      if (step.constructor?.name === 'PlotAnnotation') this.annotations.push(step)
    }
  }
}
