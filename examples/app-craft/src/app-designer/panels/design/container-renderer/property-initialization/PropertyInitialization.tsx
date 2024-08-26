import {AnySignal, effect, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Dispatch, SetStateAction, useEffect} from "react";
import {Container} from "../../../../AppDesigner.tsx";
import {useRecordErrorMessage} from "../../../../hooks/useRecordErrorMessage.ts";
import {useNavigateSignal} from "../../../../hooks/useNavigateSignal.tsx";
import {useAppContext} from "../../../../hooks/useAppContext.ts";
import {AppViewerContext} from "../../../../../app-viewer/AppViewerContext.ts";
import {ZodRawShape} from "zod";
import {dbSchemaInitialization} from "../../../../variable-initialization/dbSchemaInitialization.ts";
import {fetcherInitialization} from "../../../../variable-initialization/fetcherSchemaInitialization.ts";
import {Signal} from "signal-polyfill";
import {callableInitialization} from "../../../../variable-initialization/callableSchemaInitialization.ts";
import {queryInitialization} from "../../../../variable-initialization/queryInitialization.ts";
import untrack = Signal.subtle.untrack;

const db = dbSchemaInitialization();

export function PropertyInitialization(props: {
    container: Container,
    setComponentProps: Dispatch<SetStateAction<Record<string, unknown>>>,
}) {
    const context = useAppContext<AppViewerContext>();

    const {container, setComponentProps} = props;
    const {
        allPageVariablesSignalInstance,
        allApplicationVariablesSignalInstance,
        allPageVariablesSignal,
        allApplicationVariablesSignal,
        elements: elementsLib,
        allPageFetchersSignal,
        allApplicationFetchersSignal,
        allApplicationCallablesSignal,
        allPageCallablesSignal,
        allApplicationQueriesSignal,
        allPageQueriesSignal
    } = context;

    const allVariablesSignalInstance = useComputed(() => {
        return [...allPageVariablesSignalInstance.get(), ...allApplicationVariablesSignalInstance.get()]
    })
    const allVariablesSignal = useComputed(() => {
        return [...allPageVariablesSignal.get(), ...allApplicationVariablesSignal.get()]
    })
    const allFetchersSignal = useComputed(() => {
        return [...allPageFetchersSignal.get(),...allApplicationFetchersSignal.get()] ;
    })
    const allQueriesSignal = useComputed(() => {
        return [...allPageQueriesSignal.get(),...allApplicationQueriesSignal.get()] ;
    })
    const allCallablesSignal = useComputed(() => {
        return [...allPageCallablesSignal.get(),...allApplicationCallablesSignal.get()] ;
    })
    const property = elementsLib ? elementsLib[container.type].property as ZodRawShape : undefined;
    const errorMessage = useRecordErrorMessage();
    const propertiesSignal = useSignal(container.properties);
    const navigateSignal = useNavigateSignal();
    useEffect(() => {
        propertiesSignal.set(container.properties)
    }, [container.properties, propertiesSignal]);

    useSignalEffect(() => {
        const containerProperties = propertiesSignal.get();
        const fetchers = untrack(() => fetcherInitialization(allFetchersSignal.get() ?? [],allVariablesSignal,allVariablesSignalInstance));
        const call = untrack(() => callableInitialization(allCallablesSignal.get() ?? [],allFetchersSignal.get() ?? [],allVariablesSignal,allVariablesSignalInstance,allQueriesSignal.get()));
        const query = untrack(() => queryInitialization(allQueriesSignal.get() ?? []));
        const destroyerCallbacks: Array<() => void> = [];
        for (const containerPropKey of Object.keys(containerProperties)) {
            const containerProp = containerProperties[containerPropKey];
            const returnType = property ? property[containerPropKey] : undefined;
            const destroyer = effect(() => {
                const allVariablesInstance = allVariablesSignalInstance.get();
                const allVariables = allVariablesSignal.get();
                const navigate = navigateSignal.get();
                const propDependencies = allVariables.map(t => allVariablesInstance.find(v => v.id === t.id)?.instance) as Array<AnySignal<unknown>>;
                const propDependenciesName = allVariables.map(v => v.name);

                const funcParams = ['module', 'navigate', 'db', 'fetchers','call','query', ...propDependenciesName, containerProp.formula] as Array<string>;
                const module: { exports: unknown } = {exports: {}};
                try {
                    const fun = new Function(...funcParams);
                    const funcParamsInstance = [module, navigate, db, fetchers,call,query, ...propDependencies];
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