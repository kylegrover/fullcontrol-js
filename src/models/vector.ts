export class Vector {
  x?: number
  y?: number
  z?: number
  constructor(init?: Partial<Vector>) { Object.assign(this, init) }
  static readonly typeName = 'Vector'
  toJSON() { return { x: this.x, y: this.y, z: this.z } }
  static fromJSON(data: any) { return new Vector(data) }
}
