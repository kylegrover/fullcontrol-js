import { Point } from '../models/point.js'
import { Extruder } from '../models/extrusion.js'
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

  constructor(steps: Step[] = [], options?: { initialization_data?: any }) {
    // Flatten user steps first
    const flat = flatten(steps)
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
