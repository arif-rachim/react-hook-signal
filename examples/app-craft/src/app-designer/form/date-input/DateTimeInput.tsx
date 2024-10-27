import {CSSProperties, ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {format_ddMMMyyyy} from "../../../utils/dateFormat.ts";
import {DatePicker} from "./DatePicker.tsx";

const ERROR_COLOR = '#C00000';
export const DateTimeInput = forwardRef(function DateTimeInput(props: {
    value?: Date | string,
    onChange?: (value?: Date | string) => void,
    label?: string,
    errorMessage?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, ref: ForwardedRef<HTMLDivElement>) {
    const {inputStyle, style, errorMessage, label, onChange, value} = props;


    const {date, hour, minutes} = useMemo(() => {
        let result: Date | undefined;
        if (value instanceof Date) {
            result = value;
        }
        if (typeof value === 'string') {
            result = new Date(value);
        }
        if (!result || isNaN(result.getDate())) {
            return {date: undefined, hour: undefined, minutes: undefined};
        }
        const date = format_ddMMMyyyy(result);
        const hour = result.getHours().toString().padStart(2, '0');
        const minutes = result.getMinutes().toString().padStart(2, '0');
        return {date, hour, minutes};
    }, [value]);

    const propsRef = useRef({onChange});
    propsRef.current.onChange = onChange;
    const [localDate, setLocalDate] = useState<string | undefined>();
    const [localHour, setLocalHour] = useState<string | undefined>();
    const [localMinute, setLocalMinute] = useState<string | undefined>();

    useEffect(() => {
        if (propsRef.current.onChange && localDate && localHour && localMinute
            && localDate.length >= '1-JAN-1970'.length
            && localHour.length == 2
            && localMinute.length == 2) {
            const date = new Date(localDate);
            const dateValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(localHour), parseInt(localMinute));
            if (!isNaN(dateValue.getDate())) {
                propsRef.current.onChange(dateValue.toISOString());
                setLocalDate(format_ddMMMyyyy(dateValue));
                setLocalHour(dateValue.getHours().toString().padStart(2, '0'));
                setLocalMinute(dateValue.getMinutes().toString().padStart(2, '0'));
            }
        }
    }, [localDate, localHour, localMinute]);
    useEffect(() => {
        setLocalDate(date);
        setLocalHour(hour);
        setLocalMinute(minutes);
    }, [date, hour, minutes]);
    const element = <div style={{
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
    }}><DatePicker onChange={(newDate) => {
        if (onChange && localHour && localMinute && newDate) {
            const dateValue = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), parseInt(localHour), parseInt(localMinute));
            if (!isNaN(dateValue.getDate())) {
                onChange(dateValue.toISOString());
            }
        } else {
            setLocalDate(format_ddMMMyyyy(newDate));
        }
        setShowPopup(false);
    }} value={localDate ? new Date(localDate) : undefined}/></div>;

    const [showPopup, setShowPopup] = useState(false);
    return <div ref={ref} style={{...style, flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'flex-end'}}>
            <TextInput
                popup={{position: 'bottom', element, visible: showPopup}}
                inputStyle={{...inputStyle, width: 85, borderColor: errorMessage ? ERROR_COLOR : 'rgba(0,0,0,0.1)'}}
                label={label}
                value={localDate}
                onChange={val => setLocalDate(val)}
                onFocus={() => setShowPopup(true)}
                onBlur={() => setShowPopup(false)}
                onMouseDown={() => setShowPopup(true)}
                onKeyDown={() => setShowPopup(false)}
            />
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <TextInput
                    inputStyle={{
                        ...inputStyle,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderRight: 'unset',
                        textAlign: 'right',
                        borderColor: errorMessage ? ERROR_COLOR : 'rgba(0,0,0,0.1)'
                    }}
                    value={localHour}
                    style={{width: 30}}
                    maxLength={2}
                    onChange={e => setLocalHour(e)}
                />
                <TextInput
                    inputStyle={{
                        ...inputStyle,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: 'unset',
                        textAlign: 'left',
                        borderColor: errorMessage ? ERROR_COLOR : 'rgba(0,0,0,0.1)'
                    }}
                    value={localMinute}
                    style={{width: 30}}
                    maxLength={2}
                    onChange={e => setLocalMinute(e)}
                />
            </div>
        </div>
        {errorMessage && <div style={{
            padding: '0 5px',
            fontSize: 'small',
            lineHeight: 1,
            color: ERROR_COLOR,
            textAlign: 'right'
        }}>{errorMessage}</div>}
    </div>
})