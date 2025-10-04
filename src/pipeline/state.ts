import { Point } from '../models/point.js'
import { Extruder, ExtrusionGeometry } from '../models/extrusion.js'
import { Printer } from '../models/printer.js'
import { flatten } from '../util/extra.js'
import { buildPrimer, PrimerName } from '../gcode/primer/index.js'
import { ManualGcode } from '../models/commands.js'
import { set_up as generic_set_up } from '../devices/community/singletool/generic.js'

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
  
  // Visualization tracking (matches Python visualize/state.py)
  pathCountNow: number = 0
  pointCountNow: number = 0
  pointCountTotal: number = 0

  constructor(steps: Step[] = [], options?: { initialization_data?: any; printer_name?: string }) {
    // Flatten user steps first
    const flat = flatten(steps)
    // Initialize with device-specific settings (like Python's State.__init__)
    // For now, only support 'generic' printer (can expand later with registry)
    const printerName = options?.printer_name || 'generic'
    let initData: any
    // Use generic set_up function (matches Python's import_module + set_up pattern)
    initData = generic_set_up(options?.initialization_data || {})
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
      primerSteps = buildPrimer(primerName, firstPoint, { enablePrimer: true })
    }
    this.steps = [...starting, ...primerSteps, ...flat, ...ending]
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
    } else {
      this.extruder = this.extruders[0]
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
    
    // Initialize visualization tracking
    this.pointCountTotal = this.countPoints(this.steps)
  }

  /**
   * Count total Point instances in steps (for visualization progress tracking)
   * Matches Python: State.count_points(steps)
   */
  countPoints(steps: Step[]): number {
    return steps.filter(step => step instanceof Point || step.constructor?.name === 'Point').length
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
