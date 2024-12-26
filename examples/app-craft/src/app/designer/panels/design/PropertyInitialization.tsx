import {AnySignal, effect, useSignal, useSignalEffect} from "react-hook-signal";
import {Dispatch, SetStateAction, useContext, useEffect} from "react";
import {Container} from "../../AppDesigner.tsx";
import {useRecordErrorMessage} from "../../../../core/hooks/useRecordErrorMessage.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {AppViewerContext} from "../../../viewer/context/AppViewerContext.ts";
import {z, ZodRawShape} from "zod";
import {dbSchemaInitialization} from "../../variable-initialization/dbSchemaInitialization.ts";
import {AppVariableInitializationContext} from "../../variable-initialization/AppVariableInitialization.tsx";
import {PageVariableInitializationContext} from "../../variable-initialization/PageVariableInitialization.tsx";
import {useModalBox} from "../../variable-initialization/useModalBox.tsx";
import {useSaveSqlLite} from "../../../../core/hooks/useSaveSqlLite.ts";
import {useDeleteSqlLite} from "../../../../core/hooks/useDeleteSqlLite.ts";
import {FormContext} from "../../../form/Form.tsx";
import sqlite from "../database/sqlite.ts";
import {utils} from "../../../../core/utils/utils.ts";

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

    const alertBox = useModalBox();
    const saveSqlLite = useSaveSqlLite();
    const deleteSqlLite = useDeleteSqlLite();
    const readSqlLite = async () => {
        const result = await sqlite({type: 'loadFromFile'});
        return (result.value as Uint8Array).buffer as ArrayBuffer;
    }
    const tools = {saveSqlLite, deleteSqlLite, readSqlLite};

    const formContext = useContext(FormContext);
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

                const funcParams = ['module', 'navigate', 'db', 'app', 'page', 'z', 'alertBox', 'tools', 'utils', 'formContext', containerProp.formula] as Array<string>;
                const module: { exports: unknown } = {exports: {}};

                try {
                    const fun = new Function(...funcParams);
                    const funcParamsInstance = [module, navigate, db, app, page, z, alertBox, tools, utils, formContext, ...propDependencies];
                    fun.call(null, ...funcParamsInstance);
                    errorMessage.propertyValue({propertyName: containerPropKey, containerId: container.id});
                } catch (err) {
                    errorMessage.propertyValue({propertyName: containerPropKey, containerId: container.id, err});
                }
                if (returnType) {
                    if (JSON.stringify(module.exports) !== '{}') {
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
                    if (JSON.stringify(module.exports) !== '{}') {
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
