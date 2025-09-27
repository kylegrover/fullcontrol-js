import { BaseModelPlus } from '../core/base-model.js'

export class Printer extends BaseModelPlus {
  print_speed?: number
  travel_speed?: number
  command_list?: Record<string, string>
  new_command?: Record<string, string>
  speed_changed?: boolean
  private first_print_f_emitted?: boolean
  private first_travel_f_emitted?: boolean
  static readonly typeName = 'Printer'
  constructor(init?: Partial<Printer>) { super(init) }
  f_gcode(extruding: boolean) {
    const needFirst = extruding ? !this.first_print_f_emitted : !this.first_travel_f_emitted
    if (this.speed_changed || needFirst) {
      const speed = extruding ? this.print_speed : this.travel_speed
      if (speed != null) {
        const out = `F${speed.toFixed(1).replace(/\.0+$/, '').replace(/\.$/, '')}`
        if (extruding) this.first_print_f_emitted = true; else this.first_travel_f_emitted = true
        return out + ' '
      }
    }
    return ''
  }
  toJSON() { return { print_speed: this.print_speed, travel_speed: this.travel_speed } }
  static fromJSON(d: any) { return new Printer(d) }
}
