import { Point } from '../models/point.js'
import { linspace } from '../util/extra.js'
import { interpolated_point } from './midpoint.js'
import { distance } from './measure.js'

export function segmented_line(p1: Point, p2: Point, segments: number): Point[] {
  const xs = linspace(p1.x!, p2.x!, segments+1)
  const ys = linspace(p1.y!, p2.y!, segments+1)
  const zs = linspace(p1.z!, p2.z!, segments+1)
  return xs.map((_,i)=> new Point({ x: xs[i], y: ys[i], z: zs[i] }))
}

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
