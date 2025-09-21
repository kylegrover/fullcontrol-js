import { BaseModelPlus } from '../core/base-model.js'

export class Point extends BaseModelPlus {
  x?: number
  y?: number
  z?: number
  color?: [number, number, number] // optional for parity with visualization
  extrude?: boolean // whether this move should extrude
  speed?: number // optional per-move speed override
  static readonly typeName = 'Point'
  constructor(init?: Partial<Point>) { super(init) }
  toJSON() { return { x: this.x, y: this.y, z: this.z, color: this.color, extrude: this.extrude, speed: this.speed } }
  static fromJSON(data: any) { return new Point(data) }
}
