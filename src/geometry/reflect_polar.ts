import { Point } from '../models/point.js'
import { reflectXY } from './reflect.js'
import { polar_to_point } from './polar.js'

export function reflectXYpolar(p: Point, preflect: Point, angle_reflect: number): Point {
  return reflectXY(p, preflect, polar_to_point(preflect, 1, angle_reflect))
}
