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
    new Extruder({ relative_gcode: false }), // absolute mode to inspect E continuity
    new ExtrusionGeometry({ area_model:'rectangle', width:0.4, height:0.2 }),
    new Point({ x:0, y:0, z:0.2 }),
    new Point({ x:10, y:0, z:0.2, extrude:true }),
    new Retraction({ length:1.2, speed:1800 }),
    new Point({ x:10, y:10, z:0.2 }), // travel after retraction
    new Unretraction({ length:1.2, speed:1600 }),
    new Point({ x:20, y:10, z:0.2, extrude:true })
  ]
  const result = transform(steps, 'gcode', { silent:true, show_banner:false, show_tips:false })
  const gc = typeof result === 'string' ? result : result.gcode || result
  const lines = gc.trim().split(/\r?\n/)

  // Capture retraction and unretraction lines (G1 E<negative> / G1 E<positive>)
  const retractIdx = lines.findIndex(l => /^G1 E-/.test(l))
  const unretractIdx = lines.findIndex(l => /^G1 E[0-9]/.test(l) && /1800/.test(lines[retractIdx]||'') ? false : / E[0-9]/.test(l) && retractIdx !== -1 && lines.indexOf(l) > retractIdx && !/ X| Y| Z/.test(l))

  if (retractIdx === -1) { console.error('FAIL: missing retraction line'); process.exit(1) }
  if (unretractIdx === -1) { console.error('FAIL: missing unretraction line'); process.exit(1) }
  if (!(retractIdx < unretractIdx)) { console.error('FAIL: ordering retraction before unretraction expected'); process.exit(1) }

  // Ensure travel move (no E) occurs between retraction and unretraction
  const between = lines.slice(retractIdx+1, unretractIdx)
  const hasTravel = between.some(l => /^G0 /.test(l) || (/^G1 /.test(l) && !/ E/.test(l)))
  if (!hasTravel) { console.error('FAIL: expected travel between retraction and unretraction'); process.exit(1) }

  console.log('PASS retraction parity basic sequence')
})()
