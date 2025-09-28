// Test to ensure M82 + G92 E0 sequence appears once when switching from relative to absolute extrusion
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

(async () => {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))
  const distIndex = path.join(root, 'dist', 'index.js')
  if (!fs.existsSync(distIndex)) {
    console.error('Build artifacts missing. Run build first.')
    process.exit(1)
  }
  // Convert Windows path to file URL
  const distUrl = process.platform === 'win32'
    ? new URL('file:///' + distIndex.replace(/\\/g,'/'))
    : new URL('file://' + distIndex)
  const api = await import(distUrl.href)
  const { Extruder, Point, ExtrusionGeometry, transform } = api
  // Start relative, then switch to absolute before an extrusion move.
  const steps = [
    new Extruder({ relative_gcode: true }),
    new ExtrusionGeometry({ area_model: 'rectangle', width: 0.4, height: 0.2 }),
    new Point({ x: 0, y: 0, z: 0.2 }),
    new Extruder({ relative_gcode: false }),
    new Point({ x: 10, y: 0, z: 0.2, extrude: true })
  ]
  const result = transform(steps, 'gcode', { show_banner:false, show_tips:false, silent:true })
  const gc = typeof result === 'string' ? result : result.gcode || result
  const lines = gc.trim().split(/\r?\n/) 
  const m82Idx = lines.findIndex(l => /^M82 /.test(l))
  const g92Idx = lines.findIndex(l => /^G92 E0/.test(l))
  if (m82Idx === -1 || g92Idx === -1 || g92Idx !== m82Idx + 1) {
    console.error('FAIL: Expected M82 followed immediately by G92 E0. Found ordering:', { m82Idx, g92Idx, lines })
    process.exit(1)
  }
  // Ensure only one of each
  const m82Count = lines.filter(l => /^M82 /.test(l)).length
  const g92Count = lines.filter(l => /^G92 E0/.test(l)).length
  if (m82Count !== 1 || g92Count !== 1) {
    console.error('FAIL: Expected exactly one M82 and one G92 E0.', { m82Count, g92Count })
    process.exit(1)
  }
  console.log('PASS relative->absolute sequence parity')
})()
