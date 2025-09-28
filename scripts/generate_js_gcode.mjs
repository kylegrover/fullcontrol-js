#!/usr/bin/env node
// Generate G-code outputs for defined test cases using the JS library.
// Writes each case to scripts/out/js/<case>.gcode
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const root = path.resolve(scriptDir, '..')
const distPath = path.join(root, 'dist', 'index.js')
if (!fs.existsSync(distPath)) {
  console.error('Build output missing. Run: npm run build')
  process.exit(1)
}
const dist = process.platform === 'win32'
  ? new URL('file:///' + distPath.replace(/\\/g,'/')).href
  : new URL('file://' + distPath).href

const api = await import(dist)
const {
  Point, Printer, Extruder, ExtrusionGeometry, transform, travel_to
} = api

const modeIndex = process.argv.indexOf('--mode')
let runMode = 'noisy'
if (modeIndex !== -1 && process.argv[modeIndex+1]) runMode = process.argv[modeIndex+1]

const cases = {
  basic_line: () => {
    const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
    const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
    const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })
    const pts = [ new Point({ x:0, y:0, z:0.2 }), new Point({ x:10, y:0, z:0.2, extrude:true }) ]
    return transform([printer, extruder, geom, pts]).gcode
  },
  extruder_on_toggle_travel: () => {
    const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
    const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
    const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.4, height: 0.2 })
    const pts = [ new Point({ x:0, y:0, z:0.2 }), new Point({ x:5, y:0, z:0.2, extrude:true }) ]
    const seq = [printer, extruder, geom, pts, ...travel_to(new Point({ x:10, y:0, z:0.2 })), new Point({ x:15, y:0, z:0.2, extrude:true })]
    return transform(seq).gcode
  }
}

const outDir = path.join(scriptDir, 'out', runMode === 'silent' ? 'js_silent' : 'js')
fs.mkdirSync(outDir, { recursive: true })
let failures = 0
for (const [name, fn] of Object.entries(cases)) {
  try {
  const controls = runMode === 'silent' ? { show_banner:false, show_tips:false, silent:true } : { show_banner:true, show_tips:true }
  // Provide controls to transform if supported; fallback to existing signature
  const result = fn()
  const g = (typeof result === 'string' ? result : result).trim() + '\n'
    fs.writeFileSync(path.join(outDir, name + '.gcode'), g, 'utf-8')
    console.log('JS case', name, 'OK')
  } catch(e) {
    console.error('JS case', name, 'ERROR', e)
    failures++
  }
}
if (failures) { process.exit(1) }
