import {QueryType} from "../variable-initialization/VariableInitialization.tsx";
import {CSSProperties, forwardRef, LegacyRef, useEffect, useState} from "react";
import {ColumnsConfig, SimpleTable, SimpleTableFooter} from "../panels/database/table-editor/TableEditor.tsx";
import {Container} from "../AppDesigner.tsx";
import {SqlValue} from "sql.js";

export type QueryTypeResult = {
    error?: string,
    data?: Record<string, number | string | Uint8Array | null>[],
    columns?: string[],
    totalPage?: number,
    currentPage?: number
}

export const queryGridColumnsTemporalColumns: Record<Container['id'], string[]> = {};

export const QueryGrid = forwardRef(function QueryGrid(props: {
    query: QueryType,
    style: CSSProperties,
    columnsConfig: ColumnsConfig,
    focusedRow?: Record<string, unknown>,
    onFocusedRowChange?: (param: unknown) => void,
    container: Container,
    refreshQueryKey?: string
}, ref) {
    const {query, style, columnsConfig, focusedRow, onFocusedRowChange, container, refreshQueryKey} = props;
    const [queryResult, setQueryResult] = useState<QueryTypeResult>({
        columns: [],
        data: [],
        currentPage: 1,
        error: '',
        totalPage: 1
    });
    const [filter, setFilter] = useState<Record<string, SqlValue>>({});
    useEffect(() => {
        if (query) {
            (async () => {
                const result = await query({inputs: {}, page: 0, dynamicFilter: filter});
                setQueryResult(result);
            })();
        }
    }, [query, refreshQueryKey, filter]);

    // this is to just store them in the temporal state to be used by editor
    queryGridColumnsTemporalColumns[container.id] = queryResult.columns ?? [];

    return <div ref={ref as LegacyRef<HTMLDivElement>}
                style={{overflow: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, ...style}}>
        <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto', flexGrow: 1}}>
            <SimpleTable columns={queryResult.columns ?? []} data={queryResult.data as Array<Record<string, unknown>>}
                         keyField={'ID_'}
                         columnsConfig={columnsConfig}
                         focusedRow={focusedRow}
                         onFocusedRowChange={onFocusedRowChange}
                         filterable={true}
                         filter={filter}
                         onFilterChange={({column, value}) => {
                             setFilter(oldValue => {
                                 const newValue = {...oldValue};
                                 newValue[column] = value as SqlValue
                                 return newValue;
                             })
                         }}
            />
        </div>
        <SimpleTableFooter totalPages={queryResult.totalPage ?? 1} value={queryResult.currentPage ?? 1}
                           onChange={async (newPage) => {
                               const result = await query({dynamicFilter: filter, page: newPage, inputs: {}});
                               setQueryResult(result);
                           }}/>
    </div>
})