import fullcontrol as fc
import json

# Test extruder on/off creating multiple paths and travel colors
steps = [
    fc.Point(x=0, y=0, z=0.2),
    fc.Extruder(on=True),
    fc.Point(x=10, y=0, z=0.2),
    fc.Extruder(on=False),
    fc.Point(x=10, y=10, z=0.2),  # travel move
    fc.Extruder(on=True),
    fc.Point(x=20, y=10, z=0.2),
    fc.Extruder(on=False)
]

# Get raw plot data with z_gradient color (default)
plot_data = fc.transform(steps, result_type='plot', controls=fc.PlotControls(raw_data=True, color_type='z_gradient'))

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
