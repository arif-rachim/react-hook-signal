import {BORDER} from "../style/Border.ts";
import {LabelContainer} from "./LabelContainer.tsx";
import {CSSProperties, PropsWithChildren, ReactNode, useEffect, useState} from "react";
import {Icon} from "./icon/Icon.ts";

export default function CollapsibleLabelContainer(props: PropsWithChildren<{
    label: ReactNode,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    styleContent?: CSSProperties,
    defaultOpen?: boolean,
    autoGrowWhenOpen?: boolean,
    onOpenChange?: (isOpen: boolean) => void
}>) {
    const [isOpen, setIsOpen] = useState(props.defaultOpen ?? true);
    const onOpenChange = props.onOpenChange;
    useEffect(() => {
        if (onOpenChange) {
            onOpenChange(isOpen);
        }
    }, [isOpen, onOpenChange]);
    return <LabelContainer label={<>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {isOpen && <Icon.ArrowDown/>}
            {!isOpen && <Icon.ArrowRight/>}
        </div>
        {props.label}
    </>}
                           style={{
                               overflow: 'auto',
                               minHeight: 32,
                               flexGrow: props.autoGrowWhenOpen && isOpen ? 1 : undefined, ...props.style
                           }}
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
