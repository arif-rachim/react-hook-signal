import {AnySignalType, SignalComputed, SignalEffect} from "../Component.ts";
import {getFunctionSymbolWithParams} from "./getFunctionSymbolWithParams.ts";

export function generateSignalFunction<T extends AnySignalType>(signal: T | (T & SignalEffect) | (T & SignalComputed), signals: AnySignalType[], additionalParams: string[]) {
    const functionName = getFunctionSymbolWithParams<T>(signal, signals, additionalParams);
    return [functionName,signal.formula,'}'].join('\n')
}