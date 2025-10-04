import { BaseModelPlus } from '../core/base-model.js'
import { Point } from './point.js'
import { formatPrecision6, formatExtrusion, formatCoordinate } from '../util/format.js'

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
  gcode(state: any) {
    state.extrusion_geometry.updateFrom(this)
    if (this.width != null || this.height != null || this.diameter != null || this.area_model != null) {
      try { state.extrusion_geometry.update_area() } catch {}
    }
    return undefined
  }

  /**
   * Visualization method for ExtrusionGeometry
   * Matches Python: fullcontrol.visualize.extrusion_classes.ExtrusionGeometry.visualize()
   */
  visualize(state: any, _plotData: any, _plotControls: any): void {
    // Priority: explicit width/height > diameter > area
    // If both width and height are explicitly set, use them and ignore area/diameter
    if (this.width != null && this.height != null) {
      if (this.width !== state.extrusion_geometry.width) {
        state.extrusion_geometry.width = Math.round(this.width * 1000) / 1000 // 3 decimals
      }
      if (this.height !== state.extrusion_geometry.height) {
        state.extrusion_geometry.height = Math.round(this.height * 1000) / 1000
      }
    } else if (this.diameter != null) {
      // Diameter sets both width and height
      state.extrusion_geometry.width = Math.round(this.diameter * 1000) / 1000
      state.extrusion_geometry.height = Math.round(this.diameter * 1000) / 1000
    } else if (this.area != null) {
      // Area calculates equivalent diameter
      const dia = 2 * Math.sqrt(this.area / Math.PI)
      state.extrusion_geometry.width = Math.round(dia * 1000) / 1000
      state.extrusion_geometry.height = Math.round(dia * 1000) / 1000
    } else {
      // Only width or only height set
      if (this.width != null && this.width !== state.extrusion_geometry.width) {
        state.extrusion_geometry.width = Math.round(this.width * 1000) / 1000
      }
      if (this.height != null && this.height !== state.extrusion_geometry.height) {
        state.extrusion_geometry.height = Math.round(this.height * 1000) / 1000
      }
    }
  }
}

export class StationaryExtrusion extends BaseModelPlus {
  volume!: number
  speed!: number
  static readonly typeName = 'StationaryExtrusion'
  constructor(init?: Partial<StationaryExtrusion>) { super(init) }
  toJSON() { return { volume: this.volume, speed: this.speed } }
  static fromJSON(d: any) { return new StationaryExtrusion(d) }
  gcode(state: any) {
    if (state.printer) state.printer.speed_changed = true
    const eVal = state.extruder.get_and_update_volume(this.volume) * state.extruder.volume_to_e
    // Python state after primer typically has extruder.on True; ensure subsequent Z-only move is treated as printing
    if (state.extruder && state.extruder.on !== true) state.extruder.on = true
    // Python uses .6 format (6 significant figures) for StationaryExtrusion E values
    return `G1 F${this.speed} E${formatPrecision6(eVal)}`
  }
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
    // Reduce floating drift to align with Python double rounding when formatted to 6 decimals
  this.total_volume = Math.round(this.total_volume * 1e12) / 1e12
    const ret = this.total_volume - this.total_volume_ref
    if (this.relative_gcode) this.total_volume_ref = this.total_volume
    return ret
  }
  toJSON() { return { on: this.on, units: this.units, dia_feed: this.dia_feed, relative_gcode: this.relative_gcode } }
  static fromJSON(d: any) { return new Extruder(d) }
  e_gcode(point1: Point, state: any) {
    const distance_forgiving = (p1: Point, p2: Point) => {
      const dx = (p1.x == null || p2.x == null) ? 0 : p1.x - p2.x
      const dy = (p1.y == null || p2.y == null) ? 0 : p1.y - p2.y
      const dz = (p1.z == null || p2.z == null) ? 0 : p1.z - p2.z
      return Math.sqrt(dx*dx + dy*dy + dz*dz)
    }
    if (this.on) {
      const length = distance_forgiving(point1, state.point)
      if (length === 0) return ''
      const area = state.extrusion_geometry?.area || 0
      const ratio = this.volume_to_e || 1
      const val = this.get_and_update_volume(length * area) * ratio
      return `E${formatExtrusion(val)}`
    } else {
      if (this.travel_format === 'G1_E0') {
        const ratio = this.volume_to_e || 1
        const val = this.get_and_update_volume(0) * ratio
        return `E${formatExtrusion(val)}`
      }
      return ''
    }
  }
  gcode(state: any) {
    state.extruder.updateFrom(this)
    if (this.on != null && state.printer) state.printer.speed_changed = true
    if (this.units != null || this.dia_feed != null) state.extruder.update_e_ratio()
    if (this.relative_gcode != null) {
      // Python emits M83/M82 whenever relative_gcode attribute is set (even if same value)
      state.extruder.total_volume_ref = state.extruder.total_volume
      return state.extruder.relative_gcode ? 'M83 ; relative extrusion' : 'M82 ; absolute extrusion\nG92 E0 ; reset extrusion position to zero'
    }
    return undefined
  }

  /**
   * Visualization method for Extruder
   * Matches Python: fullcontrol.visualize.extrusion_classes.Extruder.visualize()
   */
  visualize(state: any, plotData: any, plotControls: any): void {
    if (this.on != null && this.on !== state.extruder.on) {
      state.extruder.on = this.on
      
      // If current path has more than one point (a line is already plotted), add new path
      // Otherwise just change the extruder state of the current path
      const currentPath = plotData.paths[plotData.paths.length - 1]
      if (currentPath.xvals.length > 1) {
        plotData.addPath(state, plotData, plotControls)
        state.pathCountNow += 1
      } else {
        currentPath.extruder.on = this.on
        state.point.updateColor(state, plotData, plotControls)
        if (currentPath.colors.length > 0) {
          currentPath.colors[currentPath.colors.length - 1] = state.point.color
        }
      }
    }
  }
}

export class Retraction extends BaseModelPlus {
  length?: number // override extruder default
  speed?: number // mm/min feedrate for retraction move
  static readonly typeName = 'Retraction'
  constructor(init?: Partial<Retraction>) { super(init) }
  toJSON() { return { length: this.length, speed: this.speed } }
  static fromJSON(d: any) { return new Retraction(d) }
  gcode(state: any) {
    // Firmware based retraction preferred if printer.command_list has 'retract'
    const cmdMap = state.printer?.command_list as Record<string,string> | undefined
    if (cmdMap && cmdMap.retract) return undefined // handled as PrinterCommand in pipeline if user inserted one
    // Otherwise emulate retraction as a negative stationary extrusion (relative extrusion or absolute E delta)
    const len = this.length ?? state.extruder.retraction_length
    if (len == null || len === 0) return undefined
    const speed = this.speed ?? state.extruder.retraction_speed ?? 1800
    // Mark feedrate change
    if (state.printer) state.printer.speed_changed = true
    // Convert a linear retraction length (in mm of filament) into volume -> E using volume_to_e inverse
    // Python uses StationaryExtrusion(volume=neg, speed) where negative volume indicates retraction
    // Here we bypass volume and directly compute E delta in filament units (assuming units='mm')
    const ratio = state.extruder.volume_to_e || 1
    // If units=mm3 then len is linear filament; must convert to volume: pi*(dia/2)^2 * len so that * volume_to_e yields linear again.
    let eDelta: number
    if (state.extruder.units === 'mm3') {
      if (state.extruder.dia_feed) {
        const area = Math.PI * (state.extruder.dia_feed/2)**2
        eDelta = len * area * ratio
      } else {
        return undefined // cannot compute
      }
    } else {
      eDelta = len * ratio
    }
    // Update extruder volume bookkeeping as negative extrusion
    state.extruder.get_and_update_volume(-(eDelta / ratio))
    const eVal = state.extruder.total_volume - state.extruder.total_volume_ref
    if (state.extruder.relative_gcode) {
      // relative: E value is negative delta
      const rel = -eDelta
      return `G1 F${speed} E${formatExtrusion(rel)}`
    } else {
      // absolute: current E after negative move
      return `G1 F${speed} E${formatExtrusion(eVal*ratio)}`
    }
  }
}

export class Unretraction extends BaseModelPlus {
  length?: number
  speed?: number
  static readonly typeName = 'Unretraction'
  constructor(init?: Partial<Unretraction>) { super(init) }
  toJSON() { return { length: this.length, speed: this.speed } }
  static fromJSON(d: any) { return new Unretraction(d) }
  gcode(state: any) {
    const cmdMap = state.printer?.command_list as Record<string,string> | undefined
    if (cmdMap && cmdMap.unretract) return undefined
    const len = this.length ?? state.extruder.retraction_length
    if (len == null || len === 0) return undefined
    const speed = this.speed ?? state.extruder.retraction_speed ?? 1800
    if (state.printer) state.printer.speed_changed = true
    const ratio = state.extruder.volume_to_e || 1
    let eDelta: number
    if (state.extruder.units === 'mm3') {
      if (state.extruder.dia_feed) {
        const area = Math.PI * (state.extruder.dia_feed/2)**2
        eDelta = len * area * ratio
      } else return undefined
    } else {
      eDelta = len * ratio
    }
    // Positive extrusion
    state.extruder.get_and_update_volume(eDelta / ratio)
    const eVal = state.extruder.total_volume - state.extruder.total_volume_ref
    if (state.extruder.relative_gcode) {
      return `G1 F${speed} E${formatExtrusion(eDelta)}`
    } else {
      return `G1 F${speed} E${formatExtrusion(eVal*ratio)}`
    }
  }
}
