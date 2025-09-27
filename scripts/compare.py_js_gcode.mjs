#!/usr/bin/env node
// Compares G-code output between Python fullcontrol and local JS implementation for selected examples.
// Requirements:
// 1. Python environment with `fullcontrol` installed available as `python` in PATH.
// 2. Node environment (this project built) so dist/index.js exists.

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// Resolve project root robustly across platforms (Windows file URL starts with /C:/)
const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const root = path.resolve(scriptDir, '..')
const dist = path.join(root, 'dist', 'index.js')
if (!fs.existsSync(dist)) {
  console.error(`Build output missing. (Checked: ${dist}) Run: npm run build`)
  process.exit(1)
}

// Example definitions: a function in Python and equivalent JS steps builder
// We embed small Python scripts executed via -c for isolation.
const cases = [
  {
    name: 'basic_line',
    py: `from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform\n`+
        `printer=Printer(print_speed=1800, travel_speed=6000)\n`+
        `extruder=Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')\n`+
        `geom=ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)\n`+
        `pts=[Point(x=0,y=0,z=0.2), Point(x=10,y=0,z=0.2, extrude=True)]\n`+
        `res=transform([printer, extruder, geom, pts])\n`+
        `print(res['gcode'])`,
    js: async (api) => {
      const { Point, Printer, Extruder, ExtrusionGeometry, transform } = api
      const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
      const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
      const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.45, height: 0.2 })
      const pts = [ new Point({ x:0, y:0, z:0.2, extrude:false }), new Point({ x:10, y:0, z:0.2, extrude:true }) ]
      return transform([printer, extruder, geom, pts]).gcode
    }
  },
  {
    name: 'extruder_on_toggle_travel',
    py: `from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform, travel_to\n`+
        `printer=Printer(print_speed=1800, travel_speed=6000)\n`+
        `extruder=Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')\n`+
        `geom=ExtrusionGeometry(area_model='rectangle', width=0.4, height=0.2)\n`+
        `pts=[Point(x=0,y=0,z=0.2), Point(x=5,y=0,z=0.2, extrude=True)]\n`+
        `seq=[printer, extruder, geom, pts] + travel_to(Point(x=10,y=0,z=0.2)) + [Point(x=15,y=0,z=0.2, extrude=True)]\n`+
        `print(transform(seq)['gcode'])`,
    js: async (api) => {
      const { Point, Printer, Extruder, ExtrusionGeometry, transform, travel_to } = api
      const printer = new Printer({ print_speed: 1800, travel_speed: 6000 })
      const extruder = new Extruder({ units: 'mm', dia_feed: 1.75, relative_gcode: false, travel_format: 'G1_E0' })
      const geom = new ExtrusionGeometry({ area_model: 'rectangle', width: 0.4, height: 0.2 })
      const pts = [ new Point({ x:0, y:0, z:0.2 }), new Point({ x:5, y:0, z:0.2, extrude:true }) ]
      const seq = [printer, extruder, geom, pts, ...travel_to(new Point({ x:10, y:0, z:0.2 })), new Point({ x:15, y:0, z:0.2, extrude:true })]
      return transform(seq).gcode
    }
  }
]

function detectPython() {
  const candidates = ['python', 'python3', 'py']
  for (const cmd of candidates) {
    const r = spawnSync(cmd, ['-V'], { encoding: 'utf-8' })
    if (r.status === 0) return cmd
  }
  return null
}

const PYTHON_CMD = detectPython()
if (!PYTHON_CMD) {
  console.error('No Python interpreter found (tried python, python3, py). Install Python or adjust PATH.')
  process.exit(2)
}

function runPython(code) {
  const r = spawnSync(PYTHON_CMD, ['-c', code], { encoding: 'utf-8' })
  if (r.error) throw r.error
  if (r.status !== 0) throw new Error('Python failed: '+r.stderr)
  return r.stdout.trim()
}

async function runJs(builder) {
  const api = await import(dist)
  return (await builder(api)).trim()
}

function diffLines(aStr, bStr) {
  const a = aStr.split(/\r?\n/)
  const b = bStr.split(/\r?\n/)
  const max = Math.max(a.length, b.length)
  const diffs = []
  for (let i=0;i<max;i++) {
    if (a[i] !== b[i]) diffs.push({ line: i+1, py: a[i]||'', js: b[i]||'' })
  }
  return diffs
}

;(async () => {
  let failures = 0
  for (const c of cases) {
    process.stdout.write(`Case: ${c.name} ... `)
    try {
      const pyOut = runPython(c.py)
      const jsOut = await runJs(c.js)
      if (pyOut === jsOut) {
        console.log('OK')
      } else {
        console.log('DIFF')
        const diffs = diffLines(pyOut, jsOut)
        for (const d of diffs.slice(0,20)) {
          console.log(` line ${d.line}\n   PY: ${d.py}\n   JS: ${d.js}`)
        }
        if (diffs.length > 20) console.log(` ... ${diffs.length-20} more differing lines`)
        failures++
      }
    } catch (e) {
      console.log('ERROR')
      console.error(e)
      failures++
    }
  }
  if (failures) { console.error(`\n${failures} case(s) failed`); process.exit(1) }
  else console.log('\nAll comparison cases matched.')
})()
