import {guid} from "../../core/utils/guid.ts";
import {Page} from "./AppDesigner.tsx";

export function createNewBlankPage(props: { name: string }): Page {
    const id = guid()
    return {
        queries: [],
        id: id,
        variables: [],
        fetchers: [],
        callables: [],
        containers: [{
            id: id,
            type: 'container',
            children: [],
            properties: {},
        }],
        name: props.name
    }
}