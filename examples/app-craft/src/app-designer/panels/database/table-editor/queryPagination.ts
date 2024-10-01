import {ParamsObject, SqlValue} from "sql.js";
import {queryDb} from "./queryDb.ts";

export async function queryPagination(props: {
    query: string,
    params: ParamsObject,
    currentPage: number,
    pageSize: number,
    filter: ParamsObject,
    sort: Array<{ column: string, direction: 'asc' | 'desc' }>
}) {
    const {query, params, currentPage, pageSize, filter, sort} = props;
    const {columns, values, page} = await queryDb(query, {
        size: pageSize ?? 50,
        number: currentPage
    }, params, filter, sort)

    const data = values.map(val => {
        const result: Record<string, SqlValue> = {};
        columns.forEach((c, index) => {
            result[c] = val[index]
        })
        return result;
    });
    return ({
        data,
        columns,
        currentPage: page.number,
        totalPage: Math.ceil(page.totalRows / page.size)
    })
}