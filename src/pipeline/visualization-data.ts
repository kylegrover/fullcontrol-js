/**
 * Visualization data structures matching Python's fullcontrol.visualize module
 * These classes support proper path segmentation, color gradients, and plot data export
 */

import { Point } from '../models/point.js'
import { Extruder } from '../models/extrusion.js'

/**
 * BoundingBox - calculates and stores geometric bounds of all points
 * Matches Python's fullcontrol.visualize.bounding_box.BoundingBox
 */
export class BoundingBox {
  minx?: number
  midx?: number
  maxx?: number
  rangex?: number
  miny?: number
  midy?: number
  maxy?: number
  rangey?: number
  minz?: number
  midz?: number
  maxz?: number
  rangez?: number

  /**
   * Calculate bounds from all Point instances in steps array
   * Python equivalent: calc_bounds(steps)
   */
  calcBounds(steps: any[]): void {
    this.minx = 1e10
    this.miny = 1e10
    this.minz = 1e10
    this.maxx = -1e10
    this.maxy = -1e10
    this.maxz = -1e10

    for (const step of steps) {
      if (step instanceof Point || (step.constructor && step.constructor.name === 'Point')) {
        if (step.x != null) {
          this.minx = Math.min(this.minx, step.x)
          this.maxx = Math.max(this.maxx, step.x)
        }
        if (step.y != null) {
          this.miny = Math.min(this.miny, step.y)
          this.maxy = Math.max(this.maxy, step.y)
        }
        if (step.z != null) {
          this.minz = Math.min(this.minz, step.z)
          this.maxz = Math.max(this.maxz, step.z)
        }
      }
    }

    this.midx = (this.minx + this.maxx) / 2
    this.midy = (this.miny + this.maxy) / 2
    this.midz = (this.minz + this.maxz) / 2
    this.rangex = this.maxx - this.minx
    this.rangey = this.maxy - this.miny
    this.rangez = this.maxz - this.minz
  }
}

/**
 * Path - represents a continuous segment with consistent extruder state
 * Matches Python's fullcontrol.visualize.path.Path
 * A new path is created each time the extruder changes on/off
 */
export class Path {
  xvals: number[] = []
  yvals: number[] = []
  zvals: number[] = []
  colors: [number, number, number][] = [] // RGB values 0-1
  extruder: Extruder
  widths: number[] = []
  heights: number[] = []

  constructor(extruderState: Extruder) {
    // Store a snapshot of extruder state for this path
    this.extruder = new Extruder({ on: extruderState.on })
  }

  /**
   * Add a point to this path
   * Python equivalent: add_point(state)
   */
  addPoint(state: any): void {
    this.xvals.push(state.point.x)
    this.yvals.push(state.point.y)
    this.zvals.push(state.point.z)
    this.colors.push(state.point.color)
    this.widths.push(state.extrusion_geometry.width)
    this.heights.push(state.extrusion_geometry.height)
  }
}

/**
 * PlotData - complete visualization data structure
 * Matches Python's fullcontrol.visualize.plot_data.PlotData
 */
export class PlotData {
  paths: Path[] = []
  boundingBox: BoundingBox = new BoundingBox()
  annotations: Array<{ label: string; x: number; y: number; z: number }> = []

  /**
   * Initialize PlotData with steps and state
   * Python equivalent: __init__(steps, state)
   */
  constructor(steps: any[], state: any) {
    // Calculate bounding box
    this.boundingBox.calcBounds(steps)
    
    // Initialize first path
    this.paths.push(new Path(state.extruder))
    state.pathCountNow += 1
  }

  /**
   * Add a new path to the list
   * Python equivalent: add_path(state, plot_data, plot_controls)
   */
  addPath(state: any, plotData: PlotData, plotControls: any): void {
    this.paths.push(new Path(state.extruder))
    state.point.updateColor(state, plotData, plotControls)
    this.paths[this.paths.length - 1].addPoint(state)
  }

  /**
   * Add an annotation to the plot
   * Python equivalent: add_annotation(annotation)
   */
  addAnnotation(annotation: any): void {
    this.annotations.push({
      label: annotation.label,
      x: annotation.point.x,
      y: annotation.point.y,
      z: annotation.point.z
    })
  }

  /**
   * Remove single-point paths (cleanup after visualization)
   * Python equivalent: cleanup()
   */
  cleanup(): void {
    this.paths = this.paths.filter(path => path.xvals.length > 1)
  }

  /**
   * Export to JSON for serialization
   */
  toJSON(): any {
    return {
      paths: this.paths.map(p => ({
        xvals: p.xvals,
        yvals: p.yvals,
        zvals: p.zvals,
        colors: p.colors,
        widths: p.widths,
        heights: p.heights,
        extruder: { on: p.extruder.on }
      })),
      boundingBox: {
        minx: this.boundingBox.minx,
        maxx: this.boundingBox.maxx,
        midx: this.boundingBox.midx,
        rangex: this.boundingBox.rangex,
        miny: this.boundingBox.miny,
        maxy: this.boundingBox.maxy,
        midy: this.boundingBox.midy,
        rangey: this.boundingBox.rangey,
        minz: this.boundingBox.minz,
        maxz: this.boundingBox.maxz,
        midz: this.boundingBox.midz,
        rangez: this.boundingBox.rangez
      },
      annotations: this.annotations
    }
  }
}
