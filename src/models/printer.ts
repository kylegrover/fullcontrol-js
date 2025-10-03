import { BaseModelPlus } from '../core/base-model.js'

export class Printer extends BaseModelPlus {
  print_speed?: number
  travel_speed?: number
  command_list?: Record<string, string>
  new_command?: Record<string, string>
  speed_changed?: boolean
  static readonly typeName = 'Printer'
  constructor(init?: Partial<Printer>) { super(init) }
  f_gcode(state: any) {
    if (this.speed_changed) {
      const speed = state.extruder?.on ? this.print_speed : this.travel_speed
      if (speed != null) return `F${speed.toFixed(1).replace(/\.0+$/, '').replace(/\.$/, '')} `
    }
    return ''
  }
  gcode(state: any) {
    state.printer.update_from(this)
    if (this.print_speed != null || this.travel_speed != null) state.printer.speed_changed = true
    if (this.new_command) state.printer.command_list = { ...(state.printer.command_list||{}), ...this.new_command }
    return undefined
  }
  toJSON() { return { print_speed: this.print_speed, travel_speed: this.travel_speed } }
  static fromJSON(d: any) { return new Printer(d) }
}
