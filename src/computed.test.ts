import { describe, it, expect, vi } from "vitest";

import { signal } from "./signal";
import { computed } from "./computed";

describe("computed", () => {
  it("should return updated value", () => {
    const count = signal<{ foo?: number }>({});
    const plusOne = computed(() => count.value.foo);

    expect(plusOne.value).toBe(undefined);
    count.value = {
      foo: 1,
    };
    expect(plusOne.value).toBe(1);
  });

  it("should compute lazily", () => {
    const count = signal<{ foo?: number }>({});
    const getter = vi.fn(() => count.value.foo);
    const plusOne = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(plusOne.value).toBe(undefined);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    count.set((val) => ({
      ...val,
      foo: 1,
    }));
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    count.set((val) => val);
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(plusOne.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it("should clear correcly", () => {
    const count = signal<{ foo?: number }>({});
    count.set((obj) => {
      return {
        ...obj,
        foo: 1,
      };
    });
    expect(count.value.foo).toBe(1);

    count.clear();
    expect(count.value).toEqual({});
  });

  it("should work when chained", () => {
    const count = signal({ foo: 0 });
    const c1 = computed(() => count.value.foo);
    const c2 = computed(() => c1.value + 1);
    expect(c2.value).toBe(1);
    expect(c1.value).toBe(0);

    // Init
    count.value = { foo: 0 };
    count.value.foo++;
    expect(c2.value).toBe(2);
    expect(c1.value).toBe(1);
  });

  it("should support setter", () => {
    const n = signal(1);
    const plusOne = computed({
      get: () => n.value + 1,
      set: (val) => {
        n.value = val - 1;
      },
    });

    expect(plusOne.value).toBe(2);
    n.value++;
    expect(plusOne.value).toBe(3);

    plusOne.value = 0;
    expect(n.value).toBe(-1);
  });
});
