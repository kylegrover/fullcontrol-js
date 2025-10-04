# Known Parity Differences

This document describes known differences between the Python and JavaScript implementations of FullControl. These differences are either cosmetic (formatting only) or represent improvements in the JavaScript version.

## Non-Semantic Differences (Functionally Equivalent)

### 1. Coordinate Omission Optimization (polygon test)

The JavaScript implementation uses a small epsilon (1e-10) when comparing coordinates to determine if they should be omitted from G-code. This catches cases where coordinates are mathematically equal but differ at the bit level due to floating point precision artifacts.

**Example**:
```gcode
# Python output (line 4):
G1 X45 Y41.339746 E0.332601

# JavaScript output (line 4):
G1 X45 E0.332601
```

Both lines 3 and 4 move to Y=41.339746. Python includes Y on both lines because the underlying float values differ by ~1e-14 (a floating point artifact from trigonometric calculations). JavaScript recognizes these as equivalent within printing precision and omits the redundant Y parameter.

**Impact**: 
- **Functional**: None - both produce identical toolpaths
- **File size**: JavaScript G-code is slightly smaller (better)
- **Print quality**: Identical

### 2. Initialization Data Spacing (initialization_data test)

Python sometimes produces double spaces in temperature commands. We're considering this a cosmetic difference for now.

**Example**:
```gcode
# Python:
M109 S280  

# JavaScript:
M109 S280 
```

**Impact**: None - G-code parsers ignore extra whitespace

## Summary

Current parity test results: **19 PASS, 1 WARN, 1 FAIL***

\* The 1 FAIL (polygon) is a false positive - JavaScript is actually correctly omitting redundant coordinates that Python includes due to floating point artifacts.

All tests produce functionally equivalent G-code with identical printing behavior.
