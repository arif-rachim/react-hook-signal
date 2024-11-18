import {BORDER, BORDER_ERROR} from "../../Border.ts";
import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {Label} from "../label/Label.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "../Form.tsx";
import {guid} from "../../../utils/guid.ts";

export const TextInput = forwardRef(function TextInput(props: {
        name?: string,
        value?: string,
        onChange?: (value: string) => void,
        onFocus?: () => void,
        onBlur?: (value: string) => void,
        onKeyDown?: () => void,
        onMouseDown?: () => void,
        label?: string,
        error?: string,
        style?: CSSProperties,
        inputStyle?: CSSProperties,
        maxLength?: number,
        type?: 'text' | 'number' | 'password',
        allCaps?: boolean
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
            type,
            allCaps
        } = props;
        const nameSignal = useSignal(name);
        const [localValue, setLocalValue] = useState<string | undefined>(value);
        const [localError, setLocalError] = useState<string | undefined>();
        const [cursorLoc, setCursorLoc] = useState<null | number>(null);
        const [isBusy, setIsBusy] = useState<boolean>(false);
        const inputRef = useRef<HTMLInputElement | null>(null);

        const propsRef = useRef({onChange});
        propsRef.current = {onChange};

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
            if (inputRef.current && inputRef.current?.type !== 'number') {
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

        useSignalEffect(() => {
            const isBusy = formContext !== undefined && formContext.isBusy.get();
            const isDisabled = formContext !== undefined && formContext.isDisabled.get();
            setIsBusy(isBusy || isDisabled)
        });
        const style = {
            border: localError ? BORDER_ERROR : BORDER,
            padding: '2px 5px 3px 5px',
            borderRadius: 5,
            opacity: isBusy ? 0.8 : 1,
            flexGrow: 1,
            ...inputStyle,
        }

        return <Label label={label} ref={ref} style={defaultStyle}>
            <input
                ref={inputRef}
                name={name}
                disabled={isBusy}
                value={localValue ?? ''}
                maxLength={maxLength}
                type={type}
                onChange={(e) => {
                    let val = e.target.value;
                    if (allCaps !== false && type !== 'password') {
                        val = val.toUpperCase();
                    }
                    setCursorLoc(e.target.selectionStart);
                    if (name && formContext) {
                        const newFormVal = {...formContext.value.get()};
                        newFormVal[name] = val;
                        const errors = {...formContext.errors.get()};
                        delete errors[name];
                        formContext.value.set(newFormVal);
                        formContext.errors.set(errors)
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
                autoComplete={guid()}
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