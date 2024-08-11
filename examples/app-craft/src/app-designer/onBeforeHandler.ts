import {Monaco} from "@monaco-editor/react";
import {Fetcher, Page, Variable} from "./AppDesigner.tsx";
import {zodSchemaToJson} from "./zodSchemaToJson.ts";
import {isEmpty} from "../utils/isEmpty.ts";

/**
 * Executes the onBeforeMountHandler function.
 */
export const onBeforeMountHandler = (props: {
    allVariables: Array<Variable>,
    allFetchers: Array<Fetcher>,
    dependencies: Array<string>,
    returnType: string,
    allPages: Array<Page>,
}) => (monaco: Monaco) => {
    const {allVariables, dependencies, returnType, allPages,allFetchers} = props;
    // extra libraries
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeLibrary(allVariables,allFetchers, dependencies), "ts:filename/local-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(returnTypeDefinition(returnType), "ts:filename/return-type-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composeNavigation(allPages), "ts:filename/navigation-source.d.ts");
}

const returnTypeDefinition = (returnType: string) => `declare const module:{exports:${returnType}};`

function composeLibrary(allVariables: Array<Variable>,allFetchers:Array<Fetcher>, dependencies: Array<string>) {
    const variables = allVariables.filter(i => dependencies.includes(i.id)).map(i => {
        const schema = zodSchemaToJson(i.schemaCode);
        let type = `Signal.State<${schema}>`;
        if (i.type === 'computed') {
            type = `Signal.Computed<${schema}>`
        }
        return `declare const ${i.name}:${type};`
    });
    const fetchers = allFetchers.filter(i => dependencies.includes(i.id)).map(i => {
        const schema = zodSchemaToJson(i.returnTypeSchemaCode);
        let paths = [...i.paths,...i.headers].reduce((result,path) => {
            if(!path.isInput){
                return result;
            }
            if(isEmpty(path.name)){
                return result;
            }
            result.push(`${path.name}:string`)
            return result ;
        },[] as Array<string>)
        paths = i.data.reduce((result,path) => {
            if(!path.isInput){
                return result;
            }
            if(isEmpty(path.name)){
                return result;
            }
            result.push(`${path.name}:unkown`)
            return result ;
        },paths)
        const type = '{'+paths.join(',')+'}'
        return `declare function ${i.name}(props:${type}):Promise<{error:string,result:${schema}}>;`
    })
    return [...variables,...fetchers].join('\n');
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