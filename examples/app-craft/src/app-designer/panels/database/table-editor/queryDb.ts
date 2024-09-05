import sqlite from "../sqlite/sqlite.ts";
import {BindParams, SqlValue} from "sql.js";

export async function queryDb(sql: string, page?: { size: number, number: number }, params?: BindParams) {
    const {size, number} = page ?? {size: 50, number: 0};
    const count = `SELECT COUNT(*) AS total_rows FROM (${sql}) AS sub`
    const countResponse = await sqlite({type: 'executeQuery', query: count, params});
    let totalRows = 0;
    if (!countResponse.errors) {
        const value = countResponse.value as { values: number[][] }
        totalRows = value.values[0][0] as number;
    }
    const limit = size;
    const offset = (number - 1) * limit;
    const pageRecords = `${sql} LIMIT ${limit} OFFSET ${offset}`;
    const queryResponse = await sqlite({type: 'executeQuery', query: pageRecords, params});
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