import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useRef} from "react";
import {FetcherParameter, Variable} from "../../AppDesigner.tsx";
import {useShowModal} from "../../../../core/hooks/modal/useShowModal.ts";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {useRemoveDashboardPanel} from "../../../../core/style/useRemoveDashboardPanel.ts";
import {guid} from "../../../../core/utils/guid.ts";
import {isEmpty} from "../../../../core/utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {BORDER} from "../../../../core/style/Border.ts";
import CollapsibleLabelContainer from "../../../../core/components/CollapsibleLabelContainer.tsx";
import {Button} from "../../../button/Button.tsx";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {useUpdateQueries} from "./useUpdateQueries.ts";
import {Query} from "../database/getTables.ts";
import {RenderParameters} from "../fetchers/FetcherEditorPanel.tsx";
import {ParamsObject, SqlValue} from "sql.js";
import {SimpleTable, SimpleTableFooter} from "../database/TableEditor.tsx";
import {composeArraySchema} from "../../variable-initialization/dbSchemaInitialization.ts";
import {useNameRefactor} from "../../../../core/hooks/useNameRefactor.ts";
import {queryPagination} from "../../queryPagination.ts";
import {QueryParamsObject} from "../database/queryDb.ts";

export default function QueryEditorPanel(props: {
    queryId?: string,
    panelId: string,
    scope: 'page' | 'application'
}) {
    const context = useAppContext();
    const {queryId, panelId, scope} = props;
    const query = [...context.allPageQueriesSignal.get(), ...context.allApplicationQueriesSignal.get()].find(v => v.id === queryId);
    const showModal = useShowModal();

    const updateQuery = useUpdateQueries(scope);
    const {
        allApplicationQueriesSignal,
        allPageQueriesSignal
    } = context;

    const allQueriesSignal = useComputed(() => {
        const allPageQueries = allPageQueriesSignal.get();
        const allApplicationQueries = allApplicationQueriesSignal.get();
        if (scope === "page") {
            return [...allPageQueries, ...allApplicationQueries];
        }
        return allApplicationQueries
    });

    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();

    function createNewQuery(): Query {
        return {
            id: guid(),
            name: '',
            query: '',
            parameters: [],
            schemaCode: '',
        }
    }

    const querySignal = useSignal(query ?? createNewQuery());
    const filterSignal = useSignal<QueryParamsObject>({});

    function validateForm(): [boolean, Partial<Record<keyof Query, Array<string>>>] {
        function nameIsDuplicate(name: string, id: string) {
            return allQueriesSignal.get().filter(v => v.id !== id).find(v => v.name === name) !== undefined;
        }

        const errors: Partial<Record<keyof Variable, Array<string>>> = {};
        const query = querySignal.get();
        if (isEmpty(query.name)) {
            errors.name = ['The "name" field cannot be empty; it must have a value.'];
        }
        if (isEmpty(query.query)) {
            errors.functionCode = ['The "query" field cannot be empty; it must have a value.'];
        }
        if (nameIsDuplicate(query.name, query.id)) {
            errors.name = [`The query name "${query.name}" is already in use. Please choose a different name.`];
        }
        if (monacoRef.current) {
            const markers = monacoRef.current?.editor.getModelMarkers({});
            if (markers && markers.length) {
                errors.functionCode = markers.map(m => m.message);
            }
        }
        const valid = Object.keys(errors).length === 0;
        return [valid, errors];
    }

    const monacoRef = useRef<Monaco | undefined>();
    // this is the function to repopulate the parameters
    const updateParameters = () => {
        const queryValue = querySignal.get();
        const parameters = extractParametersAndReplace(queryValue.query);
        const params = queryValue.parameters;
        const newParams = parameters.map(p => {
            const existingParam = params.find(par => par.name === p);
            if (existingParam) {
                return existingParam
            }
            const result: FetcherParameter = {
                id: guid(),
                name: p,
                value: '',
                isInput: true
            };
            return result;
        });
        querySignal.set({...queryValue, parameters: newParams})
    }

    const tableDataSignal = useSignal<{
        columns: string[],
        currentPage: number,
        totalPage: number,
        data: unknown[]
    }>({columns: [], currentPage: 1, totalPage: 1, data: []});

    async function testQuery(page: number) {
        const query = querySignal.get();
        //const params = query.parameters.map(p => p.value as SqlValue) as Array<SqlValue>;
        let params: ParamsObject = {};
        params = query.parameters.reduce((params, val) => {
            params[val.name] = val.value
            return params;
        }, params)
        const result = await queryPagination({
            query: query.query,
            params,
            filter: filterSignal.get(),
            currentPage: page ?? 1,
            pageSize: 50,
            sort: []
        });
        const prevTableData = tableDataSignal.get();
        if (prevTableData.columns.length > 0 && result.columns.length === 0) {
            tableDataSignal.set({...result, columns: prevTableData.columns});
        } else {
            tableDataSignal.set(result);
        }
        if (page === 1) {
            const allData = await queryPagination({
                query: query.query,
                params,
                filter: filterSignal.get(),
                currentPage: page ?? 1,
                pageSize: 50,
                sort: []
            });
            querySignal.set({...query, schemaCode: composeArraySchema(allData.data)})
        }
    }

    const refactorName = useNameRefactor();
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1,
    }}>
        <div style={{display: 'flex', gap: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.02)'}}>
            <LabelContainer label={'Name : '}
                            style={{flexGrow: 1, flexBasis: '50%', flexDirection: 'row', alignItems: 'center', gap: 10}}
                            styleLabel={{fontStyle: 'italic'}}>
                <notifiable.input name={'queryName'} autoComplete={guid()}
                                  style={{border: BORDER, flexGrow: 1, padding: '5px 10px', borderRadius: 5}}
                                  value={() => {
                                      return querySignal.get().name
                                  }}
                                  onKeyDown={(e) => {
                                      if (e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                      }
                                  }}
                                  onChange={(event) => {
                                      const dom = event.target;
                                      const cursorPosition = dom.selectionStart;
                                      const val = dom.value;
                                      const newCallable = {...querySignal.get()};
                                      newCallable.name = val;
                                      querySignal.set(newCallable);
                                      isModified.set(true);
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}/>
            </LabelContainer>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, overflow: 'auto'}}>
            <CollapsibleLabelContainer label={'Query'} style={{overflow: 'auto'}}
                                       styleContent={{padding: '5px 0px', overflow: 'unset'}} autoGrowWhenOpen={true}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 400,
                    minHeight: 400,
                    flexGrow: 1,
                    overflow: 'auto'
                }}>
                    {() => {
                        const callable = querySignal.get();
                        const query = callable.query;
                        return <>
                            <div style={{borderBottom: BORDER, padding: 5, fontStyle: 'italic'}}>Query</div>
                            <Editor
                                language="sql"
                                value={query}
                                options={{
                                    selectOnLineNumbers: false,
                                    lineNumbers: 'off',
                                }}

                                onChange={(value?: string) => {
                                    const newCallable = {...querySignal.get()};
                                    newCallable.query = value ?? '';
                                    querySignal.set(newCallable);
                                    isModified.set(true);
                                    updateParameters();
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 10,
                                borderTop: '1px solid rgba(0,0,0,0.1)',
                                overflow: 'auto',
                                minHeight: 100
                            }}>
                                <RenderParameters fetcherSignal={querySignal} isModified={isModified}
                                                  type={'parameters'}
                                                  nameReadOnly={true} showInputParameterColumn={false}/>
                            </div>

                        </>
                    }}
                </notifiable.div>
            </CollapsibleLabelContainer>

            <CollapsibleLabelContainer label={'Result'} style={{overflow: 'auto', minHeight: '30%'}}
                                       styleContent={{padding: 0, overflow: 'auto'}} autoGrowWhenOpen={true}>
                <notifiable.div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
                    {() => {
                        const tableData = tableDataSignal.get();
                        const filter = filterSignal.get();
                        return <SimpleTable columns={tableData.columns}
                                            data={tableData.data as Array<Record<string, SqlValue>>}
                                            filter={filter}
                                            onFilterChange={async ({column, value}) => {
                                                const filter = {...filterSignal.get()};
                                                filter[column] = value as SqlValue;
                                                filterSignal.set(filter);
                                                await testQuery(1)
                                            }}
                                            filterable={true}/>
                    }}
                </notifiable.div>
                <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                    {() => {
                        const tableData = tableDataSignal.get();
                        return <SimpleTableFooter value={tableData?.currentPage ?? 0}
                                                  totalPages={tableData?.totalPage ?? 1}
                                                  onChange={async (page) => {
                                                      await testQuery(page);
                                                  }}/>
                    }}
                </notifiable.div>
            </CollapsibleLabelContainer>
            <CollapsibleLabelContainer label={'Schema'} style={{overflow: 'unset', flexShrink: 0}} defaultOpen={false}
                                       autoGrowWhenOpen={true}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 250,
                    flexGrow: 1
                }}>
                    {() => {
                        const query = querySignal.get();
                        const schemaCode = query.schemaCode;
                        return <>
                            <div style={{borderBottom: BORDER, padding: 5, fontStyle: 'italic'}}>Query Return Type</div>
                            <Editor
                                language="javascript"
                                value={schemaCode}
                                options={{
                                    selectOnLineNumbers: false,
                                    lineNumbers: 'off',
                                }}
                                onChange={(value?: string) => {
                                    const newQuery = {...querySignal.get()};
                                    newQuery.schemaCode = value ?? '';
                                    querySignal.set(newQuery);
                                    isModified.set(true);
                                }}
                            /></>
                    }}
                </notifiable.div>
            </CollapsibleLabelContainer>
        </div>
        <notifiable.div
            style={{display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: BORDER, padding: 10, height: 50}}>
            {() => {
                const modified = isModified.get();
                return <>
                    <Button onClick={async () => {
                        await testQuery(1)
                    }} style={{
                        display: 'flex',
                        gap: 5,
                        alignItems: 'center'
                    }} icon={'IoMdGlobe'}>
                        {'Test'}
                    </Button>
                    {modified &&
                        <Button onClick={async () => {
                            const [isValid, errors] = validateForm();
                            if (isValid) {
                                updateQuery(querySignal.get());

                                const currentName = query?.name ?? '';
                                const newName = querySignal.get().name ?? '';
                                if (currentName !== newName && !isEmpty(currentName)) {
                                    refactorName({
                                        currentName,
                                        newName,
                                        scope: scope === 'page' ? 'page' : 'app',
                                        type: 'query'
                                    });
                                }
                                removePanel(panelId)
                            } else {
                                await showModal<string>(cp => {
                                    const message = (Object.keys(errors) as Array<keyof Variable>).map(k => {
                                        const ek = k as keyof typeof errors;
                                        return errors[ek]?.map(val => {
                                            return <div key={val}>{(val ?? '') as string}</div>
                                        })
                                    }).flat();
                                    return <ConfirmationDialog message={message} closePanel={cp} buttons={[{
                                        icon: 'IoIosExit',
                                        label: 'Ok',
                                        id: 'Ok'
                                    }]}/>
                                })
                            }
                        }} style={{
                            display: 'flex',
                            gap: 5,
                            alignItems: 'center'
                        }} icon={'IoIosSave'}>
                            {'Save'}
                        </Button>
                    }
                    {modified &&
                        <Button onClick={async () => {
                            querySignal.set(query ?? createNewQuery());
                            isModified.set(false);
                        }} style={{
                            display: 'flex',
                            gap: 5,
                            alignItems: 'center'
                        }} icon={'IoIosExit'}>
                            {'Reset'}
                        </Button>
                    }
                </>
            }}
        </notifiable.div>
    </div>
}

function extractParametersAndReplace(sqlQuery: string) {
    const parameterColon = /:(\w+)/g;
    return (sqlQuery.match(parameterColon) ?? []).map(t => {
        const text = t.toString();
        return text.substring(1)
    }).filter((f, index, source) => source.indexOf(f) === index);
}
