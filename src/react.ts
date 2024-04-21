import React from "react";

import { effect } from "./effect.ts";
import { type WithSignal, snapshot } from "./signal.ts";

/**
 * useSignal
 *
 * Create a local snapshot from signal that catches signal.
 * The component will only re-render when the parts of the state you access have changed, it is render-optimized.
 *
 * @example
 * ```js
 * const counter = signal(0);

 * function Counter() {
 *    const snap = useSignal(counter);
 *    return (
 *      <div>
 *          {snap}
 *          <button onClick={() => ++counter.value}>+1</button>
 *      </div>
 *    )
 * }
 * ```
 *
 */
export function useSignal<T>(target: WithSignal<T>): T {
  const subscribe = React.useCallback(function subscribe(callback: () => void) {
    return effect(callback);
  }, []);

  const getSnapshot = React.useCallback(
    function getSnapshot() {
      const nextSnapshot = snapshot(target.$$signal);

      return nextSnapshot;
    },
    [target],
  );

  const currSnapshot = React.useSyncExternalStore(subscribe, getSnapshot);

  return currSnapshot;
}
