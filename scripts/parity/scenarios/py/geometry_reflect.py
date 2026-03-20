import fullcontrol as fc
from math import tau

pts = [fc.Point(x=10, y=5, z=0.2), fc.Point(x=20, y=15, z=0.4)]
p1 = fc.Point(x=0, y=0, z=0)
p2 = fc.Point(x=10, y=0, z=0)
p3 = fc.Point(x=0, y=10, z=0)

ref_x = [fc.reflectXY(p, p1, p2) for p in pts]
ref_y = [fc.reflectXY(p, p1, p3) for p in pts]
ref_p = [fc.reflectXYpolar(p, fc.Point(x=15, y=10, z=0), tau/4) for p in pts]

steps = list(pts) + list(ref_x) + list(ref_y) + list(ref_p)
res = fc.transform(steps, result_type='gcode')
print(res)
