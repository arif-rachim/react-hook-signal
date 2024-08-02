import {AnySignal, effect, useSignal, useSignalEffect} from "react-hook-signal";
import {Dispatch, SetStateAction, useEffect} from "react";
import {Container} from "../../../../AppDesigner.tsx";
import {useRecordErrorMessage} from "../../../../hooks/useRecordErrorMessage.ts";
import {useNavigateSignal} from "../../../../hooks/useNavigateSignal.tsx";
import {useAppContext} from "../../../../hooks/useAppContext.ts";
import {AppViewerContext} from "../../../../../app-viewer/AppViewerContext.ts";

export function PropertyInitialization(props: {
    container: Container,
    setComponentProps: Dispatch<SetStateAction<Record<string, unknown>>>,
}) {
    const context = useAppContext<AppViewerContext>();

    const {container, setComponentProps} = props;
    const {allVariablesSignalInstance, allVariablesSignal, elements: elementsLib} = context;
    const {property} = elementsLib[container.type];
    const errorMessage = useRecordErrorMessage();
    const propertiesSignal = useSignal(container.properties);
    const navigateSignal = useNavigateSignal();
    useEffect(() => {
        propertiesSignal.set(container.properties)
    }, [container.properties, propertiesSignal]);

    useSignalEffect(() => {
        const containerProperties = propertiesSignal.get();
        const destroyerCallbacks: Array<() => void> = [];
        for (const containerPropKey of Object.keys(containerProperties)) {
            const containerProp = containerProperties[containerPropKey];
            const returnType = property[containerPropKey];
            const destroyer = effect(() => {
                const allVariablesInstance = allVariablesSignalInstance.get();
                const allVariables = allVariablesSignal.get();
                const navigate = navigateSignal.get();
                const propDependencies = (containerProp.dependencies ?? []).map(d => allVariablesInstance.find(v => v.id === d)?.instance).filter(i => i !== undefined) as Array<AnySignal<unknown>>;
                const propDependenciesName = (containerProp.dependencies ?? []).map(d => allVariables.find(v => v.id === d)?.name).filter(i => i !== undefined) as Array<string>;

                const funcParams = ['module', 'navigate', ...propDependenciesName, containerProp.formula] as Array<string>;
                propDependencies.forEach(p => p.get());
                const module: { exports: unknown } = {exports: {}};
                try {
                    const fun = new Function(...funcParams);
                    const funcParamsInstance = [module, navigate, ...propDependencies];
                    fun.call(null, ...funcParamsInstance);
                    errorMessage.propertyValue({propertyName: containerPropKey, containerId: container.id});
                } catch (err) {
                    errorMessage.propertyValue({propertyName: containerPropKey, containerId: container.id, err});
                }
                if (returnType) {
                    try {
                        returnType.parse(module.exports)
                        errorMessage.propertyValidation({
                            propertyName: containerPropKey,
                            containerId: container.id,
                        })
                    } catch (err) {
                        errorMessage.propertyValidation({
                            propertyName: containerPropKey,
                            containerId: container.id,
                            err
                        })
                    }
                }
                if (typeof module.exports === 'function') {
                    const originalFunction = module.exports as (...args: unknown[]) => unknown
                    const wrapper = (...args: unknown[]) => {
                        try {
                            const result = originalFunction.call(null, ...args);
                            errorMessage.propertyInvocation({
                                containerId: container.id,
                                propertyName: containerPropKey
                            });
                            return result;
                        } catch (err) {
                            errorMessage.propertyInvocation({
                                propertyName: containerPropKey,
                                containerId: container.id,
                                err
                            })
                        }
                    }
                    setComponentProps(props => ({...props, [containerPropKey]: wrapper}))
                } else {
                    setComponentProps(props => ({...props, [containerPropKey]: module.exports}))
                }
            })
            destroyerCallbacks.push(destroyer);
        }
        return () => {
            destroyerCallbacks.forEach(d => d());
        }
    });
    return <></>
}