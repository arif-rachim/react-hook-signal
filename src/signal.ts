import { Signal } from "signal-polyfill";

import { isNil, type Universal } from "./utils";

export type INTERNAL_SignalState<T = Universal> = Signal.State<T>;

// shared state
const signalStateMap = new WeakMap<
  INTERNAL_SignalState,
  WithSignal<Universal>
>();

export interface WithSignal<T> {
  value: T;
  get: (oldValue?: T) => T;
  set: (dispatcher: (state: T) => T) => void;
  clear: () => void;
  readonly $$signal: Signal.State<T>;
}

export function signal<T>(
  value: T,
  options: Signal.Options<T> = {},
): WithSignal<T> {
  return createSignal(value, options);
}

function createSignal<T>(
  rawValue: T,
  options: Signal.Options<T> = {},
): WithSignal<T> {
  if (isNil(rawValue)) {
    throw new Error("value required");
  }

  const state = new Signal.State(rawValue, options);
  const stateApi = {
    // internal
    $$signal: state,
    // shared api
    get value() {
      return state.get();
    },
    set value(val: T) {
      const sanitizeValue = toValue(state);
      sanitizeValue(val);
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
  };
  signalStateMap.set(state, stateApi);

  return Object.preventExtensions(stateApi);
}

function toValue<T>(state: Signal.State<T>) {
  return function (val: T) {
    state.set(val);
  };
}

export function snapshot<T>(state: Signal.State<T>) {
  const currSnapshot = signalStateMap.get(state);

  return currSnapshot?.$$signal.get() as T;
}
