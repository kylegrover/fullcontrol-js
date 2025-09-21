import { Point } from '../models/point.js'
import { Vector } from '../models/vector.js'
import { polar_to_point } from './polar.js'
import { move, move_geometry } from './move.js'
import { move_polar } from './move_polar.js'

export function squarewaveXYpolar(start: Point, direction_polar: number, amplitude: number, line_spacing: number, periods: number, extra_half_period=false, extra_end_line=false): Point[] {
  const steps: Point[] = [start.copy<Point>()]
  for (let i=0;i<periods;i++) {
    steps.push(polar_to_point(steps[steps.length-1], amplitude, direction_polar + Math.PI/2))
    steps.push(polar_to_point(steps[steps.length-1], line_spacing, direction_polar))
    steps.push(polar_to_point(steps[steps.length-1], amplitude, direction_polar - Math.PI/2))
    if (i !== periods-1) steps.push(polar_to_point(steps[steps.length-1], line_spacing, direction_polar))
  }
  if (extra_half_period) {
    steps.push(polar_to_point(steps[steps.length-1], line_spacing, direction_polar))
    steps.push(polar_to_point(steps[steps.length-1], amplitude, direction_polar + Math.PI/2))
  }
  if (extra_end_line) steps.push(polar_to_point(steps[steps.length-1], line_spacing, direction_polar))
  return steps
}

export function squarewaveXY(start: Point, direction_vector: Vector, amplitude: number, line_spacing: number, periods: number, extra_half_period=false, extra_end_line=false): Point[] {
  const vx = direction_vector.x ?? 0, vy = direction_vector.y ?? 0
  const direction_polar = Math.atan2(vy, vx)
  return squarewaveXYpolar(start, direction_polar, amplitude, line_spacing, periods, extra_half_period, extra_end_line)
}

export function trianglewaveXYpolar(start: Point, direction_polar: number, amplitude: number, tip_separation: number, periods: number, extra_half_period=false): Point[] {
  const steps: Point[] = [start.copy<Point>()]
  for (let i=0;i<periods;i++) {
    let temp = polar_to_point(steps[steps.length-1], amplitude, direction_polar + Math.PI/2)
    steps.push(polar_to_point(temp, tip_separation/2, direction_polar))
    temp = polar_to_point(steps[steps.length-1], amplitude, direction_polar - Math.PI/2)
    steps.push(polar_to_point(temp, tip_separation/2, direction_polar))
  }
  if (extra_half_period) {
    const temp = polar_to_point(steps[steps.length-1], amplitude, direction_polar + Math.PI/2)
    steps.push(polar_to_point(temp, tip_separation/2, direction_polar))
  }
  return steps
}

export function sinewaveXYpolar(start: Point, direction_polar: number, amplitude: number, period_length: number, periods: number, segments_per_period=16, extra_half_period=false, phase_shift=0): Point[] {
  const steps: Point[] = []
  const totalSegments = periods*segments_per_period + (extra_half_period? Math.floor(0.5*segments_per_period):0)
  for (let i=0;i<= totalSegments; i++) {
    const axis_distance = i * period_length / segments_per_period
    const amp_now = amplitude * (0.5 - 0.5 * Math.cos(((i/segments_per_period)*Math.PI*2) + phase_shift))
    steps.push(move(start, new Vector({ x: axis_distance, y: amp_now, z: 0 })) as Point)
  }
  return move_polar(steps, start, 0, direction_polar) as Point[]
}
