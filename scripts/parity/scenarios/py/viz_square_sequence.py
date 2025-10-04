import fullcontrol as fc
import json

# Square with color gradient test
steps = []

side_length = 20
layer_height = 0.2
start_x, start_y = 50, 50

# Starting position
steps.append(fc.Point(x=start_x, y=start_y, z=layer_height))

# Square corners
steps.append(fc.Point(x=start_x + side_length, y=start_y, z=layer_height))
steps.append(fc.Point(x=start_x + side_length, y=start_y + side_length, z=layer_height))
steps.append(fc.Point(x=start_x, y=start_y + side_length, z=layer_height))
steps.append(fc.Point(x=start_x, y=start_y, z=layer_height))

# Get raw plot data with print_sequence color
plot_data = fc.transform(steps, result_type='plot', controls=fc.PlotControls(raw_data=True, color_type='print_sequence'))

# Convert to JSON
output = {
    'paths': [],
    'boundingBox': {
        'minx': plot_data.bounding_box.minx,
        'maxx': plot_data.bounding_box.maxx,
        'midx': plot_data.bounding_box.midx,
        'rangex': plot_data.bounding_box.rangex,
        'miny': plot_data.bounding_box.miny,
        'maxy': plot_data.bounding_box.maxy,
        'midy': plot_data.bounding_box.midy,
        'rangey': plot_data.bounding_box.rangey,
        'minz': plot_data.bounding_box.minz,
        'maxz': plot_data.bounding_box.maxz,
        'midz': plot_data.bounding_box.midz,
        'rangez': plot_data.bounding_box.rangez
    },
    'annotations': plot_data.annotations
}

for path in plot_data.paths:
    output['paths'].append({
        'xvals': path.xvals,
        'yvals': path.yvals,
        'zvals': path.zvals,
        'colors': path.colors,
        'widths': path.widths,
        'heights': path.heights,
        'extruder': {'on': path.extruder.on}
    })

print(json.dumps(output, indent=2))
