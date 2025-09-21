import { Point } from '../models/point.js'
import { arcXY, variable_arcXY, elliptical_arcXY } from './arcs.js'
import { centreXY_3pt } from './midpoint.js'

export function rectangleXY(start: Point, x_size: number, y_size: number, cw=false): Point[] {
  const p1 = new Point({ x: start.x! + x_size * (cw?0:1), y: start.y! + y_size * (cw?1:0), z: start.z })
  const p2 = new Point({ x: start.x! + x_size, y: start.y! + y_size, z: start.z })
  const p3 = new Point({ x: start.x! + x_size * (cw?1:0), y: start.y! + y_size * (cw?0:1), z: start.z })
  return [start.copy<Point>(), p1, p2, p3, start.copy<Point>()]
}

export function circleXY(centre: Point, radius: number, start_angle: number, segments=100, cw=false): Point[] {
  return arcXY(centre, radius, start_angle, Math.PI*2 * (1 - (2*Number(cw))), segments)
}

export function circleXY_3pt(p1: Point, p2: Point, p3: Point, start_angle?: number, start_at_first_point?: boolean, segments=100, cw=false): Point[] {
  const centre = centreXY_3pt(p1,p2,p3)
  const radius = Math.hypot(p1.x!-centre.x!, p1.y!-centre.y!)
  if (start_angle!=null && start_at_first_point!=null) throw new Error('start_angle and start_at_first_point cannot both be set')
  if (start_angle==null) {
    if (start_at_first_point==null) throw new Error('neither start_angle nor start_at_first_point set')
    start_angle = Math.atan2(p1.y!-centre.y!, p1.x!-centre.x!)
  }
  return arcXY(centre, radius, start_angle, Math.PI*2 * (1 - (2*Number(cw))), segments)
}

export function ellipseXY(centre: Point, a: number, b: number, start_angle: number, segments=100, cw=false): Point[] {
  return elliptical_arcXY(centre, a, b, start_angle, Math.PI*2 * (1 - (2*Number(cw))), segments)
}

export function polygonXY(centre: Point, enclosing_radius: number, start_angle: number, sides: number, cw=false): Point[] {
  return arcXY(centre, enclosing_radius, start_angle, Math.PI*2 * (1 - (2*Number(cw))), sides)
}

export function spiralXY(centre: Point, start_radius: number, end_radius: number, start_angle: number, n_turns: number, segments: number, cw=false): Point[] {
  return variable_arcXY(centre, start_radius, start_angle, n_turns*Math.PI*2 * (1 - (2*Number(cw))), segments, end_radius-start_radius, 0)
}

export function helixZ(centre: Point, start_radius: number, end_radius: number, start_angle: number, n_turns: number, pitch_z: number, segments: number, cw=false): Point[] {
  return variable_arcXY(centre, start_radius, start_angle, n_turns*Math.PI*2 * (1 - (2*Number(cw))), segments, end_radius-start_radius, pitch_z*n_turns)
}
