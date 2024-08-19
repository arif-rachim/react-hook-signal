import {guid} from "../utils/guid.ts";
import {Page} from "./AppDesigner.tsx";

export function createNewBlankPage(): Page {
    return {
        id: guid(),
        variables: [],
        fetchers: [],
        containers: [{
            id: guid(),
            type: 'container',
            children: [],
            properties: {},
        }],
        name: 'home'
    }
}