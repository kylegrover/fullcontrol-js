import { Point } from '../models/point.js'
import { flatten, first_point } from './extra.js'

export function check(steps: any[]) {
  if (!Array.isArray(steps)) { console.warn('design must be a 1D list of instances'); return }
  const types = new Set(steps.map(s => Array.isArray(s) ? 'list' : s?.constructor?.name))
  let results = ''
  if (types.has('list')) {
    results += 'warning - list contains nested lists; use flatten() to convert to 1D\n'
  }
  results += 'step types ' + JSON.stringify([...types])
  console.log('check results:\n' + results)
}

export function fix(steps: any[], result_type: 'gcode' | 'plot', controls: any) {
  const hasNested = steps.some(s => Array.isArray(s))
  if (hasNested) {
    console.warn('warning - design includes nested lists; flattening automatically')
    steps = flatten(steps)
  }
  const p0 = first_point(steps, false)
  if (p0.x == null || p0.y == null || p0.z == null) {
    console.warn(`warning - first point should define x,y,z; filling missing with 0`)
    p0.x = p0.x ?? 0; p0.y = p0.y ?? 0; p0.z = p0.z ?? 0
  }
  if (result_type === 'plot' && controls?.color_type === 'manual' && (p0 as any).color == null) {
    throw new Error('for PlotControls(color_type=\'manual\') first point must have a color')
  }
  return steps
}

export function check_points(geometry: Point | any[], checkType: string) {
  if (checkType === 'polar_xy') {
    const checkPoint = (pt: Point) => { if (pt.x == null || pt.y == null) throw new Error('polar transformations require points with x and y defined') }
    if (geometry instanceof Point) checkPoint(geometry)
    else for (const g of geometry) if (g instanceof Point) checkPoint(g)
  }
}
