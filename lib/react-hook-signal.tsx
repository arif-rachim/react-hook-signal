import {Signal as SignalPolyfill} from "signal-polyfill";
import React from "react";
import {htmlSignalComponents,Print} from './HTMLSignalComponents.tsx';

export function useSignalState<T>(initialValue: T, options: SignalPolyfill.Options<T> = {}){
    const propsRef = React.useRef<{initialValue: T, options: SignalPolyfill.Options<T>}>({initialValue,options})
    propsRef.current = {initialValue,options};
    return React.useMemo(() => new SignalPolyfill.State(propsRef.current.initialValue,propsRef.current.options),[]);
}
export const signal = {...htmlSignalComponents,print:Print}
export function useSignalComputed<T>(computation: () => T, options: SignalPolyfill.Options<T>= {}){
    const propsRef = React.useRef<{computation: () => T, options: SignalPolyfill.Options<T>}>({computation,options});
    propsRef.current = {computation,options};
    return React.useMemo(() => new SignalPolyfill.Computed(propsRef.current.computation,propsRef.current.options),[]);
}

export function useSignalEffect(callback:React.EffectCallback){
    const propsRef = React.useRef(callback);
    propsRef.current = callback;
    React.useEffect(() => effect(propsRef.current),[])
}


// following code is taken from react-hook-signal sample
let needsEnqueue = true;

const w = new SignalPolyfill.subtle.Watcher(() => {
    if (needsEnqueue) {
        needsEnqueue = false;
        queueMicrotask(processPending);
    }
});

function processPending() {
    needsEnqueue = true;
    for (const s of w.getPending()) {
        s.get();
    }
    w.watch();
}

function effect(callback:React.EffectCallback) {
    let cleanup : ReturnType<React.EffectCallback>;

    const computed = new SignalPolyfill.Computed(() => {
        typeof cleanup === "function" && cleanup();
        cleanup = callback();
    });

    w.watch(computed);
    computed.get();

    return () => {
        w.unwatch(computed);
        typeof cleanup === "function" && cleanup();
    };
}
