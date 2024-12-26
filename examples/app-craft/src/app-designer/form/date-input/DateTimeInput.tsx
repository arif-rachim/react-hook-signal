import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {dateToString, format_ddMMMyyyy, toDate} from "../../../utils/dateFormat.ts";
import {DatePicker} from "./DatePicker.tsx";
import {Label} from "../label/Label.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {isDate} from "./isDate.ts";
import {FormContext} from "../Form.tsx";
import {useShowPopUp} from "../../hooks/useShowPopUp.tsx";
import {useForwardedRef} from "../../hooks/useForwardedRef.ts";
import {DivWithClickOutside} from "../../div-with-click-outside/DivWithClickOutside.tsx"
import {useAppContext} from "../../hooks/useAppContext.ts";
import {BORDER} from "../../Border.ts";

const ERROR_COLOR = '#C00000';
export const DateTimeInput = forwardRef(function DateTimeInput(props: {
    name?: string,
    value?: Date | string,
    onChange?: (value?: Date | string) => void,
    disabled?: boolean,
    label?: string,
    error?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, forwardedRef: ForwardedRef<HTMLLabelElement>) {
    const ref = useForwardedRef(forwardedRef);
    const {inputStyle, style, error, label, onChange, value, name, disabled} = props;
    const nameSignal = useSignal(name);
    const [localDate, setLocalDate] = useState<string | undefined>();
    const [localHour, setLocalHour] = useState<string | undefined>();
    const [localMinute, setLocalMinute] = useState<string | undefined>();
    const [localError, setLocalError] = useState<string | undefined>(error);
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({onChange, value});
    propsRef.current = {onChange, value};

    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);

    useEffect(() => {
        const result: Date | undefined = toDate(value);
        const date = result ? format_ddMMMyyyy(result) : undefined;
        const hour = result ? result.getHours().toString().padStart(2, '0') : undefined;
        const minutes = result ? result.getMinutes().toString().padStart(2, '0') : undefined;
        setLocalDate(date);
        setLocalHour(hour);
        setLocalMinute(minutes);
    }, [value]);

    const formContext = useContext(FormContext);

    useEffect(() => {
        const value = propsRef.current.value;
        const valueIsString = typeof value === 'string';
        if (localDate && localHour && localMinute
            && localDate.length >= '1-JAN-1970'.length
            && localHour.length == 2
            && localMinute.length == 2) {
            const date = new Date(localDate);
            const dateValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(localHour), parseInt(localMinute));
            if (isDate(dateValue)) {
                const shouldTriggerChange = value === undefined || (valueIsString &&  dateToString(dateValue) !== value) || (isDate(value) && dateToString(dateValue) !== dateToString(value));
                if (name && formContext && shouldTriggerChange) {
                    const newFormVal = {...formContext.value.get()};
                    newFormVal[name] = valueIsString ? dateToString(dateValue) : dateValue;
                    const errors = {...formContext.errors.get()};
                    delete errors[name];
                    formContext.value.set(newFormVal);
                    formContext.errors.set(errors)
                } else {
                    if (shouldTriggerChange && propsRef.current.onChange) {
                        propsRef.current.onChange(valueIsString ? dateToString(dateValue) : dateValue);
                    }
                    setLocalDate(format_ddMMMyyyy(dateValue));
                    setLocalHour(dateValue.getHours().toString().padStart(2, '0'));
                    setLocalMinute(dateValue.getMinutes().toString().padStart(2, '0'));
                }

            }
        }
    }, [formContext, localDate, localHour, localMinute, name]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);


    useSignalEffect(() => {
        const formValue = formContext?.value.get();
        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const value = formValue[name];
            let result: Date | undefined;
            if (value instanceof Date) {
                result = value;
            }
            if (typeof value === 'string') {
                result = new Date(value);
            }
            if (!isDate(result)) {
                result = undefined;
            }
            const date = result ? format_ddMMMyyyy(result) : undefined;
            const hour = result ? result.getHours().toString().padStart(2, '0') : undefined;
            const minutes = result ? result.getMinutes().toString().padStart(2, '0') : undefined;
            setLocalDate(date);
            setLocalHour(hour);
            setLocalMinute(minutes);
        }
    })
    const showPopup = useShowPopUp();
    const firstSegmentTimeRef = useRef<HTMLInputElement | undefined>();
    const secondSegmentTimeRef = useRef<HTMLInputElement | undefined>();
    const trapHowManyTimesUserTypeKeyDown = useRef(0);
    return <Label ref={ref} label={label} style={{...style, flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'flex-end'}}>
            <TextInput
                disabled={disabled}
                inputStyle={{
                    width: 90,
                    textAlign: 'center',
                    borderColor: localError ? ERROR_COLOR : 'rgba(0,0,0,0.1)',
                    ...inputStyle
                }}
                value={localDate}
                onChange={val => setLocalDate(val)}
                onFocus={async () => {
                    if (isDesignMode) {
                        return
                    }
                    const newDate = await showPopup<Date | false | undefined, HTMLLabelElement>(ref, (closePanel, commitLayout) => {
                        commitLayout();
                        return <DivWithClickOutside style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'white',
                            padding: 10,
                            marginTop: 1,
                            borderBottomRightRadius: 5,
                            borderBottomLeftRadius: 5,
                            width: 270,
                            boxShadow: '0px 10px 5px -3px rgba(0,0,0,0.5)'
                        }} onMouseDown={(e) => {
                            e.preventDefault()
                        }} onClickOutside={() => closePanel(false)}><DatePicker onChange={closePanel}
                                                                                value={localDate ? new Date(localDate) : undefined}/></DivWithClickOutside>
                    });
                    if (newDate === false) {
                        return;
                    }
                    setLocalDate(format_ddMMMyyyy(newDate));
                    if (firstSegmentTimeRef.current) {
                        firstSegmentTimeRef.current.focus();
                    }
                }}
            />
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput
                    disabled={disabled}
                    inputRef={firstSegmentTimeRef}
                    inputStyle={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderRight: 'unset',
                        textAlign: 'right',
                        borderColor: localError ? ERROR_COLOR : 'rgba(0,0,0,0.1)',
                        ...inputStyle
                    }}
                    value={localHour}
                    style={{width: 30}}
                    maxLength={2}
                    onChange={e => setLocalHour(e)}
                    onKeyUp={() => {
                        trapHowManyTimesUserTypeKeyDown.current += 1;
                        if (trapHowManyTimesUserTypeKeyDown.current === 2 && secondSegmentTimeRef.current) {
                            trapHowManyTimesUserTypeKeyDown.current = 0;
                            secondSegmentTimeRef.current.focus()
                            return;
                        }

                    }}
                />
                <div style={{borderTop: BORDER, borderBottom: BORDER,background:disabled?'rgba(0,0,0,0.05)':'unset'}}>
                    {':'}
                </div>
                <TextInput
                    disabled={disabled}
                    inputRef={secondSegmentTimeRef}
                    inputStyle={{
                        ...inputStyle,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: 'unset',
                        textAlign: 'left',
                        borderColor: localError ? ERROR_COLOR : 'rgba(0,0,0,0.1)'
                    }}
                    value={localMinute}
                    style={{width: 30}}
                    maxLength={2}
                    onChange={e => setLocalMinute(e)}
                />
            </div>
        </div>
        {localError && <div style={{
            padding: '0 5px',
            fontSize: 'small',
            lineHeight: 1,
            color: ERROR_COLOR,
            textAlign: 'right'
        }}>{localError}</div>}
    </Label>
})
