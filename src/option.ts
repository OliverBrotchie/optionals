import { Err, Ok, Result } from "./result.ts";

/**
 * The primitive None value.
 *
 * _Note: To construct a None variant Option, please use `None()` instead._
 */
export const none = Symbol("None");

/**
 * A Rust-like Option class.
 *
 * _Note: Please use either `Some` or `None` to construct an Option._
 *
 * @example
 * ```
 * function divide(left: number, right: number): Option<number> {
 *   if (right === 0) return None();
 *
 *   return Some(left / right);
 * }
 *
 * ```
 */
export class Option<T> {
  private val: T | typeof none;

  /**
   * A constructor for an Option.
   *
   * _Note: Please use either `Some` or `None` to construct Options._
   *
   * @param {T | typeof none} input The value to wrap in an Option.
   */
  constructor(input: T | typeof none) {
    this.val = input;
  }

  /**
   * Converts Option into a String for display purposes.
   */
  get [Symbol.toStringTag]() {
    return `Option`;
  }

  /**
   * Iterator support for Option.
   *
   * _Note: This method will only yeild if the Option is Some._
   * @returns {IterableIterator<T>}
   */
  *[Symbol.iterator]() {
    if (this.isSome()) yield this.val;
  }

  /**
   * Returns true if contained value isnt None.
   * @returns {boolean}
   */
  isSome(): boolean {
    return this.val !== none;
  }

  /**
   * Returns true if contained value is None.
   *
   * @returns {boolean}
   */
  isNone(): boolean {
    return this.val === none;
  }

  /**
   * Returns the contained Some value, consuming the Option.
   * Throws an Error with a given message if the contained value is None.
   *
   * @param {string} msg An error message to throw if contained value is None.
   * @returns {T}
   */
  expect(msg: string): T {
    if (this.isNone()) {
      throw new Error(msg);
    }

    return this.val as T;
  }

  /**
   * Returns the contained Some value, consuming the Option.
   * Throws an Error if contained value is None.
   *
   * @returns {T}
   */
  unwrap(): T {
    if (this.isNone()) {
      throw new Error(`Unwrap called on None`);
    }

    return this.val as T;
  }

  /**
   * Returns the contained Some value or a provided default.
   *
   * @param {T} fallback A default value to return if contained value is an Option.
   * @returns {T}
   */
  unwrapOr(fallback: T): T {
    if (this.isNone()) {
      return fallback;
    }

    return this.val as T;
  }

  /**
   * Returns the contained Some value or computes it from a closure.
   *
   * @param {Function} fn A function that computes a new value.
   * @returns {T}
   */
  unwrapOrElse(fn: () => T): T {
    if (this.isNone()) {
      return fn();
    }

    return this.val as T;
  }

  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained Some value, leaving None values untouched.
   *
   * @param {Function} fn A mapping function.
   * @returns {Option<U>}
   */
  map<U>(fn: (input: T) => U): Option<U> {
    if (this.isSome()) {
      return new Option<U>(fn(this.val as T));
    }
    return this as unknown as Option<U>;
  }

  /**
   * Returns the provided fallback (if None), or applies a function to the contained value.
   *
   * @param {U} fallback A defualt value
   * @param {Function} fn A mapping function.
   * @returns {U}
   */
  mapOr<U>(fallback: U, fn: (input: T) => U): U {
    if (this.isSome()) {
      return fn(this.val as T);
    }

    return fallback;
  }

  /**
   * Returns `or` if the Option is None, otherwise returns self.
   *
   * @param {Option<T>} or An alternative Option value
   * @returns {Option<T>}
   */
  or(or: Option<T>): Option<T> {
    if (this.isSome()) {
      return this;
    }

    return or;
  }

  /**
   * Calls `fn` with the contained Some value, returning the Option unchanged.
   * Does nothing if the Option is None.
   *
   * @param {Function} fn A side-effect function to run on the contained value.
   * @returns {Option<T>}
   */
  inspect(fn: (input: T) => void): Option<T> {
    if (this.isSome()) {
      fn(this.val as T);
    }
    return this;
  }

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping Some to Ok and None to Err.
   *
   * @param {E} err An error to return if the Option is None.
   * @returns {Result<T, E>}
   *
   * @example
   * ```
   * const result = Some(2).okOr("Error"); // => Ok(2)
   * ```
   */
  okOr<E extends Error>(err: E | string): Result<T, E> {
    if (this.isSome()) {
      return Ok(this.val as T);
    } else {
      return Err(err);
    }
  }

  /**
   * Returns contained value for use in matching.
   *
   * _Note: Please only use this to match against in `if` or `swtich` statments._
   *
   * @returns {T | typeof none}
   * @example
   * ```ts
   * function coolOrNice(input: Option<string>): Option<void> {
   *   switch (input.peek()) {
   *     case "cool":
   *       console.log("Input was the coolest!");
   *       break;
   *     case "nice":
   *       console.log("Input was was the nicest!");
   *       break
   *     default:
   *       return None();
   *   }
   *   return Some()
   * }
   * ```
   */
  peek(): T | typeof none {
    return this.val;
  }

  /**
   * Converts `Option<Option<T>>` into `Option<T>`, removing one level of
   * nesting. Returns `this` unchanged if the Option is `None`.
   *
   * @returns {Option<T>} The flattened Option.
   */
  flatten(): Option<T> {
    if (this.val instanceof Option) {
      return this.val as Option<T>;
    }
    return this;
  }

  /**
   * Converts a `null` or `undefined` value into an Option, mapping to None.
   *
   * @param {T | null | undefined} value The value to wrap.
   * @returns {Option<T>} The wrapped value.
   *
   * @example
   * ```ts
   * const found = Option.from(array.find(4)); // Some or None
   * ```
   */
  static from<T>(value: T | null | undefined): Option<T> {
    if (value === null || value === undefined) {
      return new Option<T>(none);
    }
    return new Option<T>(value);
  }

  /**
   * Run an asynchronous closure and convert it into an Option.
   * If the function returns `null` or `undefined`, an Option containing None will be reutrned.
   *
   * _Note: Please use `from` to capture the result of synchronous closures._
   * @param {Function} fn The closure to run.
   * @returns {Promise<Option<T>>} The result of the closure.
   */
  static async fromAsync<T>(
    fn: () => Promise<T | null | undefined>
  ): Promise<Option<Awaited<T>>> {
    return Option.from<Awaited<T>>(await fn() as Awaited<T> | null | undefined);
  }
}

class SomeClass<T> extends Option<T> {
  constructor(input: T) {
    super(input);
  }

  override get [Symbol.toStringTag]() {
    return `Some`;
  }
}

class NoneClass<T> extends Option<T> {
  constructor() {
    super(none);
  }

  override get [Symbol.toStringTag]() {
    return `None`;
  }
}

/** The `Some` variant type. */
export type Some<T> = SomeClass<T>;
/** The `None` variant type. */
export type None<T> = NoneClass<T>;

/**
 * The `Some` variant of `Option`, holding a value.
 *
 * Values may be constructed with either `Some(42)` or `new Some(42)`.
 */
export const Some: {
  <T>(input: T): Some<T>;
  new <T>(input: T): Some<T>;
} = new Proxy(SomeClass, {
  apply: (_target, _thisArg, args: [unknown]) =>
    Reflect.construct(_target, args),
}) as unknown as {
  <T>(input: T): Some<T>;
  new <T>(input: T): Some<T>;
};

/**
 * The `None` variant of `Option`.
 *
 * Values may be constructed with either `None()` or `new None()`.
 */
export const None: {
  <T>(): None<T>;
  new <T>(): None<T>;
} = new Proxy(NoneClass, {
  apply: (_target, _thisArg) => Reflect.construct(_target, []),
}) as unknown as {
  <T>(): None<T>;
  new <T>(): None<T>;
};
