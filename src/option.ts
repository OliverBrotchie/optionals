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
   */
  *[Symbol.iterator]() {
    yield this.val;
  }

  /**
   * Returns true if contained value isnt None.
   *
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
   * Run a closure in a `try`/`catch` and convert it into an Option.
   * If the function throws an Error, an Option containing None will be reutrned.
   *
   * _Note: Please use `fromAsync` to capture the result of asynchronous closures._
   * @param {Function} fn The closure to run.
   * @returns {Option<T>} The result of the closure.
   */
  static from<T>(fn: () => T): Option<T> {
    try {
      return new Option<T>(fn());
    } catch (_) {
      return new Option<T>(none);
    }
  }

  /**
   * Run an asynchronous closure in a `try`/`catch` and convert it into an Option.
   * If the function throws an Error, an Option containing None will be reutrned.
   *
   * _Note: Please use `from` to capture the result of synchronous closures._
   * @param {Function} fn The closure to run.
   * @returns {Promise<Option<T>>} The result of the closure.
   */
  static async fromAsync<T>(fn: () => Promise<T>): Promise<Option<T>> {
    try {
      return new Option<T>(await fn());
    } catch (_) {
      return new Option<T>(none);
    }
  }
}

/**
 * Construct an Option from a value other than None.
 *
 * @param {Exclude<T, typeof none>} input a value that isnt None.
 * @returns {Option<T>}
 * @example
 * ```ts
 * function divide(left: number, right: number): Option<number> {
 *   if (right === 0) return None();
 *
 *   return Some(left / right);
 * }
 *
 * ```
 */
export function Some<T>(input: Exclude<T, typeof none>) {
  return new Option<T>(input as T);
}

/**
 * Construct the None variant of Option.
 *
 * @returns {Option<T>}
 * @example
 * ```ts
 *  function divide(left: number, right: number): Option<number> {
 *   if (right === 0) return None();
 *
 *   return Some(left / right);
 * }
 * ```
 */
export function None<T>(): Option<T> {
  return new Option<T>(none);
}
