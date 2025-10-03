import fullcontrol as fc

# Test fan and temperature control
steps = []
steps.append(fc.Point(x=30, y=30, z=0.2))
steps.append(fc.Fan(speed_percent=50))
steps.append(fc.Point(x=40, y=30, z=0.2))
steps.append(fc.Hotend(temp=205))
steps.append(fc.Point(x=50, y=30, z=0.2))
steps.append(fc.Fan(speed_percent=100))
steps.append(fc.Point(x=60, y=30, z=0.2))
steps.append(fc.Buildplate(temp=80, wait=False))
steps.append(fc.Point(x=70, y=30, z=0.2))

res = fc.transform(steps, result_type='gcode')
print(res)
