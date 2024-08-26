import {useAppContext} from "../../../hooks/useAppContext.ts";
import {useRef} from "react";
import {FetcherParameter, Variable} from "../../../AppDesigner.tsx";
import {useShowModal} from "../../../../modal/useShowModal.ts";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {useRemoveDashboardPanel} from "../../../dashboard/useRemoveDashboardPanel.ts";
import {guid} from "../../../../utils/guid.ts";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {BORDER} from "../../../Border.ts";
import CollapsibleLabelContainer from "../../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {Button} from "../../../button/Button.tsx";
import {ConfirmationDialog} from "../../../ConfirmationDialog.tsx";
import {Icon} from "../../../Icon.ts";
import {useUpdateQueries} from "../../../hooks/useUpdateQueries.ts";
import {Query} from "../../database/service/getTables.ts";
import {RenderParameters} from "../../fetchers/editor/FetcherEditorPanel.tsx";
import {SqlValue} from "sql.js";
import {Column, queryPagination, SimpleTable, SimpleTableFooter} from "../../database/table-editor/TableEditor.tsx";
import {composeArraySchema} from "../../../variable-initialization/dbSchemaInitialization.ts";

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
            rawQuery: ''
        }
    }

    const querySignal = useSignal(query ?? createNewQuery());

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
        const {query: rawQuery, parameters} = extractParametersAndReplace(queryValue.query);
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
        querySignal.set({...queryValue, parameters: newParams, rawQuery})
    }

    const tableDataSignal = useSignal<{
        columns: Column[],
        currentPage: number,
        totalPage: number,
        data: unknown[]
    }>({columns: [], currentPage: 1, totalPage: 1, data: []});

    async function testQuery(page: number) {
        const query = querySignal.get();
        const params = query.parameters.map(p => p.value as SqlValue) as Array<SqlValue>;
        const result = await queryPagination(query.rawQuery, params, page ?? 1, 50);
        tableDataSignal.set(result);
        if (page === 1) {
            const allData = await queryPagination(query.rawQuery, params, page ?? 1, Number.MAX_SAFE_INTEGER);
            querySignal.set({...query, schemaCode: composeArraySchema(allData.data)})
        }
    }

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
                <notifiable.input name={'queryName'} autoComplete={'unset'}
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
            <CollapsibleLabelContainer label={'Query'} style={{overflow: 'unset', flexShrink: 0}}
                                       styleContent={{padding: '5px 0px', overflow: 'unset'}} autoGrowWhenOpen={true}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 250
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
                                height={150}
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
                                height: '100%'
                            }}>
                                <RenderParameters fetcherSignal={querySignal} isModified={isModified}
                                                  type={'parameters'}
                                                  nameReadOnly={true} showInputParameterColumn={false}/>
                            </div>

                        </>
                    }}
                </notifiable.div>
            </CollapsibleLabelContainer>

            <CollapsibleLabelContainer label={'Result'} style={{overflow: 'auto'}}
                                       styleContent={{padding: 0, overflow: 'auto'}} autoGrowWhenOpen={true}>
                <notifiable.div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
                    {() => {
                        const tableData = tableDataSignal.get();
                        return <SimpleTable columns={tableData.columns}
                                            data={tableData.data as Array<Record<string, unknown>>}
                                            keyField={'id'}/>
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
                    minHeight: 250
                }}>
                    {() => {
                        const query = querySignal.get();
                        const schemaCode = query.schemaCode;
                        return <>
                            <div style={{borderBottom: BORDER, padding: 5, fontStyle: 'italic'}}>Query Return
                                Type
                            </div>
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
                    }}>
                        {'Test'}
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon.Query style={{fontSize: 18}}/>
                        </div>
                    </Button>
                    {modified &&
                        <Button onClick={async () => {
                            const [isValid, errors] = validateForm();
                            if (isValid) {
                                updateQuery(querySignal.get());
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
                                        icon: Icon.Exit,
                                        label: 'Ok',
                                        id: 'Ok'
                                    }]}/>
                                })
                            }
                        }} style={{
                            display: 'flex',
                            gap: 5,
                            alignItems: 'center'
                        }}>
                            {'Save'}
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Icon.Save style={{fontSize: 18}}/>
                            </div>
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
                        }}>
                            {'Reset'}
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Icon.Reset style={{fontSize: 18}}/>
                            </div>
                        </Button>
                    }
                </>
            }}
        </notifiable.div>
    </div>
}

function extractParametersAndReplace(sqlQuery: string) {
    const parameterRegex = /:(\w+)/g;
    const parameters = [] as string[];
    const modifiedQuery = sqlQuery.replace(parameterRegex, (_, p1) => {
        parameters.push(p1);
        return '?'
    })
    return {
        query: modifiedQuery,
        parameters: parameters
    }
}

export function buildQuery(modifiedQuery: string, values: Array<unknown>) {
    let index = 0;
    return modifiedQuery.replace(/\?/g, () => {
        const value = values[index++];
        if (value === null || value === undefined) {
            return ''
        }
        if (typeof value === 'string') {
            return `'${value}'`
        }
        return value.toString();
    })
}