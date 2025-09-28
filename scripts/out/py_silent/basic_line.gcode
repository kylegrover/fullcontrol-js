warning - the list of steps should be a 1D list of fullcontrol class instances, it currently includes a 'list'
   - fc.flatten() is being used to convert the design to a 1D list
warning: printer is not set - defaulting to 'generic', which does not initialize the printer with proper start gcode
   - use fc.transform(..., controls=fc.GcodeControls(printer_name='generic') to disable this message or set it to a real printer name

fc.transform guidance tips are being written to screen if any potential issues are found - hide tips with fc.transform(..., show_tips=False)
tip: set initial `extrusion_width` and `extrusion_height` in the initialization_data to ensure the correct amount of material is extruded:
   - `fc.transform(..., controls=fc.GcodeControls(initialization_data={'extrusion_width': EW, 'extrusion_height': EH}))`

; GCode created with FullControl - tell us what you're printing!
; info@fullcontrol.xyz or tag FullControlXYZ on Twitter/Instagram/LinkedIn/Reddit/TikTok
M83 ; relative extrusion
G0 F8000 X0 Y0 Z0.2
M82 ; absolute extrusion
G92 E0 ; reset extrusion position to zero
G1 F1800 X10 E0.374177
