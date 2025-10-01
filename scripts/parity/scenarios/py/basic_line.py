from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform

printer = Printer(print_speed=1800, travel_speed=6000)
extruder = Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom = ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)
# Use explicit on/off extruder toggles (Python style)
seq = [
    printer,
    extruder,
    geom,
    Point(x=0,y=0,z=0.2),
    Extruder(on=True),
    Point(x=10,y=0,z=0.2),
    Extruder(on=False)
]
res = transform(seq, result_type='gcode')
print(res)
