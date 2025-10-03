import fullcontrol as fc

# Test initialization_data with custom settings
steps = []
steps.append(fc.Point(x=30, y=30, z=0.2))
steps.append(fc.Point(x=60, y=30, z=0.2))

initial_settings = {
    "print_speed": 2000,
    "travel_speed": 4000,
    "nozzle_temp": 280,
    "bed_temp": 80,
    "fan_percent": 40,
}

gcode_controls = fc.GcodeControls(initialization_data=initial_settings)
res = fc.transform(steps, 'gcode', gcode_controls)
print(res)
