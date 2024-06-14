import {AnySignalType, SignalComputed, SignalEffect, SignalState} from "../Component.ts";
import {notifiable, Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel, HorizontalLabelContext} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER, BORDER_NONE} from "../Border.ts";
import {Checkbox} from "../../elements/Checkbox.tsx";
import {convertToVarName} from "../../utils/convertToVarName.ts";
import {convertToSetterName} from "../../utils/convertToSetterName.ts";
import {Editor} from "@monaco-editor/react";
import {capFirstLetter} from "../../utils/capFirstLetter.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import RefactorDetailDialogPanel from "./RefactorDetailDialogPanel.tsx";
import {Signal} from "signal-polyfill";

const start = "   //Below this line, start your code.";
const end = "   //Above this line, end your code.";

export function buildFunctionCode<T extends AnySignalType>(signal: T | (T & SignalEffect) | (T & SignalComputed), signals: AnySignalType[], additionalParams: string[]) {
    let dependencySignals: string[] = [];
    if (isEffectOrComputed(signal)) {
        const result = signal.signalDependencies.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if (signalType === undefined) {
                return '';
            }
            return signalType.name
        });
        dependencySignals = [...dependencySignals, ...result];
    }
    if (isEffect(signal)) {
        const result = signal.mutableSignals.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if (signalType === undefined) {
                return '';
            }
            return convertToSetterName(signalType.name)
        });
        dependencySignals = [...dependencySignals, ...result];
    }
    dependencySignals = [...dependencySignals, ...additionalParams];
    const varName = signal.name;
    let functionName = '';
    if (isState(signal)) {
        functionName = `function init${capFirstLetter(signal.name)}(${[...dependencySignals].filter(i => i).join(', ')}){`;
    }
    functionName = `function ${varName}(${[...dependencySignals].filter(i => i).join(', ')}){`
    return [functionName,start,signal.formula,end,'}'].join('\n')

}

export function SignalDetailDialogPanel<T extends AnySignalType>(props: {closePanel: (param?: T) => void, value: T,signalsSignal:Signal.State<AnySignalType[]>,requiredField:Array<keyof T>,additionalParams:string[] }) {
    const {closePanel,signalsSignal,requiredField,additionalParams} = props;
    const showModal = useShowModal();
    const valueSignal = useSignal<T>(props.value);
    const errorsSignal = useSignal<{[K in keyof T]? : string}>({});
    const hasErrorSignal = useComputed(() => {
        const errors = errorsSignal.get();
        for (const key of Object.keys(errors)) {
            let value:string|undefined = '';
            const key_ = key as keyof T;
            if(errors !== undefined && errors !== null && typeof errors === 'object' && key in errors){
                value = errors[key_];
            }

            if (!isEmpty(value)) {
                return true;
            }
        }
        return false;
    });

    function validate() {
        const errors = {...errorsSignal.get()};
        const record = valueSignal.get();

        for (const key of requiredField) {
            const value = record[key];
            if (isEmpty(value)) {
                errors[key] = key.toString() + ' is required';
            }
        }
        errorsSignal.set(errors);
    }

    function update(callback: (param: T, errors: Record<string, string>) => void) {
        const item = {...valueSignal.get()};
        const errors = {...errorsSignal.get()} as Record<string, string>;
        callback(item, errors);
        valueSignal.set(item);
        errorsSignal.set(errors);
    }

    async function onSave() {
        validate();
        if (hasErrorSignal.get()) {
            return;
        }
        const signal = valueSignal.get();
        const signals = signalsSignal.get();
        if(isState(signal) || isComputed(signal)){
            const nameIsChanged = props.value.name !== signal.name;
            const nameWasNotEmpty = !isEmpty(props.value.name);
            const referencingSignals = signals.filter(s => {
                if(isEffectOrComputed(s)){
                    return s.signalDependencies.includes(signal.id)
                }
                return false;
            });
            const hasReferencingSignals = referencingSignals.length > 0;
            if(nameIsChanged && nameWasNotEmpty && hasReferencingSignals){
                await showModal<{success:boolean}>(closePanel => {
                    return <RefactorDetailDialogPanel
                        closePanel={closePanel}
                        signalsSignal={signalsSignal}
                        newSignalName={signal.name}
                        signalId={signal.id}
                    />
                });
                alert('You are about to change the variable name consider to see the impact.');
            }
        }
        closePanel(valueSignal.get())
    }
    const codeSignal = useComputed(() => {
        const signal = valueSignal.get();
        const signals = signalsSignal.get();
        return buildFunctionCode(signal, signals, additionalParams);
    });
    return <HorizontalLabelContext.Provider value={{labelWidth: 130}}>
        <div style={{display: 'flex', flexDirection: 'column', padding: 10,width:'80vh',height:'80vh'}}>
            <div style={{fontSize: 16, marginBottom: 10}}>Signal Effect</div>
            <Notifiable component={HorizontalLabel}  label={'Name :'} style={() => {
                return {
                    borderBottom: isEmpty(errorsSignal.get().name) ? `1px solid ${colors.grey10}` : `1px solid ${colors.red}`
                }
            }}>
                <notifiable.input style={{border: BORDER_NONE, padding: 5}}
                                  value={() => valueSignal.get().name}
                                  onChange={(e) => {
                                      const value = e.target.value;
                                      update((item, errors) => {
                                          item.name = convertToVarName(value);
                                          errors.name = '';
                                      });
                                  }}
                />
            </Notifiable>

            <Notifiable component={HorizontalLabel} label={'Signal Dependencies :'} style={() => {
                const signal = valueSignal.get();
                if(isEffectOrComputed(signal)) {
                    return {}
                }
                return {display:'none'}
            }}>
                <Notifiable component={Checkbox}
                            data={() => signalsSignal.get().filter(s => s.type !== 'Effect' && s.id !== valueSignal.get().id).map(s => ({label:s.name,value:s.id}))}
                            value={() => {
                                const signal = valueSignal.get();
                                if(isEffectOrComputed(signal)){
                                    return signal.signalDependencies;
                                }
                                return [];
                            }}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    if(isEffectOrComputed(item)){
                                        item.signalDependencies = values;
                                        errors.signalDependencies = '';
                                    }
                                })
                            }}
                ></Notifiable>

            </Notifiable>
            <Notifiable component={HorizontalLabel} label={'Mutable Signals :'} style={() => {
                const signal = valueSignal.get();
                if(isEffect(signal)) {
                    return {}
                }
                return {display:'none'}
            }}>
                <Notifiable component={Checkbox}
                            data={() => signalsSignal.get().filter(s => s.type === 'State' && s.id !== valueSignal.get().id).map(s => ({label:convertToSetterName(s.name),value:s.id}))}
                            value={() => {
                                const signal = valueSignal.get();
                                if(isEffect(signal)) {
                                    return signal.mutableSignals;
                                }
                                return [];
                            }}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    if(isEffect(item)){
                                        item.mutableSignals = values;
                                        errors.mutableSignals = '';
                                    }

                                })
                            }}
                ></Notifiable>
            </Notifiable>
            <notifiable.div style={{flexGrow:1,display:'flex',flexDirection:'column',overflow:'auto',marginTop:10}}>
                <Notifiable component={Editor}
                            language="javascript"
                            value={() => codeSignal.get()}
                            options={{
                                selectOnLineNumbers: true
                            }}
                            onChangeHandler={(value?:string) => {
                                const cleanFormula = (value??'').trim().split('\n');
                                const indexOfStart = cleanFormula.findIndex(i => i === start);
                                const indexOfEnd = cleanFormula.findIndex(i => i === end);
                                const formula = cleanFormula.slice(indexOfStart+1,indexOfEnd).join('\n');
                                update((item, errors) => {
                                    item.formula = formula;
                                    errors.formula = '';
                                });
                            }}
                />
            </notifiable.div>

            <div style={{display: 'flex', flexDirection: 'row', marginTop: 10, gap: 10, justifyContent: 'flex-end'}}>
                <button onClick={onSave} style={{
                    border: BORDER,
                    color: colors.white,
                    backgroundColor: colors.green,
                    borderRadius: 5,
                    padding: '5px 10px'
                }}>Save
                </button>
                <button onClick={() => closePanel()} style={{
                    border: BORDER,
                    backgroundColor: colors.grey10,
                    borderRadius: 5,
                    padding: '5px 10px'
                }}>Cancel
                </button>
            </div>
        </div>
    </HorizontalLabelContext.Provider>
}
function isEffectOrComputed(signal:AnySignalType):signal is SignalEffect|SignalComputed{
    return signal.type === 'Effect' || signal.type === 'Computed';
}

function isComputed(signal:AnySignalType):signal is SignalComputed{
    return signal.type === 'Computed';
}

function isEffect(signal:AnySignalType):signal is SignalEffect{
    return signal.type === 'Effect';
}

function isState(signal:AnySignalType):signal is SignalState{
    return signal.type === 'State';
}



