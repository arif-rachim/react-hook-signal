import {Monaco} from "@monaco-editor/react";
import {Callable, Fetcher, Page, Variable} from "./AppDesigner.tsx";
import {zodSchemaToJson} from "./zodSchemaToJson.ts";
import {Query, Table} from "./panels/database/service/getTables.ts";
import {composeDbSchema} from "./variable-initialization/dbSchemaInitialization.ts";
import {composeCallableSchema} from "./variable-initialization/callableSchemaInitialization.ts";
import {composeFetcherSchema} from "./variable-initialization/fetcherSchemaInitialization.ts";
import {composeQuerySchema} from "./variable-initialization/queryInitialization.ts";

/**
 * Executes the onBeforeMountHandler function.
 */
export const onBeforeMountHandler = (props: {
    allVariables: Array<Variable>,
    allFetchers: Array<Fetcher>,
    returnType: string,
    allPages: Array<Page>,
    allTables: Array<Table>,
    allCallables: Array<Callable>,
    allQueries: Array<Query>,
}) => (monaco: Monaco) => {
    const {allVariables, returnType, allPages, allFetchers, allTables, allCallables,allQueries} = props;
    // extra libraries
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeLibrary(allVariables), "ts:filename/local-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(returnTypeDefinition(returnType), "ts:filename/return-type-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeNavigation(allPages), "ts:filename/navigation-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeDbSchema(allTables), "ts:filename/db-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeCallableSchema(allCallables), "ts:filename/callable-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeFetcherSchema(allFetchers), "ts:filename/fetchers-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeQuerySchema(allQueries), "ts:filename/queries-source.d.ts");
}

const returnTypeDefinition = (returnType: string) => {
    return `declare const module:{exports:${returnType}};`

}

function composeLibrary(allVariables: Array<Variable>) {
    const variables = allVariables.map(i => {
        const schema = zodSchemaToJson(i.schemaCode);
        let type = `Signal.State<${schema}>`;
        if (i.type === 'computed') {
            type = `Signal.Computed<${schema}>`
        }
        return `declare const ${i.name}:${type};`
    });
    return variables.join('\n');
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
