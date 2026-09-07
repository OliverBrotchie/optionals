/**
 * Deno-compat shim so the existing `*.test.ts` files (written against
 * `Deno.test`) run unchanged under `bun test`.
 *
 * Maps:
 *   - `Deno.test(name, fn)` -> `bun:test`'s `describe(name, fn)`
 *   - the `t.step(name, fn)` context -> `bun:test`'s `test(name, fn)`
 */
import { describe, test } from "bun:test";

interface StepContext {
  step: (name: string, fn: () => void | Promise<void>) => void;
}

(globalThis as { Deno?: unknown }).Deno = {
  test: (name: string, fn: (t: StepContext) => void | Promise<void>) => {
    return describe(name, () => {
      return fn({
        step: (label: string, body: () => void | Promise<void>) =>
          test(label, body),
      });
    });
  },
};
