import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useRef} from "react";
import {Callable, Variable} from "../../AppDesigner.tsx";
import {notifiable, useSignal} from "react-hook-signal";
import {useRemoveDashboardPanel} from "../../../../core/style/useRemoveDashboardPanel.ts";
import {guid} from "../../../../core/utils/guid.ts";
import {isEmpty} from "../../../../core/utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {BORDER} from "../../../../core/style/Border.ts";
import CollapsibleLabelContainer from "../../../../core/components/CollapsibleLabelContainer.tsx";
import {initiateSchemaTS} from "../../editor/initiateSchemaTS.ts";
import {zodSchemaToJson} from "../../../../core/utils/zodSchemaToJson.ts";
import {Button} from "../../../button/Button.tsx";
import {wrapWithZObjectIfNeeded} from "../../../../core/utils/wrapWithZObjectIfNeeded.ts";
import {useUpdateCallable} from "../../../../core/hooks/useUpdateCallable.ts";
import {useNameRefactor} from "../../../../core/hooks/useNameRefactor.ts";
import {useShowErrorsDialogBox} from "../../../../core/hooks/useShowErrorsDialogBox.tsx";

export default function CallableEditorPanel(props: {
    callableId?: string,
    panelId: string,
    scope: 'page' | 'application'
}) {
    const context = useAppContext();
    const {callableId, panelId, scope} = props;
    const callable = [...context.allPageCallablesSignal.get(), ...context.allApplicationCallablesSignal.get()].find(v => v.id === callableId);
    const updateCallable = useUpdateCallable(scope);
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

    const isModified = useSignal<boolean>(false)
    const removePanel = useRemoveDashboardPanel();
    const {showErrors} = useShowErrorsDialogBox();
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
                <notifiable.input name={'callableName'} autoComplete={guid()}
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
                        const formula = callable.functionCode;

                        const returnTypeSchema = `z.function().args(${wrapWithZObjectIfNeeded(callable.inputSchemaCode)}).returns(${wrapWithZObjectIfNeeded(callable.schemaCode)})`
                        const returnType = zodSchemaToJson(returnTypeSchema);

                        const allApplicationQueries = allApplicationQueriesSignal.get();
                        const allApplicationVariables = allApplicationVariablesSignal.get();
                        const allApplicationFetchers = allApplicationFetchersSignal.get();
                        const allApplicationCallables = allApplicationCallablesSignal.get();

                        const allPageQueries = allPageQueriesSignal.get();
                        const allPageVariables = allPageVariablesSignal.get();
                        const allPageFetchers = allPageFetchersSignal.get();
                        const allPageCallables = allPageCallablesSignal.get();

                        return <Editor
                            language="javascript"
                            key={returnTypeSchema}
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
                            updateCallable(callableSignal.get());

                            const currentName = callable?.name ?? '';
                            const newName = callableSignal.get().name ?? '';
                            if (currentName !== newName && !isEmpty(currentName)) {
                                refactorName({
                                    currentName,
                                    newName,
                                    scope: scope === 'page' ? 'page' : 'app',
                                    type: 'call'
                                });
                            }
                            removePanel(panelId)
                        } else {
                            await showErrors(errors)
                        }
                    }} style={{
                        display: 'flex',
                        gap: 5,
                        alignItems: 'center'
                    }} icon={'IoIosSave'}>
                        {'Save'}
                    </Button>
                    <Button onClick={async () => {
                        callableSignal.set(callable ?? createNewCallable());
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
