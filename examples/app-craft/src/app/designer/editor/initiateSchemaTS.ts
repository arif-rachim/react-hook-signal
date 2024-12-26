import {Callable, Fetcher, Page, Variable} from "../AppDesigner.tsx";
import {zodSchemaToJson} from "../../../core/utils/zodSchemaToJson.ts";
import {Query, Table} from "../panels/database/getTables.ts";
import {composeDbSchema} from "../variable-initialization/dbSchemaInitialization.ts";
import {composeCallableSchema} from "../variable-initialization/callableSchemaInitialization.ts";
import {composeFetcherSchema} from "../variable-initialization/fetcherSchemaInitialization.ts";
import {composeQuerySchema} from "../variable-initialization/queryInitialization.ts";
import {icons} from "../cssPropertiesSchema.ts";

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

    formSchema?: string
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
        returnType,
        formSchema
    } = props;
    return `

${returnTypeDefinition(returnType)}
${composeNavigation(allPages)}
${composeDbSchema(allTables)}
${composeAlert()}
${composeTools()}
${composeUtils()}
${composeForm(formSchema)}
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
        return `'${p.name}':{${param}}`;
    }).join(',');
    return `
type Navigate = {${type}};
declare const navigate : <P extends keyof Navigate>(path:P,param?:Navigate[P]) => void;
`
}

function composeAlert() {
    return `
type Icons = ${icons.map(i => `"${i}"`).join('|')};
declare const alertBox : (props:{message:string,title?:string,icon?:Icons,buttons?:Array<{id:string,label:string,icon:Icons}>}) => Promise<string>;
`
}


function composeTools() {
    return `
declare const tools: {
    deleteSqlLite: () => Promise<void>,
    saveSqlLite: (arrayBuffer: ArrayBuffer) => Promise<void>,
    readSqlLite: () => Promise<ArrayBuffer>
};
`
}

function composeUtils() {
    return `
interface ToStringType{
    (val:unknown) : (string | undefined);
    (val:unknown, defaultVal:string) : string;
}
interface ToNumberType{
    (val:unknown) : (number | undefined);
    (val:unknown, defaultVal:number) : number;
}  
declare const utils: {
    toDate: (date: unknown) => Date | undefined,
    dateToString: (date: unknown) => string | undefined,
    dateAdd: (dateOrString: unknown, value: number, type: "year" | "month" | "day" | "hour" | "minute" | "second") => Date | undefined,
    ddMmmYyyy: (date?: Date | string) => string,
    hhMm: (date?: Date | string) => string,
    ddMmm: (date?: Date | string) => string,
    hhMmSs: (date?: Date | string) => string,
    ddMmmYyyyHhMm: (date?: Date | string) => string,
    toString: ToStringType,
    toNumber: ToNumberType,
    isEmpty: (val: unknown) => boolean,
    guid: () => string,
    uniqueNumber : () => number
};
`
}

function composeForm(formSchema?: string) {
    if (formSchema && formSchema.length > 0) {
        formSchema = formSchema || `Record<string, unknown>`;
        return `
            declare const formContext : {
                value: Signal.State<${formSchema}>,
                initialValue: ${formSchema},
                errors: Signal.State<Record<string, string>>,
                isChanged: Signal.State<boolean>,
                reset: () => void,
                submit: () => Promise<void>,
                formIsValid: () => Promise<boolean>
                isBusy: Signal.State<boolean>,
                isDisabled: Signal.State<boolean>
            }`
    }
    return '';

}