import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {Callable, Fetcher, Variable, VariableInstance} from "../AppDesigner.tsx";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";
import {Signal} from "signal-polyfill";
import {fetchersInitialization} from "./fetcherSchemaInitialization.ts";

export function composeCallableSchema(allCallables: Array<Callable>) {
    const callableSchema = [];
    for (const callable of allCallables) {
        const code = `${callable.name} : (param:${zodSchemaToJson(callable.inputSchemaCode)}) => ${zodSchemaToJson(callable.schemaCode)}`;
        callableSchema.push(code);
    }

    return `
declare const call:{
    ${callableSchema.join(',')}
};
`
}

export function callableInitialization(allCallables: Array<Callable>,allFetchers:Array<Fetcher>,allVariablesSignal:Signal.Computed<Array<Variable>>,allVariablesSignalInstance:Signal.Computed<Array<VariableInstance>>) {
    const call: Record<string, (...args:unknown[]) => unknown> = {};
    for (const callable of allCallables) {
        const module: { exports: () => void } = {
            exports: () => {
            }
        };
        const dependencies = callable.dependencies?.map(variableId => {
            const name = allVariablesSignal.get().find(v => v.id === variableId)?.name;
            const instance = allVariablesSignalInstance.get().find(v => v.id === variableId)?.instance;
            return {name,instance}
        }) ?? [];
        try{
            const fun = new Function('module', 'db','fetchers',...dependencies.map(v => v?.name ?? ''), callable.functionCode);
            fun.call(null, module, dbSchemaInitialization(),fetchersInitialization(allFetchers,allVariablesSignal,allVariablesSignalInstance),...dependencies.map(v => v.instance))
            call[callable.name] = module.exports
        }catch(err){
            console.log(err);
        }

    }
    return call
}
