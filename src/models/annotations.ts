import { BaseModelPlus } from '../core/base-model.js'
import { Point } from './point.js'

export class PlotAnnotation extends BaseModelPlus {
  point?: Point
  label?: string
  static readonly typeName = 'PlotAnnotation'
  constructor(init?: Partial<PlotAnnotation>) { super(init) }
  
  /**
   * Visualization method for PlotAnnotation
   * Matches Python: fullcontrol.visualize.annotations.PlotAnnotation.visualize()
   */
  visualize(state: any, plotData: any, _plotControls: any): void {
    if (!this.point) {
      this.point = new Point({ x: state.point.x, y: state.point.y, z: state.point.z })
    }
    plotData.addAnnotation(this)
  }
}
