import {CSSProperties, ForwardedRef, forwardRef, PropsWithChildren} from "react";

export const Label = forwardRef(function LabelContainer(props: PropsWithChildren<{
        label?: string,
        style?: CSSProperties,
        styleLabel?: CSSProperties,

    }>, ref: ForwardedRef<HTMLLabelElement>) {
        const {style, label, styleLabel} = props;

        return <label ref={ref} style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            ...style
        }}>
            {label && <div style={{padding: '0 5px', fontSize: 'small', lineHeight: 1.2, ...styleLabel}}>{label}</div>}
            {props.children}
        </label>
    }
);