import "server-only";

import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { AuthError, DomainError } from "@/lib/auth/errors";

/**
 * Uniform return type of every server action. `error` is a message key under
 * `errors.*` in messages/*.json; `fieldErrors` keys are form field names.
 */
export type ActionResult<T = void> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Wraps action bodies: maps auth/validation/domain errors, rethrows redirects/notFound. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AuthError) return { ok: false, error: error.code };
    if (error instanceof DomainError) return { ok: false, error: error.code };
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: "validation",
        fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
      };
    }
    console.error("[action] unexpected error", error);
    return { ok: false, error: "unexpected" };
  }
}
