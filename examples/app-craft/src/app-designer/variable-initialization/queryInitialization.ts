import {Query} from "../panels/database/service/getTables.ts";
import {queryPagination} from "../panels/database/table-editor/TableEditor.tsx";
import {BindParams} from "sql.js";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";

export function queryInitialization(allQueries: Array<Query>):Record<string, (inputs: Record<string, unknown>, page?: number) => unknown> {
    const queries: Record<string, (inputs: Record<string, unknown>, page?: number) => unknown> = {};
    for (const queryValue of allQueries) {
        queries[queryValue.name] = async (inputs: Record<string, unknown>, page?: number) => {
            try {
                const result = await queryPagination(queryValue.rawQuery, Object.values(inputs) as BindParams, page ?? 1, 50);
                return {
                    ...result
                }
            } catch (error: unknown) {
                const err = error as Error;
                return {error: err.message}
            }
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
        return `${i.name} : (props:${type},page?:number) => Promise<{error?:string,data?:${schema},columns?:Array<string>,currentPage?:number,totalPage?:number }>`
    })
    return `{${queriesSchema.join(',')}}`
}