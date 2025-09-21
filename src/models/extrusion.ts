import { BaseModelPlus } from '../core/base-model.js'
import { Point } from './point.js'

export class ExtrusionGeometry extends BaseModelPlus {
  area_model?: 'rectangle' | 'stadium' | 'circle' | 'manual'
  width?: number
  height?: number
  diameter?: number
  area?: number
  static readonly typeName = 'ExtrusionGeometry'
  constructor(init?: Partial<ExtrusionGeometry>) { super(init) }
  update_area() {
    if (this.area_model === 'rectangle' && this.width != null && this.height != null) this.area = this.width * this.height
    else if (this.area_model === 'stadium' && this.width != null && this.height != null)
      this.area = ((this.width - this.height) * this.height) + (Math.PI * (this.height / 2) ** 2)
    else if (this.area_model === 'circle' && this.diameter != null)
      this.area = Math.PI * (this.diameter / 2) ** 2
  }
  toJSON() { return { area_model: this.area_model, width: this.width, height: this.height, diameter: this.diameter, area: this.area } }
  static fromJSON(d: any) { return new ExtrusionGeometry(d) }
}

export class StationaryExtrusion extends BaseModelPlus {
  volume!: number
  speed!: number
  static readonly typeName = 'StationaryExtrusion'
  constructor(init?: Partial<StationaryExtrusion>) { super(init) }
  toJSON() { return { volume: this.volume, speed: this.speed } }
  static fromJSON(d: any) { return new StationaryExtrusion(d) }
}

export class Extruder extends BaseModelPlus {
  on?: boolean
  // gcode related
  units?: 'mm' | 'mm3'
  dia_feed?: number
  relative_gcode?: boolean
  volume_to_e?: number
  total_volume?: number
  total_volume_ref?: number
  travel_format?: 'G1_E0' | 'none'
  retraction_length?: number
  retraction_speed?: number
  static readonly typeName = 'Extruder'
  constructor(init?: Partial<Extruder>) { super(init) }
  update_e_ratio() {
    if (this.units === 'mm3') this.volume_to_e = 1
    else if (this.units === 'mm' && this.dia_feed != null) this.volume_to_e = 1 / (Math.PI * (this.dia_feed / 2) ** 2)
  }
  get_and_update_volume(volume: number) {
    if (this.total_volume == null) this.total_volume = 0
    if (this.total_volume_ref == null) this.total_volume_ref = 0
    this.total_volume += volume
    const ret = this.total_volume - this.total_volume_ref
    if (this.relative_gcode) this.total_volume_ref = this.total_volume
    return ret
  }
  toJSON() { return { on: this.on, units: this.units, dia_feed: this.dia_feed, relative_gcode: this.relative_gcode } }
  static fromJSON(d: any) { return new Extruder(d) }
}

export class Retraction extends BaseModelPlus {
  length?: number // override extruder default
  speed?: number // mm/min feedrate for retraction move
  static readonly typeName = 'Retraction'
  constructor(init?: Partial<Retraction>) { super(init) }
  toJSON() { return { length: this.length, speed: this.speed } }
  static fromJSON(d: any) { return new Retraction(d) }
}

export class Unretraction extends BaseModelPlus {
  length?: number
  speed?: number
  static readonly typeName = 'Unretraction'
  constructor(init?: Partial<Unretraction>) { super(init) }
  toJSON() { return { length: this.length, speed: this.speed } }
  static fromJSON(d: any) { return new Unretraction(d) }
}
