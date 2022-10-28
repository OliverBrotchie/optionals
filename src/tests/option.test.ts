import { Option, Some, None, none } from "../option.ts";
import {
  assertEquals,
  assert,
  fail,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";

const symbol = Symbol("Fake None");

Deno.test("Option", async (t) => {
  await t.step("isSome - Should correctly identify a Some value.", () => {
    assert(new Option("Some").isSome());
    assert(!new Option(none).isSome());
    assert(new Option(symbol).isSome());
  });

  await t.step("isNone - Should correctly identify a None value.", () => {
    assert(!new Option("Some").isNone());
    assert(new Option(none).isNone());
    assert(!new Option(symbol).isNone());
  });

  await t.step("Symbol.toStringTag - Should return correct value.", () => {
    assertEquals(new Option("Some")[Symbol.toStringTag], "Option");
  });

  await t.step("Symbol.iterator - Should return correct value.", () => {
    assertEquals([...new Option("Ok")], ["Ok"]);
  });

  await t.step("expect - Should get contained value.", () => {
    const res = new Option("Some").expect("Test");
    assertEquals(res, "Some");
  });

  await t.step(
    "expect None - Should throw an error with a message if Option contains None.",
    () => {
      try {
        new Option(none).expect("Alternative");
      } catch (e) {
        assertEquals(e, new Error("Alternative"));
        return;
      }
      fail("Method did not throw.");
    }
  );

  await t.step("unwrap - Should get contained value.", () => {
    const res = new Option("Some").unwrap();
    assertEquals(res, "Some");
  });

  await t.step(
    "unwrap None - Should throw an error if Option contains None.",
    () => {
      try {
        new Option(none).unwrap();
      } catch (_) {
        return;
      }
      fail("Method did not throw.");
    }
  );

  await t.step("unwrapOr - Should get contained value.", () => {
    const res = new Option("Some").unwrapOr("Test");
    assertEquals(res, "Some");
  });

  await t.step("unwrapOr None - Should get default value.", () => {
    const res = new Option<string>(none).unwrapOr("Ok");
    assertEquals(res, "Ok");
  });

  await t.step("unwrapOrElse - Should get contained value.", () => {
    const res = new Option("Ok").unwrapOrElse(() => "Test");
    assertEquals(res, "Ok");
  });

  await t.step("unwrapOrElse None - Should get computed value.", () => {
    const res = new Option<string>(none).unwrapOrElse(() => "Ok");
    assertEquals(res, "Ok");
  });

  await t.step("map - Should get mapped value.", () => {
    const res = new Option(123).map(() => "Test");
    assertEquals(res.peek(), "Test");
  });

  await t.step("map None - Should leave value untouched.", () => {
    const res = new Option<string>(none).map(() => "Test");
    assert(res.isNone());
  });

  await t.step("mapOr - Should get mapped value.", () => {
    const res = new Option(123).mapOr("Test", () => "Ok");
    assertEquals(res, "Ok");
  });

  await t.step("mapOr None - Should get Error.", () => {
    const res = new Option<string>(none).mapOr("Ok", () => "Test");
    assertEquals(res, "Ok");
  });

  await t.step("peek - Should get contained value.", () => {
    const res = new Option("Ok").peek();
    assertEquals(res, "Ok");
  });

  await t.step("or - Should get contained value.", () => {
    const res = new Option("Ok").or(new Option("Test"));
    assertEquals(res.peek(), "Ok");
  });

  await t.step("or None - Should get default value.", () => {
    const res = new Option<string>(none).or(new Option("Ok"));
    assertEquals(res.peek(), "Ok");
  });
});

Deno.test("Result - Supporting Function Tests", async (t) => {
  await t.step("Some - Should return Some result.", () => {
    const res = Some("Test");
    assertEquals(res.isSome(), true);
    assertEquals(res.peek(), "Test");
  });

  await t.step("Some instanceof - Should return true.", () => {
    const res = Some("Test");
    assert(res instanceof Some);
  });

  await t.step("None - Should return None result.", () => {
    const res = None();
    assertEquals(res.isNone(), true);
  });

  await t.step("None instanceof - Should return true.", () => {
    const res = None();
    assert(res instanceof None);
  });

  await t.step("from - Should return Ok result.", () => {
    const res = Option.from(() => "Test");
    assert(res.isSome());
    assertEquals(res.peek(), "Test");
  });

  await t.step("from Error - Should return None result.", () => {
    const res = Option.from(() => {
      throw new Error("Test");
    });
    assert(res.isNone());
  });

  await t.step("fromAsync - Should return Ok result.", async () => {
    const res = await Option.fromAsync(
      async () => await Promise.resolve("Test")
    );
    assert(res.isSome());
    assertEquals(res.peek(), "Test");
  });

  await t.step("fromAsync Error - Should return None result.", async () => {
    const res = await Option.fromAsync(
      async () => await Promise.reject(new Error("Test"))
    );
    assert(res.isNone());
  });
});
