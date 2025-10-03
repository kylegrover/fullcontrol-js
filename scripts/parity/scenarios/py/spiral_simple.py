import fullcontrol as fc
from math import tau

# Create a spiral using spiralXY
centre_point = fc.Point(x=50, y=50, z=0.2)
start_radius = 10
end_radius = 8
start_angle = 0
n_turns = 5
segments = 320
clockwise = True

steps = fc.spiralXY(centre_point, start_radius, end_radius, start_angle, n_turns, segments, clockwise)

res = fc.transform(steps, result_type='gcode')
print(res)
