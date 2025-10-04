#!/usr/bin/env node
// Execute a JS parity scenario script and emit normalized G-code lines as JSON
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf-8'))
const ignorePatterns = config.ignoreCommentPatterns.map(p=> new RegExp(p))

const scenario = process.argv[2]
if(!scenario){
  console.error('Usage: run_js_scenario.mjs <scenario_name>')
  process.exit(2)
}
const scriptPath = path.join(root, 'scenarios', 'js', `${scenario}.mjs`)
if(!fs.existsSync(scriptPath)){
  process.stdout.write(JSON.stringify({ scenario, error: 'Scenario not found'}))
  process.exit(0)
}

// Minimal: compile TypeScript entry to dist once using npx tsc if dist missing.
function ensureDist(){
  const projectRoot = path.join(root,'..','..')
  const distFile = path.join(projectRoot,'dist','index.js')
  if(fs.existsSync(distFile)) return distFile
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const tsc = spawnSync(npxCmd, ['tsc','-p','tsconfig.json'], { cwd: projectRoot, encoding:'utf-8' })
  if(tsc.status !== 0){
    // fallback: directly execute src (may fail with .ts ESM, but we tried)
    return path.join(projectRoot,'src','index.ts')
  }
  return distFile
}
const moduleEntry = ensureDist()
const res = spawnSync(process.execPath, [scriptPath], { encoding: 'utf-8', env: { ...process.env, FULLCONTROL_JS_ENTRY: pathToFileURL(moduleEntry).href } })
if(res.status !== 0){
  process.stdout.write(JSON.stringify({ scenario, error: res.stderr || 'Runtime error'}))
  process.exit(0)
}
const raw = res.stdout

// Check if this is a visualization test (starts with viz_)
if(scenario.startsWith('viz_')){
  // Visualization tests output JSON directly
  try {
    const plotData = JSON.parse(raw)
    process.stdout.write(JSON.stringify({ scenario, plot_data: plotData }))
  } catch(e) {
    process.stdout.write(JSON.stringify({ scenario, error: 'JSON parse error: ' + e.message }))
  }
  process.exit(0)
}

const lines = raw.split(/\r?\n/).map(l=> l.replace(/\s+$/,'')).filter(l=> l.trim().length)
const norm = []
for(const ln of lines){
  if(ln.startsWith(';')){
    if(ignorePatterns.some(p=> p.test(ln))) continue
  }
  norm.push(ln)
}
process.stdout.write(JSON.stringify({ scenario, lines: norm }))
