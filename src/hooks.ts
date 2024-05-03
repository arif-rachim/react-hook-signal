import {Signal} from "signal-polyfill";
import React, {type JSX, useState} from "react";
import {effect} from "./effect.ts";
import {Lambda} from "./components.ts";


export type JSXAttribute<K extends keyof JSX.IntrinsicElements, A extends keyof JSX.IntrinsicElements[K]> = NonNullable<JSX.IntrinsicElements[K][A]>;

/**
 * Executes the provided effect callback whenever the dependencies change.
 */
export function useSignalEffect(callback: React.EffectCallback) {

    const propsRef = React.useRef(callback);
    propsRef.current = callback;

    React.useEffect(function onEffect() {
        return effect(propsRef.current)
    }, [])
}

type OptionType<T> = T extends Lambda<infer R> ? R : T

/**
 * Creates a signal with initial value and options.
 */
export function useSignal<T>(param:T, options: Signal.Options<OptionType<T>> = {}):Signal.State<T>{

    function initialState(){
        return new Signal.State(param,options as Signal.Options<T>);
    }
    const [state] = useState<ReturnType<typeof initialState>>(initialState);
    return state
}

/**
 * Creates a signal with initial value and options.
 */
export function useComputed<T>(param:Lambda<T>, options: Signal.Options<OptionType<T>> = {}):Signal.Computed<T>{
    function initialState(){
        return new Signal.Computed(param as Lambda<T>,options as Signal.Options<T>);
    }
    const [state] = useState<Signal.Computed<T>>(initialState);
    return state
}