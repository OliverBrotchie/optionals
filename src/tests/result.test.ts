import { Result, Ok, Err } from "../result.ts";
import {
  assertEquals,
  assert,
  fail,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";

class TestError extends Error {
  name = "TestError";
}

class ErrorLookAlike {
  name = "ErrorLookAlike";
  message: string;
  stack?: string;

  constructor(message: string) {
    this.message = message;
  }
}

Deno.test("Result", async (t) => {
  await t.step(
    "isOk - Should correctly identify an Ok value & any extended Error class.",
    () => {
      assert(new Result("Ok").isOk());
      assert(!new Result(new Error("Test")).isOk());
      assert(!new Result(new TestError("Test")).isOk());
      assert(new Result(new ErrorLookAlike("Test")).isOk());
    }
  );

  await t.step(
    "isErr - Should correctly identify an Error & any extended class.",
    () => {
      assert(!new Result("Ok").isErr());
      assert(new Result(new Error("Test")).isErr());
      assert(new Result(new TestError("Test")).isErr());
      assert(!new Result(new ErrorLookAlike("Test")).isErr());
    }
  );

  await t.step("Symbol.toStringTag - Should return correct value.", () => {
    assertEquals(new Result("Ok")[Symbol.toStringTag], "Result");
  });

  await t.step(
    "Symbol.iterator - Should return an array with one element.",
    () => {
      assertEquals([...new Result("Ok")], ["Ok"]);
    }
  );

  await t.step("Symbol.iterator Err - Should return an empty array.", () => {
    assertEquals([...new Result(new Error("Test"))], []);
  });

  await t.step("expect - Should get contained value.", () => {
    const res = new Result("Ok").expect("Test");
    assertEquals(res, "Ok");
  });

  await t.step(
    "expect Error - Should throw an Error with a message if Result contains Error.",
    () => {
      try {
        new Result(new Error("Test")).expect("Alternative");
      } catch (e) {
        assertEquals(e, new Error("Alternative"));
        return;
      }
      fail("Method did not throw.");
    }
  );

  await t.step("expectErr - Should get contained Error value.", () => {
    const res = new Result(new Error("Test")).expectErr("Alternative");
    assertEquals(res, new Error("Test"));
  });

  await t.step(
    "expectErr Ok - Should throw an Error with a message if Result contains Ok.",
    () => {
      try {
        new Result("Ok").expectErr("Test");
      } catch (e) {
        assertEquals(e, new Error("Test"));
        return;
      }
      fail("Method did not throw.");
    }
  );

  await t.step("unwrap - Should get contained value.", () => {
    const res = new Result("Ok").unwrap();
    assertEquals(res, "Ok");
  });

  await t.step("unwrap Error - Should throw an Error.", () => {
    const err = new Error("Test");
    try {
      new Result(err).unwrap();
    } catch (e) {
      assertEquals((e as Error).message, "Unwrap called on Error");
      assertEquals(typeof (e as Error).stack, "string");
    }
  });

  await t.step("unwrap Error (no stack) - Should throw an Error.", () => {
    const err = new Error("Test");
    delete err.stack;
    try {
      new Result(err).unwrap();
    } catch (e) {
      assertEquals((e as Error).message, "Unwrap called on Error");
      assertEquals((e as Error).stack, "Unwrap called on Error: Test");
    }
  });

  await t.step("unrwapErr - Should get contained Error value.", () => {
    const err = new Result(new Error("Test")).unwrapErr();
    assertEquals(err.message, "Test");
  });

  await t.step(
    "unwrapErr Ok - Should throw an Error if Result contains Ok.",
    () => {
      try {
        new Result("Ok").unwrapErr();
      } catch (_) {
        return;
      }
      fail("Method did not throw.");
    }
  );

  await t.step("unwrapOr - Should get contained value.", () => {
    const res = new Result("Ok").unwrapOr("Test");
    assertEquals(res, "Ok");
  });

  await t.step("unwrapOr Error - Should get default value.", () => {
    const res = new Result<string, Error>(new Error("Test")).unwrapOr("Ok");
    assertEquals(res, "Ok");
  });

  await t.step("unwrapOrElse - Should get contained value.", () => {
    const res = new Result("Ok").unwrapOrElse(() => "Test");
    assertEquals(res, "Ok");
  });

  await t.step("unwrapOrElse Error - Should get computed value.", () => {
    const res = new Result<string, Error>(new Error("Test")).unwrapOrElse(
      () => "Ok"
    );
    assertEquals(res, "Ok");
  });

  await t.step("map - Should get mapped value.", () => {
    const res = new Result(123).map(() => "Test");
    assertEquals(res.peek(), "Test");
  });

  await t.step("map Error - Should get Error.", () => {
    const res = new Result<string, Error>(new Error("Test")).map(() => "Test");
    assert(res.isErr());
  });

  await t.step("mapErr - Should get mapped value.", () => {
    const res = new Result<string, Error>(new Error("Test")).mapErr(
      () => new TestError("Ok")
    );
    assertEquals(res.unwrapErr().name, "TestError");
  });

  await t.step("mapErr Ok - Should return Ok.", () => {
    const res = new Result<string, Error>("Ok").mapErr(
      () => new TestError("Test")
    );
    assertEquals(res.unwrap(), "Ok");
  });

  await t.step("mapOr - Should get mapped value.", () => {
    const res = new Result(123).mapOr("Test", () => "Ok");
    assertEquals(res, "Ok");
  });

  await t.step("mapOr Error - Should get Error.", () => {
    const res = new Result<string, Error>(new Error("Test")).mapOr(
      "Ok",
      () => "Test"
    );
    assertEquals(res, "Ok");
  });

  await t.step("peek - Should get contained value.", () => {
    const res = new Result("Ok").peek();
    assertEquals(res, "Ok");
  });

  await t.step("or - Should get contained value.", () => {
    const res = new Result("Ok").or(new Result("Test"));
    assertEquals(res.peek(), "Ok");
  });

  await t.step("or Error - Should get default value.", () => {
    const res = new Result<string, Error>(new Error("Test")).or(
      new Result("Ok")
    );
    assertEquals(res.peek(), "Ok");
  });

  await t.step("throw - Should throw an Error.", () => {
    try {
      new Result(new Error("Test")).throw();
    } catch (_) {
      return;
    }
    fail("Method did not throw.");
  });

  await t.step("throw Ok - Should not throw an Error.", () => {
    new Result("Ok").throw();
  });

  await t.step("ok - Should convert Ok to Some.", () => {
    const res = new Result("Ok").ok();
    assertEquals(res.unwrap(), "Ok");
    assertEquals(res.isSome(), true);
  });

  await t.step("ok Error - Should convert Err to None.", () => {
    const res = new Result<string, Error>(new Error("Test")).ok();
    assert(res.isNone());
  });

  await t.step('flatten - Should converts from Result<Result<T, E>, E> to Result<T, E>', () => {
    const res = new Result<Result<string, Error>, Error>(new Result<string, Error>('test'))
    assert(res.flatten(), new Result('test'))
  })
});

Deno.test("Result - Supporting Function Tests", async (t) => {
  await t.step("Ok - Should return Ok result.", () => {
    const res = Ok("Test");
    assertEquals(res.isOk(), true);
    assertEquals(res.peek(), "Test");
  });

  await t.step("Ok instanceof - Should return true.", () => {
    const res = Ok("Test");
    assertEquals(res instanceof Ok, true);
  });

  await t.step("Err - Should return Error result.", () => {
    const res = Err(new Error("Test"));
    assertEquals(res.isErr(), true);
    assertEquals(res.unwrapErr().message, "Test");
  });

  await t.step("Err String - Should construct and return Error result.", () => {
    const res = Err("Test");
    assertEquals(res.isErr(), true);
    assertEquals(res.unwrapErr().message, "Test");
  });

  await t.step("Err instanceof - Should return true.", () => {
    const res = Err(new Error("Test"));
    assertEquals(res instanceof Err, true);
  });

  await t.step("from - Should return Ok result.", () => {
    const res = Result.from(() => "Test");
    assert(res.isOk());
    assertEquals(res.peek(), "Test");
  });

  await t.step("from Error - Should return Err result.", () => {
    const res = Result.from(() => {
      throw new Error("Test");
    });
    assert(res.isErr());
    assertEquals(res.peek().message, "Test");
  });

  await t.step("fromAsync - Should return Ok result.", async () => {
    const res = await Result.fromAsync(
      async () => await Promise.resolve("Test")
    );
    assert(res.isOk());
    assertEquals(res.peek(), "Test");
  });

  await t.step("fromAsync Error - Should return Err result.", async () => {
    const res = await Result.fromAsync(
      async () => await Promise.reject(new Error("Test"))
    );
    assert(res.isErr());
    assertEquals((res.peek() as Error).message, "Test");
  });

  await t.step(
    "Result.partition - Should create array or Oks and Errs",
    async () => {
      const res = await Result.partition([
        Ok("1"),
        Ok("2"),
        Err("1"),
        Err("2"),
      ]);
      assertEquals(res.ok, ["1", "2"]);
      assertEquals(res.err.length, 2);
    }
  );
});
