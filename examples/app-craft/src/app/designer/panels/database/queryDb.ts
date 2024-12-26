import sqlite from "./sqlite.ts";
import {ParamsObject, SqlValue} from "sql.js";

export type QueryParamsObject = Record<string, SqlValue | { value: SqlValue, type: 'like' | 'equal' }>;

export async function queryDb(sql: string, page?: {
    size: number,
    number: number
}, params?: ParamsObject, filter?: QueryParamsObject, sort?: Array<{ column: string, direction: 'asc' | 'desc' }>) {
    const {size, number} = page ?? {size: 50, number: 0};
    const dynamicFilterParam = filter ?? {};
    const dynamicFilterQuery: string[] = [];
    const combinedParams = {} as ParamsObject;

    Object.keys(params ?? {}).forEach(key => {
        if (params) {
            combinedParams[`:${key}`] = params[key];
        }
    })

    Object.keys(filter ?? {}).forEach(key => {
        if (dynamicFilterParam[key]) {
            const val = dynamicFilterParam[key];
            if (val !== null && typeof val === 'object' && 'type' in val) {
                if (val.type === 'equal') {
                    dynamicFilterQuery.push(`T.${key} = @${key}`)
                    combinedParams[`@${key}`] = `${val.value}`;
                } else {
                    dynamicFilterQuery.push(`T.${key} LIKE @${key}`)
                    combinedParams[`@${key}`] = `%${val.value}%`;
                }
            } else {
                if (val !== null) {
                    dynamicFilterQuery.push(`T.${key} LIKE @${key}`)
                    combinedParams[`@${key}`] = `%${dynamicFilterParam[key]}%`;
                }
            }

        }
    })
    const hasFilter = dynamicFilterQuery.length > 0;

    if (hasFilter) {
        sql = `SELECT * FROM (${sql}) AS T WHERE ${dynamicFilterQuery.join(' AND ')}`;
    }

    const sortStrings: string[] = [];
    (sort ?? []).forEach(s => {
        if (hasFilter) {
            sortStrings.push(`T.${s.column} ${s.direction}`);
        } else {
            sortStrings.push(`${s.column} ${s.direction}`);
        }
    })

    const hasSort = sortStrings.length > 0;
    if (hasSort) {
        if (hasFilter) {
            sql = `${sql} ORDER BY ${sortStrings.join(', ')}`;
        } else {
            sql = `SELECT * FROM (${sql}) ORDER BY ${sortStrings.join(', ')}`;
        }
    }

    const count = `SELECT COUNT(*) AS total_rows FROM (${sql}) AS sub`
    const countResponse = await sqlite({type: 'executeQuery', query: count, params: combinedParams});
    let totalRows = 0;
    if (!countResponse.errors) {
        const value = countResponse.value as { values: number[][] }
        totalRows = value.values[0][0] as number;
    }
    const limit = size;
    const offset = (number - 1) * limit;
    const pageRecords = `${sql} LIMIT ${limit} OFFSET ${offset}`;
    const queryResponse = await sqlite({type: 'executeQuery', query: pageRecords, params: combinedParams});
    let columns: string[] = [];
    let values: SqlValue[][] = [];
    if (!queryResponse.errors) {
        const result = queryResponse.value as { columns: string[], values: SqlValue[][] };
        columns = result.columns;
        values = result.values;
    }
    return {
        columns,
        values,
        page: {
            size,
            number,
            totalRows
        }
    }
}