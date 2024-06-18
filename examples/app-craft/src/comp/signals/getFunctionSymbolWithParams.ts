import {AnySignalType, SignalComputed, SignalEffect} from "../Component.ts";
import {convertToSetterName} from "../../utils/convertToSetterName.ts";
import {getFunctionSymbol} from "./getFunctionSymbol.ts";

export function getFunctionSymbolWithParams<T extends AnySignalType>(signal: T | (T & SignalEffect) | (T & SignalComputed), signals: AnySignalType[], additionalParams: string[]) {
    let dependencySignals: string[] = [];
    if (isEffectOrComputed(signal)) {
        const result = signal.signalDependencies.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if (signalType === undefined) {
                return '';
            }
            return signalType.name
        });
        dependencySignals = [...dependencySignals, ...result];
    }
    if (isEffect(signal)) {
        const result = signal.mutableSignals.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if (signalType === undefined) {
                return '';
            }
            return convertToSetterName(signalType.name)
        });
        dependencySignals = [...dependencySignals, ...result];
    }
    dependencySignals = [...dependencySignals, ...additionalParams];
    const functionName = getFunctionSymbol(signal);
    return functionName+`(${[...dependencySignals].filter(i => i).join(', ')}){`;
}


function isEffectOrComputed(signal: AnySignalType): signal is SignalEffect | SignalComputed {
    return signal.type === 'Effect' || signal.type === 'Computed';
}


function isEffect(signal:AnySignalType):signal is SignalEffect{
    return signal.type === 'Effect';
}
