M83 ; relative extrusion
G0 F8000 X0 Y0 Z0.2
M82 ; absolute extrusion
G92 E0 ; reset extrusion position to zero
G1 F1800 X20 E0.748353
G10 ; retract
G1 F6000 X25 Y5 E0.748353
G11 ; unretract
G1 F1800 Y25 E1.496706
