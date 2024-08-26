import {Fetcher, Variable, VariableInstance} from "../AppDesigner.tsx";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {createRequest} from "../panels/fetchers/editor/createRequest.ts";
import {Signal} from "signal-polyfill";
import {AnySignal} from "react-hook-signal";

export function composeFetcherSchema(allFetchers: Array<Fetcher>) {
    const fetchersSchema = allFetchers.map(i => {
        const schema = zodSchemaToJson(i.returnTypeSchemaCode);
        let paths = [...i.paths, ...i.headers].reduce((result, path) => {
            if (!path.isInput) {
                return result;
            }
            if (isEmpty(path.name)) {
                return result;
            }
            result.push(`${path.name}:string`)
            return result;
        }, [] as Array<string>)
        paths = i.data.reduce((result, path) => {
            if (!path.isInput) {
                return result;
            }
            if (isEmpty(path.name)) {
                return result;
            }
            result.push(`${path.name}:unknown`)
            return result;
        }, paths)
        const type = '{' + paths.join(',') + '}'
        return `${i.name} : (props:${type}) => Promise<{error:string,result:${schema}}>`
    })

    return `
declare const fetchers:{
    ${fetchersSchema.join(',')}
};
`
}

export function fetcherInitialization(allFetchers: Array<Fetcher>, allVariablesSignal:Signal.Computed<Array<Variable>>, allVariablesSignalInstance:AnySignal<Array<VariableInstance>>) {
    const fetchers: Record<string, (inputs: Record<string, unknown>) => unknown> = {};
    for (const fetcherValue of allFetchers) {

        fetchers[fetcherValue.name] = async (inputs: Record<string, unknown>) => {
            try {
                const fetcher = {...fetcherValue};
                const allVariables = allVariablesSignal.get();
                const allVariablesInstance = allVariablesSignalInstance.get();
                const dependencies = allVariables.map(v => {
                    const instance = allVariablesInstance.find(variable => variable.id === v.id)?.instance;
                    return {name:v.name, instance}
                }) ?? [];

                const module: {
                    exports: {
                        protocol?: 'http' | 'https',
                        domain?: string,
                        method?: 'post' | 'get' | 'put' | 'patch' | 'delete',
                        contentType?: 'application/x-www-form-urlencoded' | 'application/json'
                        path?: string,
                        headers?: Record<string,string>,
                        data?: Record<string,unknown>,
                    }
                } = {exports: {}};

                try {
                    const params = ['module', ...dependencies.map(d => d.name ?? ''), fetcher.defaultValueFormula ?? ''];
                    const fun = new Function(...params)
                    fun.call(null, ...[module, ...dependencies.map(d => d.instance)]);
                    fetcher.protocol = module.exports.protocol ?? fetcher.protocol;
                    fetcher.domain = module.exports.domain ?? fetcher.domain;
                    fetcher.method = module.exports.method ?? fetcher.method;
                    fetcher.contentType = module.exports.contentType ?? fetcher.contentType;
                    fetcher.path = module.exports.path ?? fetcher.path;
                    fetcher.headers = fetcher.headers.map(h => {
                        if(module.exports.headers && h.name in  module.exports.headers){
                            return {...h,value:module.exports.headers[h.name]}
                        }
                        return h
                    });
                    fetcher.data = fetcher.data.map(h => {
                        if(module.exports.headers && h.name in  module.exports.headers){
                            return {...h,value:module.exports.headers[h.name]}
                        }
                        return h
                    });
                } catch (err) {
                    console.error(err);
                }

                const {address, requestInit} = createRequest(fetcher, inputs);
                const response = await fetch(address, requestInit);
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                const data = await response.json();
                return {
                    result: data
                }
            } catch (error:unknown) {
                const err = error as Error;
                return {error: err.message}
            }
        }
    }
    return fetchers
}