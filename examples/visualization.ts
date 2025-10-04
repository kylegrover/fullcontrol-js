/**
 * Visualization System Example
 * 
 * Demonstrates how to generate structured plot data for external rendering.
 * The visualization system has complete parity with Python FullControl.
 */

import { Point, Extruder, ExtrusionGeometry, transform, PlotData } from '../src/index';

// Example 1: Basic visualization with Z-gradient colors
function basicVisualization() {
  const steps = [
    new Point({ x: 0, y: 0, z: 0 }),
    new Point({ x: 10, y: 0, z: 0 }),
    new Point({ x: 10, y: 10, z: 0.2 }),
    new Point({ x: 0, y: 10, z: 0.4 }),
  ];

  const result = transform(steps, 'plot', {
    raw_data: true,
    color_type: 'z_gradient' // Blue (low Z) → Red (high Z)
  });

  console.log('=== Basic Visualization (Z-Gradient) ===');
  if (result.plot && result.plot instanceof PlotData) {
    console.log(JSON.stringify(result.plot.toJSON(), null, 2));
  }
}

// Example 2: Print sequence colors
function printSequenceColors() {
  const steps = [
    new Point({ x: 0, y: 0, z: 0 }),
    new Point({ x: 5, y: 0, z: 0 }),
    new Point({ x: 10, y: 0, z: 0 }),
    new Point({ x: 15, y: 0, z: 0 }),
  ];

  const result = transform(steps, 'plot', {
    raw_data: true,
    color_type: 'print_sequence' // Cyan (start) → Magenta (end)
  });

  console.log('\n=== Print Sequence Colors ===');
  if (result.plot && result.plot instanceof PlotData) {
    console.log(JSON.stringify(result.plot.toJSON(), null, 2));
  }
}

// Example 3: Multiple paths with travel moves
function pathSegmentation() {
  const steps = [
    new Point({ x: 0, y: 0, z: 0 }),
    new Point({ x: 10, y: 0, z: 0 }),
    new Extruder({ on: false }), // Travel move
    new Point({ x: 20, y: 0, z: 0 }),
    new Extruder({ on: true }),  // Resume extrusion
    new Point({ x: 20, y: 10, z: 0 }),
  ];

  const result = transform(steps, 'plot', {
    raw_data: true,
    color_type: 'print_sequence'
  });

  console.log('\n=== Path Segmentation (Travel Moves) ===');
  if (result.plot && result.plot instanceof PlotData) {
    const plotData = result.plot.toJSON();
    console.log(`Number of paths: ${plotData.paths.length}`);
    plotData.paths.forEach((path: any, i: number) => {
      console.log(`Path ${i + 1}: ${path.extruder ? 'EXTRUSION' : 'TRAVEL'} - ${path.xvals.length} points`);
      console.log(`  Colors: ${path.extruder ? 'gradient' : 'gray'}`);
    });
  }
}

// Example 4: Variable extrusion geometry
function variableGeometry() {
  const steps = [
    new Point({ x: 0, y: 0, z: 0 }),
    new ExtrusionGeometry({ width: 0.6, height: 0.3 }),
    new Point({ x: 10, y: 0, z: 0 }),
    new ExtrusionGeometry({ width: 0.4, height: 0.2 }),
    new Point({ x: 10, y: 10, z: 0 }),
  ];

  const result = transform(steps, 'plot', {
    raw_data: true,
    color_type: 'z_gradient'
  });

  console.log('\n=== Variable Extrusion Geometry ===');
  if (result.plot && result.plot instanceof PlotData) {
    const plotData = result.plot.toJSON();
    const path = plotData.paths[0];
    console.log('Widths:', path.widths);
    console.log('Heights:', path.heights);
  }
}

// Example 5: Bounding box calculation
function boundingBox() {
  const steps = [
    new Point({ x: -5, y: -10, z: 0 }),
    new Point({ x: 15, y: 5, z: 2 }),
    new Point({ x: 10, y: 20, z: 1 }),
  ];

  const result = transform(steps, 'plot', {
    raw_data: true,
    color_type: 'z_gradient'
  });

  console.log('\n=== Bounding Box ===');
  if (result.plot && result.plot instanceof PlotData) {
    const bbox = result.plot.toJSON().boundingBox;
    console.log('X range:', bbox.minx, '→', bbox.maxx, '(mid:', bbox.midx, ', range:', bbox.rangex + ')');
    console.log('Y range:', bbox.miny, '→', bbox.maxy, '(mid:', bbox.midy, ', range:', bbox.rangey + ')');
    console.log('Z range:', bbox.minz, '→', bbox.maxz, '(mid:', bbox.midz, ', range:', bbox.rangez + ')');
  }
}

// Example 6: Fluctuating colors
function fluctuatingColors() {
  const steps = Array.from({ length: 20 }, (_, i) => 
    new Point({ x: i, y: Math.sin(i * 0.5) * 5, z: 0 })
  );

  const result = transform(steps, 'plot', {
    raw_data: true,
    color_type: 'print_sequence_fluctuating' // Oscillating rainbow
  });

  console.log('\n=== Fluctuating Colors ===');
  if (result.plot && result.plot instanceof PlotData) {
    const colors = result.plot.toJSON().paths[0].colors;
    console.log('First 5 colors:');
    colors.slice(0, 5).forEach((color: number[], i: number) => {
      console.log(`  Point ${i}: RGB(${color[0].toFixed(3)}, ${color[1].toFixed(3)}, ${color[2].toFixed(3)})`);
    });
  }
}

// Run all examples
console.log('FullControl Visualization System Examples\n');
basicVisualization();
printSequenceColors();
pathSegmentation();
variableGeometry();
boundingBox();
fluctuatingColors();

console.log('\n=== Export for External Renderer ===');
console.log('Use result.plot.toJSON() to export data for Three.js, WebGL, or other renderers.');
console.log('Each path contains arrays of coordinates, colors, and extrusion dimensions.');
