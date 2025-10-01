# Parity scenario: two separated extrusion segments with a travel move between.
# Tests travel feedrate handling, coordinate suppression, and E continuity vs JS.
from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, transform

printer = Printer(print_speed=1600, travel_speed=7000)
extruder = Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom = ExtrusionGeometry(area_model='rectangle', width=0.42, height=0.2)

seq = [
    printer,
    extruder,
    geom,
    Point(x=0,y=0,z=0.2),
    Extruder(on=True),
    Point(x=12,y=0,z=0.2),
    Extruder(on=False),
    Point(x=12,y=8,z=0.2),  # travel
    Extruder(on=True),
    Point(x=25,y=8,z=0.2),
    Extruder(on=False)
]

res = transform(seq, result_type='gcode')
print(res)
