import {Variable, VariableInstance} from "../AppDesigner.tsx";
import {AnySignal} from "react-hook-signal";

export function variablesInstanceToDictionary(variableInstances: Array<VariableInstance>, variables: Array<Variable>): Record<string, AnySignal<unknown>> {
    return variableInstances.reduce((res, variableInstance) => {
        const v = variables.find(v => variableInstance.id === v.id);
        if (v) {
            res[v.name] = variableInstance.instance
        }
        return res;
    }, {} as Record<string, AnySignal<unknown>>);
}