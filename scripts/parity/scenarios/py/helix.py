import fullcontrol as fc
from math import tau

# Create a helix using helixZ
centre_point = fc.Point(x=50, y=50, z=0)
start_radius = 10
end_radius = 10
start_angle = 0
n_turns = 5
pitch_z = 0.4
segments = 320
clockwise = True

steps = fc.helixZ(centre_point, start_radius, end_radius, start_angle, n_turns, pitch_z, segments, clockwise)

res = fc.transform(steps, result_type='gcode')
print(res)
