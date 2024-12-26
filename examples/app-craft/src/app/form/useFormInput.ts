import {useContext, useEffect, useRef, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "./Form.tsx";


export function useFormInput<T, V>(props: {
    name?: string,
    value?: T,
    error?: string,
    disabled?: boolean,
    valueToLocalValue?: (val?: T) => (Promise<V | undefined> | V | undefined),
    onChange?:(value?:T) => void
}) {
    const {name, value, error, disabled, valueToLocalValue} = props;
    const nameSignal = useSignal(name);
    const [localValue, setLocalValue] = useState<V | undefined>(() => {
        if (valueToLocalValue) {
            const val = valueToLocalValue(value);
            if (val instanceof Promise) {
                return undefined;
            } else {
                return val;
            }
        }
        return value as V;
    });
    const [localError, setLocalError] = useState<string | undefined>(error);
    const [isDisabled, setIsDisabled] = useState<boolean>(disabled === true);
    const [isBusy, setIsBusy] = useState<boolean>(false);
    const formContext = useContext(FormContext);
    const propsRef = useRef({...props,localValue});
    propsRef.current = {...props,localValue};

    useEffect(() => {
        nameSignal.set(name);
    }, [nameSignal,name]);

    useEffect(() => {
        const {valueToLocalValue} = propsRef.current;
        if (valueToLocalValue) {
            const val = valueToLocalValue(value);
            if (val instanceof Promise) {
                val.then(setLocalValue)
            } else {
                setLocalValue(val);
            }
        } else {
            setLocalValue(value as V);
        }
    }, [value]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    useEffect(() => {
        setIsDisabled(disabled === true);
    }, [disabled]);

    useSignalEffect(() => {
        const formValue = formContext?.value.get();
        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const value = formValue[name] as T;
            const {valueToLocalValue} = propsRef.current;
            if (valueToLocalValue) {
                const val = valueToLocalValue(value);
                if (val instanceof Promise) {
                    val.then(setLocalValue)
                } else {
                    setLocalValue(val);
                }
            } else {
                setLocalValue(value as unknown as V);
            }
        }
    });

    useSignalEffect(() => {
        const formError = formContext?.errors.get();
        const name = nameSignal.get();
        if (name && formError) {
            setLocalError(formError[name]);
        }
    });

    useSignalEffect(() => {
        const isBusy = formContext !== undefined && formContext.isBusy.get();
        const isDisabled = formContext !== undefined && formContext.isDisabled.get();
        setIsBusy(isBusy);
        setIsDisabled(isDisabled);
    });

    const handleValueChange = (nextValue?: (T | ((current?:T) => T | undefined))) => {
        if (name && formContext) {
            const prevFormVal = formContext.value.get()[name] as T;
            let nextVal = nextValue as T;
            if(typeof nextValue === 'function'){
                const newValueFunction = nextValue as (current:T) => T
                nextVal = newValueFunction(prevFormVal);
            }
            const notMatch = JSON.stringify(prevFormVal) !== JSON.stringify(nextVal);
            if(notMatch){
                const newFormVal = { ...formContext.value.get(), [name]: nextVal };
                const errors = { ...formContext.errors.get() };
                delete errors[name];
                formContext.value.set(newFormVal);
                formContext.errors.set(errors);
            }
        } else if (propsRef.current.onChange) {
            let nVal = nextValue as T;
            if(typeof nextValue === 'function'){
                const newValueFunction = nextValue as (param?:T) => T
                nVal = newValueFunction(props.value);
            }
            propsRef.current.onChange(nVal);
        } else {
            const {valueToLocalValue} = propsRef.current;
            if (valueToLocalValue) {
                let nVal = nextValue as T;
                if(typeof nextValue === 'function'){
                    const newValueFunction = nextValue as (param?:T) => T
                    nVal = newValueFunction(props.value);
                }
                const val = valueToLocalValue(nVal);
                if (val instanceof Promise) {
                    val.then(setLocalValue)
                } else {
                    setLocalValue(val);
                }
            } else {
                setLocalValue(nextValue as V);
            }
        }
    };

    return {
        localValue,
        setLocalValue,
        localError,
        setLocalError,
        nameSignal,
        isDisabled,
        setIsDisabled,
        isBusy,
        setIsBusy,
        formContext,
        handleValueChange
    };
}

