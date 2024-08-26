import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {Callable, Fetcher, Variable, VariableInstance} from "../AppDesigner.tsx";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";
import {Signal} from "signal-polyfill";
import {fetcherInitialization} from "./fetcherSchemaInitialization.ts";
import {queryInitialization} from "./queryInitialization.ts";
import {Query} from "../panels/database/service/getTables.ts";
import {AnySignal} from "react-hook-signal";

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

export function callableInitialization(allCallables: Array<Callable>,allFetchers:Array<Fetcher>,allVariablesSignal:Signal.Computed<Array<Variable>>,allVariablesSignalInstance:AnySignal<Array<VariableInstance>>,allQueries:Array<Query>) {
    const call: Record<string, (...args:unknown[]) => unknown> = {};
    for (const callable of allCallables) {
        const module: { exports: () => void } = {
            exports: () => {
            }
        };
        const dependencies = allVariablesSignal.get().map(t => {
            const instance = allVariablesSignalInstance.get().find(v => v.id === t.id)?.instance;
            return {name:t.name,instance}
        }) ?? [];
        try{
            const fun = new Function('module', 'db','fetchers','query',...dependencies.map(v => v?.name ?? ''), callable.functionCode);
            fun.call(null, module, dbSchemaInitialization(),fetcherInitialization(allFetchers,allVariablesSignal,allVariablesSignalInstance),queryInitialization(allQueries) ,...dependencies.map(v => v.instance))
            call[callable.name] = module.exports
        }catch(err){
            console.error(err);
        }

    }
    return call
}
