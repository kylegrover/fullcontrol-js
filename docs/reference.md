# FullControl.js Library Reference

This document provides a concise reference for the FullControl.js library. It outlines the available classes, functions, and their primary uses.

## General Guidance

- **Immutability vs. Mutability**: While you can directly modify the properties of model objects (e.g., `point.x = 10`), most geometry functions that transform objects (like `move()` or `ramp_xyz()`) are immutable. They return new, modified instances of the objects instead of changing the originals. This allows for safer, more predictable transformations.
- **Chaining**: Most methods can be chained together for more readable and concise code.
- **Coordinate System**: The library uses a standard Cartesian coordinate system. The origin (0,0,0) is typically the center of the print bed.

## Core

### `FullControlModel`

The base class for creating 3D models.

- `constructor(settings: PrinterSettings)`: Creates a new model with the specified printer settings.
- `add(features: Feature[] | Feature)`: Adds one or more features to the model.
- `generateGCode()`: Generates the G-code for the model.
- `visualize()`: Generates data for visualization.

## Models

These are the data structures that represent the various parts of a 3D print.

### `Point`

Represents a point in 3D space.

- `x`, `y`, `z`: The coordinates of the point.
- `color`: An optional `[r, g, b]` array for visualization.
- `extrude`: A boolean indicating if the move to this point should be an extrusion move.
- `speed`: An optional speed override for the move to this point.

### `Vector`

Represents a vector in 3D space.

- `x`, `y`, `z`: The components of the vector.

### `ExtrusionGeometry`

Defines the shape and size of the extruded material.

- `area_model`: Can be `'rectangle'`, `'stadium'`, `'circle'`, or `'manual'`. The area is calculated based on this model.
- `width`, `height`: Dimensions for `'rectangle'` and `'stadium'`.
- `diameter`: For `'circle'`.
- `area`: For `'manual'`.

| Model | Parameters | Formula |
|---|---|---|
| `rectangle` | `width`, `height` | `width * height` |
| `stadium` | `width`, `height` | `(width - height) * height + PI * (height / 2)^2` |
| `circle` | `diameter` | `PI * (diameter / 2)^2` |
| `manual` | `area` | The area is set directly. |

### `StationaryExtrusion`

Represents an extrusion at a fixed point.

- `volume`: The volume of material to extrude.
- `speed`: The speed of the extrusion.

### `Extruder`

Controls the extruder.

- `on`: A boolean to turn the extruder on or off.
- `units`: Can be `'mm'` (filament length) or `'mm3'` (volume).
- `dia_feed`: The diameter of the filament.
- `relative_gcode`: A boolean for relative or absolute extrusion.
- `retraction_length`, `retraction_speed`: Default retraction settings.

### `Retraction` / `Unretraction`

Performs a retraction or unretraction move.

- `length`: Overrides the extruder's default retraction length.
- `speed`: Overrides the extruder's default retraction speed.

### `GcodeControls`

Controls for G-code generation.

- `printer_name`: The name of the printer to use (e.g., `'prusa_i3'`).
- `initialization_data`: Used to pass variables to a device profile, such as `{ nozzle_temp: 210 }`. Can also be used to select a primer, e.g., `{ primer: 'travel' }`.
- `save_as`: The filename for the generated G-code.
- `include_date`, `show_banner`, `show_tips`: Booleans to control the G-code header.
- `silent`: Suppresses console warnings and banners during generation.

### `PlotControls`

Controls for visualization.

- `color_type`: The coloring scheme for the visualization.
  - `'z_gradient'` (default): Blue (low Z) to Red (high Z).
  - `'print_sequence'`: Cyan (start) to Magenta (end).
  - `'print_sequence_fluctuating'`: Oscillating rainbow colors.
  - `'random_blue'`: Random shades of blue.
  - `'manual'`: Colors must be set manually on each `Point`.
- `style`: Can be `'tube'` or `'line'`.
- `hide_travel`, `hide_axes`: Booleans to control the visibility of travel moves and axes.

### `PrinterCommand`

Sends a pre-defined command to the printer.

- `id`: The ID of the command to send (e.g., `'home'`).

### `ManualGcode`

Injects raw G-code into the output.

- `text`: The G-code to inject.

### `GcodeComment`

Adds a comment to the G-code.

- `text`: The comment text.

### `Buildplate`

Controls the build plate temperature.

- `temp`: The target temperature.
- `wait`: A boolean to wait for the temperature to be reached.

### `Hotend`

Controls the hotend temperature.

- `temp`: The target temperature.
- `wait`: A boolean to wait for the temperature to be reached.
- `tool`: The tool index for multi-extruder printers.

### `Fan`

Controls the cooling fan.

- `speed_percent`: The fan speed from 0 to 100.

### `PlotAnnotation`

Adds an annotation to the visualization.

- `point`: The `Point` where the annotation should be placed.
- `label`: The text of the annotation.

### `Printer`

Defines printer-specific settings.

- `print_speed`, `travel_speed`: The speeds for printing and travel moves.
- `command_list`: A dictionary of custom printer commands (e.g., `{ home: 'G28' }`).
- `new_command`: A dictionary of new commands to add to the existing `command_list`.

## Geometry

Functions for creating and manipulating geometric shapes.

### Arcs

- `arcXY(centre, radius, start_angle, arc_angle, segments)`: Creates a circular arc in the XY plane.
- `variable_arcXY(centre, start_radius, start_angle, arc_angle, segments, radius_change, z_change)`: Creates an arc with changing radius and Z height.
- `elliptical_arcXY(centre, a, b, start_angle, arc_angle, segments)`: Creates an elliptical arc.
- `arcXY_3pt(p1, p2, p3, segments)`: Creates an arc that passes through three points.

### Measurement

- `distance(p1, p2)`: Calculates the distance between two points.
- `angleXY_between_3_points(start, mid, end)`: Calculates the angle between three points in the XY plane.
- `path_length(points)`: Calculates the total length of a path.

### Midpoint

- `midpoint(p1, p2)`: Finds the midpoint between two points.
- `interpolated_point(p1, p2, f)`: Finds a point interpolated between two points by a factor `f`.
- `centreXY_3pt(p1, p2, p3)`: Finds the center of a circle that passes through three points.

### Move

- `move(geometry, vector, copy, copy_quantity)`: Moves or copies geometry by a vector.
- `move_polar(geometry, centre, radius, angle, copy, copy_quantity)`: Moves or copies geometry in polar coordinates.

### Polar

- `polar_to_point(centre, radius, angle)`: Converts polar coordinates to a `Point`.
- `point_to_polar(target_point, origin_point)`: Converts a `Point` to polar coordinates.
- `polar_to_vector(length, angle)`: Converts polar coordinates to a `Vector`.

### Ramping

- `ramp_xyz(list, x_change, y_change, z_change)`: Applies a linear ramp to the coordinates of a list of points.
- `ramp_polar(list, centre, radius_change, angle_change)`: Applies a linear ramp to the polar coordinates of a list of points.

### Reflect

- `reflectXY(p, p1, p2)`: Reflects a point across a line defined by two other points.
- `reflectXYpolar(p, preflect, angle_reflect)`: Reflects a point across a line defined by a point and an angle.

### Segmentation

- `segmented_line(p1, p2, segments)`: Divides a line into a number of segments.
- `segmented_path(points, segments)`: Divides a path into a number of equal-length segments.

### Shapes

- `rectangleXY(start, x_size, y_size, cw)`: Creates a rectangle.
- `circleXY(centre, radius, start_angle, segments, cw)`: Creates a circle.
- `circleXY_3pt(p1, p2, p3, start_angle, start_at_first_point, segments, cw)`: Creates a circle that passes through three points.
- `ellipseXY(centre, a, b, start_angle, segments, cw)`: Creates an ellipse.
- `polygonXY(centre, enclosing_radius, start_angle, sides, cw)`: Creates a regular polygon.
- `spiralXY(centre, start_radius, end_radius, start_angle, n_turns, segments, cw)`: Creates a spiral.
- `helixZ(centre, start_radius, end_radius, start_angle, n_turns, pitch_z, segments, cw)`: Creates a helix.

### Travel

- `travel_to(geometry)`: Generates the steps to perform a travel move to the start of a geometry.

### Waves

- `squarewaveXY(start, direction_vector, amplitude, line_spacing, periods)`: Creates a square wave.
- `trianglewaveXY(start, direction_vector, amplitude, tip_separation, periods)`: Creates a triangle wave.
- `sinewaveXY(start, direction_vector, amplitude, period_length, periods)`: Creates a sine wave.

## Utility

Helper functions for various tasks.

### `check`

- `check(steps)`: Prints a summary of the types of steps in a design, warning about nested lists.

### `fix`

- `fix(steps, result_type, controls)`: Automatically flattens nested lists and ensures the first point has defined coordinates.

### `flatten`

- `flatten(steps)`: Flattens a nested list of steps into a single-level list.

### `linspace`

- `linspace(start, end, number_of_points)`: Generates a list of evenly spaced numbers over a specified interval.

### `points_only`

- `points_only(steps, track_xyz)`: Extracts all `Point` objects from a list of steps.

### `relative_point`

- `relative_point(reference, x_offset, y_offset, z_offset)`: Creates a new `Point` relative to a reference point or the last point in a list.

### `first_point` / `last_point`

- `first_point(steps)`: Returns the first `Point` in a list of steps.
- `last_point(steps)`: Returns the last `Point` in a list of steps.

### `export_design` / `import_design`

- `export_design(steps, filename)`: Serializes a design to a JSON string or file.
- `import_design(registry, jsonOrFilename)`: Deserializes a design from a JSON string or file.
- `build_default_registry()`: Returns a registry of all the built-in classes for use with `import_design`.

### `import_printer`

- `import_printer(printer_name, initialization_data)`: Dynamically imports and returns a printer profile. The profile contains `starting_procedure_steps` and `ending_procedure_steps` that should be added to your design.
- The `initialization_data` argument (e.g., `{ nozzle_temp: 210, bed_temp: 50 }`) overrides default settings and substitutes variables like `{nozzle_temp}` in the printer's G-code templates.

## Pipeline

These are the functions that generate the final output.

### `gcode`

- `gcode(steps, controls)`: Generates G-code from a list of steps.

### `visualize`

- `visualize(steps, controls)`: Generates visualization data from a list of steps.

### `transform`

- `transform(steps, controls)`: A general-purpose function that can be used to apply custom transformations to a design.
