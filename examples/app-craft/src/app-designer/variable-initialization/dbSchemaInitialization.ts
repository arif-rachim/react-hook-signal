import {Table} from "../panels/database/service/getTables.ts";
import sqlite from "../panels/database/sqlite/sqlite.ts";
import {SqlValue} from "sql.js";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";

export function composeTableSchema(table: Table) {
    const schema: string[] = [];
    for (const info of table.tableInfo) {
        const type = info.type;
        schema.push(`${info.name}:${type}`)
    }
    return `z.object({\n\t${schema.join(',\n\t')}\n})`
}

export function composeDbSchema(allTables: Array<Table>) {
    const dbSchema = [];
    for (const table of allTables) {
        composeTableSchema(table);
        dbSchema.push(`${table.name} : ${composeTableSchema(table)} `)
    }
    const schema = `z.object({ ${dbSchema.join(',')} })`;
    return `
type DbSchema ${zodSchemaToJson(schema)} 
declare const db:{
    record:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>,
    remove:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>,
    read:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<Array<DbSchema[N]>>
};
`
}

export function dbSchemaInitialization() {
    async function record(tableName: string, item: Record<string, SqlValue>) {
        const query = `INSERT INTO ${tableName} (${Object.keys(item).join(', ')}) VALUES (${Object.keys(item).map(() => `?`).join(', ')})`
        const result = await sqlite({type: 'executeQuery', query: query, params: Object.values(item)});
        if (!result.errors) {
            const readResponse = await read(tableName, item);
            if (readResponse.length > 0) {
                return readResponse[0];
            }
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

    async function read(tableName: string, item: Record<string, SqlValue>): Promise<Array<Record<string, SqlValue>>> {
        const whereCondition = Object.keys(item).map(k => `${k} = ?`).join(' AND ').trim();
        const query = `SELECT * FROM ${tableName} ${whereCondition ? `WHERE ${whereCondition}` :'' }`
        const queryResult = await sqlite({type: 'executeQuery', query: query, params: Object.values(item)});
        if (queryResult.errors) {
            console.error(queryResult.errors);
            return [];
        }
        const {columns, values} = queryResult.value as { columns: string[], values: SqlValue[][] }
        const result: Array<Record<string, SqlValue>> = [];
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