import {Signal} from "signal-polyfill";
import {InputComponent} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER_NONE} from "../Border.ts";

export function ValueProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Value :'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER_NONE}} value={():string => {
            return focusedComponent.get()?.value?.toString() ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.value = newValue;
            });
        }}/>
    </HorizontalLabel>;
}