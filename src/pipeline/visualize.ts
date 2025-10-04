import { State } from './state.js'
import { Point } from '../models/point.js'
import { PlotData } from './visualization-data.js'
import { PlotControls } from '../models/controls.js'

// Re-export visualization types
export { PlotData, Path, BoundingBox } from './visualization-data.js'
export * from './visualization-colors.js'

export interface PlotDataPoint { x?: number; y?: number; z?: number; color?: string }
export interface PlotDataLegacy { points: PlotDataPoint[]; annotations: any[] }

/**
 * Legacy simple plot data builder (for backward compatibility)
 */
export function build_plot_data(state: State): PlotDataLegacy {
  const points: PlotDataPoint[] = state.points.map(p => ({ x: p.x, y: p.y, z: p.z, color: (p as any).color }))
  return { points, annotations: state.annotations.slice() }
}

/**
 * Full visualization pipeline matching Python's visualize.steps2visualization.visualize()
 * 
 * @param steps - Array of design steps
 * @param plotControls - Visualization controls
 * @param showTips - Whether to show guidance tips
 * @returns PlotData if raw_data=true, otherwise undefined (would trigger plotting in Python)
 */
export function visualize(steps: any[], plotControls: PlotControls, showTips: boolean = true): PlotData | undefined {
  plotControls.initialize()
  
  if (showTips) {
    showVisualizationTips(plotControls)
  }

  // Create state for visualization (similar to gcode state but for visualization)
  const state = new State(steps, {
    initialization_data: plotControls.initialization_data,
    printer_name: plotControls.printer_name
  })

  // Create plot data using state.steps (which includes primers, starting procedures, etc.)
  const plotData = new PlotData(state.steps, state)

  // Process each step through its visualize method
  for (const step of state.steps) {
    if (step && typeof step.visualize === 'function') {
      step.visualize(state, plotData, plotControls)
    }
  }

  // Cleanup single-point paths
  plotData.cleanup()

  if (plotControls.raw_data) {
    return plotData
  } else {
    // In Python, this would call plotly.plot() to render
    // For JS, we just return the data for external rendering
    console.warn('Full plotting not implemented in JS - use raw_data=true to get PlotData')
    return plotData
  }
}

/**
 * Show visualization tips (simplified version of Python's tips.py)
 */
function showVisualizationTips(controls: PlotControls): void {
  let tipStr = ''
  
  if (controls.style === 'tube' && !controls.raw_data) {
    const initData = controls.initialization_data || {}
    if (!('extrusion_width' in initData) || !('extrusion_height' in initData)) {
      tipStr += "\ntip: set initial `extrusion_width` and `extrusion_height` in the initialization_data to ensure the preview is correct:\n" +
                "   - `transform(..., 'plot', { initialization_data: { extrusion_width: EW, extrusion_height: EH } })`"
    }
  }
  
  if (tipStr !== '') {
    console.log('transform guidance tips (hide with show_tips=false):' + tipStr + '\n')
  }
}

