import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "../Form.tsx";
import {IoIosRadioButtonOff, IoIosRadioButtonOn} from "react-icons/io";

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

    const nameSignal = useSignal(name);
    const [localValue, setLocalValue] = useState<string>();
    const [localError, setLocalError] = useState<string | undefined>();

    const propsRef = useRef({onChange});
    propsRef.current = {onChange};

    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);

    useEffect(() => {
        setLocalValue(value)
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
            setLocalValue(val as string);
        }
    })

    useSignalEffect(() => {
        const formError = formContext?.errors.get();
        const name = nameSignal.get();
        if (name && formError) {
            setLocalError(formError[name]);
        }
    })
    const isSelected = valueMatcher === localValue;
    return <label ref={ref} style={{display: 'flex', flexDirection: 'column', ...style}}
                  onClick={() => {
                      if (name && formContext) {
                          const newFormVal = {...formContext.value.get()};
                          newFormVal[name] = valueMatcher;
                          const errors = {...formContext.errors.get()};
                          delete errors[name];
                          formContext.value.set(newFormVal);
                          formContext.errors.set(errors)
                      } else {
                          if (onChange) {
                              onChange(valueMatcher);
                          } else {
                              setLocalValue(valueMatcher ?? '')
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
                         if (name && formContext) {
                             const newFormVal = {...formContext.value.get()};
                             newFormVal[name] = valueMatcher;
                             const errors = {...formContext.errors.get()};
                             delete errors[name];
                             formContext.value.set(newFormVal);
                             formContext.errors.set(errors)
                         } else {
                             if (onChange) {
                                 onChange(valueMatcher);
                             } else {
                                 setLocalValue(valueMatcher ?? '')
                             }
                         }
                     }
                 }}>
                {isSelected && <IoIosRadioButtonOn style={{fontSize: 18,color:'rgba(0,0,0,0.7)'}}/>}
                {!isSelected && <IoIosRadioButtonOff style={{fontSize: 18,color:'rgba(0,0,0,0.7)'}}/>}
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