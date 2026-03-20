/**
 * @module
 * @category Geometry: Math & Transforms
 */
import { Point } from '../models/point.js'
import { Vector } from '../models/vector.js'

/**
 * Translates a single point or array of points by a given spatial vector.
 * 
 * If `copy` is true, generates multiple translated copies iteratively.
 * 
 * @param geometry - The Point or array of Points to translate.
 * @param vector - The spatial delta to apply to X, Y, and Z.
 * @param copy - (Optional) If true, return multiple copies instead of moving in place.
 * @param copy_quantity - (Optional) Number of copies to generate if `copy` is true.
 * @returns The translated identical geometry structure.
 * 
 * @example
 * ```ts
 * const v = new Vector({ x: 10, y: 0 });
 * const line = [new Point({x:0,y:0}), new Point({x:0,y:10})];
 * const moved = move(line, v); // both points are translated 10mm in X
 * ```
 */
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
