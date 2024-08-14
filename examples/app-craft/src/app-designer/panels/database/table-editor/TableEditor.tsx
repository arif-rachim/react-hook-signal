import {Table} from "../service/getTables.ts";
import {useEffect, useState} from "react";
import {queryDb} from "./queryDb.ts";
import {SqlValue} from "sql.js";
import {Button} from "../../../button/Button.tsx";
import {BORDER} from "../../../Border.ts";
import {colors} from "stock-watch/src/utils/colors.ts";

async function queryTable(table: Table, currentPage: number, setTableData: (value: (((prevState: {
    columns: Column[];
    data: unknown[];
    currentPage: number;
    totalPage: number
}) => { columns: Column[]; data: unknown[]; currentPage: number; totalPage: number }) | {
    columns: Column[];
    data: unknown[];
    currentPage: number;
    totalPage: number
})) => void) {
    const {columns, values, page} = await queryDb(`select * from ${table.tblName}`, {
        size: 50,
        number: currentPage
    })
    const cols = columns.map(c => {
        const col: Column = {
            name: c,
            title: c,
            renderer: ({rowIndex, item}) => {
                return <div>{item[c]}</div>
            }
        }
        return col;
    });
    const data = values.map(val => {
        const result: Record<string, SqlValue> = {};
        columns.forEach((c, index) => {
            result[c] = val[index]
        })
        return result;
    });
    setTableData({
        data,
        columns: cols,
        currentPage: page.number,
        totalPage: Math.ceil(page.totalRows / page.size)
    });
}

export default function TableEditor(props: { table: Table }) {
    const {table} = props;
    const [tableData, setTableData] = useState<{
        columns: Column[],
        data: unknown[],
        currentPage: number,
        totalPage: number
    }>({columns: [], data: [], currentPage: 0, totalPage: 0});
    useEffect(() => {
        (async () => {
            await queryTable(table, 1, setTableData);
        })();
    }, [table]);

    return <div
        style={{display: 'flex', flexDirection: 'column', overflow: 'auto', height: '100%'}}>
        <div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
            <SimpleTable columns={tableData.columns} data={tableData.data as Array<Record<string, unknown>>}
                         keyField={'id'}/>
        </div>
        <SimpleTableFooter value={tableData?.currentPage ?? 0} totalPages={tableData?.totalPage ?? 1}
                           onChange={async (page) => {
                               await queryTable(table, page, setTableData);
                           }}/>
    </div>
}
type Column = {
    name: string,
    renderer: (props: { rowIndex: number, item: unknown }) => JSX.Element,
    title: string
}

function SimpleTableFooter(props: { totalPages: number, value: number, onChange: (value: number) => void }) {
    const {totalPages, value, onChange} = props;
    const maxButtons = 7;
    const halfRange = Math.floor(maxButtons / 2);
    let startPage = Math.max(value - halfRange, 1);
    let endPage = Math.min(startPage + maxButtons - 1, totalPages);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(endPage - maxButtons + 1, 1);
    }

    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-end',borderTop:BORDER,padding:5}}>
        <Button style={{padding:0,paddingBottom:2,width:50,height:24,display:'flex',alignItems:'center',justifyContent:'center',color:'#666',backgroundColor:'white'}} onClick={() => onChange(value - 1)}
                disabled={value === 1}
        >Prev
        </Button>
        {pages.map(page => {
            const isSelected = page === value;
            return <Button style={{padding:0,paddingBottom:2,width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',color:isSelected ? 'white' : '#666',backgroundColor:isSelected ? colors.blue : 'white'}} key={page}
                           onClick={() => onChange(page)}
                           disabled={page === value}
            >{page}</Button>
        })}
        <Button style={{padding:0,paddingBottom:2,width:50,height:24,display:'flex',alignItems:'center',justifyContent:'center',color:'#666',backgroundColor:'white'}} onClick={() => onChange(value + 1)}
                disabled={value === totalPages}
        >Next
        </Button>
    </div>
}

function SimpleTable<T extends Record<string, unknown>>(props: {
    columns: Array<Column>,
    data: Array<T>,
    keyField: string
}) {
    const {columns, data, keyField} = props;
    return <div style={{display: 'table', height: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
        <div style={{display: 'table-row', position: 'sticky', top: 0}}>
            {columns.map(col => {
                return <div style={{
                    display: 'table-cell',
                    backgroundColor: '#888',
                    color: "white",
                    padding: '0px 10px'
                }}>{col.title}</div>
            })}
        </div>
        {data.map((item, rowIndex) => {
            const key = keyField in item ? item[keyField] : rowIndex;
            return <div style={{display: 'table-row'}} key={`${key}`}>
                {columns.map((col, colIndex) => {
                    return <div style={{
                        display: 'table-cell',
                        fontWeight: 'bold',
                        verticalAlign: 'middle',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        padding: '0px 10px'
                    }}>{col.renderer({item, rowIndex})}</div>
                })}
            </div>
        })}
    </div>
}