import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

;(async () => {
  const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))
  const distIndex = path.join(root, 'dist', 'index.js')
  if (!fs.existsSync(distIndex)) { console.error('Build first'); process.exit(1) }
  const distUrl = process.platform === 'win32' ? new URL('file:///' + distIndex.replace(/\\/g,'/')) : new URL('file://' + distIndex)
  const api = await import(distUrl.href)
  const { Point, Extruder, ExtrusionGeometry, transform } = api
  const steps = [
    new Extruder({ relative_gcode: true }),
    new ExtrusionGeometry({ area_model: 'rectangle', width:0.4, height:0.2 }),
    new Point({ x:0, y:0, z:0.2 }),
    new Point({ x:20, y:0, z:0.2, extrude:true })
  ]
  const result = transform(steps, 'gcode', { initialization_data: { primer: 'travel' }, show_banner:false, show_tips:false, silent:true })
  const gc = typeof result === 'string' ? result : result.gcode || result
  const lines = gc.trim().split(/\r?\n/)
  // Expect primer injected: should see an initial move to first design point BEFORE extrusion line
  // Identify first extrusion (line containing ' E' and G1)
  const firstExtrudeIdx = lines.findIndex(l => /^G1 .*E[0-9]/.test(l))
  if (firstExtrudeIdx === -1) { console.error('FAIL: no extrusion line found'); process.exit(1) }
  // Ensure at least one prior motion line (G0 or G1 without extrusion) exists
  const priorMove = lines.slice(0, firstExtrudeIdx).some(l => /^G0 /.test(l) || (/^G1 /.test(l) && !/ E[0-9]/.test(l)))
  if (!priorMove) { console.error('FAIL: expected travel primer move before first extrusion'); process.exit(1) }
  console.log('PASS primer travel')
})()
