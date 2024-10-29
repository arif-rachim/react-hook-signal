import {BORDER, BORDER_ERROR} from "../../Border.ts";
import {CSSProperties, ForwardedRef, forwardRef, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {Label} from "../label/Label.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "../Form.tsx";

export const TextInput = forwardRef(function TextInput(props: {
        value?: string,
        onChange?: (value: string) => void,
        onFocus?: () => void,
        onBlur?: (value: string) => void,
        name?: string,
        onKeyDown?: () => void,
        onMouseDown?: () => void,
        label?: string,
        error?: string,
        style?: CSSProperties,
        inputStyle?: CSSProperties,
        maxLength?: number,
        popup?: {
            element?: ReactNode,
            position?: 'top' | 'bottom',
            visible?: boolean
        },
        type?: 'text' | 'number' | 'password'
    }, ref: ForwardedRef<HTMLLabelElement>) {
        const {
            value,
            onChange,
            style: defaultStyle,
            label,
            inputStyle,
            error,
            onFocus,
            onBlur,
            onKeyDown,
            onMouseDown,
            maxLength,
            name,
            type
        } = props;
        const nameSignal = useSignal(name);
        const [localValue, setLocalValue] = useState<string | undefined>(value);
        const [localError, setLocalError] = useState<string | undefined>();
        const [cursorLoc, setCursorLoc] = useState<null | number>(null);
        const inputRef = useRef<HTMLInputElement>(null);
        const propsRef = useRef({onChange});
        propsRef.current.onChange = onChange;

        useEffect(() => {
            nameSignal.set(name);
        }, [name, nameSignal]);

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        useEffect(() => {
            setLocalError(error);
        }, [error]);

        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(cursorLoc, cursorLoc);
            }
        }, [localValue, cursorLoc]);

        const formContext = useContext(FormContext);

        useSignalEffect(() => {
            const formValue = formContext?.value.get();
            const name = nameSignal.get();
            if (name && formValue && name in formValue) {
                let val = formValue[name];
                val = typeof val !== 'string' ? JSON.stringify(val) : val;
                setLocalValue(val as string);
            }
        })
        useSignalEffect(() => {
            const formError = formContext?.errors.get();
            const name = nameSignal.get();
            if (name && formError) {
                setLocalError(formError[name]);
            }
        })

        const style = {
            border: localError ? BORDER_ERROR : BORDER,
            padding: '0px 5px',
            borderRadius: 5,
            ...inputStyle,
        }
        if (style?.border === 'unset') {
            style.border = BORDER
        }

        return <Label label={label} ref={ref} style={defaultStyle} popup={props.popup}>
            <input
                ref={inputRef}
                name={name}
                value={localValue ?? ''}
                maxLength={maxLength}
                type={type}
                onChange={(e) => {
                    const val = e.target.value;
                    setCursorLoc(e.target.selectionStart);
                    if (name && formContext) {
                        const newFormVal = {...formContext.value.get()};
                        newFormVal[name] = val;
                        formContext.value.set(newFormVal);
                    } else {
                        if (onChange) {
                            onChange(val);
                        } else {
                            setLocalValue(val)
                        }
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
            {localError && <div style={{
                padding: '0 5px',
                fontSize: 'small',
                lineHeight: 1,
                color: '#C00000',
                textAlign: 'right'
            }}>{localError}</div>}
        </Label>
    }
);