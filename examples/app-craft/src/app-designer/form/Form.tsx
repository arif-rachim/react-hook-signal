import {createContext, CSSProperties, ForwardedRef, forwardRef, LegacyRef, PropsWithChildren, useEffect} from "react";
import {useSignal} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {Container} from "../AppDesigner.tsx";
import {useContainerStyleHook} from "./container/useContainerStyleHook.ts";
import {useContainerLayoutHook} from "./container/useContainerLayoutHook.tsx";
import {ContainerRendererIdContext} from "../panels/design/container-renderer/ContainerRenderer.tsx";

type Validator = (params: {
    key: string,
    value: unknown,
    formValue: Record<string, unknown>
}) => Promise<string | undefined>;

export const Form = forwardRef(function Form(props: PropsWithChildren<{
    value: Record<string, unknown>,
    onChange: (value: Record<string, unknown>) => void,
    container: Container,
    style: CSSProperties,
    ["data-element-id"]: string
}>, ref: ForwardedRef<HTMLFormElement>) {

    const {value, onChange, container, style} = props;
    const containerStyle = useContainerStyleHook(style);
    const {elements} = useContainerLayoutHook(container);


    const localValue = useSignal<Record<string, unknown>>(structuredClone(value));
    const errors = useSignal<Record<string, string>>({});
    const validators = useSignal<Record<string, Validator>>({});
    const isChanged = useSignal<boolean>(false);

    const reset = () => {
        localValue.set(structuredClone(value));
        isChanged.set(false);
    }

    const submit = async () => {
        const isValid = await formIsValid();
        if (!isValid) {
            return;
        }
        onChange(localValue.get());
        isChanged.set(false);
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
                    errorsValue[key] = error
                }
            }
        }
        errors.set(errorsValue);
        return Object.keys(errorsValue).length === 0;
    }
    useEffect(() => {
        localValue.set(structuredClone(value));
        isChanged.set(false);
    }, [localValue, isChanged, value]);
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
                  if(e.code.toUpperCase() === 'ENTER') {
                      submit().then()
                  }
              }}
        >
            <FormContext.Provider value={{
                value: localValue,
                initialValue: value,
                errors,
                validators,
                submit,
                reset,
                isChanged,
                formIsValid,
                validateValue
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
    validateValue: (params: { key: string, value: unknown }) => Promise<string | undefined> | undefined

} | undefined>(undefined)

