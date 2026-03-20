import fullcontrol as fc

pts = [fc.Point(x=i*5, y=0, z=0) for i in range(5)]
r_z = fc.ramp_xyz(list(pts), z_change=5)
r_p = fc.ramp_polar(list(pts), fc.Point(x=0, y=0, z=0), radius_change=10)

steps = pts + r_z + r_p
res = fc.transform(steps, result_type='gcode')
print(res)
