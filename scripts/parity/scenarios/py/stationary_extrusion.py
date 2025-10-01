# Parity scenario: stationary extrusion(s) at a single XY location.
# Exercises E-only (or Z+E) lines and feedrate consistency vs JS.
from fullcontrol import Point, Printer, Extruder, StationaryExtrusion, transform

printer = Printer(print_speed=900, travel_speed=5000)
extruder = Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')

seq = [
    printer,
    extruder,
    Point(x=5, y=5, z=0.2),
    StationaryExtrusion(volume=2.0, speed=900),
    Point(x=5, y=5, z=0.5),
    StationaryExtrusion(volume=3.0, speed=900),
]

res = transform(seq, result_type='gcode')
print(res)
