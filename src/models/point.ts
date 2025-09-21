import { BaseModelPlus } from '../core/base-model.js'

export class Point extends BaseModelPlus {
  x?: number
  y?: number
  z?: number
  color?: [number, number, number] // optional for parity with visualization
  static readonly typeName = 'Point'
  constructor(init?: Partial<Point>) { super(init) }
  toJSON() { return { x: this.x, y: this.y, z: this.z, color: this.color } }
  static fromJSON(data: any) { return new Point(data) }
}
