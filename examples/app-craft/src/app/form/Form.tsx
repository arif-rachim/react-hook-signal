import {createContext, CSSProperties, ForwardedRef, forwardRef, LegacyRef, useEffect, useRef} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {Container} from "../designer/AppDesigner.tsx";
import {useContainerStyleHook} from "./container/useContainerStyleHook.ts";
import {useContainerLayoutHook} from "./container/useContainerLayoutHook.tsx";
import {ContainerRendererIdContext} from "../designer/panels/design/ContainerRenderer.tsx";
import {guid} from "../../core/utils/guid.ts";

type Validator = (params: {
    key: string,
    value: unknown,
    formValue: Record<string, unknown>
}) => Promise<string | undefined>;

export const Form = forwardRef(function Form(props: {
    value?: Record<string, unknown>,
    onChange?: (value: Record<string, unknown>, config: {
        errors: Signal.State<Record<string, string>>
    }) => Promise<void> | void,
    container: Container,
    decorator?: (newValue?: Record<string, unknown>, prevValue?: Record<string, unknown>) => Promise<Record<string, unknown>>,
    style: CSSProperties,
    disabled?: boolean,
    ["data-element-id"]: string
}, ref: ForwardedRef<HTMLFormElement>) {

    const {value, onChange, container, disabled, style, decorator} = props;
    const containerStyle = useContainerStyleHook(style);
    const {elements} = useContainerLayoutHook(container);

    const propsRef = useRef({onChange, decorator});
    propsRef.current = {onChange, decorator};
    const prevValueRef = useRef<Record<string, unknown> | undefined>(undefined);
    const localValue = useSignal<Record<string, unknown>>(structuredClone(value ?? {}));

    const errors = useSignal<Record<string, string>>({});
    const validators = useSignal<Record<string, Validator>>({});
    const isChanged = useSignal<boolean>(false);
    const isBusy = useSignal<boolean>(false);
    const isDisabled = useSignal<boolean>(disabled === true);


    const reset = () => {
        localValue.set(structuredClone(value ?? {}));
        isChanged.set(false);
    }

    const submit = async () => {
        isBusy.set(true);
        const isValid = await formIsValid();
        // await delay(100);
        if (!isValid) {
            return isBusy.set(false);
        }
        if (!propsRef.current.onChange) {
            isBusy.set(false);
            return;
        }
        await propsRef.current.onChange(localValue.get(), {errors});
        isChanged.set(false);
        isBusy.set(false);
    }
    const validateValue = (props: { key: string, value: unknown }) => {
        const validatorsValue = validators.get();
        const formValue = localValue.get();
        if (props.key in validatorsValue && validatorsValue[props.key]) {
            const validator = validatorsValue[props.key];
            return validator({...props, formValue})
        }
        return undefined;
    }

    const formIsValid = async () => {
        const formValue = localValue.get();
        const validatorsValue = validators.get();
        const errorsValue: Record<string, string> = {};
        const validatorKeys = Object.keys(validatorsValue);
        for (const key of validatorKeys) {
            if (key in formValue) {
                const value = formValue[key];
                const error = await validateValue({key, value});
                if (error) {
                    errorsValue[key] = error as string
                }
            }
        }
        errors.set(errorsValue);
        return Object.keys(errorsValue).length === 0;
    }

    useEffect(() => {
        isDisabled.set(disabled === true);
    }, [disabled, isDisabled]);

    useEffect(() => {
        localValue.set(structuredClone(value ?? {}));
        isChanged.set(false);
    }, [localValue, isChanged, value]);

    useSignalEffect(() => {
        const valPrev = prevValueRef.current;
        const valCurrent = localValue.get();
        (async () => {
            if (propsRef.current.decorator) {
                const valNext = await propsRef.current.decorator(valCurrent, valPrev);
                prevValueRef.current = valNext;
                if (valNext !== valCurrent) {
                    localValue.set(valNext);
                }
            }
        })();
    })

    return <ContainerRendererIdContext.Provider value={props["data-element-id"]}>
        <form ref={ref as LegacyRef<HTMLFormElement>}
              style={containerStyle}
              data-element-id={props["data-element-id"]}
              onSubmit={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  submit().then()
              }}
              onKeyDown={(e) => {
                  if (e.code.toUpperCase() === 'ENTER') {
                      submit().then()
                  }
              }}
              autoComplete={guid()}>
            <FormContext.Provider value={{
                value: localValue,
                initialValue: value ?? {},
                errors,
                validators,
                submit,
                reset,
                isChanged,
                formIsValid,
                validateValue,
                isBusy,
                isDisabled
            }}>
                {elements}
            </FormContext.Provider>
        </form>
    </ContainerRendererIdContext.Provider>
});

export const FormContext = createContext<{
    value: Signal.State<Record<string, unknown>>,
    initialValue: Record<string, unknown>,
    errors: Signal.State<Record<string, string>>,
    isChanged: Signal.State<boolean>,
    validators: Signal.State<Record<string, Validator>>,
    reset: () => void,
    submit: () => Promise<void>,
    formIsValid: () => Promise<boolean>
    validateValue: (params: { key: string, value: unknown }) => Promise<string | undefined> | undefined,
    isBusy: Signal.State<boolean>,
    isDisabled: Signal.State<boolean>
} | undefined>(undefined)

/*
function delay(milliSecond:number){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        },milliSecond);
    })
}
 */