# Visualization System

FullControl's visualization system generates structured plot data that can be used to render 3D toolpaths. This system has **complete parity** with the Python reference implementation.

## Overview

The visualization pipeline processes a sequence of FullControl steps and generates:
- **Paths**: Segmented arrays of coordinates, colors, and extrusion geometry
- **Bounding Box**: Calculated min/max/mid/range for X, Y, Z axes
- **Annotations**: Optional text labels at specific points

## Basic Usage

```typescript
import { Point, transform, PlotControls } from 'fullcontrol';

// Define your design
const steps = [
  new Point({ x: 0, y: 0, z: 0 }),
  new Point({ x: 10, y: 0, z: 0 }),
  new Point({ x: 10, y: 10, z: 0 }),
  new Point({ x: 0, y: 10, z: 0 })
];

// Generate plot data
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'z_gradient'
});

// Access the structured data
const plotData = result.plot; // PlotData instance
console.log(plotData.toJSON());
```

## Result Type: `'plot'`

Use `result_type = 'plot'` to generate visualization data:

```typescript
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'print_sequence'
});

// Result contains:
// - result.plot: PlotData instance with paths, bounding box, annotations
```

## Color Types

### 1. Z-Gradient (default)

Colors transition from blue (lowest Z) to red (highest Z):

```typescript
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'z_gradient' // or omit (this is default)
});
```

**Color mapping:**
- Lowest Z → Blue `[0, 0, 1]`
- Highest Z → Red `[1, 0, 0]`
- Linear interpolation between

### 2. Print Sequence

Colors transition from cyan to magenta based on print order:

```typescript
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'print_sequence'
});
```

**Color mapping:**
- First point → Cyan `[0, 1, 1]`
- Last point → Magenta `[1, 0, 1]`
- Linear interpolation between

### 3. Print Sequence Fluctuating

Colors oscillate through the spectrum based on print order:

```typescript
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'print_sequence_fluctuating'
});
```

**Color mapping:**
- Uses `cos(t)` and `sin(t)` to create oscillating colors
- Creates rainbow-like effect through print sequence

### 4. Random Blue

Random shades of blue for each point:

```typescript
const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'random_blue'
});
```

**Color mapping:**
- Red channel: random between 0.3-0.5
- Green channel: random between 0.4-0.6
- Blue channel: random between 0.8-1.0

### 5. Travel Mode

Special color handling for travel (non-extruding) moves:

```typescript
// Automatically applies when extruder is off
// Travel moves → Gray [0.5, 0.5, 0.5]
// Extrusion moves → Use specified color_type
```

## PlotData Structure

The `PlotData` class contains:

```typescript
interface PlotData {
  paths: Path[];           // Array of path segments
  boundingBox: BoundingBox; // Calculated bounds
  annotations: any[];      // Text annotations
}
```

### Path Segments

Paths are automatically segmented when:
- Extruder turns on/off
- Coordinates change (with 0.001mm precision)

Each `Path` contains:

```typescript
interface Path {
  xvals: number[];   // X coordinates
  yvals: number[];   // Y coordinates
  zvals: number[];   // Z coordinates
  colors: number[][]; // RGB colors [0-1] for each point
  widths: number[];  // Extrusion widths
  heights: number[]; // Extrusion heights
  extruder: boolean; // true = extruding, false = travel
}
```

### Bounding Box

Automatically calculated from all points:

```typescript
interface BoundingBox {
  minx: number; // Minimum X coordinate
  maxx: number; // Maximum X coordinate
  miny: number;
  maxy: number;
  minz: number;
  maxz: number;
  midx: number; // Midpoint X = (min + max) / 2
  midy: number;
  midz: number;
  rangex: number; // Range X = max - min
  rangey: number;
  rangez: number;
}
```

## JSON Export

Export plot data to JSON for external rendering:

```typescript
const plotData = result.plot;
const json = plotData.toJSON();

// JSON structure:
{
  "paths": [
    {
      "xvals": [0, 10, 10, 0],
      "yvals": [0, 0, 10, 10],
      "zvals": [0, 0, 0, 0],
      "colors": [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
      "widths": [0.4, 0.4, 0.4, 0.4],
      "heights": [0.2, 0.2, 0.2, 0.2],
      "extruder": true
    }
  ],
  "boundingBox": {
    "minx": 0, "maxx": 10, "midx": 5, "rangex": 10,
    "miny": 0, "maxy": 10, "midy": 5, "rangey": 10,
    "minz": 0, "maxz": 0, "midz": 0, "rangez": 0
  },
  "annotations": []
}
```

## Advanced Examples

### Multiple Paths with Travel Moves

```typescript
import { Point, Extruder, transform } from 'fullcontrol';

const steps = [
  new Point({ x: 0, y: 0, z: 0 }),
  new Point({ x: 10, y: 0, z: 0 }),
  new Extruder({ on: false }), // Travel move starts
  new Point({ x: 20, y: 0, z: 0 }),
  new Extruder({ on: true }),  // Extrusion resumes
  new Point({ x: 20, y: 10, z: 0 })
];

const result = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'print_sequence'
});

// Result contains 3 paths:
// 1. Extrusion path (0,0)→(10,0) [cyan colors]
// 2. Travel path (10,0)→(20,0) [gray colors]
// 3. Extrusion path (20,0)→(20,10) [magenta colors]
```

### Using PlotControls

Configure visualization settings explicitly:

```typescript
import { PlotControls } from 'fullcontrol';

const plotControls = new PlotControls({
  color_type: 'print_sequence_fluctuating',
  raw_data: true
});

const result = transform(steps, 'plot', plotControls);
```

### Combining with GcodeControls

Generate both G-code and plot data:

```typescript
import { GcodeControls } from 'fullcontrol';

const gcodeControls = new GcodeControls({
  printer_name: 'generic',
  initialization_data: {
    primer: 'front_lines_then_y',
    print_speed: 1000
  }
});

// Generate G-code
const gcodeResult = transform(steps, 'gcode', gcodeControls);
console.log(gcodeResult.gcode);

// Generate plot data
const plotResult = transform(steps, 'plot', {
  raw_data: true,
  color_type: 'z_gradient'
});
console.log(plotResult.plot.toJSON());
```

## Extrusion Geometry Handling

The visualization system automatically tracks extrusion width and height:

```typescript
import { ExtrusionGeometry } from 'fullcontrol';

const steps = [
  new Point({ x: 0, y: 0, z: 0 }),
  new ExtrusionGeometry({ width: 0.6, height: 0.3 }),
  new Point({ x: 10, y: 0, z: 0 }),
  new ExtrusionGeometry({ width: 0.4, height: 0.2 }),
  new Point({ x: 10, y: 10, z: 0 })
];

const result = transform(steps, 'plot', { raw_data: true });

// Paths will contain:
// - First segment: widths=[0.6, 0.6], heights=[0.3, 0.3]
// - Second segment: widths=[0.4, 0.4], heights=[0.2, 0.2]
```

**Priority Logic:**
1. If both `width` AND `height` are set → use them directly
2. Else if `diameter` is set → use it for both width and height
3. Else if `area` is set → calculate diameter from area

## Precision and Tolerances

The visualization system uses specific precision values:

- **Coordinates**: 3 decimal places (0.001mm precision)
- **Colors**: 3 decimal places for RGB channels
- **Geometry**: 3 decimal places for width/height

Points are only added to paths when coordinates change beyond precision threshold.

## Parity Testing

The visualization system has been extensively tested for parity with the Python reference implementation. See test scenarios in:

- `scripts/parity/scenarios/js/viz_*.mjs`
- `scripts/parity/scenarios/py/viz_*.py`

All tests pass with zero differences, confirming complete equivalence.

## Implementation Details

### Architecture

The visualization pipeline mirrors Python's architecture:

1. **Minimal State**: Uses a lightweight state object (not the full G-code State)
2. **No Primers**: Visualization processes only user steps, without primers/procedures
3. **Point Counting**: Tracks points to calculate accurate color gradients
4. **Path Segmentation**: Automatically creates new paths on extruder state changes

### Key Classes

- `src/pipeline/visualization-data.ts`: PlotData, Path, BoundingBox
- `src/pipeline/visualization-colors.ts`: Color calculation functions
- `src/pipeline/visualize.ts`: Main visualization pipeline
- `src/models/point.ts`: Point.visualize() method
- `src/models/extrusion.ts`: Extruder and ExtrusionGeometry visualization
- `src/models/controls.ts`: PlotControls configuration

## Performance Considerations

The visualization system is optimized for:

- **Memory efficiency**: Arrays are pre-allocated where possible
- **Coordinate precision**: Only adds points when coordinates actually change
- **Path segmentation**: Minimizes path count while maintaining accuracy

For very large designs (>100k points), consider:
- Using simpler color types (avoid random calculations)
- Processing in chunks if memory is constrained
- Exporting to JSON for external rendering engines
