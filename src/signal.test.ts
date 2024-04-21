import { expect, it, describe, vi } from "vitest";

import { signal, isSignal } from "./signal";
import { effect } from "./effect.ts";

describe("signal", () => {
  it("should hold a value ", () => {
    const a = signal(1);
    expect(a.value).toBe(1);
    a.value = 2;
    expect(a.value).toBe(2);
  });

  it("should be reactive", () => {
    const a = signal(1);
    const fn = vi.fn(() => {
      a.value++;
    });
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(a.value).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = signal({
      count: 1,
    });

    a.set(({ count }) => {
      return {
        count: ++count,
      };
    });
    expect(a.value.count).toBe(2);
  });

  it("should unwrap nested signal", () => {
    const a = signal(1);
    const b = signal(a);
    // Check parameter
    expect(a.debug.isSignal()).toBe(false);
    expect(b.debug.isSignal()).toBe(true);

    // Unwrapped
    expect(b.value).toBe(1);

    // Accepts pure function
    const c = signal(() => 2);
    expect(c.value).toBe(2);
  });

  it("should unwrap nested ref in types", () => {
    const a = signal(0);
    const b = signal(a);

    expect(typeof (b.value + 1)).toBe("number");
  });

  it("isSignal", () => {
    const a = signal(0);
    expect(isSignal(a)).toBe(true);
    expect(isSignal({ value: 0 })).toBe(false);
  });
});
