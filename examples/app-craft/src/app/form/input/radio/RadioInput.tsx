import {CSSProperties, ForwardedRef, forwardRef} from "react";
import {IoIosRadioButtonOff, IoIosRadioButtonOn} from "react-icons/io";
import {useFormInput} from "../../useFormInput.ts";

export const RadioInput = forwardRef(function RadioInput(props: {
    name?: string,
    value?: string,
    valueMatcher?: string,
    label?: string,
    onChange?: (params?: string) => void,
    style: CSSProperties,
    error?: string,
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {name, value, onChange, valueMatcher, error, label, style} = props;
    const {localValue,  localError, handleValueChange} = useFormInput({
        name,
        value,
        error,
        onChange
    });

    const isSelected = valueMatcher === localValue;
    return <label ref={ref} style={{display: 'flex', flexDirection: 'column', ...style}}
                  onClick={() => {
                      handleValueChange(valueMatcher);
                  }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: localError ? 'red' : '#333'
            }} tabIndex={0}
                 onKeyDown={(key) => {
                     if (key.code.toUpperCase() === 'ENTER') {
                         handleValueChange(valueMatcher);
                     }
                 }}>
                {isSelected && <IoIosRadioButtonOn style={{fontSize: 18, color: 'rgba(0,0,0,0.7)'}}/>}
                {!isSelected && <IoIosRadioButtonOff style={{fontSize: 18, color: 'rgba(0,0,0,0.7)'}}/>}
            </div>
            {label && <div style={{paddingBottom: 2}}>
                {label}
            </div>}
        </div>
        {localError && <div style={{textAlign: 'right', color: 'red'}}>
            {localError}
        </div>}
    </label>
})