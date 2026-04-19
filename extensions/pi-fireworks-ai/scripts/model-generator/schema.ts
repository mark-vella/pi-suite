/**
 * Zod schemas and derived types for Fireworks AI model data.
 *
 * These schemas validate the Fireworks API response and define
 * the structure of the generated models.json file.
 */

import { z } from "zod";

/** Schema for Fireworks model pricing/cost information. */
export const FireworksCost = z
  .object({
    input: z.coerce.number().min(0).optional(),
    output: z.coerce.number().min(0).optional(),
    cache_read: z.coerce.number().min(0).optional(),
    cache_write: z.coerce.number().min(0).optional(),
  })
  .passthrough();

/** Schema for a single Fireworks model returned by the API. */
export const FireworksModelSpec = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    model_type: z.enum(["base", "peft", "router"]).optional(),
    created: z.number().optional(),
    /** Pricing */
    cost: FireworksCost.optional(),
    pricing: FireworksCost.optional(),
    /** Context & Output limits */
    context_length: z.coerce.number().min(0).optional(),
    max_tokens: z.coerce.number().min(0).optional(),
    max_output_tokens: z.coerce.number().min(0).optional(),
    /** Capabilities */
    supports_function_calling: z.boolean().optional(),
    supports_reasoning: z.boolean().optional(),
    supports_vision: z.boolean().optional(),
    supports_audio: z.boolean().optional(),
    supports_streaming: z.boolean().optional(),
    /** Deployment state */
    status: z.string().optional(),
    is_deprecated: z.boolean().optional(),
    /** Ownership */
    owned_by: z.string().optional(),
    /** Route info for router models */
    route: z
      .object({
        models: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .passthrough();

/** Schema for the Fireworks API models list response. */
export const FireworksListResponse = z
  .object({
    object: z.string().optional(),
    data: z.array(FireworksModelSpec),
  })
  .passthrough();

/** Schema for the ProviderModelConfig structure written to models.json. */
export const ProviderModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  reasoning: z.boolean(),
  input: z.array(z.enum(["text", "image"])),
  cost: z.object({
    input: z.number(),
    output: z.number(),
    cacheRead: z.number(),
    cacheWrite: z.number(),
  }),
  contextWindow: z.number(),
  maxTokens: z.number(),
});

export const ModelsFileSchema = z.object({
  generatedAt: z.string(),
  models: z.array(ProviderModelConfigSchema),
});

/** Provider model configuration written to models.json. */
export type ProviderModelConfig = z.infer<typeof ProviderModelConfigSchema>;

/** Parsed Fireworks API model specification. */
export type FireworksModel = z.infer<typeof FireworksModelSpec>;

/** Parsed Fireworks API list response. */
export type FireworksModelsResponse = z.infer<typeof FireworksListResponse>;
