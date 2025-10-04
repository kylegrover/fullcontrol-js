import { BaseModelPlus } from '../core/base-model.js'
import { Printer } from './printer.js'

export class Buildplate extends BaseModelPlus {
  static readonly typeName = 'Buildplate'
  temp?: number
  wait?: boolean
  constructor(init?: Partial<Buildplate>) { super(init) }
  gcode() {
    if (this.temp == null) return ''
    const code = this.wait ? 'M190' : 'M140'
    return `${code} S${this.temp}`
  }
}

export class Hotend extends BaseModelPlus {
  static readonly typeName = 'Hotend'
  temp?: number
  wait?: boolean
  tool?: number
  constructor(init?: Partial<Hotend>) { super(init) }
  gcode() {
    if (this.temp == null) return ''
    const code = this.wait ? 'M109' : 'M104'
    const tool = this.tool != null ? ` T${this.tool}` : ''
    return `${code}${tool} S${this.temp}`
  }
}

export class Fan extends BaseModelPlus {
  static readonly typeName = 'Fan'
  speed_percent?: number
  part_fan_index?: number // future multi-fan
  constructor(init?: Partial<Fan>) { 
    super(init)
  }
  gcode() {
    if (this.speed_percent == null) this.speed_percent = 0
    const s = Math.floor(Math.max(0, Math.min(100, this.speed_percent)) * 255 / 100)
    return this.speed_percent > 0 ? `M106 S${s}` : 'M107'
  }
}
