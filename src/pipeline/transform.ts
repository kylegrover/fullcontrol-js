import { State } from './state.js'
import { generate_gcode } from './gcode.js'
import { build_plot_data } from './visualize.js'
import { fix } from '../util/check.js'

export interface TransformResult { gcode: string; plot: ReturnType<typeof build_plot_data>; state: State }

export function transform(steps: any[], result_type: 'gcode' | 'plot' = 'gcode', controls: any = {}): TransformResult {
  const fixed = fix(steps, result_type, controls) as any
  const state = new State(fixed as any[])
  // register steps for metadata
  for (const s of state.steps) state.register(s)
  const gcode = generate_gcode(state)
  const plot = build_plot_data(state)
  return { gcode, plot, state }
}
