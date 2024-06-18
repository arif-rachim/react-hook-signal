import {AnySignalType, SignalComputed, SignalEffect, SignalState} from "../Component.ts";
import {capFirstLetter} from "../../utils/capFirstLetter.ts";

export function getFunctionSymbol<T extends AnySignalType>(signal: (T & SignalEffect) | (T & SignalComputed) | T | (T & SignalEffect & SignalState) | (T & SignalComputed & SignalState) | (T & SignalState)) {
    const varName = signal.name;
    let functionName = `function ${varName}`
    if (isState(signal)) {
        functionName = `function init${capFirstLetter(signal.name)}`;
    }
    return functionName;
}


function isState(signal:AnySignalType):signal is SignalState{
    return signal.type === 'State';
}