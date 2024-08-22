import {guid} from "../utils/guid.ts";
import {Page} from "./AppDesigner.tsx";

export function createNewBlankPage(): Page {
    return {
        queries: [],
        id: guid(),
        variables: [],
        fetchers: [],
        callables: [],
        containers: [{
            id: guid(),
            type: 'container',
            children: [],
            properties: {},
        }],
        name: 'home'
    }
}