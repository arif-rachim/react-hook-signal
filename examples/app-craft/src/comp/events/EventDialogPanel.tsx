import {AnySignalType, EventType} from "../Component.ts";
import {notifiable, Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel, HorizontalLabelContext} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER, BORDER_NONE} from "../Border.ts";
import {Checkbox} from "../../elements/Checkbox.tsx";
import {convertToVarName} from "../../utils/convertToVarName.ts";

function createNewValue(): EventType {
    return {
        formula : '',
        name : '',
        signals : []
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

    return <HorizontalLabelContext.Provider value={{labelWidth: 130}}>
        <div style={{display: 'flex', flexDirection: 'column', padding: 10, width: 600}}>
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

            <HorizontalLabel label={'Signals :'}>
                <Notifiable component={Checkbox}
                            data={() => signals.filter(s => s.type !== 'Effect').map(s => ({label:s.name,value:s.id}))}
                            value={() => valueSignal.get().signals}
                            onChangeHandler={(values: string[]) => {
                                update((item, errors) => {
                                    item.signals = values;
                                    errors.signals = '';
                                })
                            }}
                ></Notifiable>

            </HorizontalLabel>

            <HorizontalLabel label={'Formula :'} style={{alignItems: 'flex-start'}} styleLabel={{marginTop: 2}}>
                <notifiable.code style={{marginTop:3}}>{() => {
                    const name = valueSignal.get().name;
                    const signalDependencies = valueSignal.get().signals.map(depId => {
                        const signalType = signals.find(s => s.id === depId);
                        if(signalType === undefined){
                            return '';
                        }
                        return convertToVarName(signalType.name)
                    });
                    const varName = convertToVarName(name);
                    return `function ${varName}(${[...signalDependencies,...additionalParam].join(',')}){`
                }}</notifiable.code>
                <notifiable.textarea style={{border: BORDER_NONE, padding: 5, height: 200,marginLeft:20}}
                                     defaultValue={() => valueSignal.get().formula ?? ''}
                                     onChange={(e) => {
                                         const value = e.target.value.toString();
                                         update((item, errors) => {
                                             item.formula = value;
                                             errors.formula = '';
                                         });
                                     }}
                />
                <code>{'}'}</code>
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


