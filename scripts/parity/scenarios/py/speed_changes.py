import fullcontrol as fc

# Test speed changes during print
steps = []
steps.append(fc.Point(x=30, y=30, z=0.2))
steps.append(fc.Printer(print_speed=1000))
steps.append(fc.Point(x=40, y=30, z=0.2))
steps.append(fc.Printer(print_speed=2000))
steps.append(fc.Point(x=50, y=30, z=0.2))
steps.append(fc.Printer(travel_speed=8000))
steps.append(fc.Extruder(on=False))
steps.append(fc.Point(x=60, y=30, z=0.2))
steps.append(fc.Extruder(on=True))
steps.append(fc.Point(x=70, y=30, z=0.2))

res = fc.transform(steps, result_type='gcode')
print(res)
