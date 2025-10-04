import { State } from './state.js'
import { Point } from '../models/point.js'
import { Extruder, ExtrusionGeometry, StationaryExtrusion, Retraction, Unretraction } from '../models/extrusion.js'
import { Printer } from '../models/printer.js'
import { ManualGcode, GcodeComment, PrinterCommand, GcodeStateLike } from '../models/commands.js'
import { GcodeControls } from '../models/controls.js'
import { Fan, Hotend, Buildplate } from '../models/auxiliary.js'

export function generate_gcode(state: State, controls?: Partial<GcodeControls>) {
  const gstate: GcodeStateLike = { printer: state.printer || new Printer(), gcode: state.gcodeLines }
  // ensure extrusion geometry area computed
  if (state.extrusion_geometry && state.extrusion_geometry.area == null) {
    try { state.extrusion_geometry.update_area() } catch {}
  }
  let firstMovementEmitted = false
  const pendingModeAfterFirstMove: string[] = [] // queue mode changes that Python emits after first movement (e.g., switch to absolute)
  let seenFirstMode = false
  let queuedPrinterUpdate: Printer | null = null
  for (const step of state.steps) {
    // arrays of points
    if (Array.isArray(step) && step.length && step[0] instanceof Point) {
      for (const pt of step) {
        state.addPoint(pt)
        const line = pt.gcode(state)
        if (line) {
          state.addGcode(line)
          if (!firstMovementEmitted) {
            firstMovementEmitted = true
            // After first movement, flush any queued mode changes (e.g., switch to absolute)
            if (pendingModeAfterFirstMove.length) {
              for (const m of pendingModeAfterFirstMove) state.addGcode(m)
              pendingModeAfterFirstMove.length = 0
            }
          }
        }
      }
      continue
    }
    if (step instanceof Point) {
      state.addPoint(step)
      const line = step.gcode(state)
      if (line) {
        state.addGcode(line)
        if (!firstMovementEmitted) {
          firstMovementEmitted = true
          if (pendingModeAfterFirstMove.length) {
            for (const m of pendingModeAfterFirstMove) state.addGcode(m)
            pendingModeAfterFirstMove.length = 0
          }
          if (queuedPrinterUpdate) { queuedPrinterUpdate.gcode(state as any); queuedPrinterUpdate = null }
        }
      }
      continue
    }
    if (step instanceof ExtrusionGeometry) {
      step.gcode(state)
      continue
    }
    if (step instanceof StationaryExtrusion) {
      const line = step.gcode(state)
      if (line) state.addGcode(line)
      continue
    }
    if (step instanceof Retraction) {
      const line = step.gcode(state)
      if (line) state.addGcode(line)
      continue
    }
    if (step instanceof Unretraction) {
      const line = step.gcode(state)
      if (line) state.addGcode(line)
      continue
    }
    if (step instanceof Extruder) {
      const prevOn = state.extruder.on
      const line = step.gcode(state)
      const becameOn = step.on === true && prevOn !== true
      if (line) {
        const lines = line.split('\n')
        if (!firstMovementEmitted) {
          // Emit only the first mode line group before movement; defer any subsequent (switch to absolute) until after first move
          if (!seenFirstMode) {
            for (const l of lines) state.addGcode(l)
            seenFirstMode = true
          } else {
            pendingModeAfterFirstMove.push(...lines)
          }
        } else {
          for (const l of lines) state.addGcode(l)
        }
      }
      if (becameOn && !firstMovementEmitted) {
        // activation before first movement should not force mode lines; just mark on for when the next point extrudes
        state.extruder.on = true
        if (state.printer) state.printer.speed_changed = true
      } else if (becameOn) {
        if (state.printer) state.printer.speed_changed = true
      }
      if (step.on === false && prevOn === true) {
        if (state.printer) state.printer.speed_changed = true
      }
      continue
    }
    if (step instanceof Printer) {
      if (!firstMovementEmitted) queuedPrinterUpdate = step
      else step.gcode(state as any)
      continue
    }
    // Manual gcode
    if (step instanceof ManualGcode) {
      const out = step.gcode()
      if (out) state.addGcode(out)
      continue
    }
    // Comment
    if (step instanceof GcodeComment) {
      const out = step.gcode(gstate)
      if (out) state.addGcode(out)
      continue
    }
    // Printer command (placeholder)
    if (step instanceof PrinterCommand) {
      // Map firmware-based retract/unretract if available in printer.command_list similar to Python device settings
      let out = step.gcode(gstate)
      if (state.printer?.command_list && step.id) {
        const cmd = (state.printer.command_list as Record<string,string>)[step.id]
        if (cmd) out = cmd
      }
      if (out) state.addGcode(out)
      continue
    }
    // Fan control
    if (step instanceof Fan) {
      const out = step.gcode()
      if (out) state.addGcode(out + ' ; set fan speed')
      continue
    }
    // Hotend temperature
    if (step instanceof Hotend) {
      const out = step.gcode()
      if (out) {
        const comment = step.wait ? ' ; set hotend temp and wait' : ' ; set hotend temp and continue'
        state.addGcode(out + comment)
      }
      continue
    }
    // Buildplate temperature
    if (step instanceof Buildplate) {
      const out = step.gcode()
      if (out) {
        const comment = step.wait ? ' ; set bed temp and wait' : ' ; set bed temp and continue'
        state.addGcode(out + comment)
      }
      continue
    }
    // Unknown: ignore for now (future geometry containers, etc.)
  }
  // If we somehow ended without movement but queued mode lines, append them (edge case)
  if (!firstMovementEmitted && pendingModeAfterFirstMove.length) {
    for (const m of pendingModeAfterFirstMove) state.addGcode(m)
  }
  // Basic feedrate stamping if printer present
  // Final feedrate line not necessary; we append per-move when changed
  return state.gcodeLines.join('\n')
}
