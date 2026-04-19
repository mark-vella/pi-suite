import { describe, expect, it } from "vite-plus/test";
import {
  FIREWORKS_PROVIDER_CONFIG,
  FIREWORKS_PROVIDER_NAME,
  MODELS,
  registerFireworksProvider,
} from "./index";

describe("FIREWORKS_PROVIDER_CONFIG", () => {
  it("exposes the parsed Fireworks model list", () => {
    expect(MODELS.length).toBeGreaterThan(0);
    expect(FIREWORKS_PROVIDER_CONFIG).toMatchObject({
      api: "openai-completions",
      apiKey: "FIREWORKS_AI_API_KEY",
      authHeader: true,
      baseUrl: "https://api.fireworks.ai/inference/v1",
      models: MODELS,
    });
  });

  it("registers the provider with pi", () => {
    const calls: Array<[string, typeof FIREWORKS_PROVIDER_CONFIG]> = [];

    registerFireworksProvider({
      registerProvider(name, config) {
        calls.push([name, config]);
      },
    });

    expect(calls).toEqual([[FIREWORKS_PROVIDER_NAME, FIREWORKS_PROVIDER_CONFIG]]);
  });
});
