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
    // Omit coordinates that haven't changed from the previous point
    // Uses epsilon comparison (1e-10) to handle floating point precision:
    // - Catches coordinates that are mathematically equal but differ at bit level
    // - More aggressive optimization than Python's direct != comparison
    // - Produces smaller G-code files while maintaining identical toolpaths
    // See: scripts/parity/KNOWN_DIFFERENCES.md for details
    const eps = 1e-10
    if (this.x != null && (prev.x == null || Math.abs(this.x - prev.x) > eps)) s += `X${formatCoordinate(this.x)} `
    if (this.y != null && (prev.y == null || Math.abs(this.y - prev.y) > eps)) s += `Y${formatCoordinate(this.y)} `
    if (this.z != null && (prev.z == null || Math.abs(this.z - prev.z) > eps)) s += `Z${formatCoordinate(this.z)} `
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
