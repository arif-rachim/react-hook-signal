import {SqlValue} from "sql.js";
import sqlite from "./sqlite.ts";
import {mapTableInfoTypeToTs} from "./mapTableInfoTypeToTs.ts";
import {FetcherParameter} from "../../AppDesigner.tsx";

export interface Table {
    type: string,
    name: string,
    tblName: string,
    rootpage: number,
    sql?: string,
    tableInfo: TableInfo[]
}

export interface Query {
    id: string,
    name: string,
    query: string,
    parameters: Array<FetcherParameter>
    schemaCode: string
}


export async function getTables() {
    const result = await sqlite({
        type: 'executeQuery',
        query: `select * from sqlite_master where type like "table"  order by name asc`
    });
    const data: Table[] = [];
    if (!result.errors) {
        if (result.value !== null && typeof result.value === 'object' && 'values' in result.value && 'columns' in result.value) {
            const values = result.value.values as SqlValue[][];

            for (const item of values) {
                const tableInfo = await getTableInfo(item[2] as string);
                data.push({
                    type: item[0] as string,
                    name: item[1] as string,
                    tblName: item[2] as string,
                    rootpage: item[3] as number,
                    sql: item[4] as string,
                    tableInfo
                })
            }
        }
    }
    return data;
}


export interface TableInfo {
    cid: number,
    name: string,
    type: string,
    notnull: number,
    dfltValue?: unknown,
    pk: number
}


export async function getTableInfo(tableName: string) {
    const result = await sqlite({type: 'executeQuery', query: `pragma table_info(${tableName})`})
    const data: TableInfo[] = [];
    if (!result.errors) {
        if (result.value !== null && typeof result.value === 'object' && 'values' in result.value && 'columns' in result.value) {
            const values = result.value.values as SqlValue[][];
            for (const item of values) {
                const type = item[2] as string;
                if (type === "") {
                    console.warn(`Warning this column is type empty "${item[1]}" from table "${tableName}"`)
                }
                data.push({
                    cid: item[0] as number,
                    name: item[1] as string,
                    type: mapTableInfoTypeToTs(type),
                    notnull: item[3] as number,
                    dfltValue: item[4] as unknown,
                    pk: item[5] as number
                })
            }
        }
    }
    return data;
}
