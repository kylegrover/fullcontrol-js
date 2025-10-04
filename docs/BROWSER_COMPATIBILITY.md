# Browser Compatibility

FullControl.js is designed to work in both Node.js and browser environments.

## Key Design Decisions

### No File System Dependencies in Core Code

The library avoids importing Node.js-specific modules (`fs`, `path`, etc.) in the main codebase to ensure browser compatibility.

**Exception**: Some utility functions support optional file system operations in Node.js:
- `import_design()` - Can load design JSON from file path (Node.js only) or JSON string (works everywhere)
- These use dynamic `require()` wrapped in runtime checks to avoid bundler issues

### Import Printer

The `import_printer()` function works in both environments:

```typescript
import { import_printer } from 'fullcontrol'

// Works in browser and Node.js
const printer = import_printer('generic', {
  nozzle_temp: 200,
  bed_temp: 60,
  fan_percent: 100
})
```

**Note**: The Python library mapping feature (reading `library.json` files) is disabled for browser compatibility. Printer slugs are normalized automatically instead.

### Import Design

The `import_design()` function accepts JSON strings or file paths:

**Node.js** (file path support):
```typescript
import { import_design, build_default_registry } from 'fullcontrol'

const registry = build_default_registry()

// Load from file path (Node.js only)
const design = import_design(registry, './my-design.json')
```

**Browser** (JSON string only):
```typescript
import { import_design, build_default_registry } from 'fullcontrol'

const registry = build_default_registry()

// Option 1: Load from API
const response = await fetch('/api/designs/123')
const jsonString = await response.text()
const design = import_design(registry, jsonString)

// Option 2: From localStorage
const jsonString = localStorage.getItem('my-design')
const design = import_design(registry, jsonString)

// Option 3: User file upload
const fileInput = document.querySelector('input[type="file"]')
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const jsonString = await file.text()
  const design = import_design(registry, jsonString)
  // Use design...
})
```

**Why no File System Access API?**
Browser file systems work differently than Node.js - they require user interaction (file picker dialogs) and are async-only. The current design is simpler and more flexible: your app handles file loading however makes sense for your use case, then passes the JSON string to `import_design()`.

## Testing Browser Compatibility

Run the test suite:

```bash
npm run build
node test-browser-compat.mjs
```

## Bundler Configuration

The library should work with any modern bundler (webpack, rollup, vite, esbuild) without special configuration. The dynamic `require()` statements are guarded and won't execute in browser contexts.
