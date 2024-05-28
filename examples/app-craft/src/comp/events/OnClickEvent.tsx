import {Signal} from "signal-polyfill";
import {AnySignalType, Component, EventType} from "../Component.ts";
import {HorizontalLabel} from "../properties/HorizontalLabel.tsx";
import {VscSymbolEvent} from "react-icons/vsc";
import {BORDER} from "../Border.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import {EventDialogPanel} from "./EventDialogPanel.tsx";
import {AnySignal, notifiable} from "react-hook-signal";
import {convertToVarName} from "../../utils/convertToVarName.ts";
import {isEmpty} from "../../utils/isEmpty.ts";

export function OnClickEvent(props: {
    focusedComponent: Signal.State<Component>,
    updateValue: (callback: (thisComponent: Component) => void) => void,
    signals: AnySignal<AnySignalType[]>
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
                const result = await showModal<EventType>(closePanel => {
                    const onClick = focusedComponent.get().events.onClick;
                    return <EventDialogPanel closePanel={closePanel} value={onClick} signals={signals.get()} additionalParam={[]}/>
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
                    const value = convertToVarName(component.events.onClick?.name ?? '');
                    if (isEmpty(value)) {
                        return <VscSymbolEvent style={{fontSize: 16}}/>
                    }
                    return <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{value}</div>
                }}
            </notifiable.button>
        </div>
    </HorizontalLabel>;
}
