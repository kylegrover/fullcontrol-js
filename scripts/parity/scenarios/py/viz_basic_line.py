import fullcontrol as fc
import json

# Simple line visualization test - matches basic_line but with plot output
printer = fc.Printer(print_speed=1800, travel_speed=6000)
extruder = fc.Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom = fc.ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)

seq = [
    printer,
    extruder,
    geom,
    fc.Point(x=0, y=0, z=0.2),
    fc.Extruder(on=True),
    fc.Point(x=10, y=0, z=0.2),
    fc.Extruder(on=False)
]

# Get raw plot data
plot_data = fc.transform(seq, result_type='plot', controls=fc.PlotControls(raw_data=True))

# Convert to JSON-serializable format
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
