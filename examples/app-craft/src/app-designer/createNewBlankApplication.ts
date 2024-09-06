import {Application} from "./AppDesigner.tsx";
import {guid} from "../utils/guid.ts";
import {createNewBlankPage} from "./createNewBlankPage.ts";

export function createNewBlankApplication(): Application {
    return {
        id: guid(),
        name: '',
        pages: [createNewBlankPage()],
        tables: [],
        callables: [],
        variables: [],
        fetchers: [],
        queries: []
    }
}