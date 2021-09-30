/**
 * Optionals v1.0.4 - Soft Types
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
     * @param s An instance of a symbol.
     */
    add(s: symbol): void {
        this.values.add(s);
    }

    /**
     * Test if the SymbolHandler contains a symbol
     */
    contain<T>(e: OptionalGeneric<T>): e is symbol {
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
 * @param value An `Option<T>` or `Result<T>`.
 */
export function unwrap<T>(value: OptionalGeneric<T>): T {
    if (Symbols.contain(value)) throw `unwrap on symbol.`;
    else return value;
}

/**
 * Either returns the contained Ok/Some value or returns fallback value.
 *
 * @param value An `Option<T>` or `Result<T>`.
 * @param fallback a Fallback value of type `T`.
 */
export function unwrapOr<T, U>(value: OptionalGeneric<T>, fallback: U): T | U {
    return Symbols.contain(value) ? fallback : value;
}

/**
 * Returns the contained Some value or computes new value from function.
 *
 * @param value An `Option<T>` or `Result<T>`.
 * @param fn
 */
export function unwrapOrElse<T, U>(
    value: OptionalGeneric<T>,
    fn: NoArgFn<U>
): T | U {
    if (Symbols.contain(value)) return fn();
    else return value;
}

/**
 * Maps a Result Option to a new value, leaving Error or None values untouched.
 *
 * @param value An `Option<T>` or `Result<T>`
 * @param fn
 */
export function map<T, U>(
    value: OptionalGeneric<T>,
    fn: OneArgFn<T, U>
): OptionalGeneric<U> {
    if (Symbols.contain(value)) return value;
    else return fn(value);
}

/**
 * Either computes a new value or returns fallback value if Err or None.
 *
 * @param value An `Option<T>` or `Result<T>`.
 * @param fallback a Fallback value of type `T`.
 * @param fn
 */
export function mapOr<T, U, F>(
    value: OptionalGeneric<T>,
    fallback: F,
    fn: OneArgFn<T, U>
): F | U {
    if (Symbols.contain(value)) return fallback;
    else return fn(value);
}

/**
 * Asserts whether given value is None.
 *
 * @param value Value that is either `Some<T>` or `None`.
 */
export function isNone<T>(value: Option<T>): value is symbol {
    return value === None;
}

/**
 * Asserts whether given value is Some.
 *
 * @param value Value that is either `Some<T>` or `None`.
 */
export function isSome<T>(value: Option<T>): value is T {
    return value !== None;
}

/**
 * Asserts whether given value is an Error.
 *
 * @param value Value that is either `Ok<T>` or An `Error`.
 */
export function isErr<T>(value: Result<T>): value is symbol {
    return value === Err;
}

/**
 * Asserts whether given value is Ok.
 *
 * @param value Value that is either `Ok<T>` or An `Error`.
 */
export function isOk<T>(value: Result<T>): value is T {
    return value !== Err;
}
