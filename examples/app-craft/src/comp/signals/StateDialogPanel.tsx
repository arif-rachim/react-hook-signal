import {SignalState} from "../Component.ts";
import {guid} from "../../utils/guid.ts";
import {notifiable, Notifiable, useComputed, useSignal} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {HorizontalLabel} from "../properties/HorizontalLabel.tsx";
import {colors} from "../../utils/colors.ts";
import {BORDER, BORDER_NONE} from "../Border.ts";

function createNewValue(): SignalState {
    return {
        name: '',
        value: undefined,
        privacy: 'private',
        valueType: 'string',
        id: guid(),
        type : 'State'
    }
}

export function StateDialogPanel(props: { closePanel: (param?: SignalState) => void, value?: SignalState }) {
    const {closePanel} = props;
    const valueSignal = useSignal<SignalState>(props.value ?? createNewValue());
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
        const validateKeys:Array<keyof SignalState> = ['name', 'privacy', 'valueType'];
        for (const key of validateKeys) {
            const value = record[key]
            if (isEmpty(value)) {
                errors[key] = key + ' is required';
            }
        }
        errorsSignal.set(errors);
    }

    function update(callback: (param: SignalState, errors: Record<string, string>) => void) {
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

    return <div style={{display: 'flex', flexDirection: 'column', padding: 10}}>
        <div style={{fontSize: 16, marginBottom: 10}}>Add New State</div>
        <Notifiable component={HorizontalLabel} label={'Privacy :'} style={() => {
            return {
                borderBottom : isEmpty(errorsSignal.get().privacy) ? `1px solid ${colors.grey10}` : `1px solid ${colors.red}`
            }}}>
            <notifiable.select style={{border: BORDER_NONE, padding: 5}}
                               value={() => valueSignal.get().privacy}
                               onChange={(e) => {
                                   const value = e.target.value as SignalState['privacy'];
                                   update((item, errors) => {
                                       item.privacy = value;
                                       errors.privacy = '';
                                   });
                               }}>
                <option>Private</option>
                <option>Scope</option>
            </notifiable.select>
        </Notifiable>
        <Notifiable component={HorizontalLabel} label={'Type :'} style={() => {
            return {
                borderBottom : isEmpty(errorsSignal.get().type) ? `1px solid ${colors.grey10}` : `1px solid ${colors.red}`
            }}}>
            <notifiable.select style={{border: BORDER_NONE, padding: 5}}
                               value={() => valueSignal.get().valueType}
                               onChange={(e) => {
                                   const value = e.target.value as SignalState['valueType'];
                                   update((item, errors) => {
                                       item.valueType = value;
                                       errors.type = '';
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
                borderBottom : isEmpty(errorsSignal.get().name) ? `1px solid ${colors.grey10}` : `1px solid ${colors.red}`
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

        <HorizontalLabel label={'Value :'}>
            <notifiable.input style={{border: BORDER_NONE, padding: 5}}
                              value={() => {
                                  return (valueSignal.get().value ?? '') as string
                              }}
                              onChange={(e) => {
                                  const value = e.target.value;
                                  update((item, errors) => {
                                      item.value = value;
                                      errors.value = '';
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
}