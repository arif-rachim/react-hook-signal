import {CSSProperties, PropsWithChildren, useState} from "react";

/**
 * Creates a container with a label and content.
 */
export function LabelContainer(props: PropsWithChildren<{
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    styleContent?: CSSProperties,
    styleOnHovered?: CSSProperties
}>): JSX.Element {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    let style = {...props.style};
    if (isHovered) {
        style = {...style, ...props.styleOnHovered}
    }
    return <label style={{display: 'flex', flexDirection: 'column', gap: 0, ...style}}
                  onMouseMove={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div style={props.styleLabel}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'row', flexGrow: 1, ...props.styleContent}}>
            {props.children}
        </div>
    </label>
}
