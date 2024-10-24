import {CSSProperties, ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {format_ddMMMyyyy} from "../../../utils/dateFormat.ts";
import {DatePicker} from "./DatePicker.tsx";

export const DateInput = forwardRef(function DateInput(props: {
    value?: Date | string,
    onChange?: (value?: Date | string) => void,
    label?: string,
    errorMessage?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {inputStyle, style, errorMessage, label, onChange, value} = props;

    const date = useMemo(() => {
        let result: Date | undefined;
        if (value instanceof Date) {
            result = value;
        }
        if (typeof value === 'string') {
            result = new Date(value);
        }
        if (!result || isNaN(result.getDate())) {
            return undefined;
        }
        return result;
    }, [value]);

    const [localValue, setLocalValue] = useState(date);
    useEffect(() => {
        setLocalValue(date);
    }, [date]);
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
        if (onChange) {
            if (typeof value === 'string') {
                onChange(format_ddMMMyyyy(newDate));
            } else {
                onChange(newDate);
            }
        } else {
            setLocalValue(newDate);
        }
        setShowPopup(false);
    }} value={localValue}/></div>;

    const [showPopup, setShowPopup] = useState(false);
    const mutableRef = useRef({userIsChangingData: false});
    return <TextInput ref={ref}
                      popup={{position: 'bottom', element, visible: showPopup}}
                      inputStyle={inputStyle}
                      style={style}
                      errorMessage={errorMessage}
                      label={label}
                      value={format_ddMMMyyyy(localValue)}
                      onFocus={() => {
                          setShowPopup(true);
                      }}
                      onBlur={(newVal) => {
                          if (mutableRef.current.userIsChangingData) {
                              mutableRef.current.userIsChangingData = false;
                              const date = new Date(newVal);
                              const isValid = !isNaN(date.getDate());
                              if(isValid){
                                  if (onChange) {
                                      if (typeof value === 'string') {
                                          onChange(format_ddMMMyyyy(date));
                                      } else {
                                          onChange(date);
                                      }
                                  } else {
                                      setLocalValue(date);
                                  }
                              }
                          }
                          setShowPopup(false);
                      }}
                      onKeyDown={() => {
                          mutableRef.current.userIsChangingData = true;
                      }}
                      onMouseDown={() => setShowPopup(true)}
    />
})