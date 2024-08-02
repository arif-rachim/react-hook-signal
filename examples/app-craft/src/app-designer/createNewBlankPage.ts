import {guid} from "../utils/guid.ts";
import {Page} from "./AppDesigner.tsx";

export function createNewBlankPage(): Page {
    return {
        id: guid(),
        variables: [],
        containers: [{
            id: guid(),
            type: 'vertical',
            children: [],
            properties: {},
        }],
        name: 'home'
    }
}