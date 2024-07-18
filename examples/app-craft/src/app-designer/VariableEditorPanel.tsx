import {useContext, useRef, useState} from "react";
import {useShowModal} from "../modal/useShowModal.ts";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {guid} from "../utils/guid.ts";
import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {isEmpty} from "../utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {Button} from "./Button.tsx";
import {LabelContainer} from "./LabelContainer.tsx";
import {BORDER} from "./Border.ts";
import {Variable} from "./AppDesigner.tsx";
import {DependencySelector} from "./DependencySelector.tsx";
import {ConfirmationDialog} from "./ConfirmationDialog.tsx";
import {onBeforeMountHandler} from "./onBeforeHandler.ts";

/**
 * Represents a panel for editing variables.
 */
export function VariableEditorPanel(props: { variable?: Variable, closePanel: (result?: Variable) => void }) {
    const {variable, closePanel} = props;
    const [type, setType] = useState<'state' | 'computed' | 'effect'>(variable?.type ?? 'state');
    const showModal = useShowModal();
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;

    function createNewVariable(): Variable {
        return {
            name: '',
            type: 'state',
            id: guid(),
            dependency: [],
            functionCode: ''
        }
    }

    const variableSignal = useSignal(variable ?? createNewVariable());
    useSignalEffect(() => {
        const type = variableSignal.get().type;
        setType(type);
    })

    async function showDependencySelector() {
        const result = await showModal<Array<string> | 'cancel'>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <DependencySelector
                    closePanel={closePanel}
                    value={variableSignal.get().dependency ?? []}
                    signalsToFilterOut={[variableSignal.get().id]}
                />
            </AppDesignerContext.Provider>
        });
        if (result !== 'cancel') {
            const newVariable = {...variableSignal.get()};
            newVariable.dependency = result;
            variableSignal.set(newVariable)
        }

    }

    function validateForm(): [boolean, Partial<Record<keyof Variable, Array<string>>>] {
        const errors: Partial<Record<keyof Variable, Array<string>>> = {};
        const variable = variableSignal.get();
        if (isEmpty(variable.name)) {
            errors.name = ['Name must have value'];
        }
        if (isEmpty(variable.functionCode)) {
            errors.functionCode = ['Code cannot be empty'];
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
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        width: 800,
        height: 600,
        gap: 10,
        overflow: 'auto'
    }}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Button style={{
                backgroundColor: type === 'state' ? '#000' : '#CCC',
                color: type === 'state' ? 'white' : 'black',
                padding: 3,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
            }} onClick={() => {
                variableSignal.set({...variableSignal.get(), type: 'state'})
            }}>State
            </Button>
            <Button style={{
                borderLeft: 'none',
                borderRight: 'none',
                backgroundColor: type === 'computed' ? '#000' : '#CCC',
                color: type === 'computed' ? 'white' : 'black',
                padding: 3,
                borderRadius: 0,
            }}
                    onClick={() => {
                        variableSignal.set({...variableSignal.get(), type: 'computed'})
                    }}
            >Computed
            </Button>
            <Button style={{
                backgroundColor: type === 'effect' ? '#000' : '#CCC',
                color: type === 'effect' ? 'white' : 'black',
                padding: 3,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
            }} onClick={() => {
                variableSignal.set({...variableSignal.get(), type: 'effect'})
            }}>Effect
            </Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto', gap: 5}}>
            <LabelContainer label={'Name'} style={{flexDirection: 'row', gap: 10}} styleLabel={{width: 80}}>
                <notifiable.input name={'signalName'} autoComplete={'unset'}
                                  style={{border: BORDER, flexGrow: 1, padding: '3px 5px'}} value={() => {
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
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}/>
            </LabelContainer>
            {type !== 'state' &&
                <LabelContainer label={'Dependency'} style={{flexDirection: 'row', gap: 10}} styleLabel={{width: 80}}>
                    <notifiable.div
                        style={{border: BORDER, display: 'flex', gap: 5, padding: 5, flexGrow: 1, minHeight: 22}}
                        onClick={showDependencySelector}>{() => {
                        const dependencies = variableSignal.get().dependency ?? []
                        const allVariables = allVariablesSignal.get();
                        return dependencies.map(dep => {
                            const variable = allVariables.find(i => i.id === dep);
                            return <div key={dep} style={{border: BORDER, borderRadius: 3, padding: '3px 5px'}}>
                                {variable?.name}
                            </div>
                        })
                    }}</notifiable.div>
                </LabelContainer>
            }
            <LabelContainer label={'Code'} style={{flexGrow: 1}} styleContent={{flexDirection: 'column'}}>

                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'auto',
                    backgroundColor: 'blue'
                }}>
                    {() => {
                        const variable = variableSignal.get();
                        const dependencies = variable.dependency ?? []
                        const allVariables = allVariablesSignal.get();
                        const formula = variable.functionCode;
                        return <Editor
                            language="javascript"
                            onMount={(_, monaco: Monaco) => monacoRef.current = monaco}
                            key={dependencies.join('-')}
                            beforeMount={onBeforeMountHandler({dependencies, allVariables})}
                            value={formula}
                            options={{selectOnLineNumbers: true}}
                            onChange={(value?: string) => {
                                const newVariable = {...variableSignal.get()};
                                newVariable.functionCode = value ?? '';
                                variableSignal.set(newVariable);
                            }}
                        />
                    }}
                </notifiable.div>
            </LabelContainer>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10}}>
            <Button onClick={async () => {
                const [isValid, errors] = validateForm();
                if (isValid) {
                    closePanel(variableSignal.get());
                } else {
                    await showModal<string>(cp => {
                        const message = (Object.keys(errors) as Array<keyof Variable>).map(k => {
                            return errors[k]?.map(val => {
                                return <div key={val}>{(val ?? '') as string}</div>
                            })
                        }).flat();
                        return <ConfirmationDialog message={message} closePanel={cp} buttons={['Ok']}/>
                    })
                }
            }} style={{border: BORDER}}>Save
            </Button>
            <Button onClick={() => {
                closePanel();
            }} style={{border: BORDER}}>Cancel
            </Button>
        </div>
    </div>
}