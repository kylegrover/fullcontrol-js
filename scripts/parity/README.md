# Parity Test Harness (Script Pair Style)

Each test scenario consists of two scripts with the same base name:
- `parity/scenarios/py/<name>.py` – produces Python G-code to stdout
- `parity/scenarios/js/<name>.mjs` – produces JS G-code to stdout

A runner discovers pairs, executes both, normalizes output, and reports diffs with tolerances.

## Adding a Scenario
1. Create `<name>.py` using the real Python FullControl API. End by `print(gcode_string)`.
2. Create `<name>.mjs` using the JS API (import from built dist or src in dev). End by `process.stdout.write(gcode + '\n')`.
3. Run `npm run parity` (added script) to see comparison.

## Normalization Rules (initial)
- Trim trailing whitespace
- Ignore blank final line differences
- Numeric fields (X,Y,Z,E,F) parsed and compared with tolerances from config
- Comments identical or ignored if they match known banner/tips patterns

## Tolerances (defaults)
```
coordinate: 0.0005
extrusion: 0.000001
feedrate: 1 (exact unless small rounding)
```

## Exit Codes
- 0: All pairs pass or only formatting diffs (non-semantic)
- 1: Any semantic diff (opcode change, missing line, numeric outside tolerance)

## Future Enhancements
- Baseline snapshot store per Python version
- Category-based failure thresholds
- HTML / Markdown diff artifact
- Performance metrics recording
