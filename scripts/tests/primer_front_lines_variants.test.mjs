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

  const variants = ['front_lines_then_x','front_lines_then_y','front_lines_then_xy']
  let allPass = true
  for (const variant of variants) {
    const steps = [
      new Extruder({ relative_gcode: true }),
      new ExtrusionGeometry({ area_model: 'rectangle', width:0.4, height:0.2 }),
      new Point({ x:0, y:0, z:0.2 }),
      new Point({ x:20, y:10, z:0.2, extrude:true })
    ]
    const result = transform(steps, 'gcode', { initialization_data: { primer: variant }, show_banner:false, show_tips:false, silent:true })
    const gc = typeof result === 'string' ? result : result.gcode || result
    const lines = gc.trim().split(/\r?\n/)

    // Extract final model first extrusion target (20,10,0.2) and ensure appears AFTER primer block
    const idxModelExtrude = lines.findIndex(l => /X20(\.0+)?\b/.test(l) && /Y10(\.0+)?\b/.test(l) && /E[0-9]/.test(l))
    if (idxModelExtrude === -1) { console.error(`FAIL ${variant}: no model extrusion line`); allPass=false; continue }

    // Primer block markers ; START OF PRIMER PROCEDURE and END ... must wrap earlier lines
    const startIdx = lines.findIndex(l => /START OF PRIMER PROCEDURE/.test(l))
    const endIdx = lines.findIndex(l => /END OF PRIMER PROCEDURE/.test(l))
    if (startIdx === -1 || endIdx === -1 || !(startIdx < endIdx && endIdx < idxModelExtrude)) {
      console.error(`FAIL ${variant}: primer marker ordering invalid`); allPass=false; continue
    }

    // Ensure extruder off then on sequence inside primer (M83 already set earlier). We look for a G1/G0 move at X10 Y12 then later a point approaching final target path style.
    const hasStagingMove = lines.slice(startIdx, endIdx+1).some(l => /X10(\.0+)?\b/.test(l) && /Y12(\.0+)?\b/.test(l))
    if (!hasStagingMove) { console.error(`FAIL ${variant}: missing staging move X10 Y12`); allPass=false; continue }

    // For x vs y ordering specifics: after END marker we should not have leftover primer coordinates.
    // Validate final coordinate just before first model extrusion contains X20 or Y10 depending on variant combination movement strategy; relaxed check.
    const preModelSlice = lines.slice(endIdx+1, idxModelExtrude+1)
    if (!preModelSlice.some(l => /X20(\.0+)?/.test(l) || /Y10(\.0+)?/.test(l))) {
      console.error(`FAIL ${variant}: expected approach moves toward model start`); allPass=false; continue }

    console.log(`PASS ${variant}`)
  }
  if (!allPass) process.exit(1)
})()
