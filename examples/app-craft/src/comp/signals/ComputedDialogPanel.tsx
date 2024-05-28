import {AnySignalType, SignalComputed, SignalState} from "../Component.ts";
import {guid} from "../../utils/guid.ts";
import {notifiable, Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel, HorizontalLabelContext} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER, BORDER_NONE} from "../Border.ts";
import {Checkbox} from "../../elements/Checkbox.tsx";

function createNewValue(): SignalComputed {
    return {
        id: guid(),
        valueType: "string",
        name: '',
        signalDependencies: [],
        formula: '',
        type : 'Computed'
    }
}

export function ComputedDialogPanel(props: { closePanel: (param?: SignalComputed) => void, value?: SignalComputed,signals:AnySignalType[] }) {
    const {closePanel,signals} = props;
    const valueSignal = useSignal<SignalComputed>(props.value ?? createNewValue());
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
        const validateKeys: Array<keyof SignalComputed> = ['name', 'valueType', 'signalDependencies', 'formula'];
        for (const key of validateKeys) {
            const value = record[key]
            if (isEmpty(value)) {
                errors[key] = key + ' is required';
            }
        }
        console.log("WE GOT ERRORS",errors)
        errorsSignal.set(errors);
    }

    function update(callback: (param: SignalComputed, errors: Record<string, string>) => void) {
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

    return <HorizontalLabelContext.Provider value={{labelWidth :130}}>
        <div style={{display: 'flex', flexDirection: 'column', padding: 10,width:600}}>
            <div style={{fontSize: 16, marginBottom: 10}}>Add New Computed</div>
            <Notifiable component={HorizontalLabel} label={'Type :'} style={() => {
                return {
                    borderBottom: isEmpty(errorsSignal.get().type) ? `1px solid ${colors.grey10}` : `1px solid ${colors.red}`
                }
            }}>
                <notifiable.select style={{border: BORDER_NONE, padding: 5}}
                                   value={() => valueSignal.get().valueType.toString()}
                                   onChange={(e) => {
                                       const value = e.target.value as SignalState['type'];
                                       update((item, errors) => {
                                           item.valueType = value;
                                           errors.valueType = '';
                                       });
                                   }}>
                    <option>number</option>
                    <option>string</option>
                    <option>boolean</option>
                    <option>Record</option>
                    <option>Array</option>
                </notifiable.select>
            </Notifiable>
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

            <HorizontalLabel label={'Signal Dependencies :'}>
                <Notifiable component={Checkbox}
                            data={() => signals.map(s => ({label:s.name,value:s.id}))}
                            value={() => valueSignal.get().signalDependencies}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    item.signalDependencies = values;
                                    errors.signalDependencies = '';
                                })
                            }}
                ></Notifiable>

            </HorizontalLabel>

            <HorizontalLabel label={'Formula :'} style={{alignItems:'flex-start'}} styleLabel={{marginTop:2}}>
                <notifiable.textarea style={{border: BORDER_NONE, padding: 5,height:200}}
                                  defaultValue={() => valueSignal.get().formula ?? ''}
                                  onChange={(e) => {
                                      const value = e.target.value.toString();
                                      update((item, errors) => {
                                          item.formula = value;
                                          errors.formula = '';
                                      });
                                  }}
                />
            </HorizontalLabel>

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