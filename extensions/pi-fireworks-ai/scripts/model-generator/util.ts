/**
 * Utility functions for the Fireworks AI model generator.
 *
 * Provides environment variable access, API fetching,
 * model mapping, and file I/O operations.
 */

import { Result } from "better-result";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import {
  type FireworksModel,
  type FireworksModelsResponse,
  type ProviderModelConfig,
  FireworksListResponse,
  ModelsFileSchema,
} from "./schema.js";
import { EnvError, ApiError, ResponseParseError, OutputWriteError } from "./error.js";
import {
  OUTPUT_PATH,
  SKIP_PATTERNS,
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_MAX_TOKENS,
} from "./constants.js";

/**
 * Retrieves and validates an environment variable.
 * Returns an error if missing or empty.
 */
export function getEnv(key: string): Result<string, EnvError> {
  const value = process.env[key];

  if (!value?.trim()) {
    return Result.err(new EnvError({ key, message: `Missing environment variable: ${key}` }));
  }

  return Result.ok(value);
}

/**
 * Checks if a model should be skipped based on its ID or name.
 * Filters out embedding, image-gen, tts, and other non-inference models.
 */
function shouldSkipModel(id: string, name?: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(id) || (name && pattern.test(name)));
}

/**
 * Extracts pricing information from a Fireworks model.
 * Prefers top-level `pricing`, falls back to `cost`.
 */
function extractPricing(model: FireworksModel): ProviderModelConfig["cost"] {
  const pricing = model.pricing ?? model.cost;

  return {
    input: pricing?.input ?? 0,
    output: pricing?.output ?? 0,
    cacheRead: pricing?.cache_read ?? 0,
    cacheWrite: pricing?.cache_write ?? 0,
  };
}

/**
 * Determines input modalities supported by a model.
 * Always includes text; adds image for vision models.
 */
function extractInputCapabilities(model: FireworksModel): ProviderModelConfig["input"] {
  const input: ProviderModelConfig["input"] = ["text"];
  if (model.supports_vision === true) {
    input.push("image");
  }
  return input;
}

/**
 * Maps a Fireworks API model to the ProviderModelConfig format.
 * Returns null for non-inference model types (embedding, image-gen, tts, etc.).
 */
export function mapModel(model: FireworksModel): ProviderModelConfig | null {
  const id = model.id;

  if (shouldSkipModel(id, model.name)) {
    return null;
  }

  const reasoning = model.supports_reasoning ?? false;
  const input = extractInputCapabilities(model);
  const cost = extractPricing(model);
  const contextWindow = model.context_length ?? DEFAULT_CONTEXT_WINDOW;
  const maxTokens =
    model.max_output_tokens ?? model.max_tokens ?? Math.min(contextWindow, DEFAULT_MAX_TOKENS);
  const name = model.name || id.split("/").pop() || id;

  return {
    id,
    name,
    reasoning,
    input,
    cost,
    contextWindow,
    maxTokens,
  };
}

/**
 * Fetches the list of models from the Fireworks API for a given account.
 */
export async function fetchModels(
  apiKey: string,
  accountId: string,
): Promise<Result<FireworksModelsResponse, ApiError | ResponseParseError>> {
  const url = `https://api.fireworks.ai/v1/accounts/${accountId}/models`;

  return Result.tryPromise({
    try: async () => {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new ApiError({
          status: res.status,
          message: `Fireworks API returned ${res.status}: ${res.statusText}`,
        });
      }

      const json = await res.json();
      const parsed = FireworksListResponse.safeParse(json);

      if (!parsed.success) {
        throw new ResponseParseError({
          message: "Fireworks API response failed validation",
          errors: parsed.error.issues,
        });
      }

      return parsed.data;
    },
    catch: (e: unknown): ApiError | ResponseParseError => {
      if (e instanceof ApiError) {
        return e;
      }

      if (e instanceof ResponseParseError) {
        return e;
      }

      return new ApiError({
        status: 0,
        message: `Network or fetch error: ${String(e)}`,
      });
    },
  });
}

/**
 * Writes the validated model list to the output JSON file.
 */
export function writeOutput(models: ProviderModelConfig[]): Result<void, OutputWriteError> {
  const payload = ModelsFileSchema.parse({
    generatedAt: new Date().toISOString(),
    models,
  });

  return Result.try({
    try: () => {
      writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + "\n");
    },
    catch: (e) =>
      new OutputWriteError({
        message: "Failed to write models.json",
        cause: e,
      }),
  });
}

/**
 * Loads the previously generated models.json.
 * Returns an empty array if the file doesn't exist or is invalid.
 */
export function loadExistingModels(): ProviderModelConfig[] {
  if (!existsSync(OUTPUT_PATH)) {
    return [];
  }
  try {
    const raw = readFileSync(OUTPUT_PATH, "utf-8");
    const parsed = ModelsFileSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data.models : [];
  } catch {
    return [];
  }
}

/**
 * Computes the difference between existing and new model lists.
 */
export function computeModelDiff(existing: ProviderModelConfig[], mapped: ProviderModelConfig[]) {
  const existingIds = new Set(existing.map((m) => m.id));
  const newIds = new Set(mapped.map((m) => m.id));

  const added = mapped.filter((m) => !existingIds.has(m.id));
  const removed = existing.filter((m) => !newIds.has(m.id));
  const changed = mapped.filter((m) => {
    const prev = existing.find((e) => e.id === m.id);
    return prev ? JSON.stringify(prev) !== JSON.stringify(m) : false;
  });

  return { added, removed, changed };
}

/**
 * Logs model diff information to the console.
 */
export function logModelDiff(
  added: ProviderModelConfig[],
  removed: ProviderModelConfig[],
  changed: ProviderModelConfig[],
): void {
  if (added.length > 0) {
    console.log(`\n✨ New models (${added.length}):`);
    for (const m of added) {
      console.log(`  + ${m.name} (${m.id})`);
    }
  }

  if (removed.length > 0) {
    console.log(`\n🗑️ Removed models (${removed.length}):`);
    for (const m of removed) {
      console.log(`  - ${m.name} (${m.id})`);
    }
  }

  if (changed.length > 0) {
    console.log(`\n🔄 Changed models (${changed.length}):`);
    for (const m of changed) {
      console.log(`  ~ ${m.name} (${m.id})`);
    }
  }

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    console.log("\n✅ No changes detected.");
  }
}

/**
 * Logs a single model's details to the console.
 */
export function logModelDetails(model: ProviderModelConfig): void {
  console.log(`  ${model.name} (${model.id})`);
  console.log(
    `    reasoning=${model.reasoning} input=[${model.input.join(",")}] ctx=${model.contextWindow} max=${model.maxTokens}`,
  );
  console.log(
    `    cost: in=$${model.cost.input} out=$${model.cost.output} cacheRead=$${model.cost.cacheRead} cacheWrite=$${model.cost.cacheWrite}`,
  );
}
