import fullcontrol as fc
from math import tau

start = fc.Point(x=0, y=0, z=0)
vec = fc.Vector(x=1, y=0, z=0)
sq = fc.squarewaveXY(start, vec, 5, 2, 3)
tr = fc.trianglewaveXYpolar(start, 0, 5, 2, 3)
si = fc.sinewaveXYpolar(start, tau/4, 5, 10, 2)

steps = sq + tr + si
res = fc.transform(steps, result_type='gcode')
print(res)
