import {ButtonHTMLAttributes, CSSProperties, DetailedHTMLProps, forwardRef, LegacyRef, useMemo} from "react";
import {BORDER} from "../Border.ts";

/**
 * A custom Button component.
 */
export const Button = forwardRef(function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, ref) {
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
    return <button ref={ref as LegacyRef<HTMLButtonElement>}
                   style={buttonStyle} {...properties}>{props.children}</button>
})