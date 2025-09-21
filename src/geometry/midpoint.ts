import { Point } from '../models/point.js'

export function midpoint(p1: Point, p2: Point): Point {
  return new Point({ x: avg(p1.x, p2.x), y: avg(p1.y, p2.y), z: avg(p1.z, p2.z) })
}
function avg(a?: number, b?: number) { return (a!=null && b!=null) ? (a + b)/2 : undefined }

export function interpolated_point(p1: Point, p2: Point, f: number): Point {
  const interp = (a?: number, b?: number) => (a!=null || b!=null) ? ((a ?? b!) + f * ((b ?? a!) - (a ?? b!))) : undefined
  return new Point({ x: interp(p1.x, p2.x), y: interp(p1.y, p2.y), z: interp(p1.z, p2.z) })
}

export function centreXY_3pt(p1: Point, p2: Point, p3: Point): Point {
  const D = 2 * (p1.x! * (p2.y! - p3.y!) + p2.x! * (p3.y! - p1.y!) + p3.x! * (p1.y! - p2.y!))
  if (D === 0) throw new Error('The points are collinear, no unique circle')
  const x_centre = ((p1.x!**2 + p1.y!**2) * (p2.y! - p3.y!) + (p2.x!**2 + p2.y!**2) * (p3.y! - p1.y!) + (p3.x!**2 + p3.y!**2) * (p1.y! - p2.y!)) / D
  const y_centre = ((p1.x!**2 + p1.y!**2) * (p3.x! - p2.x!) + (p2.x!**2 + p2.y!**2) * (p1.x! - p3.x!) + (p3.x!**2 + p3.y!**2) * (p2.x! - p1.x!)) / D
  return new Point({ x: x_centre, y: y_centre, z: p1.z })
}
