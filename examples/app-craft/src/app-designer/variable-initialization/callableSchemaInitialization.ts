import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {Callable} from "../AppDesigner.tsx";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";

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

export function callableInitialization(allCallables: Array<Callable>) {
    const call: Record<string, (...args:unknown[]) => unknown> = {};
    for (const callable of allCallables) {
        const module: { exports: () => void } = {
            exports: () => {
            }
        };
        const fun = new Function('module', 'db', callable.functionCode);
        fun.call(null, module, dbSchemaInitialization())
        call[callable.name] = module.exports
    }
    return call
}
