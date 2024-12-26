import {ReactNode} from "react";
import {Button} from "../button/Button.tsx";
import {BORDER} from "../../core/style/Border.ts";
import {IconType} from "../../core/components/icon/IconElement.tsx";
import * as Io from "react-icons/io";
import {IoIosHelpCircle} from "react-icons/io";

const defaultButtons = [{id: 'Yes', label: 'Yes', icon: 'IoIosSave'}, {
    id: 'No',
    label: 'No',
    icon: 'IoIosExit'
}] as Array<{ id: string, label: string, icon?: IconType }>;
/**
 * Creates a confirmation dialog with the given properties.
 */
export function ConfirmationDialog(props: {
    message: ReactNode,
    title?: string,
    icon?: IconType,
    closePanel: (result?: string) => void,
    buttons?: Array<{ id: string, label: string, icon?: IconType }>,
}) {
    const buttons = props.buttons ?? defaultButtons
    const Icon = props.icon && props.icon in Io ? Io[props.icon] : IoIosHelpCircle;
    return <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{
            padding: '10px 20px',
            borderBottom: BORDER,
            backgroundColor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            gap: 5,
            alignItems: 'center'
        }}>
            {Icon && <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon style={{fontSize: 32, color: 'rgba(0,0,0,0.7)'}}/></div>}
            <div>{props.title ?? 'Confirmation'}</div>
        </div>
        <div style={{padding: '10px 20px'}}>{props.message}</div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 5,
            borderTop: BORDER,
            padding: '10px 20px',
            backgroundColor: 'rgba(0,0,0,0.05)'
        }}>
            {buttons.map((button) => {
                return <Button key={button.id} onClick={() => props.closePanel(button.id)}
                               style={{
                                   display: 'flex',
                                   gap: 5,
                                   alignItems: 'center'
                               }} icon={button.icon}>
                    {button.label}
                </Button>
            })}
        </div>
    </div>
}