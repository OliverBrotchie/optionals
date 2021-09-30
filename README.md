# Optionals&nbsp;&nbsp; 🦀

Rust-like error handling and options for TypeScript and Deno! This module allows you to remove `null` and `undefined` from your projects with the help of ES6 Symbols and helper functions. Inspired by Rust's `Option` and `Result`.

## Why should you use Optionals?

The standard practice of returning `null` or `undefined` when no other value can be returned, leaves something to be desired as there is no way to tell where in the code said value came from. Rust's implementation of error handling (e.g. bubbling) also has many benefits that cannot be expressed in the normal `try` `catch` JS pattern.

This module provides a minimal, fast and simple way to create expressive functions and better pattern matching! 🚀

## Type Systems

Optionals provides two type systems, Hard or Soft typing.

[Hard](https://github.com/OliverBrotchie/optionals/blob/main/hard.md) - Return types are actual values. Strict typing with rust-like pattern matching! (Recommended for most cases)
[Soft](https://github.com/OliverBrotchie/optionals/blob/main/soft.md) - Return types are compiled away at runtime. Lightweight and easy to use! (Recommened for small applications or where maximum performance is critical)
