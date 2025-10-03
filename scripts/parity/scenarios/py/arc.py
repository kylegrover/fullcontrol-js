import fullcontrol as fc
from math import tau

# Create an arc using arcXY
centre_point = fc.Point(x=50, y=50, z=0.2)
radius = 10
start_angle = 0
arc_angle = 0.75 * tau
segments = 64

steps = fc.arcXY(centre_point, radius, start_angle, arc_angle, segments)

res = fc.transform(steps, result_type='gcode')
print(res)
