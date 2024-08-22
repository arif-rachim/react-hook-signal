import {useAppContext} from "../../../hooks/useAppContext.ts";
import {useRef} from "react";
import {Callable, Variable} from "../../../AppDesigner.tsx";
import {useShowModal} from "../../../../modal/useShowModal.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {useRemoveDashboardPanel} from "../../../dashboard/useRemoveDashboardPanel.ts";
import {guid} from "../../../../utils/guid.ts";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {BORDER} from "../../../Border.ts";
import CollapsibleLabelContainer from "../../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {onBeforeMountHandler} from "../../../onBeforeHandler.ts";
import {zodSchemaToJson} from "../../../zodSchemaToJson.ts";
import {Button} from "../../../button/Button.tsx";
import {ConfirmationDialog} from "../../../ConfirmationDialog.tsx";
import {Icon} from "../../../Icon.ts";
import {useUpdateApplication} from "../../../hooks/useUpdateApplication.ts";
import {wrapWithZObjectIfNeeded} from "../../../../utils/wrapWithZObjectIfNeeded.ts";

export default function CallableEditorPanel(props: { callableId?: string, panelId: string }) {
    const context = useAppContext();
    const {callableId, panelId} = props;
    const callable = context.allApplicationCallablesSignal.get().find(v => v.id === callableId);
    const showModal = useShowModal();
    const updateApplication = useUpdateApplication();
    const {allApplicationCallablesSignal, allPagesSignal, allTablesSignal} = context;
    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();

    function createNewCallable(): Callable {
        return {
            name: '',
            id: guid(),
            functionCode: '',
            schemaCode: 'z.any()',
            inputSchemaCode: 'z.any()'
        }
    }

    const callableSignal = useSignal(callable ?? createNewCallable());

    function validateForm(): [boolean, Partial<Record<keyof Variable, Array<string>>>] {
        function nameIsDuplicate(name: string, id: string) {
            return allApplicationCallablesSignal.get().filter(v => v.id !== id).find(v => v.name === name) !== undefined;
        }

        const errors: Partial<Record<keyof Variable, Array<string>>> = {};
        const callable = callableSignal.get();
        if (isEmpty(callable.name)) {
            errors.name = ['The "name" field cannot be empty; it must have a value.'];
        }
        if (isEmpty(callable.functionCode)) {
            errors.functionCode = ['The "code" field cannot be empty; it must have a value.'];
        }
        if (nameIsDuplicate(callable.name, callable.id)) {
            errors.name = [`The callable name "${callable.name}" is already in use. Please choose a different name.`];
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
                <notifiable.input name={'callableName'} autoComplete={'unset'}
                                  style={{border: BORDER, flexGrow: 1, padding: '5px 10px', borderRadius: 5}}
                                  value={() => {
                                      return callableSignal.get().name
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
                                      const newCallable = {...callableSignal.get()};
                                      newCallable.name = val;
                                      callableSignal.set(newCallable);
                                      isModified.set(true);
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}/>
            </LabelContainer>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, overflow: 'unset'}}>
            <CollapsibleLabelContainer label={'Schema'} style={{overflow: 'unset'}}
                                       styleContent={{padding: '5px 0px', overflow: 'unset'}}>
                <div style={{display: 'flex', flexDirection: 'row', height: 250}}>

                    <notifiable.div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '50%'
                    }}>
                        {() => {
                            const callable = callableSignal.get();
                            const formula = callable.inputSchemaCode;
                            return <>
                                <div style={{borderBottom: BORDER, padding: 5, fontStyle: 'italic'}}>Function Input
                                    Parameter
                                </div>
                                <Editor
                                    language="javascript"
                                    value={formula}
                                    options={{
                                        selectOnLineNumbers: false,
                                        lineNumbers: 'off',
                                    }}
                                    onChange={(value?: string) => {
                                        const newCallable = {...callableSignal.get()};
                                        newCallable.inputSchemaCode = value ?? '';
                                        callableSignal.set(newCallable);
                                        isModified.set(true);
                                    }}
                                />
                            </>
                        }}
                    </notifiable.div>
                    <notifiable.div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '50%'
                    }}>
                        {() => {
                            const callable = callableSignal.get();
                            const formula = callable.schemaCode;
                            return <>
                                <div style={{borderBottom: BORDER, padding: 5, fontStyle: 'italic'}}>Function Return
                                    Type
                                </div>
                                <Editor
                                    language="javascript"
                                    value={formula}
                                    options={{
                                        selectOnLineNumbers: false,
                                        lineNumbers: 'off',
                                    }}
                                    onChange={(value?: string) => {
                                        const newCallable = {...callableSignal.get()};
                                        newCallable.schemaCode = value ?? '';
                                        callableSignal.set(newCallable);
                                        isModified.set(true);
                                    }}
                                /></>
                        }}
                    </notifiable.div>

                </div>

            </CollapsibleLabelContainer>
            <CollapsibleLabelContainer label={'Code'} style={{flexGrow: 1, overflow: 'unset'}}
                                       styleContent={{padding: '5px 10px', overflow: 'unset'}}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}>
                    {() => {
                        const callable = callableSignal.get();
                        const allPages = allPagesSignal.get();
                        const allTables = allTablesSignal.get();
                        const allCallables = allApplicationCallablesSignal.get();
                        const formula = callable.functionCode;
                        const returnTypeSchema = `z.function().args(${wrapWithZObjectIfNeeded(callable.inputSchemaCode)}).returns(${wrapWithZObjectIfNeeded(callable.schemaCode)})`
                        return <Editor
                            language="javascript"
                            key={returnTypeSchema}
                            options={{fontFamily:'Fira code, Consolas, Courier New, monospace'}}
                            beforeMount={onBeforeMountHandler({
                                dependencies: [],
                                allVariables: [],
                                allFetchers: [],
                                returnType: zodSchemaToJson(returnTypeSchema),
                                allPages,
                                allTables,
                                allCallables
                            })}
                            value={formula}
                            onChange={(value?: string) => {
                                const newVariable = {...callableSignal.get()};
                                newVariable.functionCode = value ?? '';
                                callableSignal.set(newVariable);
                                isModified.set(true);
                            }}
                        />
                    }}
                </notifiable.div>
            </CollapsibleLabelContainer>

        </div>
        <notifiable.div
            style={{display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: BORDER, padding: 10, height: 50}}>
            {() => {
                const modified = isModified.get();
                if (!modified) {
                    return <></>
                }
                return <>
                    <Button onClick={async () => {
                        const [isValid, errors] = validateForm();
                        if (isValid) {
                            updateApplication(app => {
                                const callables = [...app.callables];
                                const currentCallableIndex = callables.findIndex(c => c.id === callableId);
                                callables.splice(currentCallableIndex, 1, callableSignal.get())
                                app.callables = callables;
                            });
                            removePanel(panelId)
                        } else {
                            await showModal<string>(cp => {
                                const message = (Object.keys(errors) as Array<keyof Variable>).map(k => {
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
                    <Button onClick={async () => {
                        callableSignal.set(callable ?? createNewCallable());
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
                </>
            }}


        </notifiable.div>
    </div>
}
