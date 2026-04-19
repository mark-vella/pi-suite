/**
 * Type definitions for the Fireworks AI model generator.
 *
 * This file contains types that are NOT derived from Zod schemas.
 * Types derived from schemas are exported from schema.ts.
 */

/**
 * Statistics about model changes between generations.
 */
export interface ModelDiffStats {
  added: number;
  removed: number;
  changed: number;
}

/**
 * Options for the model generation process.
 */
export interface GenerateOptions {
  /** Fireworks API key for authentication */
  apiKey: string;
  /** Fireworks account ID */
  accountId: string;
  /** Whether to log progress to console */
  verbose?: boolean;
}
