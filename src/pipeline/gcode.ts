import { State } from './state.js'
import { Point } from '../models/point.js'
import { Extruder, ExtrusionGeometry, StationaryExtrusion, Retraction, Unretraction } from '../models/extrusion.js'
import { Printer } from '../models/printer.js'
import { ManualGcode, GcodeComment, PrinterCommand, GcodeStateLike } from '../models/commands.js'
import { GcodeControls } from '../models/controls.js'

function distance(a: Point, b: Point) {
  const ax = a.x ?? b.x ?? 0, ay = a.y ?? b.y ?? 0, az = a.z ?? b.z ?? 0
  const bx = b.x ?? a.x ?? 0, by = b.y ?? a.y ?? 0, bz = b.z ?? a.z ?? 0
  const dx = bx - ax, dy = by - ay, dz = bz - az
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}

// Generic formatter: keep up to p decimals, trim trailing zeros and dot
const fmt = (v: number, p: number) => v.toFixed(p).replace(/\.0+$/,'').replace(/(\.[0-9]*?)0+$/,'$1')
// Specific formatters for parity clarity
const fmtCoord = (v: number) => fmt(v, 3)
const fmtExtrude = (v: number) => fmt(v, 6)

export function generate_gcode(state: State, controls?: Partial<GcodeControls>) {
  let prevPoint: Point | undefined
  let lastLine: string | undefined
  const gstate: GcodeStateLike = { printer: state.printer || new Printer(), gcode: state.gcodeLines }
  let currentExtruder: Extruder | undefined = state.extruders[0]
  let geometry: ExtrusionGeometry | undefined
  const showBanner = !controls?.silent && controls?.show_banner !== false
  const showTips = !controls?.silent && controls?.show_tips !== false
  if (showBanner) {
    state.addGcode('; Time to print!!!!!')
    state.addGcode('; GCode created with FullControl (JS) - tell us what you\'re printing!')
    state.addGcode('; info@fullcontrol.xyz or tag FullControlXYZ on socials')
  }
  if (showTips) {
    state.addGcode('; tips: enable/disable with GcodeControls.show_tips=false')
    if (!state.printer) state.addGcode('; tip: set a Printer() early to ensure start gcode is included')
  }
  // Attempt to locate first geometry object among steps if present
  for (const s of state.steps) if (s instanceof ExtrusionGeometry) { geometry = s; geometry.update_area(); break }
  for (const step of state.steps) {
    if (!step) continue
    // Handle Extruder mode / attribute change lines before point moves when encountering an Extruder instance.
    // Points
    // Geometry switch
    if (step instanceof ExtrusionGeometry) { geometry = step; geometry.update_area(); continue }

    if (step instanceof Point) {
      state.addPoint(step)
      if (!prevPoint) {
        // Emit initial positioning move if coordinates present
        let line = (currentExtruder?.on || (step as any).extrude) ? 'G1' : 'G0'
        if (step.x != null) line += ` X${fmtCoord(step.x)}`
        if (step.y != null) line += ` Y${fmtCoord(step.y)}`
        if (step.z != null) line += ` Z${fmtCoord(step.z)}`
        // feedrate if first move and speed set
        if (state.printer) {
          if (step.speed != null) {
            if (currentExtruder?.on) state.printer.print_speed = step.speed; else state.printer.travel_speed = step.speed
            state.printer.speed_changed = true
          }
          const fSnippet = state.printer.f_gcode(!!currentExtruder?.on)
            .trim()
          if (fSnippet) line += ' ' + fSnippet
          state.printer.speed_changed = false
        }
        state.addGcode(line)
        lastLine = line
      } else {
        const moveDist = distance(prevPoint, step)
        const extrudingFlag = currentExtruder?.on || (step as any).extrude
        const isExtrude = !!extrudingFlag && geometry?.area && currentExtruder
        let line = extrudingFlag ? 'G1' : 'G0'
        if (step.x != null) line += ` X${fmtCoord(step.x)}`
        if (step.y != null) line += ` Y${fmtCoord(step.y)}`
        if (step.z != null) line += ` Z${fmtCoord(step.z)}`
        if (isExtrude) {
          currentExtruder.update_e_ratio()
          const volume = moveDist * geometry!.area!
          const eVol = currentExtruder.get_and_update_volume(volume) * (currentExtruder.volume_to_e || 1)
          line += ` E${fmtExtrude(eVol)}`
        } else if (currentExtruder && currentExtruder.travel_format === 'G1_E0') {
          line += ' E0'
        }
        // feedrate: per-move override or printer speed change
        if (state.printer) {
          // mark speed_changed for this move if point speed differs
          if (step.speed != null) {
            const extruding = !!extrudingFlag
            if (extruding) state.printer.print_speed = step.speed
            else state.printer.travel_speed = step.speed
            state.printer.speed_changed = true
          }
          const fSnippet = state.printer.f_gcode(!!extrudingFlag)
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
        if (!prevPoint) {
          let line = (currentExtruder?.on || (p as any).extrude) ? 'G1' : 'G0'
          if (p.x != null) line += ` X${fmtCoord(p.x)}`
          if (p.y != null) line += ` Y${fmtCoord(p.y)}`
          if (p.z != null) line += ` Z${fmtCoord(p.z)}`
          if (state.printer) {
            if (p.speed != null) {
              if (currentExtruder?.on) state.printer.print_speed = p.speed; else state.printer.travel_speed = p.speed
              state.printer.speed_changed = true
            }
            const fSnippet = state.printer.f_gcode(!!currentExtruder?.on).trim()
            if (fSnippet) line += ' ' + fSnippet
            state.printer.speed_changed = false
          }
          state.addGcode(line)
          lastLine = line
        } else {
          const moveDist = distance(prevPoint, p)
          const extrudingFlag = currentExtruder?.on || (p as any).extrude
          const isExtrude = !!extrudingFlag && geometry?.area && currentExtruder
          let line = extrudingFlag ? 'G1' : 'G0'
          if (p.x != null) line += ` X${fmtCoord(p.x)}`
          if (p.y != null) line += ` Y${fmtCoord(p.y)}`
          if (p.z != null) line += ` Z${fmtCoord(p.z)}`
          if (isExtrude) {
            currentExtruder!.update_e_ratio()
            const volume = moveDist * geometry!.area!
            const eVol = currentExtruder!.get_and_update_volume(volume) * (currentExtruder!.volume_to_e || 1)
            line += ` E${fmtExtrude(eVol)}`
          } else if (currentExtruder && currentExtruder.travel_format === 'G1_E0') {
            line += ' E0'
          }
          if (state.printer) {
            if (p.speed != null) {
              const extruding = !!extrudingFlag
              if (extruding) state.printer.print_speed = p.speed
              else state.printer.travel_speed = p.speed
              state.printer.speed_changed = true
            }
            const fSnippet = state.printer.f_gcode(!!extrudingFlag)
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
    if (step instanceof Printer) { 
      // merge new_command semantics
      if (state.printer && step.new_command) {
        state.printer.command_list = { ...(state.printer.command_list||{}), ...(step.new_command||{}) }
      } else {
        state.printer = step; gstate.printer = step
      }
      continue 
    }
    if (step instanceof Extruder) { 
      if (!currentExtruder) {
        currentExtruder = step
        if (currentExtruder.total_volume == null) currentExtruder.total_volume = 0
        if (currentExtruder.total_volume_ref == null) currentExtruder.total_volume_ref = 0
        state.extruders.push(step)
        // initial relative/absolute mode emission
        if (currentExtruder.relative_gcode != null) {
          state.addGcode(currentExtruder.relative_gcode ? 'M83 ; relative extrusion' : 'M82 ; absolute extrusion')
          if (!currentExtruder.relative_gcode) state.addGcode('G92 E0 ; reset extrusion position to zero')
        }
      } else {
        // detect relative mode change
        const prevRel = currentExtruder.relative_gcode
        if (step.relative_gcode != null && step.relative_gcode !== prevRel) {
          currentExtruder.relative_gcode = step.relative_gcode
          // reset reference on mode switch
          currentExtruder.total_volume_ref = currentExtruder.total_volume || 0
          state.addGcode(currentExtruder.relative_gcode ? 'M83 ; relative extrusion' : 'M82 ; absolute extrusion')
          if (!currentExtruder.relative_gcode) state.addGcode('G92 E0 ; reset extrusion position to zero')
        }
        if (step.on != null) currentExtruder.on = step.on
        if (step.units != null || step.dia_feed != null) {
          if (step.units != null) currentExtruder.units = step.units
          if (step.dia_feed != null) currentExtruder.dia_feed = step.dia_feed
          currentExtruder.update_e_ratio()
        }
        if (step.travel_format != null) currentExtruder.travel_format = step.travel_format
      }
      continue
    }
    if (step instanceof Retraction) {
      if (!currentExtruder) continue
      currentExtruder.update_e_ratio()
      const length = step.length ?? currentExtruder.retraction_length ?? 0
      const vol = length * (currentExtruder.units === 'mm3' ? 1 : (1 / (currentExtruder.volume_to_e || 1)))
      // negative extrusion for retraction
      const eVal = currentExtruder.get_and_update_volume(-vol) * (currentExtruder.volume_to_e || 1)
      let line = 'G1'
      line += ` E${fmtExtrude(eVal)}`
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
      line += ` E${fmtExtrude(eVal)}`
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
      line += ` E${fmtExtrude(eVol)}`
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
