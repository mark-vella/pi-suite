/**
 * Tagged error types for the Fireworks AI model generator.
 *
 * Uses better-result's TaggedError for structured error handling
 * with discriminated union support.
 */

import { TaggedError } from "better-result";
import { z } from "zod";

/** Error thrown when a required environment variable is missing or empty. */
export class EnvError extends TaggedError("EnvError")<{
  message: string;
  key: string;
}>() {}

/** Error thrown when the Fireworks API returns a non-OK response. */
export class ApiError extends TaggedError("ApiError")<{
  message: string;
  status: number;
}>() {}

/** Error thrown when the Fireworks API response fails Zod validation. */
export class ResponseParseError extends TaggedError("ResponseParseError")<{
  message: string;
  errors: z.ZodIssue[];
}>() {}

/** Error thrown when writing the generated models.json file fails. */
export class OutputWriteError extends TaggedError("OutputWriteError")<{
  message: string;
  cause: unknown;
}>() {}
