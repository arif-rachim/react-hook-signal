import {Fetcher} from "../AppDesigner.tsx";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {createRequest} from "../panels/fetchers/editor/createRequest.ts";

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

export function fetchersInitialization(allFetchers: Array<Fetcher>) {
    const fetchers: Record<string, (inputs: Record<string, unknown>) => unknown> = {};
    for (const fetcher of allFetchers) {
        fetchers[fetcher.name] = async (inputs: Record<string, unknown>) => {
            try {
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