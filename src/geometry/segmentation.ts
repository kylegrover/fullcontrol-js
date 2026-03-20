import { Point } from '../models/point.js'
import { linspace } from '../util/extra.js'
import { interpolated_point } from './midpoint.js'
import { distance } from './measure.js'

/**
 * Subdivides a straight line between two points into multiple points.
 * 
 * @param p1 - The starting point.
 * @param p2 - The ending point.
 * @param segments - The number of segments to divide the line into.
 * @returns An array of `segments + 1` Points forming the line.
 */
export function segmented_line(p1: Point, p2: Point, segments: number): Point[] {
  const xs = linspace(p1.x!, p2.x!, segments+1)
  const ys = linspace(p1.y!, p2.y!, segments+1)
  const zs = linspace(p1.z!, p2.z!, segments+1)
  return xs.map((_,i)=> new Point({ x: xs[i], y: ys[i], z: zs[i] }))
}

/**
 * Resamples a polyline path into evenly spaced segments.
 * 
 * Useful for normalizing the resolution of geometric shapes before applying
 * further mathematical transformations (like mathematical waves).
 * 
 * @param points - The original array of Points defining the continuous path.
 * @param segments - The desired number of evenly spaced segments.
 * @returns A new array of Points representing the resampled path.
 */
export function segmented_path(points: Point[], segments: number): Point[] {
  const lengths = points.slice(0,-1).map((_,i)=> distance(points[i], points[i+1]))
  const cumulative = [0]
  for (const l of lengths) cumulative.push(cumulative[cumulative.length-1]+l)
  const seg_length = cumulative[cumulative.length-1]/segments
  const out: Point[] = [points[0]]
  let path_section_now = 1
  for (let s=1; s<segments; s++) {
    const target = seg_length*s
    while (target > cumulative[path_section_now]) path_section_now++
    const interpolation_length = target - cumulative[path_section_now-1]
    const fraction = interpolation_length / distance(points[path_section_now-1], points[path_section_now])
    out.push(interpolated_point(points[path_section_now-1], points[path_section_now], fraction))
  }
  out.push(points[points.length-1])
  return out
}
