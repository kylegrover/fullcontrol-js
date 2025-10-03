# Publishing Guide

## Quick Reference

To publish a new version to npm:

```bash
npm run publish:npm
```

This will automatically:
1. Run parity tests (must pass)
2. Build the package
3. Run TypeScript type checking
4. Publish to npm

## Detailed Publishing Workflow

### 1. Pre-Release Checklist

- [ ] All parity tests passing: `npm run parity`
- [ ] Build succeeds: `npm run build`
- [ ] TypeScript checks pass: `npm run typecheck`
- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with changes (if exists)
- [ ] Update `pythonParity` field if Python reference version changed
- [ ] Review `README.md` for accuracy
- [ ] Test examples work: `node examples/basic-line.ts`

### 2. Version Bump

Follow semantic versioning:
- **Patch** (0.2.0 → 0.2.1): Bug fixes, minor updates
- **Minor** (0.2.0 → 0.3.0): New features, backward compatible
- **Major** (0.2.0 → 1.0.0): Breaking changes

Update `package.json`:
```json
"version": "0.2.1"
```

### 3. Commit and Tag

```bash
git add .
git commit -m "Release v0.2.1"
git tag v0.2.1
```

### 4. Dry Run (Optional but Recommended)

```bash
npm run publish:dry-run
```

This shows what will be published without actually publishing. Review the output:
- Package size
- Files included
- Version number

### 5. Publish

```bash
npm run publish:npm
```

Or manually:
```bash
npm publish --access public
```

### 6. Post-Publish

```bash
# Push to GitHub
git push origin main
git push --tags

# Verify on npm
npm view fullcontrol-js
```

## Authentication

If not logged in:
```bash
npm login
```

Verify authentication:
```bash
npm whoami
```

## Troubleshooting

### "You must verify your email"
- Check your npm account and verify your email address
- Run `npm login` again after verification

### "Version already published"
- Bump the version number in `package.json`
- Previous versions cannot be republished

### "Parity tests failing"
- Fix the failing tests before publishing
- Review changes in `src/` that may have broken parity
- Reference Python source code in `fullcontrol-py/`

### "Build errors"
- Run `npm run clean` then `npm run build`
- Check for TypeScript errors: `npm run typecheck`
- Verify all imports are correct

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build ESM, CJS, and TypeScript declarations |
| `npm run parity` | Run all parity tests against Python |
| `npm run typecheck` | Verify TypeScript types |
| `npm run publish:dry-run` | Show what would be published |
| `npm run publish:npm` | Publish to npm (with pre-checks) |
| `npm run clean` | Remove dist folder |

## Package Contents

The npm package includes:
- `dist/` - Compiled JavaScript (ESM + CJS) and type definitions
- `README.md` - Package documentation
- `license` - GPL-3.0 license file

The following are **excluded** from npm:
- Source TypeScript files (`src/`)
- Tests and parity scripts (`scripts/`, `fullcontrol-py/`)
- Development configs (`.gitignore`, `tsconfig.json`, etc.)
- Examples (`examples/`)

This is controlled by the `files` field in `package.json`.

## Release Checklist Template

Copy this for each release:

```markdown
## Release v0.X.X

- [ ] Version bumped in package.json
- [ ] All parity tests passing (7/7)
- [ ] Build successful
- [ ] TypeScript checks pass
- [ ] Changes documented
- [ ] Examples tested
- [ ] Committed and tagged
- [ ] Dry run reviewed
- [ ] Published to npm
- [ ] Pushed to GitHub with tags
- [ ] Verified on npm registry
```
