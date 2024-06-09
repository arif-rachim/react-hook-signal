import {AnySignalType, SignalComputed, SignalEffect, SignalState} from "../Component.ts";
import {guid} from "../../utils/guid.ts";

export function createNewValue<T extends AnySignalType>(type: T['type']): T {
    let result: AnySignalType | undefined = undefined;
    if (type === 'Computed') {
        result = {
            id: guid(),
            name: '',
            signalDependencies: [],
            formula: '',
            type: type
        } as SignalComputed
    }
    if (type === 'Effect') {
        result = {
            id: guid(),
            name: '',
            signalDependencies: [],
            formula: '',
            type: type,
            mutableSignals: []
        } as SignalEffect
    }
    if (type === 'State') {
        result = {
            name: '',
            formula: '',
            id: guid(),
            type: type
        } as SignalState;
    }
    if (isT<T>(result)) {
        return result;
    }
    throw new Error('Unable to identify type');
}


function isT<T extends AnySignalType>(value: unknown): value is T {
    return value !== undefined && value !== null && typeof value === 'object';
}