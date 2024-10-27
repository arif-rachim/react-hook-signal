import {ButtonHTMLAttributes, CSSProperties, DetailedHTMLProps, forwardRef, LegacyRef, RefObject, useMemo} from "react";
import {BORDER_NONE} from "../Border.ts";
import {useHoveredOnPress} from "../dashboard/useHoveredOnPress.ts";

/**
 * A custom Button component.
 */
export const Button = forwardRef(function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, ref) {
    const {style, ...properties} = props;
    const {ref: localRef, isHovered, isOnPress} = useHoveredOnPress(ref as RefObject<HTMLElement>);
    const buttonStyle: CSSProperties = useMemo(() => {
        const defaultStyle: CSSProperties = {
            border: BORDER_NONE,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius: 20,
            boxShadow: isOnPress ? '0px 5px 5px -3px rgba(0,0,0,0.5) inset' : isHovered ? '0px 5px 8px -3px rgba(255,255,255,0.2) inset' : 'unset',
            transition: 'box-shadow 100ms ease-in-out',
            padding: '5px 10px 5px 10px'
        };
        return {...defaultStyle, ...style}
    }, [style, isHovered, isOnPress]);
    return <button ref={localRef as LegacyRef<HTMLButtonElement>}
                   style={buttonStyle} {...properties}>
        {props.children}
    </button>
})