import fullcontrol as fc
from math import tau

# Test variable_arcXY with radius and z changes
centre_point = fc.Point(x=50, y=50, z=0)
radius = 10
start_angle = 0
arc_angle = 0.75 * tau
segments = 64
radius_change = -6
z_change = 2.0

steps = fc.variable_arcXY(centre_point, radius, start_angle, arc_angle, segments, radius_change, z_change)

res = fc.transform(steps, result_type='gcode')
print(res)
