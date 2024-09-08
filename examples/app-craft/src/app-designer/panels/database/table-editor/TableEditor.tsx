import {Table} from "../service/getTables.ts";
import {CSSProperties, Dispatch, ReactNode, SetStateAction, useEffect, useState} from "react";
import {queryDb} from "./queryDb.ts";
import {ParamsObject, SqlValue} from "sql.js";
import {Button} from "../../../button/Button.tsx";
import {BORDER} from "../../../Border.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import CollapsibleLabelContainer from "../../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {composeTableSchema} from "../../../variable-initialization/dbSchemaInitialization.ts";
import {Editor} from "@monaco-editor/react";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {PageViewer} from "../../../../app-viewer/PageViewer.tsx";
import {QueryTypeResult} from "../../../query-grid/QueryGrid.tsx";
import {MdArrowDownward, MdArrowUpward} from "react-icons/md";


export async function queryPagination(query: string, params: ParamsObject, currentPage: number, pageSize: number) {
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

async function queryTable(props: {
    table: Table,
    currentPage: number,
    setTableData: Dispatch<SetStateAction<QueryTypeResult>>,
    filter: Record<string, SqlValue>,
    sort :Array<{ column: string, direction: 'asc' | 'desc' }>
}) {
    const {setTableData, table, currentPage, filter,sort} = props;

    const paramsString: string[] = [];
    Object.keys(filter).forEach(key => {
        paramsString.push(`${key} LIKE '%${filter[key]}%'`);
    });
    const sortStrings:string[] = [];
    sort.forEach(s => {
        sortStrings.push(`${s.column} ${s.direction}`);
    })
    const result = await queryPagination(`SELECT * FROM ${table.tblName} ${paramsString.length > 0 ?' WHERE ':''} ${paramsString.join(' AND ')} ${sortStrings.length > 0 ? 'ORDER BY':''} ${sortStrings.join(', ')}`, {}, currentPage, 50);
    setTableData(oldValue => {
        if (result.data.length > 0) {
            return result;
        }
        if (oldValue.columns && oldValue.columns.length > 0) {
            return {...oldValue, data: [], currentPage: 0, totalPage: 0}
        }
        return oldValue;
    });
}

export default function TableEditor(props: { table: Table }) {
    const {table} = props;
    const [tableData, setTableData] = useState<QueryTypeResult>({columns: [], data: [], currentPage: 0, totalPage: 0});
    const [filter, setFilter] = useState<Record<string, string>>({})
    const [sort,setSort] = useState<Array<{ column: string, direction: 'asc' | 'desc' }>>([])
    useEffect(() => {
        (async () => {
            await queryTable({
                table,
                currentPage: 1,
                setTableData,
                filter,
                sort
            });
        })();
    }, [table, filter,sort]);
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
            <SimpleTable columns={tableData.columns ?? []} data={tableData.data as Array<Record<string, unknown>>}
                         keyField={'ID_'} filterable={true} filter={filter}
                         onFilterChange={({column, value}) => {
                             setFilter(oldValue => {
                                 const returnValue = {...oldValue};
                                 if (typeof value === 'string') {
                                     returnValue[column] = value;
                                 } else {
                                     returnValue[column] = JSON.stringify(value);
                                 }
                                 return returnValue
                             })
                         }}
                         sortable={true}
                         sort={sort}
                         onSortChange={({column,value}) => {
                             setSort(oldValue => {
                                 const newValue = [...oldValue];
                                 if(value === 'remove'){
                                     return newValue.filter(c => c.column !== column)
                                 }
                                 const itemIndex = newValue.findIndex(c => c.column === column);
                                 if(itemIndex < 0) {
                                     newValue.push({column, direction: value});
                                 }else{
                                     newValue.splice(itemIndex,1,{column: column, direction: value});
                                 }
                                 return newValue;
                             })
                         }}
            />
        </div>
        <SimpleTableFooter value={tableData?.currentPage ?? 0} totalPages={tableData?.totalPage ?? 1}
                           onChange={async (page) => {
                               await queryTable({
                                   table,
                                   currentPage: page,
                                   setTableData,
                                   filter,
                                   sort
                               });
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


function extractWidthAndHiddenField(columnsConfig: ColumnsConfig | undefined, col: string) {
    let width: CSSProperties['width'] | undefined = undefined;
    let hide: boolean | undefined = false;
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
    }
    return {width, hide};
}

export function SimpleTable<T extends Record<string, unknown>>(props: {
    columns: Array<string>,
    data: Array<T>,
    keyField: string,
    onFocusedRowChange?: (focusedItem: T) => void,
    focusedRow?: T,
    columnsConfig?: ColumnsConfig,
    filterable?: boolean,
    filter?: Record<string, unknown>,
    onFilterChange?: (props: { column: string, value: unknown, oldValue: unknown }) => void,
    sortable?: boolean,
    sort?: Array<{ column: string, direction: 'asc' | 'desc' }>,
    onSortChange?: (props: { column: string, value: 'asc' | 'desc' | 'remove' }) => void
}) {
    const {
        columns,
        data,
        keyField,
        focusedRow: focusedRowProps,
        onFocusedRowChange,
        columnsConfig,
        filterable,
        filter,
        onFilterChange,
        sort,
        onSortChange,
        sortable
    } = props;

    const [focusedRow, setFocusedRow] = useState<T | undefined>(focusedRowProps);
    useEffect(() => setFocusedRow(focusedRowProps), [focusedRowProps]);

    const {allPagesSignal, elements, applicationSignal} = useAppContext();

    return <div style={{display: 'table', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
        <div style={{display: 'table-row', position: 'sticky', top: 0}}>
            {columns.map(col => {
                const {width, hide} = extractWidthAndHiddenField(columnsConfig, col);
                let title = col;
                if (columnsConfig !== undefined && columnsConfig !== null && typeof columnsConfig === 'object' && col in columnsConfig) {
                    const config = columnsConfig[col];
                    if (config.title) {
                        title = config.title;
                    }
                }
                let sortDirection: 'asc' | 'desc' | undefined = undefined;
                let sortIndex = -1;
                if (sortable && sort) {
                    sortIndex = sort.findIndex(s => s.column === col);
                    if (sortIndex >= 0) {
                        sortDirection = sort[sortIndex].direction;
                    }
                }
                return <div style={{
                    display: hide ? 'none' : 'table-cell',
                    borderBottom: BORDER,
                    backgroundColor: '#F2F2F2',
                    color: "black",
                    padding: '5px 0px 5px 10px',
                    width,
                }} onClick={() => {
                    if (onSortChange === undefined) {
                        return;
                    }
                    if (sortDirection === 'asc') {
                        onSortChange({value: 'desc', column: col});
                    } else if (sortDirection === 'desc') {
                        onSortChange({value: 'remove', column: col});
                    } else {
                        onSortChange({value: 'asc', column: col});
                    }
                }}>
                    <div style={{display: 'flex', justifyContent: 'center', gap: 5}}>
                        <div style={{width: '100%'}}>
                            {title}
                        </div>
                        {sortable && sortIndex >=0 &&
                            <div>{(sortIndex + 1).toString()}</div>
                        }
                        {sortable &&
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                {sortDirection === 'asc' &&
                                    <MdArrowUpward/>
                                }
                                {sortDirection === 'desc' &&
                                    <MdArrowDownward/>
                                }
                            </div>
                        }
                    </div>
                </div>
            })}
        </div>
        {filterable &&
            <div style={{display: 'table-row', position: 'sticky', top: 32}}>
                {columns.map((col, index, source) => {
                    const lastIndex = (source.length - 1) === index
                    const {width, hide} = extractWidthAndHiddenField(columnsConfig, col);
                    let value = '';
                    if (filter && col in filter) {
                        const val = filter[col];
                        if (typeof val === 'string') {
                            value = val;
                        } else {
                            value = JSON.stringify(val ?? '');
                        }
                    }
                    return <div style={{
                        display: hide ? 'none' : 'table-cell',
                        borderBottom: BORDER,
                        backgroundColor: '#F2F2F2',
                        color: "black",
                        width,
                    }}><input style={{
                        border: 'unset',
                        borderRight: lastIndex ? 'unset' : BORDER,
                        width: '100%',
                        padding: '5px 10px'
                    }} value={value} onChange={(e) => {
                        const val = e.target.value;
                        if (onFilterChange) {
                            onFilterChange({
                                column: col,
                                value: val,
                                oldValue: value
                            });
                        }
                    }}/></div>
                })}
            </div>
        }
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