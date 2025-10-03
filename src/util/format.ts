/**
 * Formatting utilities to match Python's gcode output formatting
 */

/**
 * Format a number with at most 6 significant figures (matching Python's .6 format)
 * Used for StationaryExtrusion E values
 */
export function formatPrecision6(val: number): string {
  return val.toPrecision(6).replace(/\.?0+$/, '')
}

/**
 * Format coordinate values (X, Y, Z) - up to 6 decimal places, strip trailing zeros
 * Matches Python's .6f format with rstrip('0').rstrip('.')
 */
export function formatCoordinate(val: number): string {
  return val.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

/**
 * Format extrusion values (E) - up to 6 decimal places, strip trailing zeros
 * Matches Python's .6f format with rstrip('0').rstrip('.')
 */
export function formatExtrusion(val: number): string {
  return val.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

/**
 * Format feedrate values (F) - strip unnecessary decimals
 */
export function formatFeedrate(val: number): string {
  return val.toFixed(1).replace(/\.0+$/, '').replace(/\.$/, '')
}
