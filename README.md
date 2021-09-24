<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.rust-lang.org%2Fstatic%2Fimages%2Frust-social-wide.jpg&f=1&nofb=1" height="200" width="420" />

# Optionals&nbsp;&nbsp; 🦀

Rust-like error handling and options for TypeScript and Deno! This module allows you to remove Null and Undefined from your projects with the help of ES6 Symbols and helper functions. Inspired by Rust's `Option` and `Result`.

## Why

Javascipt's implementation of returning Options (`null`/`undefined`) leaves something to be desired. 

There is no way to tell where the `null` value is returned as it is equal to itself, and, it is also not what these values are designed for. 
Rust's implementation of Error handling (e.g. bubbling) also has many benefits that cannot be expressed in the normal `try`/`catch` JS pattern. ✨

## Usage

```ts
import {
    None,
    Err,
    Option,
    Result,
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
    console.log(`Result: ${unwrap(ok)}`);
}

// Deal with a None (logs 2)
console.log(unwrapOr(none, 2));

// A bad division function that allows for strings
function relaxedDivide(
    numerator: number | string,
    denominator: number
): Result<Option<number>> {
    if (typeof numerator == "string") return Err;
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
    case Err:
        console.log("Error!");
        break;
    case None:
        console.log("None!");
        break;
    default:
        console.log(val);
}
```

If you wish to create custom Errors, feel free to coppy and edit this module! 🚀

## Full API

Full documentation will be available soon, I aim to implement most of Rust's methods listed [here](https://doc.rust-lang.org/std/option/enum.Option.html).
For now please look at `mod.ts` for functions and type declarations.
