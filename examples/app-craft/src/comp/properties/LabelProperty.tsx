import {Signal} from "signal-polyfill";
import {LabelComponent} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";

export function LabelProperty(props: {
    focusedComponent: Signal.State<LabelComponent>,
    updateValue: (callback: (thisComponent: LabelComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Label'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.label ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.label = newValue;
            });
        }}/>
    </HorizontalLabel>;
}
