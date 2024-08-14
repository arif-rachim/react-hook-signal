import {Table} from "../panels/database/service/getTables.ts";
import sqlite from "../panels/database/sqlite/sqlite.ts";
import {SqlValue} from "sql.js";

export function composeDbSchema(allTables: Array<Table>) {
    const dbSchema = [];
    for (const table of allTables) {
        const schema: string[] = [];
        for (const info of table.tableInfo) {
            schema.push(`${info.name}?:${info.type}`)
        }
        dbSchema.push(`${table.name} : { ${schema.join(',')} }`)
    }
    return `
type DbSchema { ${dbSchema.join(',')} }
declare const db:{
    record:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>,
    remove:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>,
    read:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>
};
`
}

export function dbSchemaInitialization() {
    async function record(tableName: string, item: Record<string, SqlValue>) {
        const query = `INSERT INTO ${tableName} (${Object.keys(item).join(', ')}) VALUES (${Object.keys(item).map(() => `?`).join(', ')})`
        const result = await sqlite({type: 'executeQuery', query: query, params: Object.values(item)});
        if (!result.errors) {
            return await read(tableName,item);
        }
        return result;
    }

    async function remove(tableName: string, item: Record<string, SqlValue>) {
        const query = `DELETE FROM ${tableName} WHERE ${Object.keys(item).map(k => `${k} = ?`).join(' AND ')}`
        const queryResult = await sqlite({type: 'executeQuery', query: query, params: Object.values(item)});
        if (queryResult.errors) {
            console.error(queryResult.errors);
            return {};
        }
        return queryResult;
    }

    async function read(tableName: string, item: Record<string, SqlValue>) {
        const query = `SELECT * FROM ${tableName} WHERE ${Object.keys(item).map(k => `${k} = ?`).join(' AND ')}`
        const queryResult = await sqlite({type: 'executeQuery', query: query, params: Object.values(item)});
        if (queryResult.errors) {
            console.error(queryResult.errors);
            return {};
        }
        const {columns, values} = queryResult.value as { columns: string[], values: SqlValue[][] }
        const result:Array<Record<string, SqlValue>> = [];
        for (const vals of values) {
            const item = {} as Record<string, SqlValue>;
            let colIndex = 0;
            for (const value of vals) {
                item[columns[colIndex]] = value;
                colIndex++;
            }
            result.push(item);
        }
        return result;
    }

    return {
        record,
        remove,
        read
    }
}