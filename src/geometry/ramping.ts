import { Point } from '../models/point.js'
import { Vector } from '../models/vector.js'
import { linspace } from '../util/extra.js'
import { move } from './move.js'
import { move_polar } from './move_polar.js'

/**
 * Linearly interpolates a spatial change across an array of points.
 * 
 * Useful for gradually changing the Z-height of a flat path (e.g. creating a continuous slope).
 * 
 * @param list - The array of Points to modify.
 * @param x_change - Total cumulative X delta applied by the end of the array.
 * @param y_change - Total cumulative Y delta applied by the end of the array.
 * @param z_change - Total cumulative Z delta applied by the end of the array.
 * @returns The modified array of Points.
 */
export function ramp_xyz(list: Point[], x_change=0, y_change=0, z_change=0): Point[] {
  const xs = linspace(0,x_change,list.length)
  const ys = linspace(0,y_change,list.length)
  const zs = linspace(0,z_change,list.length)
  for (let i=0;i<list.length;i++) list[i] = move(list[i], new Vector({ x: xs[i], y: ys[i], z: zs[i] })) as Point
  return list
}

/**
 * Linearly interpolates a polar spatial change across an array of points.
 * 
 * @param list - The array of Points to modify.
 * @param centre - The origin point used for polar reference.
 * @param radius_change - Total cumulative radial delta applied by the end.
 * @param angle_change - Total cumulative angular delta applied by the end.
 * @returns The modified array of Points.
 */
export function ramp_polar(list: Point[], centre: Point, radius_change=0, angle_change=0): Point[] {
  const rs = linspace(0,radius_change,list.length)
  const as = linspace(0,angle_change,list.length)
  for (let i=0;i<list.length;i++) list[i] = move_polar(list[i], centre, rs[i], as[i]) as Point
  return list
}
