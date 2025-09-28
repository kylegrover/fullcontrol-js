import { Point } from '../../models/point.js'
import { Extruder } from '../../models/extrusion.js'
import { ManualGcode } from '../../models/commands.js'

// Utility to deep copy a point (minimal for our usage)
function clonePoint(p: Point) { return new Point({ x: p.x, y: p.y, z: p.z, extrude: (p as any).extrude }) }

export type PrimerName = 'travel' | 'front_lines_then_y' | 'front_lines_then_x' | 'front_lines_then_xy' | 'x' | 'y' | 'no_primer'

export function buildPrimer(name: PrimerName, endPoint: Point): any[] {
  switch (name) {
    case 'travel':
      return [ new Extruder({ on:false }), clonePoint(endPoint), new Extruder({ on:true }) ]
    case 'front_lines_then_y':
      return frontLinesThen('y', endPoint)
    case 'front_lines_then_x':
      return frontLinesThen('x', endPoint)
    case 'front_lines_then_xy':
      return frontLinesThen('xy', endPoint)
    case 'x':
      return axisPrime('x', endPoint)
    case 'y':
      return axisPrime('y', endPoint)
    case 'no_primer':
    default:
      return []
  }
}

function addBoxSeq(endPoint: Point) {
  return [ new Point({ x:110 }), new Point({ y:14 }), new Point({ x:10 }), new Point({ y:16 }) ]
}

function frontLinesThen(mode: 'x'|'y'|'xy', endPoint: Point) {
  const seq: any[] = []
  seq.push(new ManualGcode({ text: ';-----\n; START OF PRIMER PROCEDURE\n;-----' }))
  seq.push(new Extruder({ on:false }))
  seq.push(new Point({ x:10, y:12, z:endPoint.z }))
  seq.push(new Extruder({ on:true }))
  seq.push(...addBoxSeq(endPoint))
  if (mode === 'y') {
    seq.push(new Point({ x:endPoint.x }))
    seq.push(new Point({ y:endPoint.y }))
  } else if (mode === 'x') {
    seq.push(new Point({ y:endPoint.y }))
    seq.push(new Point({ x:endPoint.x }))
  } else {
    seq.push(new Point({ x:endPoint.x, y:endPoint.y }))
  }
  seq.push(new ManualGcode({ text: ';-----\n; END OF PRIMER PROCEDURE\n;-----\n' }))
  return seq
}

function axisPrime(first: 'x'|'y', endPoint: Point) {
  const seq: any[] = []
  seq.push(new ManualGcode({ text: ';-----\n; START OF PRIMER PROCEDURE\n;-----' }))
  seq.push(new Extruder({ on:false }))
  seq.push(new Point({ x:10, y:12, z:endPoint.z }))
  seq.push(new Extruder({ on:true }))
  if (first === 'x') {
    seq.push(new Point({ x:endPoint.x }))
    seq.push(new Point({ y:endPoint.y }))
  } else {
    seq.push(new Point({ y:endPoint.y }))
    seq.push(new Point({ x:endPoint.x }))
  }
  seq.push(new ManualGcode({ text: ';-----\n; END OF PRIMER PROCEDURE\n;-----\n' }))
  return seq
}
