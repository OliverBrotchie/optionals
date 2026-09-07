import { None, Option, Some } from "./option.ts";

/**
 * Determine whether a value is an `Error` (including cross-realm and
 * custom error types that extend `Error` but are not `instanceof` it).
 */
function isError(value: unknown): value is Error {
  return value instanceof Error ||
    (!!value && typeof value === "object" && Error.isPrototypeOf(value));
}

/**
 * Wraps a class so it is callable and constructable, with `instanceof`
 * working for both forms.
 */
function callable<
  C extends new (...args: any[]) => any,
>(Ctor: C): C & ((...args: ConstructorParameters<C>) => InstanceType<C>) {
  return new Proxy(Ctor, {
    apply: (_target, _thisArg, args) => Reflect.construct(Ctor, args),
  }) as C & ((...args: ConstructorParameters<C>) => InstanceType<C>);
}

/**
 * A Rust-like Result class.
 *
 * _Note: Please use either Ok or Err to construct Results._
 *
 * @example
 * ```ts
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
   * A constructor for a Result.
   *
   * @param {T | E} input The Result value.
   *
   * _Note: Please use either `Ok` or `Err` to construct Results._
   */
  constructor(input: T | E) {
    this.val = input;
  }

  /**
   * Converts Result into a String for display purposes.
   */
  get [Symbol.toStringTag](): string {
    return `Result`;
  }

  /**
   * Iterator support for Result.
   *
   * _Note: This method will only yeild if the Result is Ok._
   * @returns {IterableIterator<T>}
   */
  *[Symbol.iterator](): Generator<T | E> {
    if (this.isOk()) yield this.val;
  }

  /**
   * Returns true if contained value isnt an error.
   *
   * @returns {boolean}
   */
  isOk(): boolean {
    return !isError(this.val);
  }

  /**
   * Returns true if contained value is an error.
   *
   * @returns {boolean}
   */
  isErr(): boolean {
    return isError(this.val);
  }

  private formatError(err: Error) {
    err.stack = `${err.message}: ${
      (this.val as E).stack
        ? "\n\t" + ((this.val as E).stack as string).split("\n").join("\n\t")
        : (this.val as E).message
    }`;

    throw err;
  }

  /**
   * Returns the contained Ok value, consuming the Result.
   * Throws an Error with a given message if contained value is not Ok.
   *
   * @param {string} msg An error message to throw if contained value is an Error.
   * @returns {T}
   */
  expect(msg: string): T {
    if (this.isErr()) {
      this.formatError(new Error(msg));
    }

    return this.val as T;
  }

  /**
   * Returns the contained Err value, consuming the Result.
   * Throws an Error with a given message if contained value is not an Err.
   *
   * @param {string} msg An error message to throw if contained value is Ok.
   * @returns {T}
   */
  expectErr(msg: string): T {
    if (this.isOk()) {
      this.formatError(new Error(msg));
    }

    return this.val as T;
  }

  /**
   * Returns the contained Ok value, consuming the Result.
   * Throws an Error if contained value is not Ok.
   *
   * @returns {T}
   */
  unwrap(): T {
    if (this.isErr()) {
      this.formatError(new Error(`Unwrap called on ${(this.val as E).name}`));
    }

    return this.val as T;
  }

  /**
   * Returns the contained Error value, consuming the Result.
   * Throws an Error if contained value is not an Error.
   *
   * @returns {E}
   */
  unwrapErr(): E {
    if (this.isOk()) {
      throw new Error(
        `UnwrapError called on value - ${this.val as unknown as string}`
      );
    }

    return this.val as E;
  }

  /**
   * Returns the contained Ok value or a provided default.
   *
   * @param {T} fallback A default value to return if contained value is an Error.
   * @returns {T}
   */
  unwrapOr(fallback: T): T {
    if (this.isErr()) {
      return fallback;
    }

    return this.val as T;
  }

  /**
   * Returns the contained Ok value or computes it from a closure.
   *
   * @param {Function} fn A function that computes a new value.
   * @returns {T}
   */
  unwrapOrElse(fn: (input: E) => T): T {
    if (this.isErr()) {
      return fn(this.val as E);
    }

    return this.val as T;
  }

  /**
   * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Error value untouched.
   *
   * @param {Function} fn A mapping function.
   * @returns {Result<U, E>}
   */
  map<U>(fn: (input: T) => U): Result<U, E> {
    if (this.isOk()) {
      return new Result<U, E>(fn(this.val as T));
    }

    return this as unknown as Result<U, E>;
  }

  /**
   * Maps a Result<T, E> to Result<T, U> by applying a function to a contained Error value, leaving an Ok value untouched.
   *
   * @param {Function} fn A mapping function.
   * @returns {Result<T, U>}
   */
  mapErr<U extends Error>(fn: (input: E) => U): Result<T, U> {
    if (this.isOk()) {
      return this as unknown as Result<T, U>;
    }

    return new Result<T, U>(fn(this.val as E));
  }

  /**
   * Returns the provided fallback (if Error), or applies a function to the contained value.
   *
   * @param {U} fallback A defualt value
   * @param {Function} fn A mapping function.
   * @returns {U}
   */
  mapOr<U>(fallback: U, fn: (input: T) => U): U {
    if (this.isOk()) {
      return fn(this.val as T);
    }

    return fallback;
  }

  /**
   * Returns `or` if the result is Error, otherwise returns self.
   *
   * @param {Result<T, E>} or An alternative Result value
   * @returns {Result<T, E>}
   */
  or(or: Result<T, E>): Result<T, E> {
    if (this.isOk()) {
      return this;
    }

    return or;
  }

  /**
   * Converts from `Result<T, E>` to `Option<T>`.
   *
   * @returns {Option<T>}
   *
   * @example
   * ```ts
   * const option = Err("Some Error").ok(); // => None()
   * ```
   */
  ok(): Option<T> {
    if (this.isOk()) {
      return Some(this.val as T);
    }

    return None();
  }

  /**
   * Returns contained value for use in matching.
   *
   * _Note: Please only use this to match against in `if` or `swtich` statments._
   *
   * @returns {T | E}
   * @example
   * ```ts
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
   * Throws contained Errors, consuming the Result.
   */
  throw(): void {
    if (this.isErr()) {
      throw this.val;
    }
  }

  /**
   * Converts `Result<Result<U, E>, E>` into `Result<U, E>`, removing one
   * level of nesting. Returns `this` unchanged if the Result is `Err`.
   *
   * @returns {Result<U, E>} The flattened Result.
   */
  flatten<U, F extends Error>(this: Result<Result<U, F>, F>): Result<U, F> {
    if (this.val instanceof Result) {
      return this.val;
    }
    return this as unknown as Result<U, F>;
  }

  /**
   * Run a closure in a `try`/`catch` and convert it into a Result.
   *
   * _Note: Please use `fromAsync` to capture the Result of asynchronous closures._
   * @param {Function} fn The closure to run
   * @returns {Result<T, Error>} The Result of the closure
   */
  static from<T>(fn: () => T): Result<T, Error> {
    try {
      return new Result<T, Error>(fn());
    } catch (e: unknown) {
      return new Result<T, Error>(e as Error);
    }
  }

  /**
   * Run an asynchronous closure in a `try`/`catch` and convert it into a Result.
   *
   * _Note: Please use `from` to capture the Result of synchronous closures._
   * @param {Function} fn The synchronous closure to run
   * @returns {Promise<Result<T, Error>>} The Result of the closure
   */
  static async fromAsync<T>(
    fn: () => Promise<T>
  ): Promise<Result<Awaited<T>, Error>> {
    try {
      return new Result<Awaited<T>, Error>(await fn());
    } catch (e: unknown) {
      return new Result<Awaited<T>, Error>(e as Error);
    }
  }

  /**
   * Partition an array of Results into Ok values and Errors
   *
   * @param {Array<Result<T, E>>} input An array of Results
   * @returns {{ok: Array<T>, err: Array<E>}}
   *
   * @example
   * ```ts
   * const results = [Ok(2), Ok(16), Err("Something went wrong!")]
   *
   * Result.partition(results) // { ok:[2, 16], err:[Error("Something went wrong!")]}
   *
   * ```
   */
  static partition<T, E extends Error>(
    input: Array<Result<T, E>>
  ): { ok: Array<T>; err: Array<E> } {
    return input.reduce(
      (acc, e) => {
        if (e.isOk()) acc.ok.push(e.unwrap());
        else acc.err.push(e.unwrapErr());

        return acc;
      },
      { ok: [] as T[], err: [] as E[] } satisfies { ok: T[]; err: E[] }
    );
  }
}

class OkClass<T, E extends Error> extends Result<T, E> {
  constructor(input: T) {
    super(input);
  }

  override get [Symbol.toStringTag](): string {
    return `Ok`;
  }
}

class ErrClass<T, E extends Error> extends Result<T, E> {
  constructor(input: E) {
    super(input);
  }

  override get [Symbol.toStringTag](): string {
    return `Err`;
  }
}

/** The `Ok` variant type. */
export type Ok<T, E extends Error = Error> = OkClass<T, E>;
/** The `Err` variant type. */
export type Err<T, E extends Error = Error> = ErrClass<T, E>;

/**
 * Return a non-error value result.
 *
 * Values may be constructed with either `Ok(value)` or `new Ok(value)`.
 */
export const Ok: {
  <T, E extends Error>(input?: T): Ok<T, E>;
  new <T, E extends Error>(input?: T): Ok<T, E>;
} = new Proxy(OkClass, {
  apply: (_target, _thisArg, args) => Reflect.construct(_target, args),
}) as unknown as {
  <T, E extends Error>(input?: T): Ok<T, E>;
  new <T, E extends Error>(input?: T): Ok<T, E>;
};

/**
 * Return an error result.
 *
 * Accepts an `Error` or a `string` (coerced to an `Error`).
 * Values may be constructed with either `Err(error)` or `new Err(error)`.
 */
export const Err: {
  <T, E extends Error>(input: E | string): Err<T, E>;
  new <T, E extends Error>(input: E): Err<T, E>;
} = new Proxy(ErrClass, {
  apply: (_target, _thisArg, args: [unknown]) =>
    (typeof args[0] === "string"
      ? new ErrClass<unknown, Error>(new Error(args[0]))
      : new ErrClass<unknown, Error>(args[0] as Error)),
  construct: (_target, args: [unknown]) => Reflect.construct(ErrClass, args),
}) as unknown as {
  <T, E extends Error>(input: E | string): Err<T, E>;
  new <T, E extends Error>(input: E): Err<T, E>;
};
