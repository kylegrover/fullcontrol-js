/**
 * Color calculation system for visualization
 * Matches Python's fullcontrol.visualize.point.Point.update_color() logic
 */

import { BoundingBox } from './visualization-data.js'

/**
 * RGB color type: [r, g, b] with values 0-1
 */
export type RGBColor = [number, number, number]

/**
 * Precision for color values (number of decimal places)
 * Matches Python's precision_color = 3
 */
const PRECISION_COLOR = 3

/**
 * Round a number to specified decimal places
 */
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Travel color - grayish for non-extruding moves
 * Python: [0.75, 0.5, 0.5]
 */
export function travelColor(): RGBColor {
  return [0.75, 0.5, 0.5]
}

/**
 * Random blue color variant
 * Python: [0.1, round(random(), precision_color), 2]
 * Note: The 2 in the third component is likely a bug in Python (should be clamped to 1)
 * We'll match it for parity, but clamp to 1 for valid RGB
 */
export function randomBlueColor(): RGBColor {
  return [0.1, roundTo(Math.random(), PRECISION_COLOR), 1]
}

/**
 * Z-gradient color - color based on Z height
 * Python: z_gradient(point, bounding_box)
 */
export function zGradientColor(z: number, boundingBox: BoundingBox): RGBColor {
  const zRange = Math.max(boundingBox.rangez || 0, 0.00000001)
  const zMin = roundTo(boundingBox.minz || 0, 3) // precision_xyz = 3
  const normalized = roundTo((z - zMin) / zRange, PRECISION_COLOR)
  return [0, normalized, 1]
}

/**
 * Print sequence color - cyan to magenta gradient based on print progress
 * Python: print_sequence(point_count_now, point_count_total)
 */
export function printSequenceColor(pointCountNow: number, pointCountTotal: number): RGBColor {
  const progress = pointCountNow / pointCountTotal
  const r = roundTo(0.8 * Math.max(1 - (2 * progress), 0), PRECISION_COLOR)
  const g = roundTo(Math.max((2 * progress) - 1, 0), PRECISION_COLOR)
  return [r, g, 1]
}

/**
 * Print sequence fluctuating color - oscillating colors throughout print
 * Python: print_sequence_fluctuating(point_count_now, point_count_total, fluctuations)
 */
export function printSequenceFluctuatingColor(
  pointCountNow: number,
  pointCountTotal: number,
  fluctuations: number = 5
): RGBColor {
  const pointCountFluc = pointCountTotal / fluctuations
  const phase = ((pointCountNow % pointCountFluc) + 0.00001) / pointCountFluc
  const tau = 2 * Math.PI
  
  const r = roundTo(0.25 + 0.25 * Math.sin(phase * tau), PRECISION_COLOR)
  const g = roundTo(0.5 - 0.5 * Math.cos(phase * tau), PRECISION_COLOR)
  
  return [r, g, 1]
}

/**
 * Update color for a point based on color_type setting
 * This is called from Point.updateColor() which is invoked from Point.visualize()
 * 
 * @param colorType - The color scheme to use
 * @param extruderOn - Whether extruder is currently on
 * @param currentColor - The current/manual color if color_type is 'manual'
 * @param z - Current Z position
 * @param boundingBox - Bounding box for z_gradient calculation
 * @param pointCountNow - Current point index for sequence colors
 * @param pointCountTotal - Total point count for sequence colors
 * @returns RGB color array [r, g, b] with values 0-1
 */
export function calculateColor(
  colorType: string,
  extruderOn: boolean,
  currentColor: RGBColor | undefined,
  z: number,
  boundingBox: BoundingBox,
  pointCountNow: number,
  pointCountTotal: number
): RGBColor {
  // Manual color mode - keep existing color
  if (colorType === 'manual') {
    return currentColor || [0, 0, 1] // default to blue if no color specified
  }

  // Travel moves always get travel color regardless of color_type
  if (!extruderOn) {
    return travelColor()
  }

  // Extrusion colors based on color_type
  switch (colorType) {
    case 'random_blue':
      return randomBlueColor()
    
    case 'z_gradient':
      return zGradientColor(z, boundingBox)
    
    case 'print_sequence':
      return printSequenceColor(pointCountNow, pointCountTotal)
    
    case 'print_sequence_fluctuating':
      return printSequenceFluctuatingColor(pointCountNow, pointCountTotal, 5)
    
    default:
      throw new Error(`color_type '${colorType}' not in list of allowable color types`)
  }
}
