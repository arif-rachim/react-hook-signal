import {Signal} from "signal-polyfill";
import React, {type JSX, useState} from "react";
import {effect} from "./effect.ts";
import {Lambda} from "./components.ts";


export type JSXAttribute<K extends keyof JSX.IntrinsicElements, A extends keyof JSX.IntrinsicElements[K]> = NonNullable<JSX.IntrinsicElements[K][A]>;

/**
 * Executes the provided effect callback whenever the dependencies change.
 * @param {React.EffectCallback} callback The effect callback function to execute.
 */
export function useSignalEffect(callback: React.EffectCallback) {

    const propsRef = React.useRef(callback);
    propsRef.current = callback;

    React.useEffect(function onEffect() {
        return effect(propsRef.current)
    }, [])
}

type SignalType<T> = T extends Lambda<infer R> ? Signal.Computed<R> : Signal.State<T>
type OptionType<T> = T extends Lambda<infer R> ? R : T

/**
 * Creates a signal with initial value and options.
 * @param param The initial value or function to derive the value from.
 * @param options Options for creating the signal.
 * @returns The created signal.
 */
export function useSignal<T>(param:T, options: Signal.Options<OptionType<T>> = {}):SignalType<T>{

    function initialState(){
        if(param !== null && param !== undefined && typeof param === 'function'){
            return new Signal.Computed(param as Lambda<unknown>,options as Signal.Options<unknown>);
        }
        return new Signal.State(param,options as Signal.Options<T>);
    }
    const [state] = useState<ReturnType<typeof initialState>>(initialState);
    return state as SignalType<T>
}