<div align="center">

<h1><code>Optionals</code></h1>

<p><strong>Rust-like <code>Option</code> and <code>Result</code> for TypeScript.</strong>

</div>

---

Remove `null` and `undefined` from your projects with the safety of Rust's
`Option` and `Result` enums. Full pattern matching, exhaustive handling, and
`instanceof` guards, with zero runtime dependencies. Runs on <a href="#bun">Bun</a> (primary), <a href="#deno">Deno</a>, and <a href="#node">Node</a>.</p>

## Why?

Returning `null`/`undefined` blurs "returned nothing" with "returned an
accidental null". Throwing exceptions makes error handling implicit. Rust's
`Option`/`Result` fix both by forcing you to handle every case at compile
time. This library brings that ergonomics to TypeScript.

```ts
function divide(left: number, right: number): Option<number> {
  if (right === 0) return None();
  return Some(left / right);
}

function parse(input: string): Result<number, Error> {
  const n = Number(input);
  return Number.isNaN(n) ? Err("not a number") : Ok(n);
}
```

## Install

### Bun <a name="bun"></a>

```sh
bun add rust-optionals
```

```ts
import { Option, Some, None, Result, Ok, Err } from "rust-optionals";
```

### Deno <a name="deno"></a>

```ts
import {
  Option,
  Some,
  None,
  Result,
  Ok,
  Err,
} from "jsr:@oliverbrotchie/optionals@4.0.1";
```

### Node <a name="node"></a>

```sh
npm install rust-optionals
```

```ts
import { Option, Some, None, Result, Ok, Err } from "rust-optionals";
```

## Option

Wrap a value that may not exist.

| Method                                  | Description                                                      |
| --------------------------------------- | ---------------------------------------------------------------- |
| `Some(value)`                           | Construct an `Option` holding a value.                           |
| `None()`                                | Construct an empty `Option`.                                     |
| `.isSome()` / `.isNone()`               | Test which variant is held.                                      |
| `.unwrap()` / `.expect(msg)`            | Extract the value (throws on `None`).                            |
| `.unwrapOr(fb)` / `.unwrapOrElse(fn)`   | Extract or fall back.                                            |
| `.map(fn)`                              | Transform a held value.                                          |
| `.inspect(fn)`                          | Run a side effect on a held value, returning the `Option`.       |
| `.or(other)`                            | Coalesce alternatives.                                           |
| `.okOr(err)`                            | Convert to a `Result`.                                           |
| `.peek()`                               | Read the value for `switch` matching.                            |
| `Option.from(value)` / `.fromAsync(fn)` | Wrap a value (or closure), mapping `null`/`undefined` to `None`. |

```ts
const x: Option<number> = Some(42); // call syntax
const y = new Some(42); // or `new`; both produce a `Some`
x.map((n) => n + 1).unwrap(); // 43
None<number>().unwrapOr(0); // 0

// instanceof guards work on the constructors:
if (x instanceof Some) {
  /* ... */
}
```

## Result

Represent either a success (`Ok`) or a failure (`Err`).

| Method                                | Description                                 |
| ------------------------------------- | ------------------------------------------- |
| `Ok(value)` / `Err(error)`            | Construct a `Result`.                       |
| `.isOk()` / `.isErr()`                | Test which variant is held.                 |
| `.unwrap()` / `.expect(msg)`          | Extract the `Ok` value (throws on `Err`).   |
| `.unwrapErr()` / `.expectErr(msg)`    | Extract the error.                          |
| `.unwrapOr(fb)` / `.unwrapOrElse(fn)` | Extract or fall back.                       |
| `.map(fn)` / `.mapErr(fn)`            | Transform the `Ok` or `Err` side.           |
| `.throw()`                            | Throw the held error.                       |
| `.ok()`                               | Convert to an `Option`.                     |
| `Result.from(fn)` / `.fromAsync(fn)`  | Capture a closure's result or thrown error. |
| `Result.partition(results)`           | Split an array into `{ ok, err }`.          |

```ts
const ok: Result<number, Error> = Ok(42); // call syntax
const alt = new Ok(42); // or `new`
ok.map((n) => n * 2).unwrap(); // 84

const err: Result<number, Error> = Err("boom"); // string coerced to Error
err.isErr(); // true

Result.partition([Ok(2), Err("e"), Ok(16)]);
// { ok: [2, 16], err: [Error("e")] }
```

Errors are detected for plain `Error`, cross-realm errors, and custom
subclasses (`instanceof Error` or `Error.isPrototypeOf`).

## Matching with `peek()`

Use `peek()` to dispatch on the held value without consuming the `Option`
or `Result`:

```ts
function coolOrNice(input: Option<string>): Option<void> {
  switch (input.peek()) {
    case "cool":
      return Some();
    case "nice":
      return Some();
    default:
      return None();
  }
}
```

## Development

```sh
deno test   # Deno
bun test    # Bun
deno task build  # emit the npm package (Bun/Node)
```

## License

[MIT](LICENSE)
