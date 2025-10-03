import fullcontrol as fc

# Test combination of multiple state changes
steps = []

# Initial point
steps.append(fc.Point(x=30, y=30, z=0.2))

# Change multiple settings
steps.append(fc.Printer(print_speed=1500))
steps.append(fc.ExtrusionGeometry(area_model='rectangle', width=0.5, height=0.25))
steps.append(fc.Fan(speed_percent=75))

# Move
steps.append(fc.Point(x=40, y=30, z=0.2))

# Change more settings
steps.append(fc.Hotend(temp=215))
steps.append(fc.Printer(print_speed=2500))

# Move
steps.append(fc.Point(x=50, y=30, z=0.2))

# Travel move
steps.append(fc.Extruder(on=False))
steps.append(fc.Point(x=60, y=30, z=0.2))

# Resume printing
steps.append(fc.Extruder(on=True))
steps.append(fc.Point(x=70, y=30, z=0.2))

res = fc.transform(steps, result_type='gcode')
print(res)
