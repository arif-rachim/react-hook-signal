import {CSSProperties, ForwardedRef, forwardRef, useEffect, useRef} from "react";
import {TextInput} from "../text/TextInput.tsx";
import {dateToString, format_ddMMMyyyy, format_hhmm, toDate} from "../../../../core/utils/dateFormat.ts";
import {DatePicker} from "./DatePicker.tsx";
import {Label} from "../../Label.tsx";
import {isDate} from "./isDate.ts";
import {useShowPopUp} from "../../../../core/hooks/useShowPopUp.tsx";
import {useForwardedRef} from "../../../../core/hooks/useForwardedRef.ts";
import {DivWithClickOutside} from "../../../designer/components/DivWithClickOutside.tsx"
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {BORDER} from "../../../../core/style/Border.ts";
import {useFormInput} from "../../useFormInput.ts";

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
    const {localValue, setLocalValue, localError, formContext,handleValueChange} = useFormInput<typeof value, {
        date?: string,
        hour?: string,
        minute?: string
    }>({
        name,
        value,
        error,
        valueToLocalValue: param => {
            const result = toDate(param);
            const date = result ? format_ddMMMyyyy(result) : undefined;
            const hour = result ? format_hhmm(result).substring(0, 2) : undefined;
            const minute = result ? format_hhmm(result).substring(3, 5) : undefined;
            return {date, hour, minute}
        },
        onChange
    });
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({onChange, value});
    propsRef.current = {onChange, value};

    useEffect(() => {
        const value = propsRef.current.value;
        const valueIsString = typeof value === 'string';
        if (localValue && localValue.hour && localValue.minute && localValue.date
            && localValue.date.length >= '1-JAN-1970'.length
            && localValue.hour.length == 2
            && localValue.minute.length == 2) {
            const dateValue = toDate(`${localValue.date} ${localValue.hour}:${localValue.minute}`) as Date;
            if (isDate(dateValue)) {
                const shouldTriggerChange = value === undefined || (valueIsString && dateToString(dateValue) !== value) || (isDate(value) && dateToString(dateValue) !== dateToString(value));
                const val = valueIsString ? dateToString(dateValue) : dateValue;
                if(shouldTriggerChange){
                    handleValueChange(val);
                }
            }
        }
    }, [setLocalValue, formContext, localValue, name, handleValueChange]);

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
                value={localValue?.date}
                onChange={val => {
                    setLocalValue(prev => ({...prev, date: val}));
                }}
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
                                                                                value={toDate(localValue?.date)}/></DivWithClickOutside>
                    });
                    if (newDate === false) {
                        return;
                    }
                    setLocalValue(old => ({...old, date: format_ddMMMyyyy(newDate)}))
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
                    value={localValue?.hour}
                    style={{width: 30}}
                    maxLength={2}
                    onChange={e => setLocalValue(prev => ({...prev,hour:e}))}
                    onKeyUp={() => {
                        trapHowManyTimesUserTypeKeyDown.current += 1;
                        if (trapHowManyTimesUserTypeKeyDown.current === 2 && secondSegmentTimeRef.current) {
                            trapHowManyTimesUserTypeKeyDown.current = 0;
                            secondSegmentTimeRef.current.focus()
                            return;
                        }

                    }}
                />
                <div style={{
                    borderTop: BORDER,
                    borderBottom: BORDER,
                    background: disabled ? 'rgba(0,0,0,0.05)' : 'unset'
                }}>
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
                    value={localValue?.minute}
                    style={{width: 30}}
                    maxLength={2}
                    onChange={e => setLocalValue(prev => ({...prev,minute:e}))}
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
