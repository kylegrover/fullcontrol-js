import fullcontrol as fc

p1 = fc.Point(x=0, y=0, z=0)
p2 = fc.Point(x=10, y=10, z=0)

seg = fc.segmented_line(p1, p2, segments=5)
seg_path = fc.segmented_path(seg, segments=3)

moved = fc.move(seg_path, fc.Vector(x=5, y=5, z=5), copy=True, copy_quantity=2)
moved_polar = fc.move_polar(seg_path, p1, 5, 0, copy=True, copy_quantity=2)

steps = seg + seg_path + moved + moved_polar
res = fc.transform(steps, result_type='gcode')
print(res)
