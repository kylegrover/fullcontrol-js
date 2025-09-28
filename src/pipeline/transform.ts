import { State } from './state.js'
import { generate_gcode } from './gcode.js'
import { build_plot_data } from './visualize.js'
import { fix } from '../util/check.js'
import { GcodeControls } from '../models/controls.js'

export interface TransformResult { gcode: string; plot: ReturnType<typeof build_plot_data>; state: State }

export function transform(steps: any[], result_type: 'gcode' | 'plot' = 'gcode', controls: Partial<GcodeControls> = {}): TransformResult {
  const fixed = fix(steps, result_type, controls) as any
  const state = new State(fixed as any[], { initialization_data: (controls as any).initialization_data })
  // attach controls so gcode layer can use banner/tips flags
  ;(state as any).controls = controls
  for (const s of state.steps) state.register(s)
  const gcode = generate_gcode(state, controls as any)
  const plot = build_plot_data(state)
  return { gcode, plot, state }
}
