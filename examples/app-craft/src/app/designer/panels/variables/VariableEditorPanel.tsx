import {useContext, useEffect, useRef, useState} from "react";
import {guid} from "../../../../core/utils/guid.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {isEmpty} from "../../../../core/utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {Button} from "../../../button/Button.tsx";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {BORDER} from "../../../../core/style/Border.ts";
import {Variable, VariableType} from "../../AppDesigner.tsx";
import {initiateSchemaTS} from "../../editor/initiateSchemaTS.ts";
import {zodSchemaToJson} from "../../../../core/utils/zodSchemaToJson.ts";
import CollapsibleLabelContainer from "../../../../core/components/CollapsibleLabelContainer.tsx";
import {useUpdateVariable} from "../../../../core/hooks/useUpdateVariable.ts";
import {useRemoveDashboardPanel} from "../../../../core/style/useRemoveDashboardPanel.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {wrapWithZObjectIfNeeded} from "../../../../core/utils/wrapWithZObjectIfNeeded.ts";
import {useNameRefactor} from "../../../../core/hooks/useNameRefactor.ts";
import {PanelIsFocusedContext} from "../../../Dashboard.tsx";
import {useShowErrorsDialogBox} from "../../../../core/hooks/useShowErrorsDialogBox.tsx";

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
    const isFocused = useContext(PanelIsFocusedContext);
    const isFocusedSignal = useSignal(isFocused);
    useEffect(() => {
        isFocusedSignal.set(isFocused);
    }, [isFocusedSignal,isFocused]);
    const {variableId, defaultType, panelId, scope} = props;

    const variable = [...context.allPageVariablesSignal.get(), ...context.allApplicationVariablesSignal.get()].find(v => v.id === variableId);
    const [type, setType] = useState<VariableType>(variable?.type ?? defaultType);
    const {showErrors} = useShowErrorsDialogBox();
    const updateVariable = useUpdateVariable(scope);
    const refactorVariableName = useNameRefactor();
    const {
        allPageVariablesSignal,
        allPagesSignal,
        allPageFetchersSignal,
        allPageQueriesSignal,
        allPageCallablesSignal,

        allTablesSignal,
        allApplicationCallablesSignal,
        allApplicationVariablesSignal,
        allApplicationFetchersSignal,
        allApplicationQueriesSignal,
    } = context;

    const allVariablesSignal = useComputed(() => {
        const allPageVariables = allPageVariablesSignal.get();
        const allApplicationVariables = allApplicationVariablesSignal.get();
        if (scope === "page") {
            return [...allPageVariables, ...allApplicationVariables];
        }
        return allApplicationVariables
    });

    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();

    function createNewVariable(): Variable {
        return {
            name: '',
            type: defaultType,
            id: guid(),
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
                <notifiable.input name={'signalName'} autoComplete={guid()}
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
                            if(!isFocusedSignal.get()) {
                                return false;
                            }
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
                }} tabIndex={0}>
                    {() => {
                        const variable = variableSignal.get();

                        const allPages = allPagesSignal.get();
                        const allTables = allTablesSignal.get();
                        const formula = variable.functionCode;

                        const allApplicationQueries = allApplicationQueriesSignal.get();
                        const allApplicationVariables = allApplicationVariablesSignal.get();
                        const allApplicationFetchers = allApplicationFetchersSignal.get();
                        const allApplicationCallables = allApplicationCallablesSignal.get();

                        const allPageQueries = allPageQueriesSignal.get();
                        const allPageVariables = allPageVariablesSignal.get();
                        const allPageFetchers = allPageFetchersSignal.get();
                        const allPageCallables = allPageCallablesSignal.get();
                        const returnType = variable.type !== 'effect' ? zodSchemaToJson(wrapWithZObjectIfNeeded(variable.schemaCode)) : '';
                        if(!isFocusedSignal.get()) {
                            return false;
                        }
                        return <Editor
                            language="javascript"
                            key={variable.schemaCode}
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
                            const currentName = variable?.name ?? '';
                            const newName = variableSignal.get().name ?? '';
                            if (currentName !== newName && !isEmpty(currentName)) {
                                refactorVariableName({
                                    currentName,
                                    newName,
                                    scope: scope !== 'page' ? 'app' : 'page',
                                    type: 'var'
                                })
                            }
                            removePanel(panelId)
                        } else {
                            await showErrors(errors);
                        }
                    }} style={{
                        display: 'flex',
                        gap: 5,
                        alignItems: 'center'
                    }} icon={'IoIosSave'}>
                        {'Save'}
                    </Button>
                    <Button onClick={async () => {
                        variableSignal.set(variable ?? createNewVariable());
                        isModified.set(false);
                    }} style={{
                        display: 'flex',
                        gap: 5,
                        alignItems: 'center'
                    }} icon={'IoIosExit'}>
                        {'Reset'}
                    </Button>
                </>
            }}


        </notifiable.div>
    </div>
}
