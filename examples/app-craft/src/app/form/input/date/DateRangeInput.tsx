import {CSSProperties, ForwardedRef, forwardRef, useEffect, useRef} from "react";
import {dateToString, format_ddMMMyyyy, toDate} from "../../../../core/utils/dateFormat.ts";
import {DateRangePicker} from "./DateRangePicker.tsx";
import {Label} from "../../Label.tsx";
import {BORDER, BORDER_ERROR} from "../../../../core/style/Border.ts";
import {isDate} from "./isDate.ts";
import {TextInput} from "../text/TextInput.tsx";
import {useShowPopUp} from "../../../../core/hooks/useShowPopUp.tsx";
import {useForwardedRef} from "../../../../core/hooks/useForwardedRef.ts";
import {DivWithClickOutside} from "../../../designer/components/DivWithClickOutside.tsx"
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useFormInput} from "../../useFormInput.ts";

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
    const {handleValueChange, localValue, setLocalValue, localError, formContext} = useFormInput<RangeInput, {from?:string,to?:string}>({
        name,
        value,
        error,
        valueToLocalValue: value => {
            return {from:format_ddMMMyyyy(value?.from),to:format_ddMMMyyyy(value?.to)}
        },
        onChange
    });
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({onChange, value});
    propsRef.current = {onChange, value};


    useEffect(() => {
        const value = propsRef.current.value;
        if (localValue && localValue.from && localValue.from.length === '01-JAN-1970'.length && localValue.to && localValue.to.length === '01-JAN-1970'.length) {
            const fromIsString = isString(value?.from);
            const toIsString = isString(value?.to);
            const from = toDate(localValue.from);
            const to = toDate(localValue.to);
            const fromIsChanged = value === undefined ||
                (fromIsString && dateToString(from) !== value.from) || (isDate(value.from) && dateToString(from) !== dateToString(value.from));
            const toIsChanged = value === undefined ||
                (toIsString && dateToString(to) !== value.to) || (isDate(value.to) && dateToString(to) !== dateToString(value.to));
            const shouldTriggerChange = fromIsChanged || toIsChanged;
            const val = {
                from: (fromIsString ? dateToString(from) : from) as string,
                to: (toIsString ? dateToString(to) : to) as string
            };
            if(shouldTriggerChange){
                handleValueChange(val);
            }
        }
    }, [setLocalValue, formContext, localValue, name, handleValueChange]);


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
                                 value={{from: toDate(localValue?.from) as Date, to: toDate(localValue?.to) as Date}}/>
            </DivWithClickOutside>
        });
        if (newDate === false) {
            return;
        }
        setLocalValue({from:format_ddMMMyyyy(newDate.from),to:format_ddMMMyyyy(newDate.to)})
    }
    return <Label label={label} ref={ref} style={defaultStyle}>
        <div style={{display: 'flex', gap: 10}}>
            <TextInput
                disabled={disabled}
                value={localValue?.from}
                onChange={val => {
                    setLocalValue(old => ({...old,from:val}))
                }}
                inputStyle={style}
                onFocus={onFocus}

            />
            <TextInput
                disabled={disabled}
                value={localValue?.to}
                onChange={val => {
                    setLocalValue(old => ({...old,to:val}))
                }}
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