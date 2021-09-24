/**
 * Optionals v1.0.2
 */

export const None = Symbol(`None`);
export const Err = Symbol(`Error`);
export type OptionalGeneric<T> = T | symbol;
export type Option<T> = OptionalGeneric<T>;
export type Result<T> = OptionalGeneric<T>;

/**
 * A handler to take and match new symbols
 */
class SymbolHandler {
    private values: Set<symbol>;
    constructor() {
        this.values = new Set([None, Err]);
    }

    /**
     * Add a new symbol to match on
     *
     * @param s an instance of a symbol
     */
    add(s: symbol): void {
        this.values.add(s);
    }

    /**
     * Test if the SymbolHandler contains a symbol
     */
    contain(e: OptionalGeneric<unknown>): boolean {
        return this.values.has(e as symbol);
    }
}

export const Symbols = new SymbolHandler();

/**
 * A generic function with one argument.
 */
type OneArgFn<T, U> = (value: T) => U;

/**
 * A generic function without arguments.
 */
type NoArgFn<T> = () => T;

/**
 * Returns the contained Ok or Some value.
 * Note: Only use if value is not an Error or None as this will throw an error (see unwrap_or).
 *
 * @param value an `Option<T>` or `Result<T>`
 */
export function unwrap(value: OptionalGeneric<unknown>): unknown {
    if (Symbols.contain(value)) throw `unwrap on symbol.`;
    else return value;
}

/**
 * Either returns the contained Ok/Some value or returns fallback value.
 *
 * @param value an `Option<T>` or `Result<T>`
 * @param fallback a fallback value of type `T`
 */
export function unwrapOr(
    value: Option<unknown> | Result<unknown>,
    fallback: unknown
): unknown {
    return Symbols.contain(value) ? fallback : value;
}

/**
 * Returns the contained Some value or computes new value from function.
 *
 * @param valuean an `Option<T>` or `Result<T>`
 * @param fn
 */
export function unwrapOrElse(
    value: Option<unknown> | Result<unknown>,
    fn: NoArgFn<unknown>
): unknown {
    if (Symbols.contain(value)) return fn();
    else return value;
}

/**
 * Maps a Result Option to a new value, leaving Error or None values untouched.
 *
 * @param value an `Option<T>` or `Result<T>`
 * @param fn
 */
export function map(
    value: Option<unknown> | Result<unknown>,
    fn: OneArgFn<unknown, unknown>
): Option<unknown> | Result<unknown> {
    if (Symbols.contain(value)) return None;
    else return fn(value);
}

/**
 * Either computes a new value or returns fallback value if Err or None.
 *
 * @param value an `Option<T>` or `Result<T>`
 * @param fallback a fallback value of type `T`
 * @param fn
 */
export function mapOr(
    value: Option<unknown> | Result<unknown>,
    fallback: unknown,
    fn: OneArgFn<unknown, unknown>
): unknown {
    if (Symbols.contain(value)) return fallback;
    else return fn(value);
}

/**
 * Asserts whether given value is None
 *
 * @param value Value that is either `Some<T>` or `None`
 */
export function isNone(value: Option<unknown>): value is typeof None {
    return value === None;
}

/**
 * Asserts whether given value is Some
 *
 * @param value Value that is either `Some<T>` or `None`
 */
export function isSome(value: Option<unknown>): boolean {
    return value !== None;
}

/**
 * Asserts whether given value is an Error
 *
 * @param value Value that is either `Ok<T>` or an `Error`
 */
export function isErr(value: Option<unknown>): boolean {
    return value === Err;
}

/**
 * Asserts whether given value is Ok
 *
 * @param value Value that is either `Ok<T>` or an `Error`
 */
export function isOk(value: Option<unknown>): boolean {
    return value !== Err;
}
