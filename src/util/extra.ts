import { Point } from '../models/point.js'

export function flatten<T>(steps: (T | T[])[]): T[] {
  return steps.flatMap(s => Array.isArray(s) ? s : [s])
}

export function linspace(start: number, end: number, number_of_points: number): number[] {
  if (number_of_points < 2) return [start]
  const out: number[] = []
  const step = (end - start) / (number_of_points - 1)
  for (let i = 0; i < number_of_points; i++) out.push(start + step * i)
  return out
}

export function points_only(steps: any[], track_xyz = true): Point[] {
  const pts: Point[] = steps.filter(s => s instanceof Point)
  if (!track_xyz) return pts
  for (let i = 0; i < pts.length - 1; i++) {
    const next = pts[i + 1].copy<Point>()
    const cur = pts[i]
    if (cur.x != null && next.x == null) next.x = cur.x
    if (cur.y != null && next.y == null) next.y = cur.y
    if (cur.z != null && next.z == null) next.z = cur.z
    pts[i + 1] = next
  }
  while (pts.length && (pts[0].x == null || pts[0].y == null || pts[0].z == null)) pts.shift()
  return pts
}

export function relative_point(reference: Point | any[], x_offset: number, y_offset: number, z_offset: number): Point {
  let pt: Point | undefined
  if (reference instanceof Point) pt = reference
  else if (Array.isArray(reference)) {
    for (let i = reference.length - 1; i >= 0; i--) if (reference[i] instanceof Point) { pt = reference[i]; break }
  }
  if (!pt) throw new Error('The reference object must be a Point or list containing at least one point')
  if (pt.x == null || pt.y == null || pt.z == null) throw new Error(`The reference point must have all x,y,z defined (x=${pt.x}, y=${pt.y}, z=${pt.z})`)
  return new Point({ x: pt.x + x_offset, y: pt.y + y_offset, z: pt.z + z_offset })
}

export function first_point(steps: any[], fully_defined = true): Point {
  for (const s of steps) if (s instanceof Point) { if (!fully_defined || (s.x != null && s.y != null && s.z != null)) return s }
  throw new Error(fully_defined ? 'No point found in steps with all of x y z defined' : 'No point found in steps')
}

export function last_point(steps: any[], fully_defined = true): Point {
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i]
    if (s instanceof Point) { if (!fully_defined || (s.x != null && s.y != null && s.z != null)) return s }
  }
  throw new Error(fully_defined ? 'No point found in steps with all of x y z defined' : 'No point found in steps')
}

export function export_design(steps: any[], filename?: string): string {
  const serialized = steps.map(s => ({ type: (s.constructor as any).typeName || s.constructor.name, data: { ...s } }))
  const json = JSON.stringify(serialized, null, 2)
  if (filename) {
    // browser-safe: user handles download; node: write file lazily (dynamic import to avoid fs in browser bundles)
    if (typeof window === 'undefined') {
      import('node:fs').then(fs => fs.writeFileSync(filename + '.json', json))
    }
  }
  return json
}

export function import_design(registry: Record<string, any>, jsonOrFilename: string): any[] {
  let jsonStr = jsonOrFilename
  if (jsonOrFilename.endsWith('.json')) {
    if (typeof window !== 'undefined') throw new Error('File system import not available in browser context')
    const fs = require('node:fs')
    jsonStr = fs.readFileSync(jsonOrFilename, 'utf-8')
  }
  const arr = JSON.parse(jsonStr)
  return arr.map((o: any) => {
    const cls = registry[o.type]
    if (!cls) throw new Error(`Unknown design type '${o.type}'`)
    return cls.fromJSON ? cls.fromJSON(o.data) : new cls(o.data)
  })
}
