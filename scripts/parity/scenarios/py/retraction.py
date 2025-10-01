from fullcontrol import Point, Printer, Extruder, ExtrusionGeometry, PrinterCommand, transform

printer = Printer(print_speed=1800, travel_speed=6000)
extruder = Extruder(units='mm', dia_feed=1.75, relative_gcode=False, travel_format='G1_E0')
geom = ExtrusionGeometry(area_model='rectangle', width=0.45, height=0.2)
# Use printer command IDs 'retract' / 'unretract' that map to G10/G11 (device profiles) where configured.
seq = [
    printer,
    extruder,
    geom,
    Point(x=0,y=0,z=0.2),
    Extruder(on=True),
    Point(x=20,y=0,z=0.2),
    Extruder(on=False),
    PrinterCommand(id='retract'),
    Point(x=25,y=5,z=0.2),
    PrinterCommand(id='unretract'),
    Extruder(on=True),
    Point(x=25,y=25,z=0.2),
    Extruder(on=False)
]
res = transform(seq, result_type='gcode')
print(res)
