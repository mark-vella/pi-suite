# @markvella/pi-fireworks-ai

Fireworks AI provider extension for pi.

## Install

### From npm

```bash
pi install npm:@markvella/pi-fireworks-ai
```

### From this repo (local checkout)

From the repo root:

```bash
pi install ./extensions/pi-fireworks-ai
```

Use `-l` if you want it in project-local settings instead of global settings:

```bash
pi install -l ./extensions/pi-fireworks-ai
```

## Configure

You can configure the API key with either an environment variable or pi's `auth.json`.

### Option A: environment variable

Make sure pi is started in a shell/session that inherits the variable:

```bash
export FIREWORKS_AI_API_KEY=your_api_key
```

### Option B: pi auth file (`auth.json`)

Add a `fireworks` entry (the provider name) to pi's auth file (`~/.pi/agent/auth.json` by default):

```json
{
  "fireworks": { "type": "api_key", "key": "your_api_key" }
}
```

> If both `auth.json` and `FIREWORKS_AI_API_KEY` are set, pi uses the `auth.json` entry.
>
> If you customized pi's agent directory (for example via `PI_CODING_AGENT_DIR` or SDK configuration), use the `auth.json` file in that agent directory instead of `~/.pi/agent/auth.json`.

Then start pi and select a `fireworks/...` model.

## Refresh model metadata

The bundled model list is generated from the Fireworks API.

```bash
FIREWORKS_API_KEY=... FIREWORKS_ACCOUNT_ID=... npx vp run @markvella/pi-fireworks-ai#generate-models
```
