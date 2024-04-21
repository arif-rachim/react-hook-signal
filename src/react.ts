import React from "react";

import { effect } from "./effect.ts";
import { type WithSignal, snapshot } from "./signal.ts";

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
