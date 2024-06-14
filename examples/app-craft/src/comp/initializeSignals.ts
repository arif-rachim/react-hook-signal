import {AnySignalType, SignalStateContextData} from "./Component.ts";
import {Signal} from "signal-polyfill";

export function initializeSignals(signals: AnySignalType[]): SignalStateContextData {
    const result: SignalStateContextData = [];
    // first we iterate all state first
    for (const signalType of signals) {
        if (signalType.type === 'State') {
            try {
                const fun = new Function(signalType.formula);
                result.push({type: signalType, signal: new Signal.State(fun())})
            } catch (error) {
                console.error(error);
            }
        }
    }
    // now we iterate all computed
    for (const signalType of signals) {
        if (signalType.type === 'Computed') {
            result.push({
                type: signalType, signal: new Signal.Computed(() => {
                    const values: Array<unknown> = [];
                    const paramNames: string[] = [];
                    for (const key of signalType.signalDependencies) {
                        const dependencySignal = result.find(i => i.type.id === key);
                        if (dependencySignal === undefined) {
                            continue;
                        }
                        const {signal, type} = dependencySignal;
                        values.push(signal.get());
                        paramNames.push(type.name);
                    }
                    try {
                        const fun = new Function(...paramNames, signalType.formula);
                        return fun(...values);
                    } catch (error) {
                        console.error(error);
                        return undefined;
                    }
                })
            })
        }
    }

    return result;
}