// deno-lint-ignore-file camelcase

export const None = Symbol(`None`);
export type Some<T> = T;
export type Ok<T> = T;
export type Option<T> = Some<T> | typeof None;
export type Result<T> = Ok<T> | Error;

/**
 * A generic function with one argument.
 */
type OneArgFn<T, U> = (value: T) => U;

/**
 * A generic function without arguments.
 */
type NoArgFn<T> = () => T;

export function unwrap(value: Option<unknown> | Result<unknown>): unknown {
    if (value === None || value instanceof Error)
        throw `Unexpected unwrap call.`;
    else return value;
}

export function unwrap_or(
    value: Option<unknown> | Result<unknown>,
    fallback: unknown
): unknown {
    return value === None || value instanceof Error ? fallback : value;
}

export function unwrap_or_else(
    value: Option<unknown>,
    fn: NoArgFn<unknown>
): unknown {
    if (value === None) return fn();
    else return value;
}

export function unwrap_err_or_else(
    value: Result<unknown>,
    fn: OneArgFn<unknown, unknown>
): unknown {
    if (value instanceof Error) return fn(value);
    else return value;
}

export function map<U>(
    value: Option<unknown> | Result<unknown>,
    fn: OneArgFn<unknown, unknown>
): Option<unknown> | Result<unknown> {
    if (value === None) return None;
    else return fn(value);
}

export function mapOr<U>(
    value: Option<unknown> | Result<unknown>,
    fallback: unknown,
    fn: OneArgFn<unknown, unknown>
): unknown {
    if (value === None || value instanceof Error) return fallback;
    else return fn(value);
}

/**
 * Asserts whether given value is None
 *
 * @param value Value that is either Some<T> or None
 */
export function isNone(value: Option<unknown>): value is typeof None {
    return value === None;
}

let x = None;

unwrap(x);

/**
 * Asserts whether given value is Some<T>
 *
 * @param value Value that is either Some<T> or None
 */
export function isSome(value: Option<unknown>): boolean {
    return value !== None;
}
