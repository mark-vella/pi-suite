#!/usr/bin/env npx tsx

/**
 * Generate Fireworks AI model list from the Fireworks API.
 *
 * Fetches models from https://api.fireworks.ai/v1/accounts/{account_id}/models,
 * validates the response, maps to ProviderModelConfig format, and writes
 * a JSON file consumed by the extension at runtime.
 *
 * Environment variables:
 *   FIREWORKS_API_KEY     - API key for authentication (required)
 *   FIREWORKS_ACCOUNT_ID  - Fireworks account ID (required)
 */

import { Result } from "better-result";
import {
  getEnv,
  fetchModels,
  mapModel,
  writeOutput,
  loadExistingModels,
  computeModelDiff,
  logModelDiff,
  logModelDetails,
} from "./util.js";
import { OUTPUT_PATH } from "./constants.js";
import type { ProviderModelConfig } from "./schema.js";

/**
 * Main entry point: fetches models, maps to provider format, and writes output.
 */
async function main(): Promise<void> {
  console.log("🔥 Fireworks AI Model List Generator\n");

  const result = await Result.gen(async function* () {
    const apiKey = yield* getEnv("FIREWORKS_API_KEY");
    const accountId = yield* getEnv("FIREWORKS_ACCOUNT_ID");

    console.log(`Account: ${accountId}`);
    console.log(`Fetching models from Fireworks API...\n`);

    const response = yield* Result.await(fetchModels(apiKey, accountId));

    console.log(`API returned ${response.data.length} models\n`);

    // Map and filter models
    const mapped: ProviderModelConfig[] = response.data
      .map(mapModel)
      .filter((m): m is ProviderModelConfig => m !== null);

    console.log(`Mapped ${mapped.length} chat/inference models:\n`);

    for (const m of mapped) {
      logModelDetails(m);
    }

    // Compare with existing
    const existing = loadExistingModels();
    const { added, removed, changed } = computeModelDiff(existing, mapped);

    logModelDiff(added, removed, changed);

    yield* writeOutput(mapped);

    return Result.ok(mapped.length);
  });

  result.match({
    ok: (count) => {
      console.log(`\n✅ Successfully wrote ${count} models to ${OUTPUT_PATH}`);
    },
    err: (error) => {
      console.error(`\n❌ Generation failed:`, error);
      process.exit(1);
    },
  });
}

void main();
