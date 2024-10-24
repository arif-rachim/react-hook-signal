import {CSSProperties, ForwardedRef, forwardRef, useEffect, useMemo, useState} from "react";
import {format_ddMMMyyyy} from "../../../utils/dateFormat.ts";
import {DateRangePicker} from "./DateRangePicker.tsx";
import {Label} from "../label/Label.tsx";
import {BORDER, BORDER_ERROR} from "../../Border.ts";

type RangeInput = { from: Date | string, to: Date | string };

function isDate(val:unknown):val is Date{
    return val instanceof Date
}
function isString(val:unknown):val is string{
    return typeof val === 'string'
}

export const DateRangeInput = forwardRef(function DateRangeInput(props: {
    value?: RangeInput,
    onChange?: (value?: RangeInput) => void,
    label?: string,
    errorMessage?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {inputStyle, style: defaultStyle, errorMessage, label, onChange, value} = props;

    const dateRange = useMemo(() => {
        const result: { from?: Date, to?: Date } = {};
        if (isDate(value?.from)) {
            result.from = value?.from as Date;
        } else if (isString(value?.from)) {
            result.from = new Date(value?.from as string);
        } else if (!result.from || isNaN(result.from.getDate())) {
            return undefined;
        }
        if (isDate(value?.to)) {
            result.to = value?.to as Date;
        } else if (isString(value?.to)) {
            result.to = new Date(value?.to as string);
        } else if (!result.to || isNaN(result.to.getDate())) {
            return undefined
        }
        return result;
    }, [value]);

    const [localValue, setLocalValue] = useState<{ from?: Date, to?: Date }|undefined>(dateRange);
    useEffect(() => {
        setLocalValue(dateRange);
    }, [dateRange]);
    const element = <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        padding: 10,
        marginTop: 1,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        width: 500,
        boxShadow: '0px 10px 5px -3px rgba(0,0,0,0.5)'
    }} onMouseDown={(e) => {
        e.preventDefault()
    }}>
        <DateRangePicker onChange={(newDate) => {
            if (onChange) {
                if(newDate) {
                    onChange({
                        from : isString(value?.from) ? newDate.from.toISOString() : newDate.from,
                        to : isString(value?.to) ? newDate.to.toISOString() : newDate.to
                    });
                }else {
                    onChange();
                }
            } else {
                setLocalValue(newDate);
            }
            setShowPopup(false);
        }} value={localValue as { from: Date, to: Date }}/>
    </div>;

    const [showPopup, setShowPopup] = useState(false);

    const style = {
        ...inputStyle,
        border: errorMessage ? BORDER_ERROR : BORDER,
        padding: '0px 5px',
        borderRadius: 5,
        width: '50%'
    }
    if (style?.border === 'unset') {
        style.border = BORDER
    }

    return <Label label={label} ref={ref} style={defaultStyle}
                  popup={{position: 'bottom', element, visible: showPopup}}>
        <div style={{display: 'flex', gap: 5}}>
            <input
                value={format_ddMMMyyyy(localValue?.from)}
                onFocus={() => setShowPopup(true)}
                style={style}
            />
            <input
                value={format_ddMMMyyyy(localValue?.to)}
                onFocus={() => setShowPopup(true)}
                style={style}
            />
        </div>

        {errorMessage && <div style={{
            padding: '0 5px',
            fontSize: 'small',
            lineHeight: 1,
            color: '#C00000',
            textAlign: 'right'
        }}>{errorMessage}</div>}
    </Label>

})