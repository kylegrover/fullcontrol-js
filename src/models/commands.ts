import { BaseModelPlus } from '../core/base-model.js'
import { Printer } from './printer.js'

export interface GcodeStateLike { printer: Printer; gcode: string[] }

export class PrinterCommand extends BaseModelPlus {
  id?: string
  static readonly typeName = 'PrinterCommand'
  constructor(init?: Partial<PrinterCommand>) { super(init) }
  gcode(state: GcodeStateLike) {
    if (this.id && state.printer.command_list) return state.printer.command_list[this.id]
  }
}

export class ManualGcode extends BaseModelPlus {
  text?: string
  static readonly typeName = 'ManualGcode'
  constructor(init?: Partial<ManualGcode>) { super(init) }
  gcode() { return this.text }
}

export class GcodeComment extends BaseModelPlus {
  text?: string
  end_of_previous_line_text?: string
  static readonly typeName = 'GcodeComment'
  constructor(init?: Partial<GcodeComment>) { super(init) }
  gcode(state: GcodeStateLike) {
    if (this.end_of_previous_line_text && state.gcode.length > 0)
      state.gcode[state.gcode.length - 1] += ' ; ' + this.end_of_previous_line_text
    if (this.text) return '; ' + this.text
  }
}
