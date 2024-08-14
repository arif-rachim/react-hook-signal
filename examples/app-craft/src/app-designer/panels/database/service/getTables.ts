
import {SqlValue} from "sql.js";
import sqlite from "../sqlite/sqlite.ts";

export interface Table {
   type:string,
   name:string,
   tblName:string,
   rootpage:number,
   sql?:string
}

export const TableToColumnMap = {
    type : "type",
    name : "name",
    tblName : "tbl_name",
    rootpage : "rootpage",
    sql : "sql"
} as const;

export async function getTables(){
    const result = await sqlite({type: 'executeQuery', query: `select * from sqlite_master where type like "table"  order by name asc`});
    const data:Table[] = [];
    if (result.success) {
        if (result.value !== null && typeof result.value === 'object' && 'values' in result.value && 'columns' in result.value) {
            const values = result.value.values as SqlValue[][];
            for(const item of values){
                data.push({
                    type:item[0] as string,
                    name:item[1] as string,
                    tblName:item[2] as string,
                    rootpage:item[3] as number,
                    sql:item[4] as string
                })    
            }
        }
    }
    return data;
}
