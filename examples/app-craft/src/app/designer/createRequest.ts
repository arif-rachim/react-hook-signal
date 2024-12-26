import {Fetcher, FetcherParameter} from "./AppDesigner.tsx";

export function createRequest(fetcher: Fetcher, inputs: Record<string, unknown>) {
    const url = `${fetcher.protocol}://${fetcher.domain}`;

    function populateTemplate(template: string, parameters: Record<string, string>) {
        return template.replace(/{(.*?)}/g, (match, p1) => {
            // remove any extra whitespace from the parameter name
            const paramName = p1.trim();
            // return the parameter value or the original placeholder
            return parameters[paramName] !== undefined ? parameters[paramName] : match
        })
    }

    function toRecord(encodeString: boolean, userInput: Record<string, unknown>) {
        return (result: Record<string, string>, parameter: FetcherParameter) => {
            const {name, isInput} = parameter;
            let value = parameter.value;
            try {
                value = JSON.parse(value);
            } catch (err) {
                // ignore this if this cannot be parsed
            }
            if (isInput && userInput[name]) {
                value = userInput[name] as string;
            }
            if (encodeString) {
                result[encodeURIComponent(parameter.name)] = encodeURIComponent(value)
            } else {
                result[parameter.name] = value
            }
            return result;
        }
    }

    const path = populateTemplate(fetcher.path, fetcher.paths.reduce(toRecord(true, inputs), {}));

    function trimSlashes(str: string) {
        return str.replace(/^\/+|\/+$/g, '')
    }

    const address = `${url}/${trimSlashes(path.trim())}`
    const requestInit: RequestInit = {
        method: fetcher.method,
        cache: 'no-cache',
        credentials: 'include',
        headers: fetcher.headers.reduce(toRecord(true, inputs), {
            'Content-Type': fetcher.contentType
        }),
    }

    function objectToUrlEncodedString(obj: Record<string, string>) {
        return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&')
    }

    const hasContent = ['post', 'patch', 'put'].includes(fetcher.method);
    if (hasContent) {
        if (fetcher.contentType === 'application/x-www-form-urlencoded') {
            requestInit.body = objectToUrlEncodedString(fetcher.data.reduce(toRecord(true, inputs), {}))
        }
        if (fetcher.contentType === 'application/json') {
            requestInit.body = JSON.stringify(fetcher.data.reduce(toRecord(false, inputs), {}))
        }
    }
    return {address, requestInit};
}