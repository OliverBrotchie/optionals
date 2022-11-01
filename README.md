<div align="center">

  <h1><code>Optionals</code></h1>

<strong>Rust-like error handling and options for TypeScript, Node and Deno!</strong>

</div>

This module allows you to remove `null` and `undefined` from your projects with the help of ES6 Symbols and helper methods. Inspired by Rust's `Option`, `Result` enums.

## Why should you use Optionals?

The standard practice of returning `null` or `undefined` when no other value can be returned means that there is no simple way to express the difference between a function that has returned "nothing" and a `null` return type. There are also no easy ways to handle errors in a functional pattern. Rust's implementation of `Option` and `Result` guarantees correctness by expressly forcing correct result-handling practices.

This module provides a minimal, fast and simple way to create expressive functions and perform better pattern matching on resulting values! 🚀

## Usage

```ts
// Result
import { Result, Ok, Err } from "https://deno.land/x/optionals@v2.0.2`/mod.ts";

// Option
import {
  Option,
  Some,
  None,
} from "https://deno.land/x/optionals@v2.0.2/mod.ts";
```

## Documentation

Please find further documentation on the [doc](https://doc.deno.land/https://deno.land/x/optionals@v2.0.2/mod.ts) page!
