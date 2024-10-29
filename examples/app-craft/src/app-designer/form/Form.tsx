import {createContext, CSSProperties, ForwardedRef, forwardRef, LegacyRef, PropsWithChildren, useEffect} from "react";
import {useSignal} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {Container} from "../AppDesigner.tsx";
import {useContainerStyleHook} from "./container/useContainerStyleHook.ts";
import {useContainerLayoutHook} from "./container/useContainerLayoutHook.tsx";
import {ContainerRendererIdContext} from "../panels/design/container-renderer/ContainerRenderer.tsx";

type Validator = (params: { key: string, value: unknown, formValue: Record<string, unknown> }) => string | undefined;

export const Form = forwardRef(function Form(props: PropsWithChildren<{
    value: Record<string, unknown>,
    onChange: (value: Record<string, unknown>) => void,
    container: Container,
    style: CSSProperties,
    ["data-element-id"]: string
}>, ref: ForwardedRef<HTMLDivElement>) {

    const {value, onChange, container, style} = props;

    const containerStyle = useContainerStyleHook(style);
    const {elements} = useContainerLayoutHook(container);


    const localValue = useSignal<Record<string, unknown>>(structuredClone(value));
    const errors = useSignal<Record<string, string>>({});
    const validators = useSignal<Record<string, Validator>>({});
    const isChanged = useSignal<boolean>(false);

    const resetValue = () => {
        localValue.set(structuredClone(value));
        isChanged.set(false);
    }

    const submit = () => {
        onChange(localValue.get());
        isChanged.set(false);
    }
    const formIsValid = () => {
        const formValue = localValue.get();
        const validatorsValue = validators.get();
        const errorsValue: Record<string, string> = {};
        Object.keys(validatorsValue).forEach(key => {
            if (key in formValue) {
                const value = formValue[key];
                const error = validatorsValue[key]({formValue, key, value})
                if (error) {
                    errorsValue[key] = error
                }
            }
        });
        errors.set(errorsValue);
        return Object.keys(errorsValue).length === 0;
    }
    useEffect(() => {
        localValue.set(structuredClone(value));
        isChanged.set(false);
    }, [localValue, isChanged, value]);
    return <ContainerRendererIdContext.Provider value={props["data-element-id"]}>
        <div ref={ref as LegacyRef<HTMLDivElement>}
             style={containerStyle}
             data-element-id={props["data-element-id"]}
        >
            <FormContext.Provider value={{
                value: localValue,
                initialValue: value,
                errors,
                validators,
                submit,
                resetValue,
                isChanged,
                formIsValid
            }}>
                {elements}
            </FormContext.Provider>
        </div>
    </ContainerRendererIdContext.Provider>
});

export const FormContext = createContext<{
    value: Signal.State<Record<string, unknown>>,
    initialValue: Record<string, unknown>,
    errors: Signal.State<Record<string, string>>,
    isChanged: Signal.State<boolean>,
    validators: Signal.State<Record<string, Validator>>,
    resetValue: () => void,
    submit: () => void,
    formIsValid: () => boolean
} | undefined>(undefined)

