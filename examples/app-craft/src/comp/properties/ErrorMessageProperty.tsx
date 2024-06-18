import {Signal} from "signal-polyfill";
import {InputComponent, SignalComputed} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";
import {VscSymbolEvent} from "react-icons/vsc";
import {isEmpty} from "../../utils/isEmpty.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import {createNewValue} from "../signals/createNewValue.ts";
import {SignalDetailDialogPanel} from "../signals/SignalDetailDialogPanel.tsx";
import {ComponentContext} from "../ComponentContext.ts";
import {useContext} from "react";

export function ErrorMessageProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const componentContext = useContext(ComponentContext)!;
    const {updateValue, focusedComponent} = props;
    const showModal = useShowModal();
    return <HorizontalLabel label={'Error :'}>
        <div style={{
            minHeight: 27,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: 5,
            marginRight: 5,
            overflow: 'hidden'
        }}>
            <notifiable.button style={{
                display: 'flex',
                padding: 2,
                alignItems: 'center',
                justifyContent: 'center',
                border: BORDER,
                borderRadius: 5
            }} onClick={async () => {
                const result = await showModal<SignalComputed>(closePanel => {
                    const formulaValue = focusedComponent.get().errorMessage ?? createNewValue<SignalComputed>('Computed');
                    return <ComponentContext.Provider value={componentContext}>
                        <SignalDetailDialogPanel closePanel={closePanel as (param?:SignalComputed) => void} value={formulaValue}
                                               requiredField={['name','signalDependencies','formula']} additionalParams={[]}/>
                    </ComponentContext.Provider>
                });
                if (result) {
                    updateValue(thisComponent => {
                        thisComponent.errorMessage = result;
                    })
                }
            }}>
                {() => {
                    const component = focusedComponent.get();
                    if (component === undefined) {
                        return <VscSymbolEvent style={{fontSize: 16}}/>
                    }
                    const value = component?.errorMessage?.name ?? '';
                    if (isEmpty(value)) {
                        return <VscSymbolEvent style={{fontSize: 16}}/>
                    }
                    return <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{value}</div>
                }}
            </notifiable.button>
        </div>
    </HorizontalLabel>;
}