import {Signal} from "signal-polyfill";
import {InputComponent} from "../Component.ts";
import {HorizontalLabel} from "./HorizontalLabel.tsx";
import {notifiable} from "react-hook-signal";
import {BORDER_NONE} from "../Border.ts";
import {convertToVarName} from "../../utils/convertToVarName.ts";


export function NameProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Name :'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER_NONE}} value={() => {
            return focusedComponent.get()?.name ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            const selectionStart = e.target.selectionStart
            updateValue((thisComponent) => {
                thisComponent.name = convertToVarName(newValue);
            });
            setTimeout(() => {
                e.target.setSelectionRange(selectionStart, selectionStart);
            },0)
        }}/>
    </HorizontalLabel>;
}