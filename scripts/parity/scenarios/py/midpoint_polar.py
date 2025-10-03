import fullcontrol as fc

# Test midpoint and polar_to_point geometry functions
from math import tau

pt1 = fc.Point(x=40, y=40, z=0.2)
pt2 = fc.Point(x=40, y=60, z=0.2)
pt3 = fc.polar_to_point(pt2, 15, tau/8)
pt4 = fc.midpoint(pt1, pt2)

steps = [pt1, pt2, pt3, pt4]

res = fc.transform(steps, result_type='gcode')
print(res)
