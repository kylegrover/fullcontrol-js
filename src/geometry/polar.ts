/**
 * @module
 * @category Geometry: Math & Transforms
 */
import { Point } from '../models/point.js'
import { Vector } from '../models/vector.js'
import { check_points } from '../util/check.js'

export interface PolarPoint { radius: number; angle: number }

/**
 * Calculates a new Point based on a polar coordinate offset from a center.
 * 
 * @param centre - The origin point of the polar sweep.
 * @param radius - The spatial distance from the centre.
 * @param angle - The polar angle in radians.
 * @returns A new Point at the calculated Cartesian coordinate.
 * 
 * @example
 * ```ts
 * const p = polar_to_point(new Point({x:0, y:0, z:0}), 10, Math.PI); // Point(-10, 0, 0)
 * ```
 */
export function polar_to_point(centre: Point, radius: number, angle: number): Point {
  return new Point({ x: (centre.x ?? 0) + radius * Math.cos(angle), y: (centre.y ?? 0) + radius * Math.sin(angle), z: centre.z })
}

/**
 * Calculates the polar relationship (radius and angle) between two points.
 * 
 * @param target_point - The point to measure to.
 * @param origin_point - The center point to measure from.
 * @returns An object containing the `radius` and `angle`.
 */
export function point_to_polar(target_point: Point, origin_point: Point): PolarPoint {
  check_points([target_point, origin_point], 'polar_xy')
  const r = Math.hypot((target_point.x! - origin_point.x!), (target_point.y! - origin_point.y!))
  const angle = Math.atan2((target_point.y! - origin_point.y!), (target_point.x! - origin_point.x!))
  return { radius: r, angle: ((angle % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI) }
}

export function polar_to_vector(length: number, angle: number): Vector {
  return new Vector({ x: length * Math.cos(angle), y: length * Math.sin(angle) })
}
