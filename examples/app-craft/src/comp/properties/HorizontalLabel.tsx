import {createContext, CSSProperties, PropsWithChildren, useContext} from "react";
import {BORDER} from "../Border.ts";

export function HorizontalLabel(props: PropsWithChildren<{ label: string, width?: CSSProperties['width'],style?:CSSProperties,styleLabel?:CSSProperties }>) {
    const {labelWidth} = useContext(HorizontalLabelContext);
    return <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', width: props.width,borderBottom:BORDER,...props.style}}>
        <div style={{fontStyle: 'italic', width: labelWidth, textAlign: 'right', flexShrink: 0,whiteSpace:'nowrap',...props.styleLabel}}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {props.children}
        </div>
    </div>
}

export const HorizontalLabelContext = createContext({labelWidth:58})
