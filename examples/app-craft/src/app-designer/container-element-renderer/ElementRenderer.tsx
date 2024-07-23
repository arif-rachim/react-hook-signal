import {Container} from "../AppDesigner.tsx";
import {useContext, useEffect, useState} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {AnySignal, effect, useSignal, useSignalEffect} from "react-hook-signal";
import {ZodFunction} from "zod";
import {ElementProps} from "../LayoutBuilderProps.ts";

/**
 * Renders a container component with dynamically generated properties based on container properties and dependencies.
 * This is considered as the glue attaching external component and the platform.
 *
 * In summary, RenderContainer performs the following tasks:
 * - It makes use of the React Context, AppDesignerContext, to get various properties and signals (which presumably represent state values managed with some sort of a state management library).
 * - It derives the component based on container type. After destructuring container and elementsLib from the passed props and context respectively, Component is derived from elementsLib[container.type].
 * - It manages a propertiesSignal state, initialized from useSignal with container.properties and subsequently updated any time container.properties changes.
 * - It initializes an empty object in a state variable componentProps.
 * - It computes values for the component's props by creating a new object, componentPropertiesValue, and populates it based on propertiesSignal.get() and allVariablesSignalInstance.get(). If a property does not represent a Zod function, an effect is defined using the effect function.
 * - Function fun gets compiled at runtime with the new Function statement, making use of the various dependencies present in some state variables. This function is then called with the newly created module object and the instances of the dependencies as parameters.
 * - The module.exports value so obtained is set to be one of the properties of the componentPropertiesValue object. This componentPropertiesValue object is eventually assigned to the componentProps state variable.
 * - The return function of the useSignalEffect call cleans up any effects that may have been created inside the function (notably, due to effect() calls), by running their respective destroyer callbacks.
 * - Lastly, it renders the appropriate Component based on the container type, using componentProps.
 *
 */
export function ElementRenderer(props: { container: Container,elementProps:ElementProps }) {
    const {container,elementProps} = props;
    const {elements: elementsLib, allVariablesSignalInstance, allVariablesSignal} = useContext(AppDesignerContext);
    const {component: Component} = elementsLib[container.type];
    const propertiesSignal = useSignal(container.properties);
    useEffect(() => {
        propertiesSignal.set(container.properties)
    }, [container.properties, propertiesSignal]);
    const [componentProps, setComponentProps] = useState<Record<string, unknown>>({})

    useSignalEffect(() => {
        const containerProperties = propertiesSignal.get();
        const allVariablesInstance = allVariablesSignalInstance.get();
        const allVariables = allVariablesSignal.get();
        const componentPropertiesValue: Record<string, unknown> = {};
        const destroyerCallbacks: Array<() => void> = [];
        for (const containerPropKey of Object.keys(containerProperties)) {
            const containerProp = containerProperties[containerPropKey];

            const propDependencies = containerProp.dependencies.map(d => allVariablesInstance.find(v => v.id === d)?.instance).filter(i => i !== undefined) as Array<AnySignal<unknown>>;
            const propDependenciesName = containerProp.dependencies.map(d => allVariables.find(v => v.id === d)?.name).filter(i => i !== undefined) as Array<string>;
            const funcParams = ['module', ...propDependenciesName, containerProp.formula] as Array<string>;
            const module: { exports: unknown } = {exports: {}};
            try {
                const fun = new Function(...funcParams);
                const funcParamsInstance = [module, ...propDependencies];
                fun.call(null, ...funcParamsInstance);
            } catch (err) {
                console.error(err);
            }
            componentPropertiesValue[containerPropKey] = module.exports;
            const isZodFunction = containerProp.type instanceof ZodFunction;
            if (!isZodFunction) {
                const destroyer = effect(() => {
                    // just listen for changes
                    propDependencies.forEach(p => p.get());
                    const module: { exports: unknown } = {exports: {}};
                    try {
                        const fun = new Function(...funcParams);
                        const funcParamsInstance = [module, ...propDependencies];
                        fun.call(null, ...funcParamsInstance);
                        setComponentProps(props => {
                            return {...props, [containerPropKey]: module.exports}
                        })
                    } catch (err) {
                        console.error(err);
                    }
                })
                destroyerCallbacks.push(destroyer);
            }
        }
        setComponentProps(componentPropertiesValue);
        return () => {
            destroyerCallbacks.forEach(d => d());
        }
    });
    return <Component key={container?.id} {...componentProps} properties={elementProps} />
}