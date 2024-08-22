import {useRef, useState} from "react";
import {useShowModal} from "../../../../modal/useShowModal.ts";
import {guid} from "../../../../utils/guid.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {Button} from "../../../button/Button.tsx";
import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {BORDER} from "../../../Border.ts";
import {Variable, VariableType} from "../../../AppDesigner.tsx";
import {ConfirmationDialog} from "../../../ConfirmationDialog.tsx";
import {onBeforeMountHandler} from "../../../onBeforeHandler.ts";
import {zodSchemaToJson} from "../../../zodSchemaToJson.ts";
import {Icon} from "../../../Icon.ts";
import {DependencyInputSelector} from "../../../dependency-selector/DependencyInputSelector.tsx";
import CollapsibleLabelContainer from "../../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {useUpdateVariable} from "../../../hooks/useUpdateVariable.ts";
import {useRemoveDashboardPanel} from "../../../dashboard/useRemoveDashboardPanel.ts";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {wrapWithZObjectIfNeeded} from "../../../../utils/wrapWithZObjectIfNeeded.ts";
import {Signal} from "signal-polyfill";

const empty = new Signal.Computed(() => []);

/**
 * Represents a panel for editing variables.
 */
export function VariableEditorPanel(props: {
    variableId?: string,
    defaultType: VariableType,
    panelId: string,
    scope: 'page' | 'application'
}) {
    const context = useAppContext();
    const {variableId, defaultType, panelId, scope} = props;
    const variable = [...context.allVariablesSignal.get(), ...context.allApplicationVariablesSignal.get()].find(v => v.id === variableId);
    const [type, setType] = useState<VariableType>(variable?.type ?? defaultType);
    const showModal = useShowModal();
    const updateVariable = useUpdateVariable(scope);
    const {
        allVariablesSignal: allPageVariablesSignal,
        allPagesSignal,
        allFetchersSignal: allPageFetchersSignal,
        allTablesSignal,
        allCallablesSignal,
        allApplicationVariablesSignal
    } = context;

    const allVariablesSignal = useComputed(() => {
        const allPageVariables = allPageVariablesSignal.get();
        const allApplicationVariables = allApplicationVariablesSignal.get();
        if(scope === "page"){
            return [...allPageVariables,...allApplicationVariables];
        }
        return allApplicationVariables
    });

    const allFetchersSignal = scope === 'page' ? allPageFetchersSignal : empty;

    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();

    function createNewVariable(): Variable {
        return {
            name: '',
            type: defaultType,
            id: guid(),
            dependencies: [],
            functionCode: '',
            schemaCode: 'z.any()'
        }
    }

    const variableSignal = useSignal(variable ?? createNewVariable());
    useSignalEffect(() => {
        const type = variableSignal.get().type;
        setType(type);
    })

    function validateForm(): [boolean, Partial<Record<keyof Variable, Array<string>>>] {
        function nameIsDuplicate(name: string, id: string) {
            return allVariablesSignal.get().filter(v => v.id !== id).find(v => v.name === name) !== undefined;
        }

        const errors: Partial<Record<keyof Variable, Array<string>>> = {};
        const variable = variableSignal.get();
        if (isEmpty(variable.name)) {
            errors.name = ['The "name" field cannot be empty; it must have a value.'];
        }
        if (isEmpty(variable.functionCode)) {
            errors.functionCode = ['The "code" field cannot be empty; it must have a value.'];
        }
        if (nameIsDuplicate(variable.name, variable.id)) {
            errors.name = [`The variable name "${variable.name}" is already in use. Please choose a different name.`];
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
                <notifiable.input name={'signalName'} autoComplete={'unset'}
                                  style={{border: BORDER, flexGrow: 1, padding: '5px 10px', borderRadius: 5}}
                                  value={() => {
                                      return variableSignal.get().name
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
                                      const newVariable = {...variableSignal.get()};
                                      newVariable.name = val;
                                      variableSignal.set(newVariable);
                                      isModified.set(true);
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}/>
            </LabelContainer>
            {type !== 'state' &&
                <LabelContainer label={'Dependency :'} style={{
                    flexGrow: 1,
                    flexBasis: '50%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10
                }}
                                styleLabel={{fontStyle: 'italic'}}
                                styleContent={{display: 'flex', flexDirection: 'column'}}>
                    <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                        {() => {
                            const variable = variableSignal.get();
                            return <DependencyInputSelector onChange={(result) => {
                                variableSignal.set({...variable, dependencies: result});
                                isModified.set(true);
                            }} value={variable.dependencies ?? []} valueToIgnore={[variable.id]}
                                                            scope={scope}/>;
                        }}
                    </notifiable.div>
                </LabelContainer>
            }
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, overflow: 'unset'}}>
            {type !== 'effect' &&
                <CollapsibleLabelContainer label={'Schema'} style={{overflow: 'unset'}}
                                           styleContent={{padding: '5px 10px', overflow: 'unset'}}>
                    <notifiable.div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: 250,
                    }}>
                        {() => {
                            const variable = variableSignal.get();
                            const formula = variable.schemaCode;
                            return <Editor
                                language="javascript"
                                value={formula}
                                options={{
                                    selectOnLineNumbers: false,
                                    lineNumbers: 'off',
                                }}

                                onChange={(value?: string) => {
                                    const newVariable = {...variableSignal.get()};
                                    newVariable.schemaCode = value ?? '';
                                    variableSignal.set(newVariable);
                                    isModified.set(true);
                                }}
                            />
                        }}
                    </notifiable.div>
                </CollapsibleLabelContainer>
            }
            <CollapsibleLabelContainer label={'Code'} style={{flexGrow: 1, overflow: 'unset'}}
                                       styleContent={{padding: '5px 10px', overflow: 'unset'}}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                }}>
                    {() => {
                        const variable = variableSignal.get();
                        const dependencies = variable.dependencies ?? []
                        const allVariables = allVariablesSignal.get();
                        const allFetchers = allFetchersSignal.get();
                        const allPages = allPagesSignal.get();
                        const allTables = allTablesSignal.get();
                        const allCallables = allCallablesSignal.get();
                        const formula = variable.functionCode;
                        return <Editor
                            language="javascript"
                            key={variable.schemaCode + dependencies.join('-')}
                            options={{fontFamily:'Fira code, Consolas, Courier New, monospace'}}
                            beforeMount={onBeforeMountHandler({
                                dependencies,
                                allVariables,
                                allFetchers,
                                returnType: zodSchemaToJson(wrapWithZObjectIfNeeded(variable.schemaCode)),
                                allPages,
                                allTables,
                                allCallables
                            })}
                            value={formula}
                            onChange={(value?: string) => {
                                const newVariable = {...variableSignal.get()};
                                newVariable.functionCode = value ?? '';
                                variableSignal.set(newVariable);
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
                            updateVariable(variableSignal.get());
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
                        variableSignal.set(variable ?? createNewVariable());
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
