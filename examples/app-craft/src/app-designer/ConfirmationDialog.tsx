import {ReactNode} from "react";
import {Button} from "./Button.tsx";

/**
 * Creates a confirmation dialog with the given properties.
 */
export function ConfirmationDialog(props: {
    message: ReactNode,
    closePanel: (result?: string) => void,
    buttons?: Array<string>,
}) {
    const buttons = props.buttons ?? ['Yes', 'No']
    return <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 10}}>
        <div>{props.message}</div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 5}}>
            {buttons.map((key) => {
                return <Button key={key} onClick={() => props.closePanel(key)}>{key}</Button>
            })}
        </div>
    </div>
}