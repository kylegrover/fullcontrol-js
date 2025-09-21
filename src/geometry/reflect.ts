import { Point } from '../models/point.js'

export function reflectXY_mc(p: Point, m_reflect: number, c_reflect: number): Point {
  const m_reflect_normal = -1 / m_reflect
  const c_reflect_normal = (p.y ?? 0) - (m_reflect_normal * (p.x ?? 0))
  const x = (c_reflect_normal - c_reflect) / (m_reflect - m_reflect_normal)
  const y = (c_reflect_normal - ((m_reflect_normal / m_reflect) * c_reflect)) / (1 - (m_reflect_normal / m_reflect))
  return new Point({ x: (p.x ?? 0) + 2 * (x - (p.x ?? 0)), y: (p.y ?? 0) + 2 * (y - (p.y ?? 0)), z: p.z })
}

export function reflectXY(p: Point, p1: Point, p2: Point): Point {
  if (p2.x === p1.x) return new Point({ x: (p.x ?? 0) + 2 * (p1.x! - (p.x ?? 0)), y: p.y, z: p.z })
  if (p2.y === p1.y) return new Point({ x: p.x, y: (p.y ?? 0) + 2 * (p1.y! - (p.y ?? 0)), z: p.z })
  const m = (p2.y! - p1.y!) / (p2.x! - p1.x!)
  const c = p1.y! - (m * p1.x!)
  return reflectXY_mc(p, m, c)
}
