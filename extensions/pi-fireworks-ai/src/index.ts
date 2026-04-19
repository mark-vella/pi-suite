/**
 * Fireworks AI Provider Extension
 *
 * Provides access to Fireworks AI inference models through OpenAI-compatible API.
 *
 * The model list is generated from the Fireworks API by `scripts/model-generator/index.ts`
 * and written to `src/models.json`. Run the generator to refresh the list:
 *
 *   FIREWORKS_API_KEY=... FIREWORKS_ACCOUNT_ID=... npx vp run @markvella/pi-fireworks-ai#generate-models
 *
 * A GitHub Actions workflow also refreshes the list daily.
 *
 * Usage:
 *   export FIREWORKS_AI_API_KEY=your_api_key
 *   pi
 *   # Then select model with /model or --model fireworks/...
 */

import type { ExtensionAPI, ProviderModelConfig } from "@mariozechner/pi-coding-agent";
import modelsData from "./models.json" with { type: "json" };
import { ModelsFileSchema } from "./schema";

type RegisterProviderAPI = Pick<ExtensionAPI, "registerProvider">;

/**
 * Fireworks AI API base URL for OpenAI-compatible inference endpoints.
 */
const FIREWORKS_API_BASE_URL = "https://api.fireworks.ai/inference/v1";

export const FIREWORKS_PROVIDER_NAME = "fireworks";

/**
 * Available Fireworks AI models with their configurations.
 * Generated from the Fireworks API — see scripts/model-generator/index.ts
 */
export const MODELS: ProviderModelConfig[] = ModelsFileSchema.parse(modelsData).models;

export const FIREWORKS_PROVIDER_CONFIG: Parameters<RegisterProviderAPI["registerProvider"]>[1] = {
  baseUrl: FIREWORKS_API_BASE_URL,
  apiKey: "FIREWORKS_AI_API_KEY",
  api: "openai-completions",
  authHeader: true,
  models: MODELS,
};

/**
 * Registers the Fireworks AI provider with the PI coding agent.
 * Configures the provider to use OpenAI-compatible API endpoints with
 * API key authentication via the FIREWORKS_AI_API_KEY environment variable.
 */
export function registerFireworksProvider(pi: RegisterProviderAPI): void {
  pi.registerProvider(FIREWORKS_PROVIDER_NAME, FIREWORKS_PROVIDER_CONFIG);
}

export default function (pi: ExtensionAPI) {
  registerFireworksProvider(pi);
}
