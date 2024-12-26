import {CSSProperties, HTMLAttributes, PropsWithChildren, ReactNode, useState} from "react";

/**
 * Creates a container with a label and content.
 */
export function LabelContainer(props: PropsWithChildren<{
    label: ReactNode,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    styleContent?: CSSProperties,
    styleOnHovered?: CSSProperties,
    labelOnClick?: () => void
}>): ReactNode {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    let style = {...props.style};
    if (isHovered) {
        style = {...style, ...props.styleOnHovered}
    }
    const Element = props.labelOnClick === undefined ? Label : Div;
    return <Element style={{display: 'flex', flexDirection: 'column', gap: 0, ...style}}
                    onMouseMove={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div style={{flexShrink: 0, ...props.styleLabel}} onClick={() => {
            if (props.labelOnClick) {
                props.labelOnClick()
            }
        }}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'row', flexGrow: 1, ...props.styleContent}}>
            {props.children}
        </div>
    </Element>
}

function Label(props: HTMLAttributes<HTMLLabelElement>) {
    return <label {...props}></label>
}

function Div(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props}></div>
}
