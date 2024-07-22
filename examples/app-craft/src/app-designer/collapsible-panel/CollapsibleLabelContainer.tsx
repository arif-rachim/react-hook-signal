import {BORDER} from "../Border.ts";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {CSSProperties, PropsWithChildren, ReactNode, useState} from "react";
import {Icon} from "../Icon.ts";

export default function CollapsibleLabelContainer(props: PropsWithChildren<{
    label: ReactNode,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    styleContent?: CSSProperties
}>) {
    const [isOpen, setIsOpen] = useState(true);
    return <LabelContainer label={<>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {isOpen && <Icon.ArrowDown/>}
            {!isOpen && <Icon.ArrowRight/>}
        </div>
        {props.label}
    </>}
                           style={{...props.style}}
                           styleLabel={{
                               flexShrink: 0,
                               borderTop: BORDER,
                               borderBottom: BORDER,
                               padding: '5px 10px',
                               backgroundColor: 'rgba(0,0,0,0.02)',
                               flexDirection: 'row',
                               display: 'flex',
                               alignItems: 'center',
                               gap: 10, ...props.styleLabel
                           }}
                           styleContent={{
                               display:isOpen ? 'flex' : 'none',
                               flexDirection: 'column',
                               gap: 10,
                               padding: '15px 10px', ...props.styleContent}}
                           labelOnClick={() => setIsOpen(!isOpen)}>
        {props.children}
    </LabelContainer>
}
