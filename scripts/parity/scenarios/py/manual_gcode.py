import fullcontrol as fc

# Test ManualGcode insertion
steps = []
steps.append(fc.Point(x=30, y=30, z=0.2))
steps.append(fc.ManualGcode(text="G4 P2000 ; pause for 2 seconds"))
steps.append(fc.Point(x=40, y=30, z=0.2))
steps.append(fc.ManualGcode(text="G4 P1000 ; pause for 1 second"))
steps.append(fc.Point(x=50, y=30, z=0.2))

res = fc.transform(steps, result_type='gcode')
print(res)
