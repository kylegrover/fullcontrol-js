/**
 * @module
 * @category Geometry: Shapes
 */
import { Point } from '../models/point.js'
import { arcXY, variable_arcXY, elliptical_arcXY } from './arcs.js'
import { centreXY_3pt } from './midpoint.js'

/**
 * Generates an array of `Point`s forming a 2D rectangle in the XY plane.
 * 
 * @param start - The starting corner point.
 * @param x_size - Length along the X axis.
 * @param y_size - Length along the Y axis.
 * @param cw - Set to `true` to draw clockwise, default is `false`.
 * @returns An array of 5 `Point`s closing the rectangle.
 */
export function rectangleXY(start: Point, x_size: number, y_size: number, cw=false): Point[] {
  const p1 = new Point({ x: start.x! + x_size * (cw?0:1), y: start.y! + y_size * (cw?1:0), z: start.z })
  const p2 = new Point({ x: start.x! + x_size, y: start.y! + y_size, z: start.z })
  const p3 = new Point({ x: start.x! + x_size * (cw?1:0), y: start.y! + y_size * (cw?0:1), z: start.z })
  return [start.copy<Point>(), p1, p2, p3, start.copy<Point>()]
}

/**
 * Generates an array of `Point`s forming a 2D circle in the XY plane.
 * 
 * @param centre - The center point of the circle.
 * @param radius - Spatial radius of the circle.
 * @param start_angle - The starting polar angle in radians.
 * @param segments - Interpolation segments (default 100).
 * @param cw - True for clockwise drawing.
 * @returns Array of Points defining the circle perimeter.
 */
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

/**
 * Generates an array of `Point`s forming a 2D ellipse in the XY plane.
 */
export function ellipseXY(centre: Point, a: number, b: number, start_angle: number, segments=100, cw=false): Point[] {
  return elliptical_arcXY(centre, a, b, start_angle, Math.PI*2 * (1 - (2*Number(cw))), segments)
}

/**
 * Generates an array of `Point`s forming a 2D regular polygon in the XY plane.
 */
export function polygonXY(centre: Point, enclosing_radius: number, start_angle: number, sides: number, cw=false): Point[] {
  return arcXY(centre, enclosing_radius, start_angle, Math.PI*2 * (1 - (2*Number(cw))), sides)
}

/**
 * Generates an array of `Point`s forming a 2D Archimedean spiral in the XY plane.
 * 
 * @param centre - Spiral origin.
 * @param start_radius - Initial radius.
 * @param end_radius - Final radius.
 * @param start_angle - Starting polar angle.
 * @param n_turns - Number of full 360-degree rotations.
 * @param segments - Resolution (points generated) for the spiral path.
 * @param cw - True for clockwise.
 * @returns Smooth array of Points defining the spiral.
 */
export function spiralXY(centre: Point, start_radius: number, end_radius: number, start_angle: number, n_turns: number, segments: number, cw=false): Point[] {
  return variable_arcXY(centre, start_radius, start_angle, n_turns*Math.PI*2 * (1 - (2*Number(cw))), segments, end_radius-start_radius, 0)
}

/**
 * Generates an array of `Point`s forming a 3D helix along the Z axis.
 * 
 * @param centre - Helix central origin column.
 * @param start_radius - Base radius.
 * @param end_radius - Top radius (permits conical helices).
 * @param start_angle - Entry angle.
 * @param n_turns - Number of vertical rotations.
 * @param pitch_z - Height gained per full turn.
 * @param segments - Resolution of the helix.
 * @param cw - True for clockwise.
 * @returns Array of Points traversing up the Z axis in a helical spiral.
 */
export function helixZ(centre: Point, start_radius: number, end_radius: number, start_angle: number, n_turns: number, pitch_z: number, segments: number, cw=false): Point[] {
  return variable_arcXY(centre, start_radius, start_angle, n_turns*Math.PI*2 * (1 - (2*Number(cw))), segments, end_radius-start_radius, pitch_z*n_turns)
}
