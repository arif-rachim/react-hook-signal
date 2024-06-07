import {AnySignalType, FormulaValue} from "../Component.ts";
import {Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel, HorizontalLabelContext} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER} from "../Border.ts";
import {Checkbox} from "../../elements/Checkbox.tsx";
import {convertToVarName} from "../../utils/convertToVarName.ts";
import {Editor} from "@monaco-editor/react";

function createNewValue(name: string): FormulaValue {
    return {
        formula: '',
        signalDependencies: [],
        name,
    }
}

export function FormulaDialogPanel(props: {
    closePanel: (param?: FormulaValue) => void,
    value: FormulaValue,
    signals: AnySignalType[],
    additionalParam?: string[],
    name: string
}) {
    const {closePanel, signals, additionalParam, name} = props;
    const valueSignal = useSignal<FormulaValue>(props.value?.name === '' ? createNewValue(name) : props.value);
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
        const validateKeys: Array<keyof FormulaValue> = ['formula'];
        for (const key of validateKeys) {
            const value = record[key]
            if (isEmpty(value)) {
                errors[key] = key + ' is required';
            }
        }
        errorsSignal.set(errors);
    }

    function update(callback: (param: FormulaValue, errors: Record<string, string>) => void) {
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
        const signalDependencies = valueSignal.get().signalDependencies.map(depId => {
            const signalType = signals.find(s => s.id === depId);
            if (signalType === undefined) {
                return '';
            }
            return convertToVarName(signalType.name);
        });
        return `function ${name}(${[...signalDependencies, ...(additionalParam ?? [])].join(',')}){`
    });
    const codeSignal = useComputed(() => {
        return [functionName.get(), valueSignal.get().formula, '}'].join('\n');
    });
    return <HorizontalLabelContext.Provider value={{labelWidth: 130}}>
        <div style={{display: 'flex', flexDirection: 'column', padding: 10, width: '80vh', height: '80vh'}}>
            <HorizontalLabel label={'Signals Dependency:'}>
                <Notifiable component={Checkbox}
                            data={() => signals.filter(s => s.type !== 'Effect').map(s => ({
                                label: convertToVarName(s.name),
                                value: s.id
                            }))}
                            value={() => valueSignal.get().signalDependencies}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    item.signalDependencies = values;
                                    errors.signals = '';
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
                        onChangeHandler={(value?: string) => {
                            const formula = (value ?? '').trim().split('\n').slice(1, -1).join('\n');
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


