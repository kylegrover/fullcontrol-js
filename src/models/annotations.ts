import { BaseModelPlus } from '../core/base-model.js'
import { Point } from './point.js'

export class PlotAnnotation extends BaseModelPlus {
  point?: Point
  label?: string
  static readonly typeName = 'PlotAnnotation'
  constructor(init?: Partial<PlotAnnotation>) { super(init) }
  visualize(state: any, plot_data: any, _plot_controls: any) {
    if (!this.point) this.point = new Point({ x: state.point.x, y: state.point.y, z: state.point.z })
    if (plot_data?.add_annotation) plot_data.add_annotation(this)
  }
}
