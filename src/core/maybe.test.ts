import { describe, it, expect } from "vitest";
import { None, Some } from "./maybe";

describe("Maybe", () => {
  it("Some", () => {
    const maybe = Some(69);
    expect(maybe.isSome).toBe(true);
    expect(maybe.isNone).toBe(false);
    expect(maybe.unwrap()).toBe(69);
    expect(maybe.unwrapOr(420)).toBe(69);
  });

  it("None", () => {
    const maybe = None<number>();
    expect(maybe.isSome).toBe(false);
    expect(maybe.isNone).toBe(true);
    expect(() => {
      maybe.unwrap();
    }).toThrow("Unwrapping None");
    expect(maybe.unwrapOr(420)).toBe(420);
  });
});
