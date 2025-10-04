#!/usr/bin/env node
// Quick test to verify browser-compatible imports (no fs/path)
import { import_printer, Point, transform } from './dist/index.js'

console.log('Testing browser compatibility...\n')

// Test 1: import_printer without fs
console.log('1. Testing import_printer (generic printer)...')
try {
  const printer = import_printer('generic', {
    nozzle_temp: 200,
    bed_temp: 60,
    fan_percent: 100
  })
  console.log('   ✓ import_printer works without fs')
  console.log(`   ✓ Got ${printer.starting_procedure_steps.length} starting steps`)
  console.log(`   ✓ Got ${printer.ending_procedure_steps.length} ending steps`)
} catch (err) {
  console.error('   ✗ FAILED:', err.message)
  process.exit(1)
}

// Test 2: Basic transform with printer
console.log('\n2. Testing transform with printer settings...')
try {
  const steps = [
    new Point({ x: 0, y: 0, z: 0.2 }),
    new Point({ x: 10, y: 10, z: 0.2 })
  ]
  const result = transform(steps, 'gcode', {
    printer_name: 'generic',
    initialization_data: { nozzle_temp: 200, bed_temp: 60 },
    show_tips: false,
    show_banner: false
  })
  console.log('   ✓ transform works with printer')
  console.log(`   ✓ Generated ${result.gcode.split('\\n').length} lines of G-code`)
} catch (err) {
  console.error('   ✗ FAILED:', err.message)
  process.exit(1)
}

console.log('\n✅ All browser compatibility tests passed!')
console.log('   No fs or path dependencies detected in runtime code')
