import fullcontrol as fc
from math import tau

# Create a hexagon using polygonXY
centre_point = fc.Point(x=50, y=50, z=0.2)
enclosing_radius = 10
start_angle = 0
sides = 6
clockwise = True

steps = fc.polygonXY(centre_point, enclosing_radius, start_angle, sides, clockwise)

res = fc.transform(steps, result_type='gcode')
print(res)
