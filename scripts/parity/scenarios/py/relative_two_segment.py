# Parity scenario: relative extrusion mode with two extruded segments.
# Tests M83 handling and E value increments vs JS.
from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform

printer = Printer(print_speed=1500, travel_speed=5000)
extruder = Extruder(units='mm', dia_feed=1.75, relative_gcode=True, travel_format='G1_E0')
geom = ExtrusionGeometry(area_model='rectangle', width=0.5, height=0.25)

seq = [
    printer,
    extruder,
    geom,
    Point(x=0,y=0,z=0.2),
    Extruder(on=True),
    Point(x=15,y=0,z=0.2),
    Extruder(on=False),
    Point(x=15,y=5,z=0.2),  # travel move
    Extruder(on=True),
    Point(x=30,y=5,z=0.2),
    Extruder(on=False)
]

res = transform(seq, result_type='gcode')
print(res)
