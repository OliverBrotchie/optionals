/**
 * Optionals v1.0.4 - Hard Types
 */

export const None = Symbol("None");

export type Option<T> = ((s: (val: T) => T) => T) | typeof None;
export type Some<T> = (val: T) => Option<T>;
export const Some: <T>(val: T) => Option<T> = (val) => (s) => s(val);

export type Result<T, E> = (o: (val: T) => E, s: (val: symbol) => E) => E;
export type Err<T> = T;
export const Err: <A, B>(val: symbol) => Result<A, B> =
    (val: symbol) => (_, g) =>
        g(val);
export const Ok: <T, E>(val: T) => Result<T, E> = (val) => (f, _) => f(val);

/**
 * A generic function with one argument.
 */
export type OneArgFn<T, U> = (value: T) => U;

/**
 * A generic function without arguments.
 */
export type NoArgFn<T> = () => T;

/**
 * A generic variable for use in match statments.
 */
export const Var = Symbol("Variable");

/**
 * A default case for use in match statments.
 */
export const Default = Symbol("Default");

/**
 * Returns the contained Ok or Some value.
 * Note: Only use if value is not an Err or None as this will throw an error (see unwrap_or).
 *
 * @param value An `Option<T>` or `Result<T>`.
 */
export function unwrap<T, U>(value: Option<T> | Result<T, U>): T {
    if ((value as Option<T>) === None) throw `unwrap on None.`;
    else if (
        typeof value == "function" &&
        (value.toString() === "(s) => s(val)" ||
            value.toString() === "(f, _) => f(val)" ||
            value.toString() === "(_, g) => g(val)")
    ) {
        return (value as Result<T, T>)(
            (val) => val as T,
            (val) => {
                throw `unwrap on ${val.toString()}.`;
            }
        );
    } else return value as unknown as T;
}

/**
 * Either returns the contained Ok/Some value or returns fallback value.
 *
 * @param value An `Option<T>` or `Result<T,U>`.
 * @param fallback Afallback value.
 */
export function unwrapOr<T, U, F>(
    value: Option<T> | Result<T, U>,
    fallback: F
): T | F {
    if ((value as Option<T>) === None) return fallback;
    else if (
        typeof value == "function" &&
        (value.toString() === "(s) => s(val)" ||
            value.toString() === "(f, _) => f(val)" ||
            value.toString() === "(_, g) => g(val)")
    ) {
        return (value as Result<T, T>)(
            (val) => val as T,
            () => fallback as unknown as T
        );
    } else return value as unknown as T;
}

/**
 * Returns the contained Some value or computes new value from function.
 *
 * @param value An `Option<T>` or `Result<T>`.
 * @param fn
 */
export function unwrapOrElse<T, U, F>(
    value: Option<T> | Result<T, U>,
    fn: NoArgFn<F>
): T | F {
    if ((value as Option<T>) === None) return fn();
    else if (
        typeof value == "function" &&
        (value.toString() === "(s) => s(val)" ||
            value.toString() === "(f, _) => f(val)" ||
            value.toString() === "(_, g) => g(val)")
    ) {
        return (value as Result<T, T>)(
            (val) => val as T,
            () => fn() as unknown as T
        );
    } else return value as unknown as T;
}

/**
 * Maps a Result Option to a new value, leaving Error or None values untouched.
 *
 * @param value An `Option<T>` or `Result<T>`.
 * @param fn
 */
export function map<T, U, F>(
    value: Option<T> | Result<T, U>,
    fn: OneArgFn<T, F>
): Option<T> | Result<T, U> | T {
    if ((value as Option<T>) === None) return value;
    else if (
        typeof value == "function" &&
        (value.toString() === "(s) => s(val)" ||
            value.toString() === "(f, _) => f(val)" ||
            value.toString() === "(_, g) => g(val)")
    ) {
        return (value as Result<T, T>)(
            (val) => fn(val) as unknown as T,
            () => value as unknown as T
        );
    } else return fn(value as unknown as T) as unknown as T;
}

/**
 * Either computes a new value or returns fallback value if Err or None.
 *
 * @param value An `Option<T>` or `Result<T,U>`.
 * @param fallback A fallback value.
 * @param fn
 */
export function mapOr<T, U, F, E>(
    value: Option<T> | Result<T, U>,
    fallback: E,
    fn: OneArgFn<T, F>
): T | E {
    if ((value as Option<T>) === None) return fallback;
    else if (
        typeof value == "function" &&
        (value.toString() === "(s) => s(val)" ||
            value.toString() === "(f, _) => f(val)" ||
            value.toString() === "(_, g) => g(val)")
    ) {
        return (value as Result<T, T>)(
            (val) => fn(val) as unknown as T,
            () => fallback as unknown as T
        );
    } else return fn(value as unknown as T) as unknown as T;
}

/**
 * Asserts whether given value is None
 *
 * @param value A value that is either `Some(T)` or `None`.
 */
export function isNone<T>(value: Option<T>): value is typeof None {
    return value === None;
}

/**
 * Asserts whether given value is Some.
 *
 * @param value A value that is either `Some(T)` or `None`.
 */
export function isSome<T>(value: Option<T>): boolean {
    return value !== None;
}

/**
 * Asserts whether given value is an Error.
 *
 * @param value A value that is either `Ok` or an `Err`.
 */
export function isErr<T>(value: Result<T, T>): boolean {
    return value(
        () => false as unknown as T,
        () => true as unknown as T
    ) as unknown as boolean;
}

/**
 * Asserts whether given value is Ok.
 *
 * @param value A value that is either `Ok` or an `Err`.
 */
export function isOk<T>(value: Result<T, T>): boolean {
    return value(
        () => true as unknown as T,
        () => false as unknown as T
    ) as unknown as boolean;
}

function getDetails<T>(value: unknown): {
    callStack: Array<string>;
    value: T;
} {
    const callStack: Array<string> = [];
    let val = value;

    // Filter through optional functions until a value is obtained
    while (
        typeof val == "function" &&
        (val.toString() === "(s) => s(val)" ||
            val.toString() === "(f, _) => f(val)" ||
            val.toString() === "(_, g) => g(val)")
    ) {
        callStack.push(val.toString());
        val(
            (v: unknown) => (val = v),
            (v: unknown) => (val = v)
        );
    }

    if (val == None) callStack.push("None");
    if (val == Var) callStack.push("Var");

    return { callStack: callStack, value: val as T };
}

/**
 * Get the contanied value regardless of whether it is None or Err.
 *
 * @param value an `Option<T>` or `Result<T,U>`.
 */
export function peek<T>(value: unknown): T {
    return getDetails(value).value as T;
}

/**
 * A non-exhaustive rust-style match statment.
 * Use of generic Var and Default case is pemitted.
 *
 * @param value An `Option<T>` or `Result<T,U>`.
 * @param cases An array of arrays ach containing two elements, a case to match against and a function to run.
 */
export function match<T, U, O>(
    value: T,
    cases: Array<[Result<U, U> | Option<U> | unknown, OneArgFn<U, O>]>
): void | O {
    const valueDetails = getDetails(value);
    let found = false;
    for (const c of cases) {
        const caseDetails = getDetails(c[0]);
        if (
            JSON.stringify(valueDetails) == JSON.stringify(caseDetails) ||
            JSON.stringify([...valueDetails.callStack, "Var"]) ===
                JSON.stringify(caseDetails.callStack) ||
            (!found && caseDetails.value === Default)
        ) {
            const result = c[1](valueDetails.value as U);
            if (result !== undefined) return result;
            found = true;
        }
    }
}

/**
 * An exhaustive rust-style match statment.
 * Use of generic Var is permitted.
 * Note: Function will throw an error if all possible branches are not covered.
 *
 * @param value An `Option<T>` or `Result<T,U>`.
 * @param cases An array of arrays ach containing two elements, a case to match against and a function to run.
 */
export function eMatch<T, U, O>(
    value: T,
    cases: Array<[Result<U, U> | Option<U> | unknown, OneArgFn<U, O>]>
): void | O {
    // Finds all posible cases
    function findAllCases<T>(callStack: Array<string>): Array<Array<string>> {
        let cases: Array<Array<string>> = [["Var"]];

        callStack.reverse().forEach((e) => {
            if (e != "Var")
                if (e == "(s) => s(val)" || e == "None") {
                    cases = cases.map((c) => {
                        return ["(s) => s(val)", ...c];
                    });
                    cases.push(["None"]);
                } else {
                    cases = cases.map((c) => {
                        return ["(f, _) => f(val)", ...c];
                    });
                    cases.push(["(_, g) => g(val)", "Var"]);
                }
        });

        // re-revere as this function uses value by-val
        callStack.reverse();

        return cases;
    }

    // Pretty prents a call stack
    function prettyPrint<T>(callStack?: Array<string>, value?: T): string {
        const m = new Map<string, string>([
            ["None", "None"],
            ["Var", "Var"],
            ["(s) => s(val)", "Some("],
            ["(f, _) => f(val)", "Ok("],
            ["(_, g) => g(val)", "Err("],
        ]);
        let str = "";

        callStack?.forEach((e) => {
            str += m.get(e);
        });

        if (callStack?.length !== 0) {
            if (
                value !== undefined &&
                (value as unknown) !==
                    (callStack as string[])[(callStack as string[]).length - 1]
            ) {
                if (typeof value == "symbol") {
                    if (value !== Var && value !== None) str += "Symbol";
                } else str += JSON.stringify(value);
            }

            for (let i = 0; i < (callStack as string[]).length; i++) {
                str += ")";
            }
        } else str += `${value}`;

        return str;
    }

    const valueDetails = getDetails(value);
    let possibleCases = findAllCases(valueDetails.callStack);

    // Test that branches are exhustive
    for (const c of cases) {
        possibleCases = possibleCases.filter(
            (e) =>
                JSON.stringify(e) !== JSON.stringify(getDetails(c[0]).callStack)
        );
    }

    // Throw error if cases are non-exhaustive
    if (possibleCases.length !== 0) {
        let err = `Missing Branches. Case${
            possibleCases.length !== 1 ? "s" : ""
        }: `;
        possibleCases.forEach((e) => {
            err += `${prettyPrint(e)}, `;
        });
        throw `${err}${possibleCases.length === 1 ? "is" : "are"} not covered.`;
    }

    for (const c of cases) {
        const caseDetails = getDetails(c[0]);

        if (
            JSON.stringify(valueDetails) === JSON.stringify(caseDetails) ||
            JSON.stringify([...valueDetails.callStack, "Var"]) ===
                JSON.stringify(caseDetails.callStack)
        ) {
            const result = c[1](valueDetails.value as U);
            if (result !== undefined) return result;
        }
    }
}
