
import {SqlValue} from "sql.js";
import sqlite from "../sqlite/sqlite.ts";

export interface TableInfo {
   cid:number,
   name:string,
   type:string,
   notnull:number,
   dfltValue?:unknown,
   pk:number
}

export const TableInfoToColumnMap = {
    cid : "cid",
    name : "name",
    type : "type",
    notnull : "notnull",
    dfltValue : "dflt_value",
    pk : "pk"
} as const;

export async function getTableInfo(tableName:string){
    const result = await sqlite({type:'executeQuery', query: `pragma table_info(${tableName})`})
    const data:TableInfo[] = [];
    if (result.success) {
        if (result.value !== null && typeof result.value === 'object' && 'values' in result.value && 'columns' in result.value) {
            const values = result.value.values as SqlValue[][];
            for(const item of values){
                data.push({
                    cid:item[0] as number,
                    name:item[1] as string,
                    type:item[2] as string,
                    notnull:item[3] as number,
                    dfltValue:item[4] as unknown,
                    pk:item[5] as number
                })    
            }
        }
    }
    return data;
}
