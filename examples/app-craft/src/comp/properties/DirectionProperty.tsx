import {Signal} from "signal-polyfill";
import {Component} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";

export function DirectionProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Direction'}>
    <notifiable.select style={{padding: 5, borderRadius: 3, border: BORDER, width: '100%'}}
    value={() => {
        return focusedComponent.get()?.componentType ?? 'Vertical'
    }}
    onChange={(e) => {
        const newValue = e.target.value;
        updateValue((thisComponent) => {
            thisComponent.componentType = newValue as ('Horizontal' | 'Vertical');
        });
    }}
>
    <option value={'Horizontal'}>Horizontal</option>
        <option value={'Vertical'}>Vertical</option>
        </notifiable.select>
        </HorizontalLabel>;
}