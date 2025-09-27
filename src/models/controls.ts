import { BaseModelPlus } from '../core/base-model.js'

export class GcodeControls extends BaseModelPlus {
  printer_name?: string
  initialization_data?: Record<string, any>
  save_as?: string
  include_date?: boolean = true
  show_banner: boolean = true
  show_tips: boolean = true
  silent: boolean = false
  static readonly typeName = 'GcodeControls'
  constructor(init?: Partial<GcodeControls>) { super(init) }
  initialize() {
    if (!this.printer_name) {
      this.printer_name = 'generic'
      console.warn("warning: printer is not set - defaulting to 'generic'")
    }
  }
}

export class PlotControls extends BaseModelPlus {
  color_type: string = 'z_gradient'
  line_width?: number
  style?: 'tube' | 'line'
  tube_type: 'flow' | 'cylinders' = 'flow'
  tube_sides: number = 4
  zoom: number = 1
  hide_annotations = false
  hide_travel = false
  hide_axes = false
  neat_for_publishing = false
  raw_data = false
  printer_name: string = 'generic'
  initialization_data?: Record<string, any>
  static readonly typeName = 'PlotControls'
  constructor(init?: Partial<PlotControls>) { super(init) }
  initialize() {
    if (!this.raw_data) {
      if (!this.style) {
        this.style = 'tube'
        console.warn("warning: plot style is not set - defaulting to 'tube'")
      }
      if (this.style === 'tube' && this.line_width != null) {
        console.warn('warning: line_width set but style=tube; it is ignored for extruding lines')
      }
      if (this.line_width == null) this.line_width = 2
    }
  }
}
