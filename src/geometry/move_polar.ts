import { Point } from '../models/point.js'
import { point_to_polar, polar_to_point } from './polar.js'
import { check_points } from '../util/check.js'

export function move_polar(geometry: Point | any[], centre: Point, radius: number, angle: number, copy=false, copy_quantity=2): Point | any[] {
  check_points(geometry, 'polar_xy')
  return copy ? copy_geometry_polar(geometry, centre, radius, angle, copy_quantity) : move_geometry_polar(geometry, centre, radius, angle)
}

export function move_geometry_polar(geometry: Point | any[], centre: Point, radius: number, angle: number): Point | any[] {
  const move_point = (p: Point): Point => {
    const pol = point_to_polar(p, centre)
    const np = polar_to_point(centre, pol.radius + radius, pol.angle + angle)
    const clone = p.copy<Point>()
    clone.x = np.x; clone.y = np.y
    return clone
  }
  if (geometry instanceof Point) return move_point(geometry)
  return geometry.map(e=> e instanceof Point ? move_point(e) : e)
}

export function copy_geometry_polar(geometry: Point | any[], centre: Point, radius: number, angle: number, quantity: number): any[] {
  const out: any[] = []
  for (let i=0;i<quantity;i++) {
    const rnow = radius * i
    const anow = angle * i
  const g = move_geometry_polar(geometry, centre, rnow, anow)
  if (g instanceof Point) out.push(g)
  else out.push(...g)
  }
  return out
}
