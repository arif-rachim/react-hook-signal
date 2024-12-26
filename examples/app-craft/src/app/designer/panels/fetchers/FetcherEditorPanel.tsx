import {Button} from "../../../button/Button.tsx";
import {useRemoveDashboardPanel} from "../../../../core/style/useRemoveDashboardPanel.ts";
import {BORDER} from "../../../../core/style/Border.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {Callable, Fetcher, FetcherParameter, Page} from "../../AppDesigner.tsx";
import {useShowModal} from "../../../../core/hooks/modal/useShowModal.ts";
import {guid} from "../../../../core/utils/guid.ts";
import {Icon} from "../../../../core/components/icon/Icon.ts";
import {Signal} from "signal-polyfill";
import CollapsibleLabelContainer from "../../../../core/components/CollapsibleLabelContainer.tsx";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {useUpdateFetcher} from "./useUpdateFetcher.ts";
import {isEmpty} from "../../../../core/utils/isEmpty.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {format_hhmmss} from "../../../../core/utils/dateFormat.ts";
import {Editor} from "@monaco-editor/react";
import {initiateSchemaTS} from "../../editor/initiateSchemaTS.ts";
import Visible from "../../../../core/components/Visible.tsx";
import {createRequest} from "../../createRequest.ts";
import {Query, Table} from "../database/getTables.ts";
import type {ChangeEvent} from "react";
import {useNameRefactor} from "../../../../core/hooks/useNameRefactor.ts";
import untrack = Signal.subtle.untrack;

const LABEL_WIDTH = 60;

export function FetcherEditorPanel(props: { fetcherId?: string, panelId: string, scope: 'page' | 'application' }) {
    const {
        allPageFetchersSignal,
        allPageVariablesSignal,
        allApplicationVariablesSignal,
        allPageVariablesSignalInstance,
        allApplicationVariablesSignalInstance,
        allApplicationFetchersSignal
    } = useAppContext();

    const {fetcherId, panelId, scope} = props;
    const fetcher = [...allPageFetchersSignal.get(), ...allApplicationFetchersSignal.get()].find(v => v.id === fetcherId);
    const showModal = useShowModal();
    const updateFetcher = useUpdateFetcher(scope);
    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();
    const testMessages = useSignal<Array<{ id: string, date: Date, message: string }>>([]);
    const responseData = useSignal<string>('');

    function logTestMessage(message: string) {
        testMessages.set([...testMessages.get(), {id: guid(), date: new Date(), message: message}])
    }

    function createNewFetcher(): Fetcher {
        return {
            id: guid(),
            name: '',
            protocol: 'https',
            domain: '',
            method: 'get',
            contentType: 'application/json',
            path: '',
            headers: [],
            paths: [],
            data: [],
            returnTypeSchemaCode: '',
            functionCode: '',
        }
    }

    const allVariablesSignal = useComputed(() => {
        const allPageVariables = allPageVariablesSignal.get();
        const allApplicationVariables = allApplicationVariablesSignal.get();
        if (scope === "page") {
            return [...allPageVariables, ...allApplicationVariables];
        }
        return allApplicationVariables
    });

    const allVariablesInstanceSignal = useComputed(() => {
        const allPageVariables = allPageVariablesSignalInstance.get();
        const allApplicationVariables = allApplicationVariablesSignalInstance.get();
        if (scope === "page") {
            return [...allPageVariables, ...allApplicationVariables];
        }
        return allApplicationVariables
    });

    const fetcherSignal = useSignal(fetcher ?? createNewFetcher());

    function addParam(type: 'headers' | 'paths' | 'data') {
        const newFetcher = {...fetcherSignal.get()};

        newFetcher[type] = [...newFetcher[type], {
            id: guid(),
            isInput: false,
            name: '',
            value: ''
        }]
        fetcherSignal.set(newFetcher);
        isModified.set(true);
    }

    const pathComputed = useComputed(() => {
        const path = fetcherSignal.get().path;
        return extractParams(path);
    }, {
        equals: (prev, next) => {
            return JSON.stringify(prev) === JSON.stringify(next)
        }
    })

    function validateForm(): [boolean, Partial<Record<keyof Fetcher, Array<string>>>] {
        function nameIsDuplicate(name: string, id: string) {
            return allPageFetchersSignal.get().filter(v => v.id !== id).find(v => v.name === name) !== undefined;
        }

        const errors: Partial<Record<keyof Fetcher, Array<string>>> = {};
        const fetcher = fetcherSignal.get();
        if (isEmpty(fetcher.name)) {
            errors.name = ['The "name" field cannot be empty; it must have a value.'];
        }
        if (isEmpty(fetcher.domain)) {
            errors.domain = ['The "domain" field cannot be empty; it must have a value.'];
        }
        if (isEmpty(fetcher.path)) {
            errors.path = ['The "path" field cannot be empty; it must have a value.'];
        }

        if (nameIsDuplicate(fetcher.name, fetcher.id)) {
            errors.name = [`The fetcher name "${fetcher.name}" is already in use. Please choose a different name.`];
        }

        const valid = Object.keys(errors).length === 0;
        return [valid, errors];
    }

    useSignalEffect(() => {
        const params = pathComputed.get();
        const signal = untrack(() => fetcherSignal.get());
        const newSignal = {...signal};
        const paths = newSignal.paths;
        const newPaths: FetcherParameter[] = [];
        let hasChanged = false;
        for (const param of params) {
            const parameter = paths.find(p => p.name === param);
            if (parameter) {
                newPaths.push(parameter);
            } else {
                hasChanged = true;
                newPaths.push({
                    id: guid(),
                    name: param,
                    isInput: false,
                    value: ''
                })
            }
        }
        newSignal.paths = newPaths;
        if (hasChanged) {
            setTimeout(() => fetcherSignal.set(newSignal), 0)
        }
    })
    const hasContent = useComputed(() => ['post', 'patch', 'put'].includes(fetcherSignal.get().method))

    async function testFetcher() {
        const fetcherValue = fetcherSignal.get();
        // repopulate fetcher

        const fetcher = {...fetcherValue};

        const allVariables = allVariablesSignal.get();
        const allVariablesInstance = allVariablesInstanceSignal.get();
        const dependencies = allVariables.map(v => {
            const instance = allVariablesInstance.find(variable => variable.id === v.id)?.instance;
            return {name: v.name, instance}
        }) ?? [];

        const module: {
            exports: {
                protocol?: 'http' | 'https',
                domain?: string,
                method?: 'post' | 'get' | 'put' | 'patch' | 'delete',
                contentType?: 'application/x-www-form-urlencoded' | 'application/json'
                path?: string,
                headers?: Record<string, string>,
                data?: Record<string, unknown>,
            }
        } = {exports: {}};

        try {
            const params = ['module', ...dependencies.map(d => d.name ?? ''), fetcher.functionCode ?? ''];
            const fun = new Function(...params)
            fun.call(null, ...[module, ...dependencies.map(d => d.instance)]);
            fetcher.protocol = module.exports.protocol ?? fetcher.protocol;
            fetcher.domain = module.exports.domain ?? fetcher.domain;
            fetcher.method = module.exports.method ?? fetcher.method;
            fetcher.contentType = module.exports.contentType ?? fetcher.contentType;
            fetcher.path = module.exports.path ?? fetcher.path;
            fetcher.headers = fetcher.headers.map(h => {
                if (module.exports.headers && h.name in module.exports.headers) {
                    return {...h, value: module.exports.headers[h.name]}
                }
                return h
            });
            fetcher.data = fetcher.data.map(h => {
                if (module.exports.headers && h.name in module.exports.headers) {
                    return {...h, value: module.exports.headers[h.name]}
                }
                return h
            });
        } catch (err) {
            console.log(err);
        }


        const {address, requestInit} = createRequest(fetcher, {});
        logTestMessage(`[Request] ${address}`);
        logTestMessage(`[Request] ${JSON.stringify(requestInit)}`);
        let contentType: string = '';
        let response: Response | null = null;
        try {
            response = await fetch(address, requestInit);
            contentType = response.headers.get('Content-Type') ?? '';
        } catch (err) {
            if (err !== undefined && err !== null && typeof err === 'object' && 'message' in err) {
                logTestMessage(`[Response] ${err.message}`)
            }
        }
        if (response === null) {
            return;
        }
        logTestMessage(`[Response] ${response.statusText} ${contentType}`);
        if (contentType && contentType.includes('application/json')) {
            // its json we can do something here
            const json = await response.json();
            responseData.set(JSON.stringify(json));
            const ts = naiveJsonToTs(json, 1);
            logTestMessage(`[Response] ${ts}`);

            const newFetcher = {...fetcherSignal.get()};
            newFetcher.returnTypeSchemaCode = ts
            fetcherSignal.set(newFetcher);
        } else {
            const text = await response.text();
            logTestMessage(`[Response] ${text}`);
        }
    }

    const returnType = `{
        protocol?: 'http' | 'https',
        domain?: string,
        method?: 'post' | 'get' | 'put' | 'patch' | 'delete',
        contentType?: 'application/x-www-form-urlencoded' | 'application/json'
        path?: string,
        headers?: Record<string,string>,
        data?: Record<string,unknown>,
    }`
    const refactorName = useNameRefactor();
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1,
    }}>
        <CollapsibleLabelContainer label={'Default Value'} autoGrowWhenOpen={true} defaultOpen={false}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 20px'}}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 300
                }}>
                    {() => {
                        const fetcher = fetcherSignal.get();

                        const allPages: Array<Page> = [];
                        const allTables: Array<Table> = [];
                        const formula = fetcher.functionCode;

                        const allApplicationQueries = [] as Array<Query>;
                        const allApplicationVariables = allApplicationVariablesSignal.get();
                        const allApplicationFetchers = [] as Array<Fetcher>;
                        const allApplicationCallables = [] as Array<Callable>;

                        const allPageQueries = [] as Array<Query>;
                        const allPageVariables = allPageVariablesSignal.get();
                        const allPageFetchers = [] as Array<Fetcher>;
                        const allPageCallables = [] as Array<Callable>;


                        return <Editor
                            language="javascript"
                            beforeMount={(monaco) => {
                                const dtsContent = initiateSchemaTS({
                                    returnType,
                                    allPages,
                                    allTables,

                                    allApplicationQueries,
                                    allApplicationVariables,
                                    allApplicationFetchers,
                                    allApplicationCallables,

                                    allPageQueries,
                                    allPageVariables,
                                    allPageFetchers,
                                    allPageCallables,
                                })
                                monaco.languages.typescript.javascriptDefaults.addExtraLib(dtsContent, "ts:filename/validation-source.d.ts");
                            }}
                            value={formula}
                            onChange={(value?: string) => {
                                const newVariable = {...fetcherSignal.get()};
                                newVariable.functionCode = value ?? '';
                                fetcherSignal.set(newVariable);
                                isModified.set(true);
                            }}
                        />
                    }}
                </notifiable.div>
            </div>
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Info'}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 20px'}}>
                <LabelContainer label={'Name : '} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}
                                styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH}}>
                    <notifiable.input name={'fetcherName'} autoComplete={guid()}
                                      style={{border: BORDER, flexGrow: 1, padding: '5px 10px', borderRadius: 5}}
                                      value={() => {
                                          return fetcherSignal.get().name
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
                                          const newFetcher = {...fetcherSignal.get()};
                                          newFetcher.name = val;
                                          fetcherSignal.set(newFetcher);
                                          isModified.set(true);
                                          setTimeout(() => {
                                              dom.setSelectionRange(cursorPosition, cursorPosition);
                                          }, 0);
                                      }}/>
                </LabelContainer>
                <div style={{display: 'flex', flexDirection: 'row', gap: 10}}>
                    <LabelContainer label={'Protocol : '} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}
                                    styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH}}>
                        <notifiable.select
                            style={{border: BORDER, padding: '6px 10px', borderRadius: 5}}
                            value={() => {
                                return fetcherSignal.get().protocol
                            }}
                            onChange={(e) => {
                                const value = e.target.value as Fetcher['protocol'];
                                const newVariable = {...fetcherSignal.get()};
                                newVariable.protocol = value;
                                fetcherSignal.set(newVariable);
                                isModified.set(true);
                            }}>
                            <option value={'http'}>HTTP</option>
                            <option value={'https'}>HTTPS</option>
                        </notifiable.select>
                    </LabelContainer>
                    <LabelContainer label={'Domain : '}
                                    style={{flexDirection: 'row', alignItems: 'center', gap: 10, flexGrow: 1}}
                                    styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH - 5}}>
                        <notifiable.input name={'domain'} autoComplete={guid()}
                                          style={{border: BORDER, flexGrow: 1, padding: '5px 10px', borderRadius: 5}}
                                          value={() => {
                                              return fetcherSignal.get().domain
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
                                              const newVariable = {...fetcherSignal.get()};
                                              newVariable.domain = val;
                                              fetcherSignal.set(newVariable);
                                              isModified.set(true);
                                              setTimeout(() => {
                                                  dom.setSelectionRange(cursorPosition, cursorPosition);
                                              }, 0);
                                          }}/>
                    </LabelContainer>
                </div>
                <LabelContainer label={'Path : '}
                                style={{flexDirection: 'row', alignItems: 'center', gap: 10, flexGrow: 1}}
                                styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH}}>
                    <notifiable.input name={'path'} autoComplete={guid()}
                                      style={{border: BORDER, flexGrow: 1, padding: '5px 10px', borderRadius: 5}}
                                      value={() => {
                                          return fetcherSignal.get().path
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
                                          const newVariable = {...fetcherSignal.get()};
                                          newVariable.path = val;
                                          fetcherSignal.set(newVariable);
                                          isModified.set(true);
                                          setTimeout(() => {
                                              dom.setSelectionRange(cursorPosition, cursorPosition);
                                          }, 0);
                                      }}/>
                </LabelContainer>
                <RenderParameters fetcherSignal={fetcherSignal} isModified={isModified} type={'paths'}
                                  nameReadOnly={true} showInputParameterColumn={true}/>

                <div style={{display: 'flex', gap: 20}}>
                    <LabelContainer label={'Method : '} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}
                                    styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH}}>
                        <notifiable.select
                            style={{border: BORDER, padding: '6px 10px', borderRadius: 5}}
                            value={() => {
                                return fetcherSignal.get().method
                            }}
                            onChange={(e) => {
                                const value = e.target.value as Fetcher['method'];
                                const newVariable = {...fetcherSignal.get()};
                                newVariable.method = value;
                                fetcherSignal.set(newVariable);
                                isModified.set(true);
                            }}>
                            <option value={'get'}>GET</option>
                            <option value={'post'}>POST</option>
                            <option value={'put'}>PUT</option>
                            <option value={'patch'}>PATCH</option>
                            <option value={'delete'}>DELETE</option>
                        </notifiable.select>
                    </LabelContainer>
                    <Visible when={() => hasContent.get()}>
                        <LabelContainer label={'Content Type : '}
                                        style={{flexDirection: 'row', alignItems: 'center', gap: 10}}
                                        styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH + 20}}>
                            <notifiable.select
                                style={{border: BORDER, padding: '6px 10px', borderRadius: 5}}
                                value={() => {
                                    return fetcherSignal.get().contentType
                                }}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const newVariable = {...fetcherSignal.get()};
                                    newVariable.contentType = value as Fetcher['contentType'];
                                    fetcherSignal.set(newVariable);
                                    isModified.set(true);
                                }}>
                                <option
                                    value={'application/x-www-form-urlencoded'}>Form
                                </option>
                                <option value={'application/json'}>Json</option>
                            </notifiable.select>
                        </LabelContainer>
                    </Visible>
                </div>
            </div>
        </CollapsibleLabelContainer>
        <Visible when={() => hasContent.get()}>
            <CollapsibleLabelContainer label={'Post Data Param'}>
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                    <Button style={{display: 'flex', alignItems: 'center'}} onClick={() => addParam('data')} icon={'IoMdAdd'}>
                        Add Post Param
                    </Button>
                </div>
                <RenderParameters fetcherSignal={fetcherSignal} isModified={isModified} type={'data'}
                                  showInputParameterColumn={true}/>
            </CollapsibleLabelContainer>
        </Visible>

        <CollapsibleLabelContainer label={'Headers'} defaultOpen={false}>
            <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                <Button style={{display: 'flex', alignItems: 'center'}} onClick={() => addParam('headers')} icon={'IoMdAdd'}>
                    Add Header
                </Button>
            </div>
            <RenderParameters fetcherSignal={fetcherSignal} isModified={isModified} type={'headers'}
                              showInputParameterColumn={true}/>
        </CollapsibleLabelContainer>
        <Visible when={() => testMessages.get().length > 0}>
            <CollapsibleLabelContainer label={'Test Result Log'} autoGrowWhenOpen={true}>
                <notifiable.div style={{display: 'table'}}>
                    {() => {
                        const messages = testMessages.get();
                        return <>
                            <div style={{display: 'table-row'}}>
                                <div style={{display: 'table-cell', width: 100}}>Time</div>
                                <div style={{display: 'table-cell'}}>Messages</div>
                            </div>
                            {messages.map(message => {
                                return <div key={message.id} style={{display: 'table-row'}}>
                                    <div style={{display: 'table-cell', width: 100}}>{format_hhmmss(message.date)}</div>
                                    <div style={{display: 'table-cell'}}>{message.message}</div>
                                </div>
                            })}
                        </>
                    }}
                </notifiable.div>
            </CollapsibleLabelContainer>
            <CollapsibleLabelContainer label={'Test Result Data'} autoGrowWhenOpen={true}>
                <notifiable.div style={{minHeight: 100, flexGrow: 1}}>{
                    () => {
                        return <Editor
                            language="json"
                            value={responseData.get()}
                            options={{
                                selectOnLineNumbers: false,
                                lineNumbers: 'off',
                            }}
                        />
                    }
                }
                </notifiable.div>
            </CollapsibleLabelContainer>
        </Visible>
        <CollapsibleLabelContainer label={'Schema'} autoGrowWhenOpen={true}>
            <notifiable.div style={{minHeight: 100, flexGrow: 1}}>
                {() => {
                    return <Editor
                        language="javascript"
                        value={`${fetcherSignal.get().returnTypeSchemaCode}`}
                        options={{
                            selectOnLineNumbers: false,
                            lineNumbers: 'off',
                        }}
                    />
                }}
            </notifiable.div>
        </CollapsibleLabelContainer>
        <div style={{display: 'flex', justifyContent: 'flex-end', padding: '10px 20px', gap: 10}}>
            <Button onClick={async () => {
                await testFetcher()
            }} icon={'IoIosGitNetwork'}>
                Test
            </Button>
            <Button onClick={async () => {
                const [isValid, errors] = validateForm();
                if (isValid) {
                    updateFetcher(fetcherSignal.get());

                    const currentName = fetcher?.name ?? '';
                    const newName = fetcherSignal.get().name ?? '';
                    if (currentName !== newName && !isEmpty(currentName)) {
                        refactorName({currentName, newName, scope: scope === 'page' ? 'page' : 'app', type: 'fetch'});
                    }
                    removePanel(panelId)
                } else {
                    await showModal<string>(cp => {
                        const message = (Object.keys(errors) as Array<keyof Fetcher>).map(k => {
                            return errors[k]?.map(val => {
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
            }} style={{display: 'flex', alignItems: 'center', gap: 5}} icon={'IoIosSave'}>
                Save
            </Button>
        </div>
    </div>
}

function extractParams(url: string): Array<string> {
    const regex = /\{(\w+)\}/g;
    const params = [];
    let match;
    while ((match = regex.exec(url)) !== null) {
        params.push(match[1])
    }
    return params;
}


export function RenderParameters<T extends Query | Fetcher>(props: {
    nameReadOnly?: boolean,
    fetcherSignal: Signal.State<T>,
    isModified: Signal.State<boolean>,
    type: keyof T,
    showInputParameterColumn: boolean
}) {
    const deleteAble = props.type !== 'paths';
    const notDeleteAble = !deleteAble;
    const {fetcherSignal, isModified, type, nameReadOnly, showInputParameterColumn} = props;

    const parametersSignal = useComputed<Array<FetcherParameter>>(() => {
        return (fetcherSignal.get()[type] ?? []) as Array<FetcherParameter>
    });

    function onChangeFactory(paramType: keyof FetcherParameter, param: FetcherParameter, transformValue: (val: string) => unknown) {
        return function extracted(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
            let dom = event.target;
            let cursorPosition: number | null = null;
            if ('selectionStart' in dom) {
                cursorPosition = dom.selectionStart;
            }
            const val = dom.value;
            const newFetcher = {...fetcherSignal.get()};
            const fetcherTypeValues = newFetcher[type] as Array<FetcherParameter>;
            const newArray = [...fetcherTypeValues];
            const paramIndex = newArray.findIndex(p => p.id === param.id)
            newFetcher[type] = newArray as T[keyof T];
            ((newFetcher[type] ?? []) as Array<FetcherParameter>).splice(paramIndex, 1, {
                ...param,
                [paramType]: transformValue(val)
            })
            fetcherSignal.set(newFetcher);
            isModified.set(true);
            if ('setSelectionRange' in dom) {
                setTimeout(() => {
                    dom = dom as HTMLInputElement;
                    dom.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
            }

        }
    }


    return <notifiable.div style={{display: 'table'}}>
        {() => {
            const parameters = parametersSignal.get();
            return <>
                <div style={{display: 'table-row'}}>
                    <div style={{
                        display: 'table-cell',
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                        padding: '0px 10px'
                    }}>Name
                    </div>
                    <div style={{
                        display: 'table-cell',
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                        padding: '0px 10px'
                    }}>Value
                    </div>
                    {showInputParameterColumn &&
                        <div style={{
                            display: 'table-cell',
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            padding: '0px 10px',
                            whiteSpace: 'nowrap'
                        }}>
                            Input Parameter
                        </div>
                    }
                    {deleteAble &&
                        <div style={{
                            display: 'table-cell',
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            padding: '0px 10px',
                            width: 50
                        }}>Value
                        </div>
                    }
                </div>
                {parameters.map((param, index, source) => {
                    const isFirstIndex = index === 0;
                    const isLastIndex = index === source.length - 1;
                    return <div key={param.id} style={{display: 'table-row'}}>
                        <div style={{display: 'table-cell'}}>
                            <input name={'paramName'} autoComplete={guid()}
                                   readOnly={nameReadOnly}
                                   style={{
                                       border: BORDER,
                                       borderTop: isFirstIndex ? BORDER : 'unset',
                                       borderTopLeftRadius: isFirstIndex ? 20 : 'unset',
                                       borderBottomLeftRadius: isLastIndex ? 20 : 'unset',
                                       borderRight: 'unset',
                                       flexGrow: 1,
                                       padding: '5px 10px',
                                       width: '100%',
                                   }}
                                   value={param.name}
                                   onKeyDown={(e) => {
                                       if (e.key === " ") {
                                           e.preventDefault();
                                           e.stopPropagation();
                                       }
                                   }}
                                   onChange={onChangeFactory('name', param, val => val)}
                            />
                        </div>
                        <div style={{display: 'table-cell'}}>
                            <input name={'valueName'} autoComplete={guid()}
                                   style={{
                                       border: BORDER,
                                       borderTop: isFirstIndex ? BORDER : 'unset',
                                       borderRight: 'unset',
                                       flexGrow: 1,
                                       padding: '5px 10px',
                                       width: '100%',
                                   }}
                                   value={param.value}
                                   onChange={onChangeFactory('value', param, val => val)}
                            />
                        </div>
                        {showInputParameterColumn &&
                            <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                                <select style={{
                                    border: BORDER,
                                    borderTop: isFirstIndex ? BORDER : 'unset',
                                    borderTopRightRadius: notDeleteAble && isFirstIndex ? 20 : 'unset',
                                    borderBottomRightRadius: notDeleteAble && isLastIndex ? 20 : 'unset',
                                    borderRight: notDeleteAble ? BORDER : 'unset',
                                    flexGrow: 1,
                                    padding: '5px 10px 5px 10px',
                                    width: '100%',
                                    margin: 0,
                                }}
                                        value={param.isInput ? 'true' : 'false'}
                                        onChange={onChangeFactory('isInput', param, val => val === 'true')}
                                >
                                    <option value={'false'}>No</option>
                                    <option value={'true'}>Yes</option>
                                </select>
                            </div>
                        }
                        {deleteAble &&
                            <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                                <Button style={{
                                    border: BORDER,
                                    borderRadius: 0,
                                    borderTop: isFirstIndex ? BORDER : 'unset',
                                    borderTopRightRadius: isFirstIndex ? 20 : 'unset',
                                    borderBottomRightRadius: isLastIndex ? 20 : 'unset',
                                    flexGrow: 1,
                                    padding: '5px 10px',
                                    width: '100%',
                                    fontSize: 21,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }} onClick={() => {
                                    const newFetcher = {...fetcherSignal.get()};
                                    const newFetcherValue = newFetcher[type] as Array<FetcherParameter>;
                                    newFetcher[type] = [...newFetcherValue] as T[keyof T];
                                    const paramIndex = ((newFetcher[type] ?? []) as Array<FetcherParameter>).findIndex(p => p.id === param.id)
                                    const newArray = (newFetcher[type] ?? []) as Array<FetcherParameter>;
                                    newArray.splice(paramIndex, 1);
                                    newFetcher[type] = newArray as T[keyof T];
                                    fetcherSignal.set(newFetcher);
                                    isModified.set(true);
                                }}>
                                    <Icon.Delete/>
                                </Button>
                            </div>
                        }
                    </div>
                })}
            </>
        }}
    </notifiable.div>
}

function naiveJsonToTs(param: unknown, level: number): string {
    const identation = Array.from({length: level + 1}).join('\t');
    if (Array.isArray(param)) {
        const types: string[] = [];
        for (const paramElement of param) {
            const type = naiveJsonToTs(paramElement, level + 1);
            if (!types.includes(type)) {
                types.push(type);
            }
        }
        if (types.length > 1) {
            return `z.array(z.union([${types.join(',')}]))`
        } else if (types.length > 0) {
            return `z.array(${types[0]})`
        } else {
            return `z.array(z.unknown())`
        }

    } else if (typeof param === 'string') {
        return 'z.string()'
    } else if (typeof param === 'number') {
        return 'z.number()'
    } else if (typeof param === 'boolean') {
        return 'z.boolean()'
    } else if (isRecord(param)) {
        const result = [];
        for (const [key, value] of Object.entries(param)) {
            result.push(`${key}:${naiveJsonToTs(value, level + 1)}`);
        }
        return `z.object({\n${identation}${result.join(`,\n${identation}`)}\n})`
    } else {
        return 'z.unknown()'
    }
}

function isRecord(obj: unknown): obj is Record<string, unknown> {
    return obj !== null &&
        typeof obj === 'object' &&
        !Array.isArray(obj);
}