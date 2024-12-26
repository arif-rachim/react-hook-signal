import {Table} from "../panels/database/getTables.ts";
import sqlite from "../panels/database/sqlite.ts";
import {SqlValue} from "sql.js";
import {zodSchemaToJson} from "../../../core/utils/zodSchemaToJson.ts";

export function composeTableSchema(table: Table) {
    const schema: string[] = [];
    for (const info of table.tableInfo) {
        const type = info.type;
        schema.push(`${info.name}:${type}`)
    }
    return `z.object({\n\t${schema.join(',\n\t')}\n})`
}

export function composeArraySchema(data: Array<unknown>) {
    const schema: Record<string, string> = {};

    for (const i of data) {
        const item = i as Record<string, string>;
        Object.keys(item).forEach(key => {
            // we loop it first
            let type = 'any';
            if (typeof item[key] === 'number') {
                type = 'number'
            } else if (typeof item[key] === 'string') {
                type = 'string'
            }
            if (!(key in schema)) {
                schema[key] = type;
            } else {
                const prevSchemaIsNull = schema[key] === 'any';
                const nextTypeIsNotNull = type === 'any';
                if (prevSchemaIsNull && nextTypeIsNotNull) {
                    schema[key] = type
                }
            }
        })
    }
    return `z.object({\n\t${Object.keys(schema).map(k => {
        const zodType = {
            'any': 'z.any()',
            'number': 'z.number().nullable().optional()',
            'string': 'z.string().nullable().optional()'
        }
        const type = schema[k] as keyof typeof zodType;
        return `${k}:${zodType[type]}`;
    }).join(',\n\t')}\n})`;
}

export function composeDbSchema(allTables: Array<Table>) {
    const dbSchema = [];
    for (const table of allTables) {
        composeTableSchema(table);
        dbSchema.push(`${table.name} : ${composeTableSchema(table)} `)
    }
    const schema = `z.object({ ${dbSchema.join(',')} })`;
    return `
type DbSchema = ${zodSchemaToJson(schema)} 
declare const db:{
    record:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>,
    remove:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]>,
    read:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<Array<DbSchema[N]>>,
    find:<N extends keyof DbSchema>(name:N,item:DbSchema[N]) => Promise<DbSchema[N]|undefined>,
    commit: () => Promise<void>
};
`
}

export function dbSchemaInitialization() {
    async function record(tableName: string, item: Record<string, SqlValue>) {
        const query = `INSERT INTO ${tableName} (${Object.keys(item).join(', ')}) VALUES (${Object.keys(item).map(() => `?`).join(', ')})`
        const result = await sqlite({type: 'executeQuery', query: query, params: Object.values(item).map(i => i === undefined  ? null : i )});
        if (!result.errors) {
            const readResponse = await read(tableName, item);
            if (readResponse.length > 0) {
                return readResponse[0];
            }
        }else{
            console.error(result.errors)
        }
        return result;
    }

    async function remove(tableName: string, item: Record<string, SqlValue>) {
        const whereCondition = Object.keys(item).map(k => `${k} = ?`).join(' AND ').trim();
        const query = `DELETE FROM ${tableName} ${whereCondition ? `WHERE ${whereCondition}` : ''}`
        const queryResult = await sqlite({type: 'executeQuery', query: query, params: Object.values(item)});
        if (queryResult.errors) {
            console.error(queryResult.errors);
            return {};
        }
        return queryResult;
    }

    async function read(tableName: string, item: Record<string, SqlValue>): Promise<Array<Record<string, SqlValue>>> {
        const whereCondition = Object.keys(item).map(k => `${k} = ?`).join(' AND ').trim();
        const query = `SELECT * FROM ${tableName} ${whereCondition ? `WHERE ${whereCondition}` : ''}`
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

    async function find(tableName: string, item: Record<string, SqlValue>): Promise<Record<string, SqlValue>|undefined>{
        const result = await read(tableName,item);
        if(result.length > 0){
            return result[0];
        }
        return undefined;
    }

    async function commit(){
        await sqlite({type: 'persistChanges'});
    }

    return {
        record,
        remove,
        read,
        commit,
        find
    }
}