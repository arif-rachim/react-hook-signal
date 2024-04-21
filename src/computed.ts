import { Signal } from "signal-polyfill";

import { effect } from "./effect";
import { type Universal, isFunction } from "./utils";

export interface ComputedSignal<T = Universal> {
  readonly value: T;
}

export interface WritableComputedSignal<T> {
  value: T;
}

export type ComputedGetter<T> = (oldValue?: T) => T;
export type ComputedSetter<T> = (newValue: T) => void;

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>;
  set: ComputedSetter<T>;
}

/**
 * Takes a getter function and returns a readonly object for the
 * returned value from the getter. It can also take an object with get and set
 * functions to create a writable ref object.
 *
 * @example
 * ```js
 * // Creating a readonly computed signal:
 * const count = signal(0);
 * const plusOne = computed(() => count.value + 1);
 *
 * ++count.value
 * console.log(plusOne.value) // 2
 * ```
 *
 * ```js
 * // Creating a writable computed signal:
 * const count = signal(1);
 * const plusOne = computed({
 *   get: () => count.value + 1,
 *   set: (val) => {
 *     count.value = val - 1;
 *   },
 * });
 *
 * ++count.value
 * console.log(plusOne.value) // 2
 *
 * plusOne.value = 0;
 * console.log(counter.value) // -1
 * ```
 *
 */
export function computed<T>(
  getter: ComputedGetter<T>,
  signalOptions?: Signal.Options<T>,
): ComputedSignal<T>;
export function computed<T>(
  getterOptions: WritableComputedOptions<T>,
  signalOptions?: Signal.Options<T>,
): WritableComputedSignal<T>;
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  signalOptions?: Signal.Options<T>,
) {
  let getter: ComputedGetter<T>;
  let setter: ComputedSetter<T>;

  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  const computedSignal = new Signal.Computed(getter, signalOptions);

  return {
    get value() {
      return computedSignal.get();
    },
    set value(val: T) {
      effect(() => {
        setter(val);
      });
    },
  };
}
