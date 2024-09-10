import {Query} from "../panels/database/service/getTables.ts";
import {queryPagination} from "../panels/database/table-editor/TableEditor.tsx";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {QueryType} from "./VariableInitialization.tsx";

export function queryInitialization(allQueries: Array<Query>): Record<string, QueryType> {
    const queries: Record<string, QueryType> = {};
    for (const queryValue of allQueries) {
        queries[queryValue.name] = (props) => {
            const {params, page, filter, sort} = props;
            return new Promise(resolve => {
                queryPagination({
                    query: queryValue.query,
                    filter: filter ?? {},
                    sort: sort ?? [],
                    params: params ?? {},
                    pageSize: 50,
                    currentPage: page ?? 1,
                }).then(result => {
                    resolve(result);
                }).catch(error => {
                    const err = error as Error;
                    resolve({
                        error: err.message,
                        data: [],
                        columns: [],
                        currentPage: 1,
                        totalPage: 0
                    })
                })
            })
        }
    }
    return queries
}

export function composeQuerySchema(allQueries: Array<Query>) {
    const queriesSchema = allQueries.map(i => {
        const schema = zodSchemaToJson(`z.array(${i.schemaCode})`);
        const paths = [...i.parameters].reduce((result, param) => {
            result.push(`${param.name}:string`)
            return result;
        }, [] as Array<string>)
        const type = '{' + paths.join(',') + '}'
        return `${i.name} : (props:{params?:${type},page?:number,filter?:Record<string,SqlValue>,sort?:Record<string,SqlValue>}) => Promise<{error?:string,data?:${schema},columns?:Array<string>,currentPage?:number,totalPage?:number }>`
    })
    return `{${queriesSchema.join(',')}}`
}