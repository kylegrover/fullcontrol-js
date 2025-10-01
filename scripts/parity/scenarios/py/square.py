
# Define the printer settings to override the default settings (shown below)
printer_name = 'generic'
printer_settings = {
    'primer': 'travel',
    'print_speed': 40*60,  # mm/min
    'travel_speed': 80*60,  # mm/min
    'nozzle_temp': 210,
    'bed_temp': 50,
    'fan_percent': 100,
    'extrusion_width': 0.4,
    'extrusion_height': 0.2
}

# Define square parameters
side_length = 20
layer_height = 0.2
line_width = 0.4

# Starting position
start_x, start_y = 50, 50

# Create the square
steps.append(fc.Point(x=start_x, y=start_y, z=layer_height))

# Square corners
steps.append(fc.Point(x=start_x + side_length, y=start_y, z=layer_height))
steps.append(fc.Point(x=start_x + side_length, y=start_y + side_length, z=layer_height))
steps.append(fc.Point(x=start_x, y=start_y + side_length, z=layer_height))
steps.append(fc.Point(x=start_x, y=start_y, z=layer_height))