import {QueryType} from "../variable-initialization/VariableInitialization.tsx";
import {CSSProperties, forwardRef, LegacyRef, useEffect, useState} from "react";
import {ColumnsConfig, SimpleTable, SimpleTableFooter} from "../panels/database/table-editor/TableEditor.tsx";
import {Container} from "../AppDesigner.tsx";

type QueryTypeResult = {
    error?: string,
    data: Array<Record<string, unknown>>,
    columns: string[],
    totalPage: number,
    currentPage: number
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
    useEffect(() => {
        if (query) {
            (async () => {
                const result = await query();
                setQueryResult(result);
            })();
        }
    }, [query, refreshQueryKey]);

    // this is to just store them in the temporal state to be used by editor
    queryGridColumnsTemporalColumns[container.id] = queryResult.columns;


    return <div ref={ref as LegacyRef<HTMLDivElement>} style={{overflow: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1, ...style}}>
        <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto', flexGrow: 1}}>
            <SimpleTable columns={queryResult.columns} data={queryResult.data as Array<Record<string, unknown>>}
                         keyField={'ID_'}
                         columnsConfig={columnsConfig}
                         focusedRow={focusedRow}
                         onFocusedRowChange={onFocusedRowChange}/>
        </div>
        <SimpleTableFooter totalPages={queryResult.totalPage} value={queryResult.currentPage}
                           onChange={async (newPage) => {
                               const result = await query({}, newPage);
                               setQueryResult(result);
                           }}/>
    </div>
})