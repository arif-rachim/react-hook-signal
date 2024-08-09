import {ReactNode} from "react";
import {Button} from "./button/Button.tsx";
import {IconType} from "react-icons";
import {Icon} from "./Icon.ts";
import {BORDER} from "./Border.ts";

/**
 * Creates a confirmation dialog with the given properties.
 */
export function ConfirmationDialog(props: {
    message: ReactNode,
    closePanel: (result?: string) => void,
    buttons?: Array<{ id: string, label: string, icon: IconType }>,
}) {
    const buttons = props.buttons ?? [{id: 'Yes', label: 'Yes', icon: Icon.Save}, {
        id: 'No',
        label: 'No',
        icon: Icon.Exit
    }]
    return <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{
            padding: '10px 20px',
            borderBottom: BORDER,
            backgroundColor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            gap: 5,
            alignItems: 'center'
        }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon.Confirmation
                style={{fontSize: 32, color: 'rgba(0,0,0,0.7)'}}/></div>
            <div>Confirmation</div>
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
                const Icon = button.icon;
                return <Button key={button.id} onClick={() => props.closePanel(button.id)}
                               style={{
                                   display: 'flex',
                                   gap: 5,
                                   alignItems: 'center'
                               }}>
                    <div style={{paddingBottom: 2}}>{button.label}</div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon style={{fontSize: 22}}/>
                    </div>
                </Button>
            })}
        </div>
    </div>
}