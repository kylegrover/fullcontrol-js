import { Point } from '../models/point.js'
import { point_to_polar } from './polar.js'

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(((p1.x??0)-(p2.x??0))**2 + ((p1.y??0)-(p2.y??0))**2 + ((p1.z??0)-(p2.z??0))**2)
}

export function angleXY_between_3_points(start: Point, mid: Point, end: Point): number {
  return point_to_polar(end, mid).angle - point_to_polar(start, mid).angle
}

export function path_length(points: Point[]): number { let len = 0; for (let i=0;i<points.length-1;i++) len += distance(points[i], points[i+1]); return len }
