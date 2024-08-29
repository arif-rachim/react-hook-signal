import {Table} from "../service/getTables.ts";
import {CSSProperties, Dispatch, ReactNode, SetStateAction, useEffect, useState} from "react";
import {queryDb} from "./queryDb.ts";
import {BindParams, SqlValue} from "sql.js";
import {Button} from "../../../button/Button.tsx";
import {BORDER} from "../../../Border.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import CollapsibleLabelContainer from "../../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {composeTableSchema} from "../../../variable-initialization/dbSchemaInitialization.ts";
import {Editor} from "@monaco-editor/react";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {PageViewer} from "../../../../app-viewer/PageViewer.tsx";


export async function queryPagination(query: string, params: BindParams, currentPage: number, pageSize: number) {
    const {columns, values, page} = await queryDb(query, {
        size: pageSize ?? 50,
        number: currentPage
    }, params)

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

async function queryTable(table: Table, currentPage: number, setTableData: Dispatch<SetStateAction<{
    columns: string[];
    data: unknown[];
    currentPage: number;
    totalPage: number
}>>) {
    const result = await queryPagination(`select * from ${table.tblName}`, [], currentPage, 50);
    setTableData(result);
}

export default function TableEditor(props: { table: Table }) {
    const {table} = props;
    const [tableData, setTableData] = useState<{
        columns: string[],
        data: unknown[],
        currentPage: number,
        totalPage: number
    }>({columns: [], data: [], currentPage: 0, totalPage: 0});
    useEffect(() => {
        (async () => {
            await queryTable(table, 1, setTableData);
        })();
    }, [table]);
    const [isOpen, setOpen] = useState(false);
    return <div
        style={{display: 'flex', flexDirection: 'column', overflow: 'auto', height: '100%'}}>
        <CollapsibleLabelContainer label={'Table Schema'} style={{minHeight: isOpen ? 300 : 32}} defaultOpen={false}
                                   autoGrowWhenOpen={true} onOpenChange={setOpen}>
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Editor
                    language="javascript"
                    value={composeTableSchema(props.table)}
                    options={{
                        selectOnLineNumbers: false,
                        lineNumbers: 'off',
                    }}
                />
            </div>
        </CollapsibleLabelContainer>
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


export function SimpleTableFooter(props: { totalPages: number, value: number, onChange: (value: number) => void }) {
    const {totalPages, value, onChange} = props;
    const maxButtons = 7;
    const halfRange = Math.floor(maxButtons / 2);
    let startPage = Math.max(value - halfRange, 1);
    const endPage = Math.min(startPage + maxButtons - 1, totalPages);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(endPage - maxButtons + 1, 1);
    }

    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return <div
        style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', borderTop: BORDER, padding: 5}}>
        <Button style={{
            padding: 0,
            paddingBottom: 2,
            width: 50,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            backgroundColor: 'white'
        }} onClick={() => onChange(value - 1)}
                disabled={value === 1}
        >Prev
        </Button>
        {pages.map(page => {
            const isSelected = page === value;
            return <Button style={{
                padding: 0,
                paddingBottom: 2,
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSelected ? 'white' : '#666',
                backgroundColor: isSelected ? colors.blue : 'white'
            }} key={page}
                           onClick={() => onChange(page)}
                           disabled={page === value}
            >{page}</Button>
        })}
        <Button style={{
            padding: 0,
            paddingBottom: 2,
            width: 50,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            backgroundColor: 'white'
        }} onClick={() => onChange(value + 1)}
                disabled={value === totalPages}
        >Next
        </Button>
    </div>
}

export type ColumnsConfig = Record<string, {
    hidden?: boolean,
    width?: CSSProperties["width"],
    rendererPageId?: string,
    title?: string
}>


export function SimpleTable<T extends Record<string, unknown>>(props: {
    columns: Array<string>,
    data: Array<T>,
    keyField: string,
    onFocusedRowChange?: (focusedItem: T) => void,
    focusedRow?: T,
    columnsConfig?: ColumnsConfig
}) {
    const {
        columns,
        data,
        keyField,
        focusedRow: focusedRowProps,
        onFocusedRowChange,
        columnsConfig
    } = props;

    const [focusedRow, setFocusedRow] = useState<T | undefined>(focusedRowProps);
    useEffect(() => setFocusedRow(focusedRowProps), [focusedRowProps]);

    const {allPagesSignal, elements, applicationSignal} = useAppContext();

    return <div style={{display: 'table', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
        <div style={{display: 'table-row', position: 'sticky', top: 0}}>
            {columns.map(col => {
                let width: CSSProperties['width'] | undefined = undefined;
                let hide: boolean | undefined = false;
                let title = col;
                if (columnsConfig !== undefined && columnsConfig !== null && typeof columnsConfig === 'object' && col in columnsConfig) {
                    const config = columnsConfig[col];
                    if (!isEmpty(config.width)) {
                        {
                            width = config.width;
                        }
                    }
                    if (config.hidden !== undefined) {
                        hide = config.hidden;
                    }
                    if (config.title) {
                        title = config.title;
                    }
                }
                return <div style={{
                    display: hide ? 'none' : 'table-cell',
                    borderBottom: BORDER,
                    backgroundColor: '#F2F2F2',
                    color: "black",
                    padding: '5px 10px',
                    width,
                }}>{title}</div>
            })}
        </div>
        {data.map((item, rowIndex) => {
            const key = keyField in item ? item[keyField] : rowIndex;
            const isFocused = item === focusedRow;
            return <div style={{display: 'table-row', background: isFocused ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)'}}
                        key={`${key}`} onClick={() => {
                if (onFocusedRowChange) {
                    onFocusedRowChange(item)
                } else {
                    setFocusedRow(item)
                }
            }}>
                {columns.map((col) => {
                    let width: CSSProperties['width'] | undefined = undefined;
                    let hide: boolean | undefined = false;
                    let rendererPageId: string | undefined = undefined;
                    if (columnsConfig !== undefined && columnsConfig !== null && typeof columnsConfig === 'object' && col in columnsConfig) {
                        const config = columnsConfig[col];
                        if (!isEmpty(config.width)) {
                            {
                                width = config.width;
                            }
                        }
                        if (config.hidden !== undefined) {
                            hide = config.hidden;
                        }
                        if (config.rendererPageId) {
                            rendererPageId = config.rendererPageId;
                        }
                    }
                    const value = item[col] as ReactNode;
                    let renderer = <div>{value}</div>;
                    if (rendererPageId) {
                        const page = allPagesSignal.get().find(p => p.id === rendererPageId);
                        if (page) {
                            renderer = <PageViewer
                                elements={elements}
                                page={page!}
                                key={`${col}:${rowIndex}`}
                                appConfig={applicationSignal.get()}
                                value={{item, index: rowIndex, value}}
                            />
                        }
                    }
                    return <div style={{
                        display: hide ? 'none' : 'table-cell',
                        verticalAlign: 'middle',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        padding: '0px 10px',
                        width
                    }} key={`${col}:${rowIndex}`}>{renderer}</div>
                })}
            </div>
        })}
    </div>
}