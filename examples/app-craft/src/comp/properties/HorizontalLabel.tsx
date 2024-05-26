import {CSSProperties, PropsWithChildren} from "react";

export function HorizontalLabel(props: PropsWithChildren<{ label: string, width?: CSSProperties['width'] }>) {
    return <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', width: props.width}}>
        <div style={{fontStyle: 'italic', width: 50, textAlign: 'right', flexShrink: 0}}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {props.children}
        </div>
    </div>
}