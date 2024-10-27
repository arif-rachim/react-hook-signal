import {BORDER, BORDER_ERROR} from "../../Border.ts";
import {CSSProperties, ForwardedRef, forwardRef, ReactNode, useEffect, useState} from "react";
import {Label} from "../label/Label.tsx";

export const TextInput = forwardRef(function TextInput(props: {
        value?: string,
        onChange?: (value: string) => void,
        onFocus?: () => void,
        onBlur?: (value: string) => void,
        onKeyDown?: () => void,
        onMouseDown?: () => void,
        label?: string,
        errorMessage?: string,
        style?: CSSProperties,
        inputStyle?: CSSProperties,
        maxLength?: number,
        popup?: {
            element?: ReactNode,
            position?: 'top' | 'bottom',
            visible?: boolean
        }
    }, ref: ForwardedRef<HTMLLabelElement>) {
        const {
            value,
            onChange,
            style: defaultStyle,
            label,
            inputStyle,
            errorMessage,
            onFocus,
            onBlur,
            onKeyDown,
            onMouseDown,
            maxLength
        } = props;

        const [localValue, setLocalValue] = useState<string | undefined>(value);
        useEffect(() => {
            setLocalValue(value)
        }, [value]);
        const style = {
            border: errorMessage ? BORDER_ERROR : BORDER,
            padding: '0px 5px',
            borderRadius: 5,
            ...inputStyle,
        }
        if (style?.border === 'unset') {
            style.border = BORDER
        }

        return <Label label={label} ref={ref} style={defaultStyle} popup={props.popup}>
            <input
                value={localValue}
                maxLength={maxLength}
                onChange={(e) => {
                    const val = e.target.value;
                    if (onChange) {
                        onChange(val);
                    } else {
                        setLocalValue(val)
                    }
                }}
                onFocus={() => {
                    if (onFocus) {
                        onFocus()
                    }
                }}
                onBlur={(e) => {
                    const val = e.target.value;
                    if (onBlur) {
                        onBlur(val);
                    }
                }}
                onKeyDown={() => {
                    if (onKeyDown) {
                        onKeyDown()
                    }
                }}
                onMouseDown={() => {
                    if (onMouseDown) {
                        onMouseDown()
                    }
                }}
                style={style}
            />
            {errorMessage && <div style={{
                padding: '0 5px',
                fontSize: 'small',
                lineHeight: 1,
                color: '#C00000',
                textAlign: 'right'
            }}>{errorMessage}</div>}
        </Label>
    }
);