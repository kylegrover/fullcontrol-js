import { State } from './state.js'
import { Point } from '../models/point.js'

export interface PlotDataPoint { x?: number; y?: number; z?: number; color?: string }
export interface PlotData { points: PlotDataPoint[]; annotations: any[] }

export function build_plot_data(state: State): PlotData {
  const points: PlotDataPoint[] = state.points.map(p => ({ x: p.x, y: p.y, z: p.z, color: (p as any).color }))
  return { points, annotations: state.annotations.slice() }
}
