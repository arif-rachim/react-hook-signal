import {QueryType} from "../designer/variable-initialization/AppVariableInitialization.tsx";
import {CSSProperties, forwardRef, useEffect, useRef, useState} from "react";
import {ColumnsConfig, SimpleTable, SimpleTableFooter} from "../designer/panels/database/TableEditor.tsx";
import {Container} from "../designer/AppDesigner.tsx";
import {SqlValue} from "sql.js";
import {queryGridColumnsTemporalColumns} from "../designer/editor/queryGridColumnsTemporalColumns.ts";
import {useForwardedRef} from "../../core/hooks/useForwardedRef.ts";

export type QueryTypeResult = {
    error?: string,
    data?: Record<string, SqlValue>[],
    columns?: string[],
    totalPage?: number,
    currentPage?: number
}

export const QueryGrid = forwardRef<HTMLDivElement | null, {
    query: QueryType,
    style?: CSSProperties,
    columnsConfig: ColumnsConfig,
    focusedRow?: Record<string, SqlValue>,
    itemToKey?: (item: Record<string, SqlValue>) => string | number,
    onFocusedRowChange?: (props: {
        value: Record<string, SqlValue>,
        data: Array<Record<string, SqlValue>>,
        totalPage: number,
        currentPage: number,
        index: number
    }) => (Promise<void> | void),
    container: Container,
    refreshQueryKey?: string,
    onRowDoubleClick?: (props: {
        value: Record<string, SqlValue>,
        data: Array<Record<string, SqlValue>>,
        totalPage: number,
        currentPage: number,
        index: number
    }) => (Promise<void> | void),
    filterable?: boolean,
    sortable?: boolean,
    pageable?: boolean,
    rowPerPage?: number,
    paginationButtonCount?: number,
    onQueryResultChange?: (result: QueryTypeResult) => void
}>(function QueryGrid(props, ref) {
    const referenceRef = useForwardedRef<HTMLDivElement>(ref);
    const {
        query,
        style,
        columnsConfig,
        onFocusedRowChange,
        container,
        refreshQueryKey,
        onRowDoubleClick,
        filterable,
        sortable,
        pageable,
        itemToKey,
        paginationButtonCount,
        onQueryResultChange
    } = props;
    const propsRef = useRef({onQueryResultChange});
    propsRef.current = {onQueryResultChange};
    const rowPerPage = pageable ? props.rowPerPage ? props.rowPerPage : 20 : Number.MAX_SAFE_INTEGER
    const [queryResult, setQueryResult] = useState<QueryTypeResult>({
        columns: [],
        data: [],
        currentPage: 1,
        error: '',
        totalPage: 1
    });

    const [focusedRow, setFocusedRow] = useState(props.focusedRow);
    useEffect(() => {
        setFocusedRow(props.focusedRow);
    }, [props.focusedRow]);
    const [filter, setFilter] = useState<Record<string, SqlValue>>({});
    const [sort, setSort] = useState<Array<{ column: string, direction: 'asc' | 'desc' }>>([]);

    useEffect(() => {
        if (query) {
            (async () => {
                const result = await query({
                    params: {},
                    page: 0,
                    filter: filter,
                    sort: sort,
                    rowPerPage: rowPerPage
                });
                setQueryResult(oldVal => {
                    if (result && result.columns && result.columns.length === 0 && oldVal && oldVal.columns && oldVal.columns.length && oldVal.columns.length > 0) {
                        result.columns = oldVal.columns;
                    }
                    if (result) {
                        return result
                    }
                    return oldVal;
                });
            })();
        }
    }, [query, refreshQueryKey, filter, sort, pageable, rowPerPage]);

    // this is to just store them in the temporal state to be used by editor
    queryGridColumnsTemporalColumns[container.id] = queryResult.columns ?? [];
    useEffect(() => {
        if (propsRef.current.onQueryResultChange) {
            propsRef.current.onQueryResultChange(queryResult);
        }
    }, [queryResult]);
    const dataIsNotEmpty = (queryResult.data as Array<Record<string, SqlValue>>).length > 0;
    return <div ref={referenceRef}
                style={{
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    background: 'white',
                    ...style
                }}>
        <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto', flexGrow: 1}}>
            <SimpleTable columns={queryResult.columns ?? []}
                         data={queryResult.data as Array<Record<string, SqlValue>>}
                         itemToKey={itemToKey}
                         columnsConfig={columnsConfig}
                         focusedRow={focusedRow}
                         onFocusedRowChange={(value: Record<string, SqlValue>) => {
                             const data = queryResult.data ?? [];
                             if (onFocusedRowChange) {
                                 onFocusedRowChange({
                                     value,
                                     index: data.indexOf(value),
                                     totalPage: queryResult.totalPage ?? 0,
                                     data,
                                     currentPage: queryResult.currentPage ?? 1
                                 })
                             } else {
                                 setFocusedRow(value);
                             }
                         }}
                         filterable={filterable}
                         filter={filter}
                         onFilterChange={({column, value}) => {
                             setFilter(oldValue => {
                                 const newValue = {...oldValue};
                                 newValue[column] = value as SqlValue
                                 return newValue;
                             })
                         }}
                         sortable={sortable}
                         sort={sort}
                         onSortChange={({column, value}) => {
                             setSort(oldValue => {
                                 const newValue = [...oldValue];
                                 if (value === 'remove') {
                                     return newValue.filter(c => c.column !== column)
                                 }
                                 const itemIndex = newValue.findIndex(c => c.column === column);
                                 if (itemIndex < 0) {
                                     newValue.push({column, direction: value});
                                 } else {
                                     newValue.splice(itemIndex, 1, {column: column, direction: value});
                                 }
                                 return newValue;
                             })
                         }}
                         onRowDoubleClick={(value) => {
                             if (onRowDoubleClick) {
                                 const data = queryResult.data ?? [];
                                 onRowDoubleClick({
                                     data,
                                     value,
                                     currentPage: queryResult.currentPage ?? 1,
                                     totalPage: queryResult.totalPage ?? 0,
                                     index: data.indexOf(value)
                                 });
                             }
                         }}

            />
        </div>
        {pageable && dataIsNotEmpty &&
            <SimpleTableFooter totalPages={queryResult.totalPage ?? 1} value={queryResult.currentPage ?? 1}
                               buttonCount={paginationButtonCount}
                               onChange={async (newPage) => {
                                   const result = await query({
                                       filter: filter,
                                       page: newPage,
                                       params: {},
                                       sort,
                                       rowPerPage: rowPerPage
                                   });
                                   setQueryResult(oldVal => {
                                       if (result.columns?.length === 0 && oldVal.columns?.length && oldVal.columns?.length > 0) {
                                           result.columns = oldVal.columns;
                                       }
                                       return result
                                   });
                               }}/>
        }
    </div>
})