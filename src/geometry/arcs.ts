import { Point } from '../models/point.js'
import { linspace } from '../util/extra.js'
import { polar_to_point, point_to_polar } from './polar.js'
import { ramp_xyz, ramp_polar } from './ramping.js'
import { centreXY_3pt } from './midpoint.js'

export function arcXY(centre: Point, radius: number, start_angle: number, arc_angle: number, segments=100): Point[] {
  return linspace(start_angle, start_angle+arc_angle, segments+1).map(a=> polar_to_point(centre, radius, a))
}

export function variable_arcXY(centre: Point, start_radius: number, start_angle: number, arc_angle: number, segments=100, radius_change=0, z_change=0): Point[] {
  let arc = arcXY(centre, start_radius, start_angle, arc_angle, segments)
  arc = ramp_xyz(arc, 0, 0, z_change)
  return ramp_polar(arc, centre, radius_change, 0)
}

export function elliptical_arcXY(centre: Point, a: number, b: number, start_angle: number, arc_angle: number, segments=100): Point[] {
  const t = linspace(start_angle, start_angle+arc_angle, segments+1)
  return t.map(tt=> new Point({ x: a*Math.cos(tt)+centre.x!, y: b*Math.sin(tt)+centre.y!, z: centre.z }))
}

export function arcXY_3pt(p1: Point, p2: Point, p3: Point, segments=100): Point[] {
  const centre = centreXY_3pt(p1, p2, p3)
  const radius = Math.hypot(p1.x!-centre.x!, p1.y!-centre.y!)
  const start_angle = Math.atan2(p1.y!-centre.y!, p1.x!-centre.x!)
  const mid_angle = Math.atan2(p2.y!-centre.y!, p2.x!-centre.x!)
  const end_angle = Math.atan2(p3.y!-centre.y!, p3.x!-centre.x!)
  const twoPi = Math.PI*2
  const norm = (a: number) => { while(a<0) a+=twoPi; while(a>=twoPi) a-=twoPi; return a }
  const sa = norm(start_angle), ma = norm(mid_angle), ea = norm(end_angle)
  const ccw = (ma > sa && ma < ea) || (sa > ea && (ma > sa || ma < ea))
  const arc_angle = ccw ? (ea - sa) : -(twoPi - (ea - sa))
  return arcXY(centre, radius, sa, arc_angle, segments)
}
