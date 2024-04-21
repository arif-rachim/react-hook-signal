import { Signal } from "signal-polyfill";

import { isNil, isFunction, type Universal } from "./utils";

type AnyFunction<T = Universal> = (...args: Universal[]) => T;

export type INTERNAL_SignalState<T = Universal> = Signal.State<T>;

// shared state
const signalStateMap = new WeakMap<
  INTERNAL_SignalState,
  WithSignal<Universal>
>();

interface WithSignalDebug {
  isSignal: () => boolean;
}

export interface WithSignal<T> {
  readonly __INTERNAL_SIGNAL: Signal.State<T>;
  readonly __INTERNAL_IS_SIGNAL: boolean;
  value: T;
  get: (oldValue?: T) => T;
  set: (dispatcher: (state: T) => T) => void;
  clear: () => void;
  debug: WithSignalDebug;
}

export type ReadonlySignal<T> = Omit<WithSignal<T>, "value" | "set" | "clear">;

export type UnwrapSignal<T, Fn = ReturnType<() => T>> =
  T extends WithSignal<infer V> ? V : T extends AnyFunction ? Fn : T;

export function signal<T>(
  value: T | (() => T),
  options?: Signal.Options<T>,
): WithSignal<UnwrapSignal<T>>;
export function signal<T>(
  value: T,
  options: Signal.Options<T> = {},
): WithSignal<T> {
  return createSignal(value, options);
}

function createSignal<T>(rawValue: T, options: Signal.Options<T> = {}) {
  if (isNil(rawValue)) {
    throw new Error("value required");
  }

  const state = new Signal.State(rawValue, options);
  const stateApi = {
    // internal
    __INTERNAL_SIGNAL: state,
    __INTERNAL_IS_SIGNAL: true,
    // shared
    get value() {
      return toValue(state.get());
    },
    set value(val: T) {
      state.set(val);
    },
    get() {
      return this.value;
    },
    set(dispatcher: (state: T) => T) {
      const dispatched = dispatcher(this.value);
      state.set(dispatched);
    },
    clear() {
      this.set(() => rawValue);
      signalStateMap.delete(state);
    },
    // debug
    debug: {
      isSignal() {
        return isSignal(rawValue);
      },
    },
  };
  signalStateMap.set(state, stateApi);

  return Object.preventExtensions(stateApi);
}

export function isSignal<T>(s: ReadonlySignal<T> | T): s is WithSignal<T>;
export function isSignal(s: Universal): s is WithSignal<unknown> {
  return !!(s && s.__INTERNAL_IS_SIGNAL === true);
}

export type MaybeSignal<T> = T | WithSignal<T>;
function unsignal<T>(signal: MaybeSignal<T>): T {
  return isSignal(signal) ? signal.value : signal;
}

export function toValue<T>(source: T): T {
  return isFunction(source) ? (source() as T) : unsignal(source);
}

export function snapshot<T>(state: Signal.State<T>) {
  const currSnapshot = signalStateMap.get(state);
  return currSnapshot?.__INTERNAL_SIGNAL.get() as T;
}
