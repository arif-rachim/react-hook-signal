import {BORDER, BORDER_ERROR} from "../../Border.ts";
import {
    CSSProperties,
    ForwardedRef,
    forwardRef,
    MutableRefObject,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
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
        onKeyDown?: (value: string) => void,
        onKeyUp?: (value: string) => void,
        onMouseDown?: () => void,
        label?: string,
        error?: string,
        style?: CSSProperties,
        inputStyle?: CSSProperties,
        maxLength?: number,
        disabled?: boolean,
        type?: 'text' | 'number' | 'password',
        allCaps?: boolean,
        inputRef?: MutableRefObject<HTMLInputElement|undefined>
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
            onKeyUp,
            onMouseDown,
            maxLength,
            name,
            type,
            allCaps,
            disabled,
        } = props;
        const nameSignal = useSignal(name);
        const [localValue, setLocalValue] = useState<string | undefined>(value);
        const [localError, setLocalError] = useState<string | undefined>();
        const [cursorLoc, setCursorLoc] = useState<null | number>(null);
        const [isBusy, setIsBusy] = useState<boolean>(false);
        const [isDisabled, setIsDisabled] = useState<boolean>(disabled === true);
        const localRef = useRef<HTMLInputElement | null>(null);
        const inputRef = props.inputRef ? props.inputRef : localRef;

        const inputDisabled = isDisabled || isBusy;
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
            setIsDisabled(disabled === true);
        }, [disabled]);

        useEffect(() => {
            if (inputRef.current && inputRef.current?.type !== 'number') {
                inputRef.current.setSelectionRange(cursorLoc, cursorLoc);
            }
        }, [inputRef,localValue, cursorLoc]);

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
            setIsBusy(isBusy);
            setIsDisabled(isDisabled);
        });
        const style = {
            border: localError ? BORDER_ERROR : BORDER,
            padding: '2px 5px 3px 5px',
            borderRadius: 5,
            backgroundColor: inputDisabled ? 'rgba(0,0,0,0.05)' : 'unset',
            flexGrow: 1,
            minWidth : 0,
            textAlign : type === 'number' ? 'right' : 'left',
            ...inputStyle,
        } as CSSProperties

        return <Label label={label} ref={ref} style={{minWidth:0,...defaultStyle}}>
            <input
                ref={inputRef as MutableRefObject<HTMLInputElement>}
                name={name}
                disabled={inputDisabled}
                value={localValue ?? ''}
                maxLength={maxLength}
                type={type}
                onChange={(e) => {
                    if (inputDisabled) {
                        return;
                    }
                    let val = getValue(e) ?? '';
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
                    }else {
                        inputRef.current?.select()
                    }
                }}
                onBlur={(e) => {
                    const val = e.target.value;
                    if (onBlur) {
                        onBlur(val);
                    }
                }}
                onKeyDown={(e) => {
                    const val = getValue(e) ?? '';
                    if (onKeyDown) {
                        onKeyDown(val)
                    }
                }}
                onKeyUp={(e) => {
                    const val = getValue(e) ?? '';
                    if (onKeyUp) {
                        onKeyUp(val)
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

function getValue(e: unknown): string | undefined {
    if (e && typeof e === 'object' && 'target' in e && e.target && typeof e.target === 'object' && 'value' in e.target) {
        return e.target.value as string;
    }
    return undefined;
}