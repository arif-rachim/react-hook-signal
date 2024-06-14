import {Signal} from "signal-polyfill";
import {AnySignalType, Component, SignalEffect} from "../Component.ts";
import {HorizontalLabel} from "../properties/HorizontalLabel.tsx";
import {VscSymbolEvent} from "react-icons/vsc";
import {BORDER} from "../Border.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import {notifiable} from "react-hook-signal";
import {isEmpty} from "../../utils/isEmpty.ts";
import {SignalDetailDialogPanel} from "../signals/SignalDetailDialogPanel.tsx";
import {createNewValue} from "../signals/createNewValue.ts";

export function OnClickEvent(props: {
    focusedComponent: Signal.State<Component>,
    updateValue: (callback: (thisComponent: Component) => void) => void,
    signals: Signal.State<AnySignalType[]>
}) {
    const {updateValue, focusedComponent, signals} = props;
    const showModal = useShowModal();
    return <HorizontalLabel label={'OnClick :'} style={{overflow:'hidden'}}>
        <div style={{minHeight: 27, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 5,marginRight:5,overflow:'hidden'}}>
            <notifiable.button style={{
                display: 'flex',
                padding: 2,
                alignItems: 'center',
                justifyContent: 'center',
                border: BORDER,
                borderRadius: 5
            }} onClick={async () => {
                const result = await showModal<SignalEffect>(closePanel => {
                    const onClick = focusedComponent.get().events.onClick ?? createNewValue<SignalEffect>('Effect');
                    return <SignalDetailDialogPanel closePanel={closePanel as (param:AnySignalType|undefined) => void} value={onClick} signalsSignal={signals} requiredField={['name','formula']} additionalParams={['value']} />
                });
                if (result) {
                    updateValue(thisComponent => {
                        thisComponent.events.onClick = result;
                    })
                }
            }}>
                {() => {
                    const component = focusedComponent.get();
                    if (component === undefined) {
                        return <VscSymbolEvent style={{fontSize: 16}}/>
                    }
                    const value = component.events.onClick?.name ?? '';
                    if (isEmpty(value)) {
                        return <VscSymbolEvent style={{fontSize: 16}}/>
                    }
                    return <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{value}</div>
                }}
            </notifiable.button>
        </div>
    </HorizontalLabel>;
}
