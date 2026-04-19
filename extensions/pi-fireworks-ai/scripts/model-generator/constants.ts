/**
 * Constants and configuration for the model generator.
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/** Directory containing this script, used for resolving relative paths. */
export const __scriptDir = dirname(fileURLToPath(import.meta.url));

/** Path where the generated models.json file is written. */
export const OUTPUT_PATH = resolve(__scriptDir, "..", "src", "models.json");

/** Regex patterns for model IDs to skip (non-inference types). */
export const SKIP_PATTERNS: readonly RegExp[] = [
  /embed/i,
  /image[-_]?gen/i,
  /tts/i,
  /stt/i,
  /whisper/i,
  /asr/i,
  /rerank/i,
  /clip/i,
  /dall/i,
  /audio/i,
] as const;

/** Default context window when not specified by the model. */
export const DEFAULT_CONTEXT_WINDOW = 131_072;

/** Default max tokens when not specified by the model. */
export const DEFAULT_MAX_TOKENS = 16_384;
