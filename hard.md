# Hard Types

Return types are actual values. Strict typing with rust-like pattern matching!

## Usage

Example usage of Option:

```ts
import {
    Option,
    None,
    Some,
    match,
    unwrapOr,
} from "https://deno.land/x/optionals/hard.ts";

// Divide two numbers
function divide(numerator: number, denominator: number): Option<number> {
    if (denominator == 0) {
        return None;
    } else {
        return Some(numerator / denominator);
    }
}

// The return value of the function is an option
const some = divide(2, 3);
const none = divide(2, 0);

// Pattern match
match(some, [
    [
        Some(2),
        () => {
            console.log("Value is 2!");
        },
    ],
    [
        Some(Var),
        (e) => {
            console.log(`Generic Var is ${e}!`);
        },
    ],
    [
        None,
        () => {
            console.log("Value is None!");
        },
    ],
    [
        Default,
        () => {
            console.log("No other case was triggered!");
        },
    ],
]);

// Deal with a None
console.log(unwrapOr(none, 2)); // 2
```

Example usage of a Result, Option and Exhaustive Match:

```ts
import { Err, Result } from "https://deno.land/x/optionals/hard.ts";

const SomeErr = Symbol("Inputs were not numbers!");

// Weakly typed option
function divide(
    numerator: unknown,
    denominator: unknown
): Result<Option<number>, Err<typeof SomeErr>> {
    if (typeof numerator != "number" || typeof denominator != "number") {
        return Err(SomeErr);
    } else if (denominator == 0) {
        return Ok(None);
    } else {
        return Ok(Some(numerator / denominator));
    }
}

// Exhastive match statment
eMatch(divide(4, 2), [
    [
        Ok(Some(2)), // Example of case. Function will run if call strucuture and value of case is a match
        (e) => {
            console.log(`Value is ${e}!`);
        },
    ],
    [
        Ok(Some(Var)), // Example usage of generic variable. Will run if call structure of case is a match
        (e) => {
            console.log(`Some(Var) was triggered. Value is ${e}!`);
        },
    ],
    [
        Ok(None),
        () => {
            console.log(`Value is None`);
        },
    ],
    [
        Err(SomeErr),
        (e) => {
            console.log(e.to_string()); // Inputs were not numbers!
        },
    ],
    [
        Err(Var),
        () => {
            console.log(`All other tpyes of errors!`);
        },
    ],
]);
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
        return Some(numerator / denominator);
    }
}

peek(divide(2, 0)); // Symbol(`None`)
```

### Some

A type used in Option to return a value.

### None

A symbol used in Option to represent returning nothing as an enum.

### Result

A return type that is either Some value (okay) or an Err value (Error).

Example:

```ts
const SomeErr = Symbol("Inputs were not numbers!");

// A bad addition function that allows for multiple types
function relaxedAdd(
    numerator: any,
    denominator: any
): Result<number, Err<typeof SomeErr>> {
    if (typeof numerator != "number" || typeof denominator != "number")
        return Err(SomeErr);
    else {
        return Ok(numerator + denominator);
    }
}

peek(relaxedAdd("2", 2)); // Symbol(`Inputs were not numbers!`)
```

### Ok

A type used in Result to say that a value is not an Error

### Err

A type used in Result to return an error.

### unwrap

Returns the contained Ok or Some value.
Note: Only use if value is not an Error or None as this will throw an error.

Example:

```ts
const str = Some("str");
const none = None;

unwrap(str); // str
unwrap(none); // Error: unwrap on None.
```

### unwrapOr

Either returns the contained Ok/Some value or returns fallback value.

Example:

```ts
const none = None;

unwrapOr(none, "another value"); // another value
```

### unwrapOrElse

Returns the contained Some value or computes new value from provided function.

Example:

```ts
const none: = None;

unwrapOrElse(none, () => {
    1 + 1;
}); // 2
```

### map

Maps a Result Option to a new value, leaving Err or None values untouched.

Example:

```ts
const num = Some(8);

map(num, (val) => {
    val * 2;
}); // 16
```

### mapOr

Either computes a new value or returns fallback value if Err or None.

Example:

```ts
const none = None;

mapOr(none, "foo", (val) => {
    val * 2;
}); // foo
```

### match

A non-exhaustive rust-style match statment.  
Use of generic Var and Default case is pemitted.

Example:

```ts
let x = match(Ok("value"), [
    [
        Ok("value"),
        (e) => {
            return e;
        },
    ],
    [
        Ok(Var),
        () => {
            return "something other value";
        },
    ],
    [
        Default,
        () => {
            return "default case";
        },
    ],
]);

x; // value
```

### eMatch

An exhaustive rust-style match statment.  
Use of generic Var is permitted.  
Note: Function will throw an error if all possible branches are not covered.

Example:

```ts
let x = eMatch(Ok("Value"), [
    [
        Ok("Value"),
        (e) => {
            return e;
        },
    ],
    [
        Ok(Var),
        () => {
            return "Something other value";
        },
    ],
    [
        Err(Var),
        (e) => {
            console.log(e);
        },
    ],
]);

x; // value

eMatch(Ok("Value"), [
    [
        Ok("Value"),
        (e) => {
            console.log("Value!");
        },
    ],
]); // Error Missing Branches. Cases Ok(Var) and Err(Var) are not covered!
```

### peek

Get the contained value regardless of type.  
Note: Other functions should be used to handle Err or None, this function for debugging purposes!

Example:

```ts
peek(Some(2)); // 2
```

### isNone, isSome, isErr, isOkay

Asserts whether value is of said type.

Example:

```ts
const some = Some("Some string!");

isSome(some); // True
```

<br/> 
    
**Thanks for reading! If you have any questions or wish to submit an improvment, 
please open an [issue](https://github.com/OliverBrotchie/optionals/issues/new). ✨**
