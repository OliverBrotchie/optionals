# Optionals&nbsp;&nbsp; 🦀

Rust-like error handling and options for TypeScript and Deno! This module allows you to remove Null and Undefined from your projects with the help of ES6 Symbols and helper functions. Inspired by Rust's `Option` and `Result`.

## Why

Javascipt's implementation of returning Options (`null`/`undefined`) leaves something to be desired.

There is no way to tell where the `null` value is returned as it is equal to itself, and, it is also not what these values are designed for.
Rust's implementation of Error handling (e.g. bubbling) also has many benefits that cannot be expressed in the normal `try`/`catch` JS pattern. ✨

## Usage

Example usage of Option:

```ts
import {
    None,
    Option,
    unwrap,
    isOk,
} from "https://deno.land/x/optionals/mod.ts";

// Divide two numbers
function divide(numerator: number, denominator: number): Option<number> {
    if (denominator == 0) {
        return None;
    } else {
        return numerator / denominator;
    }
}

// The return value of the function is an option
const some = divide(2, 3);
const none = divide(2, 0);

// Pattern match to retrieve the value
if (isOk(some)) {
    console.log(`Result: ${unwrap(ok)}`); // Unwrap returns the contained value if it is not an Err
}

// Deal with a None (logs 2)
console.log(unwrapOr(none, 2));
```

Example usage of Result:

```ts
import { Err, Result } from "https://deno.land/x/optionals/mod.ts";

// A bad division function that allows for multiple types
function relaxedDivide(
    numerator: any,
    denominator: any
): Result<Option<number>> {
    if (typeof numerator != "number" || typeof denominator != "number")
        return Err;
    else if (denominator == 0) {
        return None;
    } else {
        return numerator / denominator;
    }
}

// The return value of the function is a Result over an Option
const val = relaxedDivide("2", 2);

// Pattern match to retrieve the value
switch (val) {
    case 2:
        console.log("Two!");
        break;
    case 20:
        console.log("Twenty!");
        break;
    case None:
        console.log("None!");
        break;
    case Err:
        console.log("Error!");
        break;
    default:
        console.log(val);
}
```

To add custom Symbols and return types:

```ts
import {
    Symbols,
    OptionalGeneric,
    uwnrapOr,
} from "https://deno.land/x/optionals/mod.ts";

// Create custom symbol (enum) and return type
const CustomErr = Symbol(`Some custom error message.`);
type CustomResult<T> = OptionalGeneric<T>;

// Register the new symbol
Symbols.add(CustomErr);

const foo: CustomResult<string> = CustomErr;

try {
    unwrap(foo);
} catch (e) {
    console.log(e); // Error: unwrap on symbol.
}
console.log(foo.toString()); // Some custom error message.

// An example function using a custom return type
function addOne(value: any): CustomResult<number> {
    if (typeof value != "number") return CustomErr;
    else return value + 1;
}
```

## Full API

### Option<T>

A return type that is either some value (something) or None (nothing).

Example:

```ts
// Divide two numbers
function divide(numerator: number, denominator: number): Option<number> {
    if (denominator == 0) {
        return None;
    } else {
        return numerator / denominator;
    }
}

divide(2, 0); // Symbol(`None`)
```

### None

A symbol used in Option to represent returning nothing as an enum.

### Result<T>

A return type that is either some value (okay) or Err.

Example:

```ts
// A bad addition function that allows for multiple types
function relaxedAdd(numerator: any, denominator: any): Result<number> {
    if (typeof numerator != "number" || typeof denominator != "number")
        return Err;
    else {
        return numerator + denominator;
    }
}

relaxedAdd("2", 2); // Symbol(`Err`)
```

### Err

A symbol used in Result to represent returning an error.

### OptionalGeneric<T>

The generic Optional type. Result and Option are sytactic sugar over this.

Example:

```ts
type CustomResult<T> = OptionalGeneric<T>;
```

### Symbols

A class used to instanciate new symbols for use in matching functions such as `unwrap`.

Example:

```ts
const Foo = Symbol(`Foo`);
Symbols.add(Foo);

const f = Foo;

unwrapOr(f, "Value is foo"); // Value is foo
```

### unwrap

Returns the contained Ok or Some value.
Note: Only use if value is not an Error or None as this will throw an error.

Example:

```ts
const str: Option<String> = "Not None";
const none: Option<String> = None;

unwrap(str); // Not None
unwrap(none); // Error: unwrap on symbol.
```

### unwrapOr

Either returns the contained Ok/Some value or returns fallback value.

Example:

```ts
const none: Option<String> = None;

unwrapOr(none, "another value"); // another value
```

### unwrapOrElse

Returns the contained Some value or computes new value from provided function.

Example:

```ts
const none: Option<number> = None;

unwrapOrElse(none, () => {
    1 + 1;
}); // 2
```

### map

Maps a Result Option to a new value, leaving Error or None values untouched.

Example:

```ts
const num: Option<number> = 8;

map(num, (val) => {
    val * 2;
}); // 16
```

### mapOr

Either computes a new value or returns fallback value if Err or None.

Example:

```ts
const none: Option<number> = None;

mapOr(none, "foo", (val) => {
    val * 2;
}); // foo
```

### isNone, isSome, isErr, isOkay

Assets whether value is said symbol or specified type.

Example:

```ts
const none: Option<number> = None;

isNone(none); // True
```

## Thanks for reading!
