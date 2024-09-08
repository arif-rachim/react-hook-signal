import {Query} from "../panels/database/service/getTables.ts";
import {queryPagination} from "../panels/database/table-editor/TableEditor.tsx";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import {QueryType} from "./VariableInitialization.tsx";
import {SqlValue} from "sql.js";

export function queryInitialization(allQueries: Array<Query>): Record<string, QueryType> {
    const queries: Record<string, QueryType> = {};
    for (const queryValue of allQueries) {
        queries[queryValue.name] = (inputs?: Record<string, SqlValue>, page?: number) => {
            return new Promise(resolve => {
                queryPagination(queryValue.query,inputs ?? {}, page ?? 1, 50).then(result => {
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
        return `${i.name} : (props?:${type},page?:number) => Promise<{error?:string,data?:${schema},columns?:Array<string>,currentPage?:number,totalPage?:number }>`
    })
    return `{${queriesSchema.join(',')}}`
}