import { BaseModelPlus } from '../core/base-model.js'
import { formatCoordinate } from '../util/format.js'

export class Point extends BaseModelPlus {
  x?: number
  y?: number
  z?: number
  color?: [number, number, number] // optional for parity with visualization
  extrude?: boolean // whether this move should extrude
  speed?: number // optional per-move speed override
  static readonly typeName = 'Point'
  constructor(init?: Partial<Point>) { super(init) }
  toJSON() { return { x: this.x, y: this.y, z: this.z, color: this.color, extrude: this.extrude, speed: this.speed } }
  static fromJSON(data: any) { return new Point(data) }

  XYZ_gcode(prev: Point) {
    let s = ''
    if (this.x != null && this.x !== prev.x) s += `X${formatCoordinate(this.x)} `
    if (this.y != null && this.y !== prev.y) s += `Y${formatCoordinate(this.y)} `
    if (this.z != null && this.z !== prev.z) s += `Z${formatCoordinate(this.z)} `
    return s === '' ? undefined : s
  }

  gcode(state: any) { // state typed loosely to avoid circular import
    const XYZ = this.XYZ_gcode(state.point)
    if (XYZ == null) return undefined
    const isFirst = state._first_movement_done !== true
    const extruding = !!state.extruder?.on && !isFirst
    // First movement always G0 travel (Python basic_line ordering)
    const G = isFirst ? 'G0 ' : ((extruding || state.extruder?.travel_format === 'G1_E0') ? 'G1 ' : 'G0 ')
    const F = state.printer?.f_gcode(state) || ''
    let E = ''
    if (!isFirst && state.extruder) {
      if (extruding) E = state.extruder.e_gcode(this, state)
      else if (state.extruder?.travel_format === 'G1_E0') E = state.extruder.e_gcode(this, state)
    }
    const line = `${G}${F}${XYZ}${E}`.trim()
    if (state.printer) state.printer.speed_changed = false
    state.point.updateFrom(this)
    if (isFirst) state._first_movement_done = true
    return line
  }
}
