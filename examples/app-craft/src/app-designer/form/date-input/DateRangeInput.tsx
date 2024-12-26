import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {dateToString, format_ddMMMyyyy, toDate} from "../../../utils/dateFormat.ts";
import {DateRangePicker} from "./DateRangePicker.tsx";
import {Label} from "../label/Label.tsx";
import {BORDER, BORDER_ERROR} from "../../Border.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {isDate} from "./isDate.ts";
import {FormContext} from "../Form.tsx";
import {TextInput} from "../text-input/TextInput.tsx";
import {useShowPopUp} from "../../hooks/useShowPopUp.tsx";
import {useForwardedRef} from "../../hooks/useForwardedRef.ts";
import {DivWithClickOutside} from "../../div-with-click-outside/DivWithClickOutside.tsx"
import {useAppContext} from "../../hooks/useAppContext.ts";

type RangeInput = { from: Date | string, to: Date | string };


function isString(val: unknown): val is string {
    return typeof val === 'string'
}

export const DateRangeInput = forwardRef(function DateRangeInput(props: {
    name?: string,
    value?: RangeInput,
    onChange?: (value?: RangeInput) => void,
    label?: string,
    error?: string,
    disabled?: boolean,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, forwardedRef: ForwardedRef<HTMLLabelElement>) {
    const ref = useForwardedRef(forwardedRef);
    const {inputStyle, style: defaultStyle, error, label, onChange, value, name, disabled} = props;
    const nameSignal = useSignal(name);
    const [localFrom, setLocalFrom] = useState<string | undefined>();
    const [localTo, setLocalTo] = useState<string | undefined>();
    const [localError, setLocalError] = useState<string | undefined>(error)
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({onChange, value});
    propsRef.current = {onChange, value};

    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);

    useEffect(() => {
        let from: string | undefined = undefined;
        let to: string | undefined = undefined;
        if (value && isDate(value.from)) {
            from = format_ddMMMyyyy(value.from);
        }
        if (value && isString(value.from)) {
            from = format_ddMMMyyyy(toDate(value.from));
        }
        if (value && isDate(value.to)) {
            to = format_ddMMMyyyy(value.to);
        }
        if (value && isString(value.to)) {
            to = format_ddMMMyyyy(toDate(value.to));
        }
        setLocalFrom(from);
        setLocalTo(to);
    }, [value]);

    const formContext = useContext(FormContext);

    useEffect(() => {
        const value = propsRef.current.value;
        if (localFrom && localTo && localFrom.length === '01-JAN-1970'.length && localTo.length === '01-JAN-1970'.length) {
            const fromIsString = isString(value?.from);
            const toIsString = isString(value?.to);
            const from = toDate(localFrom);
            const to = toDate(localTo);
            const fromIsChanged = value === undefined ||
                (fromIsString && dateToString(from) !== value.from) || (isDate(value.from) && dateToString(from) !== dateToString(value.from));
            const toIsChanged = value === undefined ||
                (toIsString && dateToString(to) !== value.to) || (isDate(value.to) && dateToString(to) !== dateToString(value.to));
            const shouldTriggerChange = fromIsChanged || toIsChanged;

            if (name && formContext && shouldTriggerChange) {
                const newFormVal = {...formContext.value.get()};
                newFormVal[name] = {
                    from: fromIsString ? dateToString(from) : from,
                    to: toIsString ? dateToString(to) : to
                };
                const errors = {...formContext.errors.get()};
                delete errors[name];
                formContext.value.set(newFormVal);
                formContext.errors.set(errors)
            } else {
                if (shouldTriggerChange && propsRef.current.onChange) {
                    if (from && to) {
                        const fromString = dateToString(from)!;
                        const toString = dateToString(from)!;
                        propsRef.current.onChange({
                            from: fromIsString ? fromString : from,
                            to: toIsString ? toString : to
                        });
                    }
                }
                setLocalFrom(format_ddMMMyyyy(from));
                setLocalTo(format_ddMMMyyyy(to));
            }
        }
    }, [formContext, localFrom, localTo, name]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);


    useSignalEffect(() => {
        const formValue = formContext?.value.get();
        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const value = formValue[name] as { from: string | Date, to: string | Date };
            let from: string | undefined = undefined;
            let to: string | undefined = undefined;
            if (value && isDate(value.from)) {
                from = format_ddMMMyyyy(value.from);
            }
            if (value && isString(value.from)) {
                from = format_ddMMMyyyy(new Date(value.from));
            }
            if (value && isDate(value.to)) {
                to = format_ddMMMyyyy(value.to);
            }
            if (value && isString(value.to)) {
                to = format_ddMMMyyyy(new Date(value.to));
            }
            setLocalFrom(from);
            setLocalTo(to);
        }
    })

    const style = {
        border: error ? BORDER_ERROR : BORDER,
        padding: '0px 5px',
        borderRadius: 5,
        width: 90,
        textAlign: 'center',
        ...inputStyle
    } as CSSProperties
    if (style?.border === 'unset') {
        style.border = BORDER
    }

    const showPopup = useShowPopUp();
    const onFocus = async () => {
        if (isDesignMode) {
            return;
        }
        const newDate = await showPopup<{
            from: Date,
            to: Date
        } | false, HTMLLabelElement>(ref, (closePanel, commitLayout) => {
            commitLayout();
            return <DivWithClickOutside style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                padding: 10,
                marginTop: 1,
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
                width: 500,
                boxShadow: '0px 10px 5px -3px rgba(0,0,0,0.5)'
            }} onClickOutside={() => closePanel(false)}>
                <DateRangePicker onChange={closePanel}
                                 value={{from: new Date(localFrom ?? ''), to: new Date(localTo ?? '')}}/>
            </DivWithClickOutside>
        });
        if (newDate === false) {
            return;
        }
        setLocalFrom(format_ddMMMyyyy(newDate.from));
        setLocalTo(format_ddMMMyyyy(newDate.to));
    }
    return <Label label={label} ref={ref} style={defaultStyle}>
        <div style={{display: 'flex', gap: 10}}>
            <TextInput
                disabled={disabled}
                value={localFrom}
                onChange={val => setLocalFrom(val)}
                inputStyle={style}
                onFocus={onFocus}

            />
            <TextInput
                disabled={disabled}
                value={localTo}
                onChange={val => setLocalTo(val)}
                inputStyle={style}
                onFocus={onFocus}
            />
        </div>

        {localError && <div style={{
            padding: '0 5px',
            fontSize: 'small',
            lineHeight: 1,
            color: '#C00000',
            textAlign: 'right'
        }}>{localError}</div>}
    </Label>

})