import {Signal} from "signal-polyfill";
import type {EffectCallback} from "react";

let needsEnqueue = true;

const signalWatcher = new Signal.subtle.Watcher(function notify(){
    if (needsEnqueue) {
        needsEnqueue = false;
        queueMicrotask(processPending);
    }
});

function processPending() {
    needsEnqueue = true;
    for (const s of signalWatcher.getPending()) {
        s.get();
    }
    signalWatcher.watch();
}

export function effect(callback: EffectCallback) {
    let cleanup: ReturnType<EffectCallback>;

    const computed = new Signal.Computed(function computation() {
        typeof cleanup === "function" && cleanup();
        cleanup = callback();
    });

    signalWatcher.watch(computed);
    computed.get();

    return function destroyEffect(){
        signalWatcher.unwatch(computed);
        typeof cleanup === "function" && cleanup();
    };
}