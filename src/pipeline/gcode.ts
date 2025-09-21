import { State } from './state.js'
import { Point } from '../models/point.js'
import { Extruder, ExtrusionGeometry, StationaryExtrusion, Retraction, Unretraction } from '../models/extrusion.js'
import { Printer } from '../models/printer.js'
import { ManualGcode, GcodeComment, PrinterCommand, GcodeStateLike } from '../models/commands.js'

function distance(a: Point, b: Point) {
  const ax = a.x ?? b.x ?? 0, ay = a.y ?? b.y ?? 0, az = a.z ?? b.z ?? 0
  const bx = b.x ?? a.x ?? 0, by = b.y ?? a.y ?? 0, bz = b.z ?? a.z ?? 0
  const dx = bx - ax, dy = by - ay, dz = bz - az
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

const fmt = (v: number, p: number) => v.toFixed(p).replace(/\.0+$/,'').replace(/(\.[0-9]*?)0+$/,'$1')

export function generate_gcode(state: State) {
  let prevPoint: Point | undefined
  let lastLine: string | undefined
  const gstate: GcodeStateLike = { printer: state.printer || new Printer(), gcode: state.gcodeLines }
  let currentExtruder: Extruder | undefined = state.extruders[0]
  let geometry: ExtrusionGeometry | undefined
  // Attempt to locate first geometry object among steps if present
  for (const s of state.steps) if (s instanceof ExtrusionGeometry) { geometry = s; geometry.update_area(); break }
  for (const step of state.steps) {
    if (!step) continue
    // Points
    // Geometry switch
    if (step instanceof ExtrusionGeometry) { geometry = step; geometry.update_area(); continue }

    if (step instanceof Point) {
      state.addPoint(step)
      if (prevPoint) {
        const moveDist = distance(prevPoint, step)
        const isExtrude = !!step.extrude && geometry?.area && currentExtruder
        let line = isExtrude ? 'G1' : 'G0'
        if (step.x != null) line += ` X${fmt(step.x,3)}`
        if (step.y != null) line += ` Y${fmt(step.y,3)}`
        if (step.z != null) line += ` Z${fmt(step.z,3)}`
        if (isExtrude) {
          currentExtruder.update_e_ratio()
          const volume = moveDist * geometry!.area!
          const eVol = currentExtruder.get_and_update_volume(volume) * (currentExtruder.volume_to_e || 1)
          line += ` E${fmt(eVol,5)}`
        } else if (currentExtruder && currentExtruder.travel_format === 'G1_E0') {
          line += ' E0'
        }
        // feedrate: per-move override or printer speed change
        if (state.printer) {
          // mark speed_changed for this move if point speed differs
          if (step.speed != null) {
            // heuristically decide extruding vs travel for feedrate
            const extruding = !!step.extrude
            if (extruding) state.printer.print_speed = step.speed
            else state.printer.travel_speed = step.speed
            state.printer.speed_changed = true
          }
          const fSnippet = state.printer.f_gcode(!!step.extrude)
          if (fSnippet.trim()) line += ' ' + fSnippet.trim()
          state.printer.speed_changed = false
        }
        state.addGcode(line)
        lastLine = line
      }
      prevPoint = step
      continue
    }
    // Arrays of points
    if (Array.isArray(step) && step.length && step[0] instanceof Point) {
      for (const p of step as Point[]) {
        // recurse logic by pushing back into loop? Simpler: duplicate block
        state.addPoint(p)
        if (prevPoint) {
          const moveDist = distance(prevPoint, p)
          const isExtrude = !!p.extrude && geometry?.area && currentExtruder
          let line = isExtrude ? 'G1' : 'G0'
          if (p.x != null) line += ` X${fmt(p.x,3)}`
          if (p.y != null) line += ` Y${fmt(p.y,3)}`
          if (p.z != null) line += ` Z${fmt(p.z,3)}`
          if (isExtrude) {
            currentExtruder!.update_e_ratio()
            const volume = moveDist * geometry!.area!
            const eVol = currentExtruder!.get_and_update_volume(volume) * (currentExtruder!.volume_to_e || 1)
            line += ` E${fmt(eVol,5)}`
          } else if (currentExtruder && currentExtruder.travel_format === 'G1_E0') {
            line += ' E0'
          }
          if (state.printer) {
            if (p.speed != null) {
              const extruding = !!p.extrude
              if (extruding) state.printer.print_speed = p.speed
              else state.printer.travel_speed = p.speed
              state.printer.speed_changed = true
            }
            const fSnippet = state.printer.f_gcode(!!p.extrude)
            if (fSnippet.trim()) line += ' ' + fSnippet.trim()
            state.printer.speed_changed = false
          }
          state.addGcode(line)
          lastLine = line
        }
        prevPoint = p
      }
      continue
    }
    // Manual gcode
    if (step instanceof ManualGcode) {
      const out = step.gcode()
      if (out) state.addGcode(out)
      lastLine = state.gcodeLines[state.gcodeLines.length - 1]
      continue
    }
    // Comment
    if (step instanceof GcodeComment) {
      const out = step.gcode(gstate)
      if (out) state.addGcode(out)
      lastLine = state.gcodeLines[state.gcodeLines.length - 1]
      continue
    }
    // Printer command (placeholder)
    if (step instanceof PrinterCommand) {
      const out = step.gcode(gstate)
      if (out) state.addGcode(out)
      lastLine = state.gcodeLines[state.gcodeLines.length - 1]
      continue
    }
    // Printer / Extruder registration
    if (step instanceof Printer) { state.printer = step; gstate.printer = step; continue }
    if (step instanceof Extruder) { state.extruders.push(step); if (!currentExtruder) currentExtruder = step; continue }
    if (step instanceof Retraction) {
      if (!currentExtruder) continue
      currentExtruder.update_e_ratio()
      const length = step.length ?? currentExtruder.retraction_length ?? 0
      const vol = length * (currentExtruder.units === 'mm3' ? 1 : (1 / (currentExtruder.volume_to_e || 1)))
      // negative extrusion for retraction
      const eVal = currentExtruder.get_and_update_volume(-vol) * (currentExtruder.volume_to_e || 1)
      let line = 'G1'
      line += ` E${fmt(eVal,5)}`
      if (step.speed != null && state.printer) {
        state.printer.print_speed = step.speed
        state.printer.speed_changed = true
        const fSnippet = state.printer.f_gcode(true)
        if (fSnippet.trim()) line += ' ' + fSnippet.trim()
        state.printer.speed_changed = false
      }
      state.addGcode(line)
      lastLine = line
      continue
    }
    if (step instanceof Unretraction) {
      if (!currentExtruder) continue
      currentExtruder.update_e_ratio()
      const length = step.length ?? currentExtruder.retraction_length ?? 0
      const vol = length * (currentExtruder.units === 'mm3' ? 1 : (1 / (currentExtruder.volume_to_e || 1)))
      const eVal = currentExtruder.get_and_update_volume(vol) * (currentExtruder.volume_to_e || 1)
      let line = 'G1'
      line += ` E${fmt(eVal,5)}`
      if (step.speed != null && state.printer) {
        state.printer.print_speed = step.speed
        state.printer.speed_changed = true
        const fSnippet = state.printer.f_gcode(true)
        if (fSnippet.trim()) line += ' ' + fSnippet.trim()
        state.printer.speed_changed = false
      }
      state.addGcode(line)
      lastLine = line
      continue
    }
    if (step instanceof StationaryExtrusion) {
      if (!currentExtruder) continue
      currentExtruder.update_e_ratio()
      const eVol = currentExtruder.get_and_update_volume(step.volume) * (currentExtruder.volume_to_e || 1)
      let line = 'G1'
      line += ` E${fmt(eVol,5)}`
      if (step.speed != null && state.printer) {
        state.printer.print_speed = step.speed
        state.printer.speed_changed = true
        const fSnippet = state.printer.f_gcode(true)
        if (fSnippet.trim()) line += ' ' + fSnippet.trim()
        state.printer.speed_changed = false
      }
      state.addGcode(line)
      lastLine = line
      continue
    }
    // Unknown: ignore for now (future geometry containers, etc.)
  }
  // Basic feedrate stamping if printer present
  // Final feedrate line not necessary; we append per-move when changed
  return state.gcodeLines.join('\n')
}
