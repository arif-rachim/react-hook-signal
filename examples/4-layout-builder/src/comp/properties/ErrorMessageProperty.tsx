import {Signal} from "signal-polyfill";
import {InputComponent} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";

export function ErrorMessageProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Error'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={():string => {
            return focusedComponent.get()?.errorMessage?.toString() ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.errorMessage = newValue;
            });
        }}/>
    </HorizontalLabel>;
}