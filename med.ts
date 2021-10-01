/**
 * A Rust-like Result class.
 *
 * Note: Please use either Ok or Err to construct Results.
 *
 * @example
 * ```
 * function divide(left: number, right: number): Result<number, Error> {
 *   if (right === 0) return Err("Divided by zero");
 *
 *   return Ok(left / right);
 * }
 *
 * ```
 */
export class Result<T, E extends Error> {
    private val: T | E;

    /**
     * A constructor for a Result
     *
     * Note: Please use either Ok or Err to construct Results.
     */
    constructor(input: T | E) {
        this.val = input;
    }

    /**
     * Returns the contained Ok value, consuming the self value.
     * Throws an Error with a given message if contained value is not Ok.
     *
     * @param msg An error message to throw if contained value is an Error.
     */
    expect(msg: string): T {
        if (this.val instanceof Error) {
            throw new Error(msg);
        }

        return this.val;
    }

    /**
     * Returns the contained Ok value, consuming the self value.
     * Throws an Error if contained value is not Ok.
     */
    unwrap(): T {
        return this.expect(`Unwrap called error - ${this.val}`);
    }

    /**
     * Returns the contained Error value, consuming the self value.
     * Throws an Error if contained value is not an Error.
     */
    unwrapErr(): E {
        if (!(this.val instanceof Error)) {
            throw new Error(`UnwrapError called on value - ${this.val}`);
        }

        return this.val;
    }

    /**
     * Returns the contained Ok value or a provided default.
     *
     * @param fallback A default value to return if contained value is an Error.
     */
    unwrapOr(fallback: T): T {
        if (this.val instanceof Error) {
            return fallback;
        }

        return this.val;
    }

    /**
     * Returns the contained Ok value or computes it from a closure.
     *
     * @param fn A function that computes a new value.
     */
    unwrapOrElse(fn: (input: E) => T): T {
        if (this.val instanceof Error) {
            return fn(this.val);
        }

        return this.val;
    }

    /**
     * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Error value untouched.
     *
     * @param fn A mapping function.
     */
    map<U>(fn: (input: T) => U): Result<U, E> {
        if (!(this.val instanceof Error)) {
            return new Result<U, E>(fn(this.val));
        }

        return this as unknown as Result<U, E>;
    }

    /**
     * Returns the provided fallback (if Error), or applies a function to the contained value.
     *
     * @param fallback A defualt value
     * @param fn A mapping function.
     */
    mapOr<U>(fallback: U, fn: (input: T) => U): U {
        if (!(this.val instanceof Error)) {
            return fn(this.val);
        }

        return fallback;
    }

    /**
     * Returns `or` if the result is Error, otherwise returns self.
     *
     * @param or A alternative Result value
     */
    or(or: Result<T, E>): Result<T, E> {
        if (!(this.val instanceof Error)) {
            return this;
        }

        return or;
    }

    /**
     * Returns true if contained value isnt an error.
     */
    isOk(): boolean {
        return !(this.val instanceof Error);
    }

    /**
     * Returns true if contained value is an error.
     */
    isErr(): boolean {
        return this.val instanceof Error;
    }

    /**
     * Returns contained value for use in matching.
     *
     * Note: Please only use this to match against in `if` or `swtich` statments.
     *
     * @example
     * ```
     * function coolOrNice(input: Result<string, Error>): Result<void, Error> {
     *   switch (input.peek()) {
     *     case "cool":
     *       console.log("Input was the coolest!");
     *       break;
     *     case "nice":
     *       console.log("Input was was the nicest!");
     *       break
     *     default:
     *       return Err("Input neither cool nor nice.");
     *   }
     *   return Ok()
     * }
     * ```
     */
    peek(): T | E {
        return this.val;
    }

    /**
     * Run a closure in a `try`/`catch` and convert it into a Result
     * @param fn The closure to run
     * @returns The Result of the closure
     */
    from<T>(fn: () => T): Result<T, Error> {
        try {
            return new Result(fn());
        } catch (e: unknown) {
            return new Result<T, Error>(e as Error);
        }
    }

    /**
     * Run am asynchronous closure in a `try`/`catch` and convert it into a Result
     * @param fn The closure to run
     * @returns The Result of the closure
     */
    async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
        try {
            return new Result(await fn());
        } catch (e: unknown) {
            return new Result<T, Error>(e as Error);
        }
    }
}

/**
 * Return a non-error value result.
 *
 * @param input a value that does not extend the `Error` type.
 *  @example
 * ```
 * function divide(left: number, right: number): Result<number, Error> {
 *   if (right === 0) return Err("Divided by zero");
 *
 *   return Ok(left / right);
 * }
 *
 * ```
 */
export function Ok<T, E extends Error>(input?: Exclude<T, E>) {
    return new Result<T, E>(input as T);
}

/**
 * Return a error result.
 *
 * @param input a value that extends the `Error` type.
 * @example
 * ```
 * function divide(left: number, right: number): Result<number, Error> {
 *   if (right === 0) return Err("Divided by zero");
 *
 *   return Ok(left / right);
 * }
 *
 * ```
 */
export function Err<T, E extends Error>(input: E | string) {
    if (typeof input === "string") {
        return new Result<T, Error>(new Error(input));
    }
    return new Result<T, E>(input);
}

/**
 * Partition an array of Results into Ok values and Errors
 *
 * @param input An array of Results
 * @example
 * ```
 * const results = [Ok(2),Ok(16),Err("Something went wrong!")]
 *
 * partition(results) // {ok:[2, 16], err:[Error("Something went wrong!")]}
 *
 * ```
 */
export function partition<T, E extends Error>(
    input: Array<Result<T, E>>
): { ok: Array<T>; err: Array<E> } {
    return input.reduce(
        (acc: { ok: Array<T>; err: Array<E> }, e) => {
            if (e.isOk()) acc.ok.push(e.unwrap());
            else acc.err.push(e.unwrapErr());

            return acc;
        },
        {
            ok: [],
            err: [],
        }
    );
}
