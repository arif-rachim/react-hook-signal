import {Callable, Fetcher, Page, Variable} from "./AppDesigner.tsx";
import {zodSchemaToJson} from "./zodSchemaToJson.ts";
import {Query, Table} from "./panels/database/service/getTables.ts";
import {composeDbSchema} from "./variable-initialization/dbSchemaInitialization.ts";
import {composeCallableSchema} from "./variable-initialization/callableSchemaInitialization.ts";
import {composeFetcherSchema} from "./variable-initialization/fetcherSchemaInitialization.ts";
import {composeQuerySchema} from "./variable-initialization/queryInitialization.ts";

export function initiateSchemaTS(props: {
    allApplicationVariables: Array<Variable>,
    allApplicationQueries: Array<Query>,
    allApplicationFetchers: Array<Fetcher>,
    allApplicationCallables: Array<Callable>,

    allPageVariables: Array<Variable>,
    allPageQueries: Array<Query>,
    allPageFetchers: Array<Fetcher>,
    allPageCallables: Array<Callable>,

    returnType: string,
    allPages: Array<Page>,
    allTables: Array<Table>,
}) {
    const {
        allApplicationVariables,
        allApplicationFetchers,
        allApplicationQueries,
        allApplicationCallables,
        allPageQueries,
        allPageFetchers,
        allPageVariables,
        allPageCallables,
        allTables,
        allPages,
        returnType
    } = props;
    return `

${returnTypeDefinition(returnType)}
${composeNavigation(allPages)}
${composeDbSchema(allTables)}

declare const app:{
    var:${composeLibrary(allApplicationVariables)},
    query:${composeQuerySchema(allApplicationQueries)},
    fetch:${composeFetcherSchema(allApplicationFetchers)},
    call:${composeCallableSchema(allApplicationCallables)}
};

declare const page:{
    var:${composeLibrary(allPageVariables)},
    query:${composeQuerySchema(allPageQueries)},
    fetch:${composeFetcherSchema(allPageFetchers)},
    call:${composeCallableSchema(allPageCallables)}
};`;
}
const returnTypeDefinition = (returnType: string) => {
    if (returnType) {
        return `declare const module:{exports:${returnType}};`
    }
    return '';
}

function composeLibrary(allVariables: Array<Variable>) {
    const variables = allVariables.filter(v => v.type !== 'effect').map(i => {
        const schema = zodSchemaToJson(i.schemaCode);
        let type = `Signal.State<${schema}>`;
        if (i.type === 'computed') {
            type = `Signal.Computed<${schema}>`
        }
        return `${i.name}:${type}`
    });
    return `{${variables.join(';\n')}}`;
}

function composeNavigation(allPages: Array<Page>) {
    const type = allPages.map(p => {
        const param = p.variables.filter(v => v.type === 'state').map(v => {
            return `${v.name}?:${zodSchemaToJson(v.schemaCode)}`
        }).join(',')
        return `${p.name}:(param:{${param}}) => void`;
    }).join(',')
    return `declare const navigate:{${type}};`
}
