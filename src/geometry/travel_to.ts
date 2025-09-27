import { Point } from '../models/point.js'
import { Extruder } from '../models/extrusion.js'
import { first_point } from '../util/extra.js'

// travel_to: returns [Extruder(off), point, Extruder(on)] matching Python behavior.
// Accepts a Point or a geometry (list) from which the first Point is extracted.
export function travel_to(geometry: Point | any[]): any[] {
  let point: Point
  if (geometry instanceof Point) point = geometry
  else if (Array.isArray(geometry)) point = first_point(geometry)
  else throw new Error('travel_to expects a Point or array of steps containing at least one Point')
  return [new Extruder({ on: false }), point, new Extruder({ on: true })]
}
