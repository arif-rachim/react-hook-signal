import {Signal} from "signal-polyfill";
import {Component} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER_NONE} from "../Border.ts";

export function HeightProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Height :'} width={'50%'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER_NONE}} value={() => {
            return focusedComponent.get()?.style.height ?? ''
        }} onChange={(e) => {
            let newValue: string | number = e.target.value;
            if (typeof newValue === 'string' && !newValue.endsWith('%')) {
                const number = parseInt(e.target.value);
                if (!isNaN(number)) {
                    newValue = number;
                }
            }
            updateValue((thisComponent) => {
                thisComponent.style.height = newValue as (number | `${number}%` | undefined);
            });
        }}/>
    </HorizontalLabel>;
}