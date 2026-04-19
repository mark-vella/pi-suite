import { z } from "zod";

/** Schema for a provider model configuration used by the Fireworks AI provider. */
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

/** Schema for the generated models.json file containing the model list and metadata. */
export const ModelsFileSchema = z.object({
  generatedAt: z.string(),
  models: z.array(ProviderModelConfigSchema),
});
