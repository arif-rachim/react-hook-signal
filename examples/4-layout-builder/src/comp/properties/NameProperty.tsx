import {Signal} from "signal-polyfill";
import {InputComponent} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";


export function NameProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Name'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.name ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.name = newValue;
            });
        }}/>
    </HorizontalLabel>;
}