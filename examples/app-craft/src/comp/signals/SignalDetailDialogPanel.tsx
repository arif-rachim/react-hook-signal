import {AnySignalType, SignalComputed, SignalEffect, SignalState} from "../Component.ts";
import {guid} from "../../utils/guid.ts";
import {notifiable, Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel, HorizontalLabelContext} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER, BORDER_NONE} from "../Border.ts";
import {Checkbox} from "../../elements/Checkbox.tsx";
import {convertToVarName} from "../../utils/convertToVarName.ts";
import {convertToSetterName} from "../../utils/convertToSetterName.ts";
import {Editor} from "@monaco-editor/react";

export function createNewValue<T extends AnySignalType>(type:T['type']): T {
    let result:AnySignalType|undefined = undefined;
    if(type ==='Computed'){
        result = {
            id: guid(),
            name: '',
            signalDependencies: [],
            formula: '',
            type : type
        } as SignalComputed
    }
    if(type === 'Effect'){
        result = {
            id: guid(),
            name: '',
            signalDependencies: [],
            formula: '',
            type:type,
            mutableSignals: []
        } as SignalEffect
    }
    if(type === 'State'){
        result = {
            name: '',
            value: undefined,
            id: guid(),
            type : type
        } as SignalState;
    }
    if(isT<T>(result)){
        return result;
    }
    throw new Error('Unable to identify type');
}
function isT<T extends AnySignalType>(value:unknown): value is T {
    return value !== undefined && value !== null && typeof value === 'object';
}
export function SignalDetailDialogPanel<T extends AnySignalType>(props: {closePanel: (param?: T) => void, value: T,signals:AnySignalType[],requiredField:Array<keyof T> }) {
    const {closePanel,signals,requiredField} = props;
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

    function onSave() {
        validate();
        if (hasErrorSignal.get()) {
            return;
        }
        closePanel(valueSignal.get())
    }
    const functionName = useComputed(() => {
        const name = valueSignal.get().name;
        const signal = valueSignal.get();
        let dependencySignals:string[] = [];
        if(isEffectOrComputed(signal)){
            const result = signal.signalDependencies.map(depId => {
                const signalType = signals.find(s => s.id === depId);
                if(signalType === undefined){
                    return '';
                }
                return convertToVarName(signalType.name)
            });
            dependencySignals = [...dependencySignals,...result];
        }
        if(isEffectSignal(signal)){
            const result = signal.mutableSignals.map(depId => {
                const signalType = signals.find(s => s.id === depId);
                if(signalType === undefined){
                    return '';
                }
                return convertToSetterName(signalType.name)
            });
            dependencySignals = [...dependencySignals,...result];
        }
        const varName = convertToVarName(name);
        return `function ${varName}(${[...dependencySignals].filter(i => i).join(', ')}){`
    });
    const codeSignal = useComputed(() => {
        const signal = valueSignal.get();
        const functionName_ = functionName.get();
        if(isEffectOrComputed(signal)){
            return [functionName_,signal.formula,'}'].join('\n');
        }
        if(isState(signal)){
            return '// there is no code for state';
        }
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
                                          item.name = value;
                                          errors.name = '';
                                      });
                                  }}
                />
            </Notifiable>

            <Notifiable component={HorizontalLabel} label={'Value :'} style={() => {
                const signal = valueSignal.get();
                if(isState(signal)) {
                    return {}
                }
                return {display:'none'}
            }} >
                <notifiable.input style={{border: BORDER_NONE, padding: 5}}
                                  value={() => {
                                      const signal = valueSignal.get();
                                      if(isState(signal)) {
                                        return (signal.value ?? '') as string
                                      }
                                      return ''
                                  }}
                                  onChange={(e) => {
                                      const value = e.target.value;
                                      update((item, errors) => {
                                          if(isState(item)){
                                              item.value = value;
                                              errors.value = '';
                                          }
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
                            data={() => signals.filter(s => s.type !== 'Effect' && s.id !== valueSignal.get().id).map(s => ({label:convertToVarName(s.name),value:s.id}))}
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
                if(isEffectSignal(signal)) {
                    return {}
                }
                return {display:'none'}
            }}>
                <Notifiable component={Checkbox}
                            data={() => signals.filter(s => s.type === 'State' && s.id !== valueSignal.get().id).map(s => ({label:convertToSetterName(s.name),value:s.id}))}
                            value={() => {
                                const signal = valueSignal.get();
                                if(isEffectSignal(signal)) {
                                    return signal.mutableSignals;
                                }
                                return [];
                            }}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    if(isEffectSignal(item)){
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
                                const formula = (value??'').trim().split('\n').slice(1,-1).join('\n');
                                update((item, errors) => {
                                    if(isEffectOrComputed(item)){
                                        item.formula = formula;
                                        errors.formula = '';
                                    }
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

function isEffectSignal(signal:AnySignalType):signal is SignalEffect{
    return signal.type === 'Effect';
}

function isState(signal:AnySignalType):signal is SignalState{
    return signal.type === 'State';
}


