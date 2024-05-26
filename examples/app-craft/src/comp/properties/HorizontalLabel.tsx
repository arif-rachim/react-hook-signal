import {CSSProperties, PropsWithChildren} from "react";
import {BORDER} from "../Border.ts";

export function HorizontalLabel(props: PropsWithChildren<{ label: string, width?: CSSProperties['width'] }>) {
    return <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', width: props.width,borderBottom:BORDER}}>
        <div style={{fontStyle: 'italic', width: 58, textAlign: 'right', flexShrink: 0,whiteSpace:'nowrap'}}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {props.children}
        </div>
    </div>
}