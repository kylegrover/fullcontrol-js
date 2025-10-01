# Parity scenario: rectangular perimeter (closed loop) with four extrusion segments.
# Mirrors tutorial style: explicit extruder on/off, absolute extrusion mode.
from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform

printer = Printer(print_speed=1800, travel_speed=6000)
extruder = Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom = ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)

w = 20
h = 10
z = 0.2

seq = [
    printer,
    extruder,
    geom,
    Point(x=0, y=0, z=z),
    Extruder(on=True),
    Point(x=w, y=0, z=z),
    Point(x=w, y=h, z=z),
    Point(x=0, y=h, z=z),
    Point(x=0, y=0, z=z),  # close loop
    Extruder(on=False)
]

res = transform(seq, result_type='gcode')
print(res)
