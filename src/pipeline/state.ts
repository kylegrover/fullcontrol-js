import { Point } from '../models/point.js'
import { Extruder } from '../models/extrusion.js'
import { Printer } from '../models/printer.js'
import { flatten } from '../util/extra.js'

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

  constructor(steps: Step[] = []) { this.steps = flatten(steps) }

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
