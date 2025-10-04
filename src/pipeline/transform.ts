import { State } from './state.js'
import { generate_gcode } from './gcode.js'
import { build_plot_data, visualize, PlotData } from './visualize.js'
import { fix } from '../util/check.js'
import { GcodeControls, PlotControls } from '../models/controls.js'

export interface TransformResult { 
  gcode: string
  plot: ReturnType<typeof build_plot_data> | PlotData | undefined
  state: State 
}

export function transform(
  steps: any[], 
  result_type: 'gcode' | 'plot' = 'gcode', 
  controls: Partial<GcodeControls> | Partial<PlotControls> = {}
): TransformResult {
  
  // Handle plot result_type
  if (result_type === 'plot') {
    const plotControls = new PlotControls(controls)
    plotControls.initialize()
    
    const fixed = fix(steps, result_type, plotControls as any) as any
    const plotData = visualize(fixed, plotControls, (controls as any).show_tips !== false)
    
    // Create minimal state for compatibility
    const state = new State(fixed, {
      initialization_data: plotControls.initialization_data,
      printer_name: plotControls.printer_name
    })
    
    return { gcode: '', plot: plotData, state }
  }
  
  // Original gcode path
  const gcodeControls = new GcodeControls(controls)
  gcodeControls.initialize()
  
  const fixed = fix(steps, result_type, gcodeControls) as any
  const state = new State(fixed as any[], { 
    initialization_data: gcodeControls.initialization_data,
    printer_name: gcodeControls.printer_name 
  })
  // attach controls so gcode layer can use banner/tips flags
  ;(state as any).controls = gcodeControls
  for (const s of state.steps) state.register(s)
  const gcode = generate_gcode(state, gcodeControls as any)
  const plot = build_plot_data(state)
  return { gcode, plot, state }
}
