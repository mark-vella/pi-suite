# pi-suite

Monorepo for developing and releasing pi extensions as independently published npm packages.

## Workspace model

- `extensions/*` contains one publishable npm package per pi extension.
- Each extension package declares its own `pi.extensions` array in its own `package.json`.
- The workspace root is private and only coordinates development, validation, and releases.
- Extension packages ship TypeScript source directly for pi.

## Development

Install dependencies:

```bash
npx vp install
```

Validate the full repo:

```bash
vp run ready
```

Run a package task:

```bash
vp run @markvella/pi-fireworks-ai#test
vp run @markvella/pi-fireworks-ai#generate-models
```

## Release management

This repo uses Changesets for independent package versioning and npm publishing.

Create a release note:

```bash
vp run changeset
```

Version packages:

```bash
vp run version-packages
```

Publish packages:

```bash
vp run release
```

## Current packages

- `@markvella/pi-fireworks-ai`
