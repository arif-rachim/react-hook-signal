import {Monaco} from "@monaco-editor/react";
import {Page, Variable} from "./AppDesigner.tsx";
import {zodSchemaToJson} from "./zodSchemaToJson.ts";

/**
 * Executes the onBeforeMountHandler function.
 */
export const onBeforeMountHandler = (props: {
    allVariables: Array<Variable>,
    dependencies: Array<string>,
    returnType:string,
    allPages:Array<Page>,
}) => (monaco: Monaco) => {
    const {allVariables, dependencies,returnType,allPages} = props;
    // extra libraries
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeLibrary(allVariables, dependencies), "ts:filename/local-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(returnTypeDefinition(returnType), "ts:filename/return-type-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeNavigation(allPages), "ts:filename/navigation-source.d.ts");
}

const returnTypeDefinition = (returnType:string) => `declare const module:{exports:${returnType}};`

function composeLibrary(allVariables: Array<Variable>, dependencies: Array<string>) {
    return allVariables.filter(i => dependencies.includes(i.id)).map(i => {
        const schema = zodSchemaToJson(i.schemaCode);
        let type = `Signal.State<${schema}>`;
        if (i.type === 'computed') {
            type = `Signal.Computed<${schema}>`
        }
        return `declare const ${i.name}:${type};`
    }).join('\n');
}

function composeNavigation(allPages:Array<Page>){
    const type = allPages.map(p => {
        const param = p.variables.filter(v => v.type === 'state').map(v => {
            return `${v.name}?:${zodSchemaToJson(v.schemaCode)}`
        }).join(',')
        return `${p.name}:(param:{${param}}) => void`;
    }).join(',')
    return `declare const navigate:{${type}};`
}