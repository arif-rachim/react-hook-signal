import {Container} from "./AppDesigner.tsx";
import {useContext, useEffect, useState} from "react";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {AnySignal, effect, useSignal, useSignalEffect} from "react-hook-signal";
import {ZodFunction} from "zod";

/**
 * Renders a container component with dynamically generated properties based on container properties and dependencies.
 * This is considered as the glue attaching external component and the platform
 */
export function RenderContainer(props:{container:Container}){
    const {container} = props;
    const {elements: elementsLib,allVariablesSignalInstance,allVariablesSignal} = useContext(AppDesignerContext);
    const {component: Component} = elementsLib[container.type];
    const propertiesSignal = useSignal(container.properties);
    useEffect(() => {
        propertiesSignal.set(container.properties)
    }, [container.properties, propertiesSignal]);
    const [componentProps,setComponentProps] = useState<Record<string,unknown>>({})

    useSignalEffect(() => {
        const containerProperties = propertiesSignal.get();
        const allVariablesInstance = allVariablesSignalInstance.get();
        const allVariables = allVariablesSignal.get();
        const componentPropertiesValue:Record<string, unknown> = {};
        const destroyerCallbacks:Array<() => void> = [];
        for (const containerPropKey of Object.keys(containerProperties)) {
            const containerProp = containerProperties[containerPropKey];

            const propDependencies = containerProp.dependencies.map(d => allVariablesInstance.find(v => v.id === d)?.instance).filter(i => i !== undefined) as Array<AnySignal<unknown>>;
            const propDependenciesName = containerProp.dependencies.map(d => allVariables.find(v => v.id === d)?.name).filter(i => i !== undefined) as Array<string>;
            const funcParams = ['module',...propDependenciesName,containerProp.formula] as Array<string>;
            const fun = new Function(...funcParams);
            const module:{exports:unknown} = {exports:{}};
            const funcParamsInstance = [module,...propDependencies]
            fun.call(null,...funcParamsInstance);
            componentPropertiesValue[containerPropKey] = module.exports;

            const isZodFunction = containerProp.type instanceof ZodFunction;
            if(!isZodFunction){
                const destroyer = effect(() => {
                    // just listen for changes
                    propDependencies.forEach(p => p.get());
                    const module:{exports:unknown} = {exports:{}};
                    const funcParamsInstance = [module,...propDependencies]
                    fun.call(null,...funcParamsInstance);
                    setComponentProps(props => {
                        return {...props,[containerPropKey]:module.exports}
                    })
                })
                destroyerCallbacks.push(destroyer);
            }
        }
        setComponentProps(componentPropertiesValue);
        return () => {
            destroyerCallbacks.forEach(d => d());
        }
    })
    return <Component key={container?.id} {...componentProps} />
}