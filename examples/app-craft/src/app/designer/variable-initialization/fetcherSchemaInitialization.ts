import {Fetcher} from "../AppDesigner.tsx";
import {zodSchemaToJson} from "../../../core/utils/zodSchemaToJson.ts";
import {isEmpty} from "../../../core/utils/isEmpty.ts";
import {createRequest} from "../createRequest.ts";
import {FetchType, FormulaDependencyParameter} from "./AppVariableInitialization.tsx";

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
        return `${i.name} : (props?:${type}) => Promise<${schema} & {error?:string}>`
    })

    return `{${fetchersSchema.join(',')}}`
}

export function fetcherInitialization(props: {
    allFetchers: Array<Fetcher>,
    app: FormulaDependencyParameter,
    page: FormulaDependencyParameter
}): Record<string, FetchType> {

    const {
        allFetchers,
        app, page
    } = props;
    const fetchers: Record<string, FetchType> = {};


    for (const fetcherValue of allFetchers) {
        fetchers[fetcherValue.name] = async (inputs?: Record<string, unknown>) => {
            try {
                const fetcher = {...fetcherValue};
                const module: {
                    exports: {
                        protocol?: 'http' | 'https',
                        domain?: string,
                        method?: 'post' | 'get' | 'put' | 'patch' | 'delete',
                        contentType?: 'application/x-www-form-urlencoded' | 'application/json'
                        path?: string,
                        headers?: Record<string, string>,
                        data?: Record<string, unknown>,
                    }
                } = {exports: {}};

                try {
                    const params = ['module', 'app', 'page', fetcher.functionCode ?? ''];
                    const fun = new Function(...params)
                    fun.call(null, ...[module, app, page]);
                    fetcher.protocol = module.exports.protocol ?? fetcher.protocol;
                    fetcher.domain = module.exports.domain ?? fetcher.domain;
                    fetcher.method = module.exports.method ?? fetcher.method;
                    fetcher.contentType = module.exports.contentType ?? fetcher.contentType;
                    fetcher.path = module.exports.path ?? fetcher.path;
                    fetcher.headers = fetcher.headers.map(h => {
                        if (module.exports.headers && h.name in module.exports.headers) {
                            return {...h, value: module.exports.headers[h.name]}
                        }
                        return h
                    });
                    fetcher.data = fetcher.data.map(h => {
                        if (module.exports.headers && h.name in module.exports.headers) {
                            return {...h, value: module.exports.headers[h.name]}
                        }
                        return h
                    });
                } catch (err) {
                    console.error(err);
                }

                const {address, requestInit} = createRequest(fetcher, inputs ?? {});
                const response = await fetch(address, requestInit);
                if (!response.ok) {
                    return {error: 'Network response was not ok: ' + response.statusText}
                }
                return await response.json();
            } catch (error: unknown) {
                const err = error as Error;
                return {error: err.message}
            }
        }
    }
    return fetchers
}