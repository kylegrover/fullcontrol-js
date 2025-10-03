import fullcontrol as fc

# Test varying extrusion geometry during print
steps = []
steps.append(fc.Point(x=30, y=30, z=0.2))
steps.append(fc.ExtrusionGeometry(area_model='rectangle', width=0.4, height=0.2))
steps.append(fc.Point(x=40, y=30, z=0.2))
steps.append(fc.ExtrusionGeometry(area_model='rectangle', width=0.6, height=0.3))
steps.append(fc.Point(x=50, y=30, z=0.2))
steps.append(fc.ExtrusionGeometry(area_model='circle', diameter=0.5))
steps.append(fc.Point(x=60, y=30, z=0.2))

res = fc.transform(steps, result_type='gcode')
print(res)
