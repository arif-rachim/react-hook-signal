import {useContext, useEffect, useRef, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "./Form";


export function useFormInput<T, V>(props: {
    name?: string,
    value?: T,
    error?: string,
    disabled?: boolean,
    valueToLocalValue?: (val?: T) => (Promise<V | undefined> | V | undefined)
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
    const propsRef = useRef(props);
    propsRef.current = props;

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
        formContext
    };
}

