/**
 * # `Optionals`
 *
 * **Rust-like error handling and options for TypeScript and Deno!**
 *
 * This module provides two classes `Result` and `Option`:
 *  - `Option` provides a lovely way to express functions that may return nothing.
 *  - `Result` lets you tackle errors using with an easy to use functional pattern.
 *
 */

import { Result, Ok, Err } from "./src/result.ts";
import { Option, Some, None, none } from "./src/option.ts";

export { Result, Ok, Err, Option, Some, None, none };
