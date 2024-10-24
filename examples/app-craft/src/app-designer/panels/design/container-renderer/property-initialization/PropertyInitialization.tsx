import {AnySignal, effect, useSignal, useSignalEffect} from "react-hook-signal";
import {Dispatch, SetStateAction, useContext, useEffect} from "react";
import {Container} from "../../../../AppDesigner.tsx";
import {useRecordErrorMessage} from "../../../../hooks/useRecordErrorMessage.ts";
import {useAppContext} from "../../../../hooks/useAppContext.ts";
import {AppViewerContext} from "../../../../../app-viewer/AppViewerContext.ts";
import {z, ZodRawShape} from "zod";
import {dbSchemaInitialization} from "../../../../variable-initialization/initiator/dbSchemaInitialization.ts";
import {AppVariableInitializationContext} from "../../../../variable-initialization/AppVariableInitialization.tsx";
import {PageVariableInitializationContext} from "../../../../variable-initialization/PageVariableInitialization.tsx";

const db = dbSchemaInitialization();

export function PropertyInitialization(props: {
    container: Container,
    setComponentProps: Dispatch<SetStateAction<Record<string, unknown>>>,
}) {
    const context = useAppContext<AppViewerContext>();
    const appSignal = useContext(AppVariableInitializationContext);
    const pageSignal = useContext(PageVariableInitializationContext);
    const {container, setComponentProps} = props;
    const {
        elements: elementsLib,
        allVariablesSignal,
        allVariablesSignalInstance,
        navigate
    } = context;

    const property = elementsLib ? elementsLib[container.type].property as ZodRawShape : undefined;
    const errorMessage = useRecordErrorMessage();
    const propertiesSignal = useSignal(container.properties);
    useEffect(() => {
        propertiesSignal.set(container.properties)
    }, [container.properties, propertiesSignal]);

    useSignalEffect(() => {
        const containerProperties = propertiesSignal.get();
        const app = appSignal.get();
        const page = pageSignal.get();
        const destroyerCallbacks: Array<() => void> = [];
        for (const containerPropKey of Object.keys(containerProperties)) {
            const containerProp = containerProperties[containerPropKey];
            const returnType = property ? property[containerPropKey] : undefined;
            const destroyer = effect(() => {
                const allVariablesInstance = allVariablesSignalInstance.get();
                const allVariables = allVariablesSignal.get();
                const propDependencies = allVariables.map(t => allVariablesInstance.find(v => v.id === t.id)?.instance) as Array<AnySignal<unknown>>;

                const funcParams = ['module', 'navigate', 'db', 'app', 'page','z', containerProp.formula] as Array<string>;
                const module: { exports: unknown } = {exports: {}};

                try {
                    const fun = new Function(...funcParams);
                    const funcParamsInstance = [module, navigate, db,app, page,z, ...propDependencies];
                    fun.call(null, ...funcParamsInstance);
                    errorMessage.propertyValue({propertyName: containerPropKey, containerId: container.id});
                } catch (err) {
                    errorMessage.propertyValue({propertyName: containerPropKey, containerId: container.id, err});
                }
                if (returnType) {
                    if(JSON.stringify(module.exports) !== '{}'){
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
                    if(JSON.stringify(module.exports) !== '{}'){
                        setComponentProps(props => ({...props, [containerPropKey]: module.exports}))
                    }
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