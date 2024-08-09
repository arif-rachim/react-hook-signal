import {Button} from "../../../button/Button.tsx";
import {useRemoveDashboardPanel} from "../../../dashboard/useRemoveDashboardPanel.ts";
import {BORDER} from "../../../Border.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {Fetcher, FetcherParameter} from "../../../AppDesigner.tsx";
import {useShowModal} from "../../../../modal/useShowModal.ts";
import {guid} from "../../../../utils/guid.ts";
import {Icon} from "../../../Icon.ts";
import {Signal} from "signal-polyfill";
import CollapsibleLabelContainer from "../../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {ConfirmationDialog} from "../../../ConfirmationDialog.tsx";
import {useUpdateFetcher} from "../../../hooks/useUpdateFetcher.ts";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {format_hhmmss} from "../../../../utils/dateFormat.ts";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "../../../onBeforeHandler.ts";
import untrack = Signal.subtle.untrack;

const LABEL_WIDTH = 60;

export function FetcherEditorPanel(props: { fetcherId?: string, panelId: string }) {
    const {allFetchersSignal} = useAppContext();

    const {fetcherId, panelId} = props;
    const fetcher = allFetchersSignal.get().find(v => v.id === fetcherId);
    const showModal = useShowModal();
    const updateFetcher = useUpdateFetcher();
    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();
    const testMessages = useSignal<Array<{ id: string, date: Date, message: string }>>([]);
    const responseData = useSignal<string>('');
    const responseSchema = useSignal<string>('');

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
            returnTypeSchemaCode: ''
        }
    }

    const fetcherSignal = useSignal(fetcher ?? createNewFetcher());

    function addParam(type: 'headers' | 'paths' | 'data') {
        const newFetcher = {...fetcherSignal.get()};

        newFetcher[type] = [...newFetcher[type], {
            id: guid(),
            required: false,
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
            return allFetchersSignal.get().filter(v => v.id !== id).find(v => v.name === name) !== undefined;
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
                    required: true,
                    value: ''
                })
            }
        }
        newSignal.paths = newPaths;
        if (hasChanged) {
            setTimeout(() => fetcherSignal.set(newSignal), 0)
        }
    })
    const isPost = useComputed(() => fetcherSignal.get().method === 'post')

    async function testFetcher() {
        const fetcher = fetcherSignal.get();
        const url = `${fetcher.protocol}://${fetcher.domain}`;

        function populateTemplate(template: string, parameters: Record<string, string>) {
            return template.replace(/{(.*?)}/g, (match, p1) => {
                // remove any extra whitespace from the parameter name
                const paramName = p1.trim();
                // return the parameter value or the original placeholder
                return parameters[paramName] !== undefined ? parameters[paramName] : match
            })
        }

        function toRecord(encodeString: boolean) {
            return (result: Record<string, string>, parameter: FetcherParameter) => {
                if (encodeString) {
                    result[encodeURIComponent(parameter.name)] = encodeURIComponent(parameter.value)
                } else {
                    result[parameter.name] = parameter.value
                }
                return result;
            }
        }

        const path = populateTemplate(fetcher.path, fetcher.paths.reduce(toRecord(true), {}));

        function trimSlashes(str: string) {
            return str.replace(/^\/+|\/+$/g, '')
        }

        const address = `${url}/${trimSlashes(path.trim())}`
        const requestInit: RequestInit = {
            method: fetcher.method,
            headers: fetcher.headers.reduce(toRecord(true), {
                'Content-Type': fetcher.contentType
            }),
        }

        function objectToUrlEncodedString(obj: Record<string, string>) {
            return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&')
        }

        if (fetcher.method === 'post') {
            if (fetcher.contentType === 'application/x-www-form-urlencoded') {
                requestInit.body = objectToUrlEncodedString(fetcher.data.reduce(toRecord(true), {}))
            }
            if (fetcher.contentType === 'application/json') {
                requestInit.body = JSON.stringify(fetcher.data.reduce(toRecord(false), {}))
            }
        }
        logTestMessage(`[Request] ${address}`);
        logTestMessage(`[Request] ${JSON.stringify(requestInit)}`);
        let contentType:string = '';
        let response:Response|null = null;
        try{
            response = await fetch(address, requestInit);
            contentType = response.headers.get('Content-Type') ?? '';
        }catch(err){
            if(err !== undefined && err !== null && typeof err === 'object' && 'message' in err){
                logTestMessage(`[Response] ${err.message}`)
            }
        }
        if(response === null){
            return;
        }
        logTestMessage(`[Response] ${response.statusText} ${contentType}`);
        if (contentType && contentType.includes('application/json')) {
            // its json we can do something here
            const json = await response.json();
            responseData.set(JSON.stringify(json));
            const ts = naiveJsonToTs(json,1);
            logTestMessage(`[Response] ${ts}`);
            responseSchema.set(ts);
        } else {
            const text = await response.text();
            logTestMessage(`[Response] ${text}`);
        }
    }

    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1,
    }}>
        <CollapsibleLabelContainer label={'Info'}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 20px'}}>
                <LabelContainer label={'Name : '} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}
                                styleLabel={{fontStyle: 'italic', width: LABEL_WIDTH}}>
                    <notifiable.input name={'fetcherName'} autoComplete={'unset'}
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
                        <notifiable.input name={'domain'} autoComplete={'unset'}
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
                    <notifiable.input name={'path'} autoComplete={'unset'}
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
                                  nameReadOnly={true}/>

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
                        </notifiable.select>
                    </LabelContainer>
                    <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                        {() => {
                            if (!isPost.get()) {
                                return <></>
                            }
                            return <LabelContainer label={'Content Type : '}
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
                                        value={'application/x-www-form-urlencoded'}>application/x-www-form-urlencoded
                                    </option>
                                    <option value={'application/json'}>application/json</option>
                                </notifiable.select>
                            </LabelContainer>
                        }}
                    </notifiable.div>
                </div>
            </div>
        </CollapsibleLabelContainer>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                if (!isPost.get()) {
                    return <></>
                }
                return <CollapsibleLabelContainer label={'Post Data Param'}>
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                        <Button style={{display: 'flex', alignItems: 'center'}} onClick={() => addParam('data')}>
                            <div style={{paddingBottom: 2}}>Add Post Param</div>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Icon.Add style={{fontSize: 20}}/>
                            </div>
                        </Button>
                    </div>
                    <RenderParameters fetcherSignal={fetcherSignal} isModified={isModified} type={'data'}/>
                </CollapsibleLabelContainer>
            }}
        </notifiable.div>
        <CollapsibleLabelContainer label={'Headers'} defaultOpen={false}>
            <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                <Button style={{display: 'flex', alignItems: 'center'}} onClick={() => addParam('headers')}>
                    <div style={{paddingBottom: 2}}>Add Header</div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon.Add style={{fontSize: 20}}/>
                    </div>
                </Button>
            </div>
            <RenderParameters fetcherSignal={fetcherSignal} isModified={isModified} type={'headers'}/>
        </CollapsibleLabelContainer>
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
        <CollapsibleLabelContainer label={'Test Result Schema'} autoGrowWhenOpen={true}>
            <notifiable.div style={{minHeight: 100, flexGrow: 1}}>
                {() => {
                    return <Editor
                        language="javascript"
                        value={`${responseSchema.get()}`}
                        beforeMount={onBeforeMountHandler({
                            dependencies:[],
                            allVariables:[],
                            returnType: 'any',
                            allPages:[]
                        })}
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
            }} style={{display: 'flex', alignItems: 'center', gap: 5}}>
                <div>Test</div>
                <div style={{fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Fetcher/></div>
            </Button>
            <Button onClick={async () => {
                const [isValid, errors] = validateForm();
                if (isValid) {
                    updateFetcher(fetcherSignal.get());
                    removePanel(panelId)
                } else {
                    await showModal<string>(cp => {
                        const message = (Object.keys(errors) as Array<keyof Fetcher>).map(k => {
                            return errors[k]?.map(val => {
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
            }} style={{display: 'flex', alignItems: 'center', gap: 5}}>
                <div>Save</div>
                <div style={{fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Save/></div>
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

function RenderParameters(props: {
    nameReadOnly?: boolean,
    fetcherSignal: Signal.State<Fetcher>,
    isModified: Signal.State<boolean>,
    type: 'headers' | 'paths' | 'data'
}) {
    const {fetcherSignal, isModified, type, nameReadOnly} = props;
    return <>
        <notifiable.div style={{display: 'table'}}>
            {() => {
                const parameters = fetcherSignal.get()[type];
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
                    </div>
                    {parameters.map(param => {
                        return <div key={param.id} style={{display: 'table-row'}}>
                            <div style={{display: 'table-cell'}}>
                                <input name={'paramName'} autoComplete={'unset'}
                                       readOnly={nameReadOnly}
                                       style={{
                                           border: BORDER,
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
                                       onChange={(event) => {
                                           const dom = event.target;
                                           const cursorPosition = dom.selectionStart;
                                           const val = dom.value;
                                           const newFetcher = {...fetcherSignal.get()};
                                           newFetcher[type] = [...newFetcher[type]];
                                           const paramIndex = newFetcher[type].findIndex(p => p.id === param.id)
                                           newFetcher[type].splice(paramIndex, 1, {...param, name: val})
                                           fetcherSignal.set(newFetcher);
                                           isModified.set(true);
                                           setTimeout(() => {
                                               dom.setSelectionRange(cursorPosition, cursorPosition);
                                           }, 0);
                                       }}
                                />
                            </div>
                            <div style={{display: 'table-cell'}}>
                                <input name={'valueName'} autoComplete={'unset'}
                                       style={{
                                           border: BORDER,
                                           flexGrow: 1,
                                           padding: '5px 10px',
                                           width: '100%',
                                       }}
                                       value={param.value}
                                       onChange={(event) => {
                                           const dom = event.target;
                                           const cursorPosition = dom.selectionStart;
                                           const val = dom.value;
                                           const newFetcher = {...fetcherSignal.get()};
                                           newFetcher[type] = [...newFetcher[type]];
                                           const paramIndex = newFetcher[type].findIndex(p => p.id === param.id)
                                           newFetcher[type].splice(paramIndex, 1, {...param, value: val})
                                           fetcherSignal.set(newFetcher);
                                           isModified.set(true);
                                           setTimeout(() => {
                                               dom.setSelectionRange(cursorPosition, cursorPosition);
                                           }, 0);
                                       }}
                                />
                            </div>
                        </div>
                    })}
                </>
            }}
        </notifiable.div>
    </>
}

function naiveJsonToTs(param: unknown,level:number): string {
    const identation = Array.from({length:level+1}).join('\t');
    if (Array.isArray(param)) {
        const types: string[] = [];
        for (const paramElement of param) {
            const type = naiveJsonToTs(paramElement,level+1);
            if (!types.includes(type)) {
                types.push(type);
            }
        }
        if (types.length > 1) {
            return `z.array(z.union([${types.join(',')}]))`
        }else if(types.length > 0) {
            return `z.array(${types[0]})`
        }else{
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
            result.push(`${key}:${naiveJsonToTs(value,level+1)}`);
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