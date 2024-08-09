import {BORDER} from "../Border.ts";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {CSSProperties, PropsWithChildren, ReactNode, useState} from "react";
import {Icon} from "../Icon.ts";

export default function CollapsibleLabelContainer(props: PropsWithChildren<{
    label: ReactNode,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    styleContent?: CSSProperties,
    defaultOpen?: boolean
}>) {
    const [isOpen, setIsOpen] = useState(props.defaultOpen ?? true);
    return <LabelContainer label={<>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {isOpen && <Icon.ArrowDown/>}
            {!isOpen && <Icon.ArrowRight/>}
        </div>
        {props.label}
    </>}
                           style={{overflow: 'auto', minHeight: 30, ...props.style}}
                           styleLabel={{
                               flexShrink: 0,
                               borderBottom: BORDER,
                               padding: '5px 10px',
                               backgroundColor: 'rgba(0,0,0,0.02)',
                               flexDirection: 'row',
                               display: 'flex',
                               alignItems: 'center',
                               gap: 10, ...props.styleLabel
                           }}
                           styleContent={{
                               boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.1) inset',
                               overflow: 'auto',
                               borderBottom: BORDER,
                               display: isOpen ? 'flex' : 'none',
                               flexDirection: 'column',
                               padding: '15px 10px',
                               ...props.styleContent
                           }}
                           labelOnClick={() => setIsOpen(!isOpen)}>
        {props.children}
    </LabelContainer>
}
