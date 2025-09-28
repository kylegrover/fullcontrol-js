# Devices & Dynamic Loading

Devices (printer profiles) encapsulate: start / end procedures, temperature & fan initialization, primer selection defaults, and command list definitions.

In Python this is handled by `fullcontrol/gcode/import_printer.py` and device modules under `devices/community/singletool`. The JS port mirrors this at:
- `src/devices/community/singletool/*.ts`
- `src/devices/community/singletool/import_printer.ts`
- `src/devices/community/singletool/library.json` (mapping names to modules or gcode templates)

## Usage
```ts
import { import_printer } from 'fullcontrol-js'
const printerProfile = await import_printer('generic', { nozzle_temp: 210, bed_temp: 45 })
const init = printerProfile.initialization_data
const steps = [ ...init.starting_procedure_steps, /* design steps */, ...init.ending_procedure_steps ]
const { gcode } = transform(steps)
```

## Variable Substitution
When a library entry provides fallback `start_gcode` / `end_gcode` strings, `{key}` tokens are replaced using merged `initialization_data` (user overrides win). Example variables: `nozzle_temp`, `bed_temp`, `fan_percent`.

## Command List Extension
Add new commands dynamically:
```ts
steps.push(new Printer({ new_command: { park: 'G27 ; park head' } }))
```
Commands are merged into `printer.command_list` at gcode generation time.

## Parity Notes
- Single-tool community devices ported 1:1.
- Multi-tool support: planned; Python base class reference will guide design.
- Banner / tips intentionally stdout-only vs embedded lines for cleaner diffs.
