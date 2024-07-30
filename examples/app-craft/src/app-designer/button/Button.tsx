import {ButtonHTMLAttributes, CSSProperties, DetailedHTMLProps, useMemo} from "react";
import {BORDER} from "../Border.ts";

/**
 * A custom Button component.
 */
export function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    const {style, ...properties} = props;
    const buttonStyle: CSSProperties = useMemo(() => {
        const defaultStyle: CSSProperties = {
            border: BORDER,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius: 20,
            padding: '5px 10px'
        };
        return {...defaultStyle, ...style}
    }, [style]);
    return <button style={buttonStyle} {...properties}>{props.children}</button>
}