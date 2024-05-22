import {Signal} from "signal-polyfill";
import {Component} from "../Component.ts";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";

export function WidthProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Width'} width={'50%'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.style.width ?? ''
        }} onChange={(e) => {
            let newValue: string | number = e.target.value;
            if (typeof newValue === 'string' && !newValue.endsWith('%')) {
                const number = parseInt(e.target.value);
                if (!isNaN(number)) {
                    newValue = number;
                }
            }
            updateValue((thisComponent) => {
                thisComponent.style.width = newValue as (number | `${number}%` | undefined);
                console.log("UPDATING WIDTH ",thisComponent.style.width);
            });
        }}/>
    </HorizontalLabel>;
}