import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "../Form.tsx";
import {ImCheckboxChecked, ImCheckboxUnchecked} from "react-icons/im";

export const CheckboxInput = forwardRef(function CheckboxInput(props: {
    name?: string,
    value?: boolean,
    label?: string,
    onChange?: (params?: boolean) => void,
    style: CSSProperties,
    error?: string,
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {name, value, onChange, error, label, style} = props;

    const nameSignal = useSignal(name);
    const [localValue, setLocalValue] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>();

    const propsRef = useRef({onChange});
    propsRef.current = {onChange};

    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);

    useEffect(() => {
        setLocalValue(value === true)
    }, [value]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    const formContext = useContext(FormContext);

    useSignalEffect(() => {
        const formValue = formContext?.value.get();
        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const val = formValue[name];
            setLocalValue(val as boolean);
        }
    })

    useSignalEffect(() => {
        const formError = formContext?.errors.get();
        const name = nameSignal.get();
        if (name && formError) {
            setLocalError(formError[name]);
        }
    })

    return <label ref={ref} style={{display: 'flex', flexDirection: 'column', ...style}}
                  onClick={() => {
                      const val = !localValue;
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
                         const val = !localValue;
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
                     }
                 }}>

                {localValue && <ImCheckboxChecked style={{fontSize: 14,color:'rgba(0,0,0,0.7)'}}/>}
                {!localValue && <ImCheckboxUnchecked style={{fontSize: 14,color:'rgba(0,0,0,0.7)'}}/>}
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