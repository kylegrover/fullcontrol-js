import { BaseModelPlus } from '../core/base-model.js'

export class Printer extends BaseModelPlus {
  print_speed?: number
  travel_speed?: number
  command_list?: Record<string, string>
  new_command?: Record<string, string>
  speed_changed?: boolean
  static readonly typeName = 'Printer'
  constructor(init?: Partial<Printer>) { super(init) }
  f_gcode(extruding: boolean) {
    if (this.speed_changed) {
      const speed = extruding ? this.print_speed : this.travel_speed
      if (speed != null) {
        return `F${speed.toFixed(1).replace(/\.0+$/, '')} `
      }
    }
    return ''
  }
  toJSON() { return { print_speed: this.print_speed, travel_speed: this.travel_speed } }
  static fromJSON(d: any) { return new Printer(d) }
}
