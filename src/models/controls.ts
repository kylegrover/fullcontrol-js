import { BaseModelPlus } from '../core/base-model.js'

export class GcodeControls extends BaseModelPlus {
  printer_name?: string
  initialization_data?: Record<string, any>
  save_as?: string
  include_date?: boolean
  show_banner?: boolean
  show_tips?: boolean
  silent?: boolean
  static readonly typeName = 'GcodeControls'
  
  constructor(init?: Partial<GcodeControls>) {
    super(init)
    // Set defaults only if not provided (matches Python pydantic behavior)
    if (this.include_date === undefined) this.include_date = true
    if (this.show_banner === undefined) this.show_banner = true
    if (this.show_tips === undefined) this.show_tips = true
    if (this.silent === undefined) this.silent = false
  }
  
  initialize() {
    if (!this.printer_name) {
      this.printer_name = 'generic'
      console.warn("warning: printer is not set - defaulting to 'generic'")
    }
  }
}

export class PlotControls extends BaseModelPlus {
  color_type?: string
  line_width?: number
  style?: 'tube' | 'line'
  tube_type?: 'flow' | 'cylinders'
  tube_sides?: number
  zoom?: number
  hide_annotations?: boolean
  hide_travel?: boolean
  hide_axes?: boolean
  neat_for_publishing?: boolean
  raw_data?: boolean
  printer_name?: string
  initialization_data?: Record<string, any>
  static readonly typeName = 'PlotControls'
  
  constructor(init?: Partial<PlotControls>) {
    super(init)
    // Set defaults only if not provided (matches Python pydantic behavior)
    if (this.color_type === undefined) this.color_type = 'z_gradient'
    if (this.tube_type === undefined) this.tube_type = 'flow'
    if (this.tube_sides === undefined) this.tube_sides = 4
    if (this.zoom === undefined) this.zoom = 1
    if (this.hide_annotations === undefined) this.hide_annotations = false
    if (this.hide_travel === undefined) this.hide_travel = false
    if (this.hide_axes === undefined) this.hide_axes = false
    if (this.neat_for_publishing === undefined) this.neat_for_publishing = false
    if (this.raw_data === undefined) this.raw_data = false
    if (this.printer_name === undefined) this.printer_name = 'generic'
  }
  
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
