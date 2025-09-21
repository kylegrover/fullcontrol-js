import { Point } from '../models/point.js'
import { Vector } from '../models/vector.js'

export function move(geometry: Point | any[], vector: Vector, copy=false, copy_quantity=2): Point | any[] {
  return copy ? copy_geometry(geometry, vector, copy_quantity) : move_geometry(geometry, vector)
}

export function move_geometry(geometry: Point | any[], vector: Vector): Point | any[] {
  const move_point = (p: Point): Point => {
    const n = p.copy<Point>()
    if (n.x != null && vector.x != null) n.x += vector.x
    if (n.y != null && vector.y != null) n.y += vector.y
    if (n.z != null && vector.z != null) n.z += vector.z
    return n
  }
  if (geometry instanceof Point) return move_point(geometry)
  return geometry.map(e => e instanceof Point ? move_point(e) : e)
}

export function copy_geometry(geometry: Point | any[], vector: Vector, quantity: number): any[] {
  const out: any[] = []
  for (let i=0;i<quantity;i++) {
    const v = new Vector({ x: vector.x!=null? vector.x*i: undefined, y: vector.y!=null? vector.y*i: undefined, z: vector.z!=null? vector.z*i: undefined })
  const g = move_geometry(geometry, v)
  if (g instanceof Point) out.push(g)
  else out.push(...g)
  }
  return out
}
