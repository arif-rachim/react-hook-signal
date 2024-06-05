import {AnySignalType, EventType} from "../Component.ts";
import {notifiable, Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel, HorizontalLabelContext} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER, BORDER_NONE} from "../Border.ts";
import {Checkbox} from "../../elements/Checkbox.tsx";
import {convertToVarName} from "../../utils/convertToVarName.ts";
import {convertToSetterName} from "../../utils/convertToSetterName.ts";
import {Editor} from "@monaco-editor/react";

function createNewValue(): EventType {
    return {
        formula : '',
        name : '',
        signalDependencies : [],
        mutableSignals : []
    }
}

export function EventDialogPanel(props: { closePanel: (param?: EventType) => void, value?: EventType,signals:AnySignalType[],additionalParam:string[] }) {
    const {closePanel,signals,additionalParam} = props;
    const valueSignal = useSignal<EventType>(props.value ?? createNewValue());
    const errorsSignal = useSignal<Record<string, string>>({});
    const hasErrorSignal = useComputed(() => {
        const errors = errorsSignal.get();
        for (const key of Object.keys(errors)) {
            const value = errors[key]
            if (!isEmpty(value)) {
                return true;
            }
        }
        return false;
    });

    function validate() {
        const errors = {...errorsSignal.get()};
        const record = valueSignal.get();
        const validateKeys: Array<keyof EventType> = ['name', 'formula'];
        for (const key of validateKeys) {
            const value = record[key]
            if (isEmpty(value)) {
                errors[key] = key + ' is required';
            }
        }
        errorsSignal.set(errors);
    }

    function update(callback: (param: EventType, errors: Record<string, string>) => void) {
        const item = {...valueSignal.get()};
        const errors = {...errorsSignal.get()};
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
        const signalDependencies = valueSignal.get().signalDependencies.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if(signalType === undefined){
                return '';
            }
            return convertToVarName(signalType.name);
        });
        const mutableSignals = valueSignal.get().mutableSignals.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if(signalType === undefined){
                return '';
            }
            return convertToSetterName(signalType.name)
        });
        const varName = convertToVarName(name);
        return `function ${varName}(${[...signalDependencies,...mutableSignals,...additionalParam].join(',')}){`
    });
    const codeSignal = useComputed(() => {
        return [functionName.get(),valueSignal.get().formula,'}'].join('\n');
    });
    return <HorizontalLabelContext.Provider value={{labelWidth: 130}}>
        <div style={{display: 'flex', flexDirection: 'column', padding: 10,width:'80vh',height:'80vh'}}>
            <div style={{fontSize: 16, marginBottom: 10}}>On Event</div>
            <Notifiable component={HorizontalLabel} label={'Name :'} style={() => {
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

            <HorizontalLabel label={'Signals Dependency:'}>
                <Notifiable component={Checkbox}
                            data={() => signals.filter(s => s.type !== 'Effect').map(s => ({label:convertToVarName(s.name),value:s.id}))}
                            value={() => valueSignal.get().signalDependencies}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    item.signalDependencies = values;
                                    errors.signals = '';
                                })
                            }}
                ></Notifiable>
            </HorizontalLabel>
            <HorizontalLabel label={'Mutable Signals :'}>
                <Notifiable component={Checkbox}
                            data={() => signals.filter(s => s.type === 'State').map(s => ({label:convertToSetterName(s.name),value:s.id}))}
                            value={() => valueSignal.get().mutableSignals}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    item.mutableSignals = values;
                                    errors.mutableSignals = '';
                                })
                            }}
                ></Notifiable>
            </HorizontalLabel>
            <Notifiable component={Editor}
                        height="100%"
                        language="javascript"
                        value={() => codeSignal.get()}
                        options={{
                            selectOnLineNumbers: true
                        }}
                        onChangeHandler={(value?:string) => {
                            const formula = (value??'').trim().split('\n').slice(1,-1).join('\n');
                            update((item, errors) => {
                                item.formula = formula;
                                errors.formula = '';
                            });
                        }}
            />

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


