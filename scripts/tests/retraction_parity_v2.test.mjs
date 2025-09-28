import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

;(async () => {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))
  const distIndex = path.join(root, 'dist', 'index.js')
  if (!fs.existsSync(distIndex)) { console.error('Build first'); process.exit(1) }
  const distUrl = process.platform === 'win32' ? new URL('file:///' + distIndex.replace(/\\/g,'/')) : new URL('file://' + distIndex)
  const api = await import(distUrl.href)
  const { Point, Extruder, ExtrusionGeometry, Retraction, Unretraction, transform } = api

  const steps = [
    new Extruder({ relative_gcode: false }),
    new ExtrusionGeometry({ area_model:'rectangle', width:0.4, height:0.2 }),
    new Point({ x:0, y:0, z:0.2 }),
    new Point({ x:10, y:0, z:0.2, extrude:true }),
    new Retraction({ length:1.0 }),
    new Point({ x:10, y:10, z:0.2 }),
    new Unretraction({ length:1.0 }),
    new Point({ x:20, y:10, z:0.2, extrude:true })
  ]
  const result = transform(steps, 'gcode', { silent:true, show_banner:false, show_tips:false })
  const gc = typeof result === 'string' ? result : result.gcode || result
  const lines = gc.trim().split(/\r?\n/)

  const retractIdx = lines.findIndex(l => /^G1 E-/.test(l))
  const unretractIdx = lines.findIndex((l,i) => i>retractIdx && /^G1 E[0-9]/.test(l) && !/ X| Y| Z/.test(l))

  if (retractIdx === -1) { console.error('FAIL: missing retraction line'); process.exit(1) }
  if (unretractIdx === -1) { console.error('FAIL: missing unretraction line'); process.exit(1) }
  if (!(retractIdx < unretractIdx)) { console.error('FAIL: ordering issue'); process.exit(1) }

  // Accept that the travel line after retraction may include an E value (restoring volume due to absolute tracking) but must not decrease further.
  const travelSegment = lines.slice(retractIdx+1, unretractIdx)
  const furtherNegative = travelSegment.some(l => /^G1 E-/.test(l))
  if (furtherNegative) { console.error('FAIL: additional negative extrusion after initial retraction'); process.exit(1) }

  console.log('PASS retraction parity v2')
})()
