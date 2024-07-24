import {useContext, useRef, useState} from "react";
import {useShowModal} from "../../modal/useShowModal.ts";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {guid} from "../../utils/guid.ts";
import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {Button} from "../button/Button.tsx";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {BORDER} from "../Border.ts";
import {Variable, VariableType} from "../AppDesigner.tsx";
import {ConfirmationDialog} from "../ConfirmationDialog.tsx";
import {onBeforeMountHandler} from "../onBeforeHandler.ts";
import {zodSchemaToJson} from "../zodSchemaToJson.ts";
import ButtonGroup from "../button/ButtonGroup.tsx";
import {Icon} from "../Icon.ts";
import {DependencyInputSelector} from "../dependency-selector/DependencyInputSelector.tsx";

/**
 * Represents a panel for editing variables.
 */
export function VariableEditorPanel(props: {
    variable?: Variable,
    closePanel: (result?: Variable) => void,
    defaultType: VariableType
}) {
    const {variable, closePanel, defaultType} = props;
    const [type, setType] = useState<VariableType>(variable?.type ?? defaultType);
    const showModal = useShowModal();
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;

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
        width: '90vw',
        height: '90vh',
        overflow: 'auto',
        gap: 10,
    }}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <ButtonGroup buttons={{
                State: {
                    onClick: () => variableSignal.set({...variableSignal.get(), type: 'state'})
                },
                Computed: {
                    onClick: () => variableSignal.set({...variableSignal.get(), type: 'computed'})
                },
                Effect: {
                    onClick: () => variableSignal.set({...variableSignal.get(), type: 'effect'})
                }
            }} defaultButton={type === 'state' ? 'State' : type === 'computed' ? 'Computed' : 'Effect'}/>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, flexShrink: 1, gap: 5, overflow: 'auto'}}>
            <div style={{display: 'flex', gap: 10}}>
                <LabelContainer label={'Name'} style={{width: 250}} styleLabel={{width: 80}}>
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
                                          setTimeout(() => {
                                              dom.setSelectionRange(cursorPosition, cursorPosition);
                                          }, 0);
                                      }}/>
                </LabelContainer>
                {type !== 'state' &&
                    <LabelContainer label={'Dependency'}>
                        <notifiable.div>
                            {() => {
                                const variable = variableSignal.get();
                                return <DependencyInputSelector onChange={(result) => {
                                    variableSignal.set({...variable, dependencies: result});
                                }} value={variable.dependencies ?? []} valueToIgnore={[variable.id]}/>;
                            }}
                        </notifiable.div>
                    </LabelContainer>
                }

            </div>


            {type !== 'effect' &&
                <LabelContainer label={'Schema'} style={{height: 100, flexShrink: 0}}
                                styleContent={{flexDirection: 'column'}}>
                    <notifiable.div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        backgroundColor: 'blue'
                    }}>
                        {() => {
                            const variable = variableSignal.get();
                            const formula = variable.schemaCode;
                            return <Editor
                                language="javascript"
                                value={formula}
                                onChange={(value?: string) => {
                                    const newVariable = {...variableSignal.get()};
                                    newVariable.schemaCode = value ?? '';
                                    variableSignal.set(newVariable);
                                }}
                            />
                        }}
                    </notifiable.div>
                </LabelContainer>
            }
            <LabelContainer label={'Code'} style={{flexGrow: 1, flexShrink: 1}}
                            styleContent={{flexDirection: 'column', overflow: 'auto', flexShrink: 1}}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    backgroundColor: 'blue'
                }}>
                    {() => {
                        const variable = variableSignal.get();
                        const dependencies = variable.dependencies ?? []
                        const allVariables = allVariablesSignal.get();
                        const formula = variable.functionCode;
                        return <Editor
                            language="javascript"
                            key={variable.schemaCode + dependencies.join('-')}
                            beforeMount={onBeforeMountHandler({
                                dependencies,
                                allVariables,
                                returnType: zodSchemaToJson(variable.schemaCode)
                            })}
                            value={formula}
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
            <Button style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }} onClick={() => {
                closePanel();
            }}>
                {'Cancel'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Exit style={{fontSize: 18}}/>
                </div>
            </Button>
        </div>
    </div>
}
