/**
 * Runtime-neutral assertions backed by `node:assert/strict` (available in
 * Node, Bun, and Deno). Replaces the `deno.land/std` import so the test suite
 * runs identically across runtimes.
 */
import { deepStrictEqual, ok } from "node:assert/strict";

export function assertEquals(actual: unknown, expected: unknown, msg?: string) {
  deepStrictEqual(actual, expected, msg);
}

export function assert(cond: unknown, msg?: string): asserts cond {
  ok(cond, msg);
}

export function fail(msg = "Expected to fail"): never {
  throw new Error(msg);
}
