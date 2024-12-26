import {CSSProperties, ForwardedRef, forwardRef} from "react";
import {ImCheckboxChecked, ImCheckboxUnchecked} from "react-icons/im";
import {useFormInput} from "../../useFormInput.ts";

export const CheckboxInput = forwardRef(function CheckboxInput(props: {
    name?: string,
    value?: boolean,
    label?: string,
    onChange?: (params?: boolean) => void,
    style: CSSProperties,
    error?: string,
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {name, value, onChange, error, label, style} = props;
    const {localValue, localError, handleValueChange} = useFormInput<typeof value, typeof value>({
        name,
        value,
        error,
        onChange
    });

    return <label ref={ref} style={{display: 'flex', flexDirection: 'column', ...style}}
                  onClick={() => {
                      handleValueChange(!localValue);
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
                         handleValueChange(!localValue);
                     }
                 }}>

                {localValue && <ImCheckboxChecked style={{fontSize: 14, color: 'rgba(0,0,0,0.7)'}}/>}
                {!localValue && <ImCheckboxUnchecked style={{fontSize: 14, color: 'rgba(0,0,0,0.7)'}}/>}
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