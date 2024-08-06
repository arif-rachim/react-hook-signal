import CollapsibleLabelContainer from "../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {PropertyCallbackItemRenderer} from "./item-renderer/PropertyCallbackItemRenderer.tsx";
import {ZodFunction} from "zod";
import {useState} from "react";
import {useSelectedDragContainer} from "../../hooks/useSelectedDragContainer.ts";
import {useSignalEffect} from "react-hook-signal";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {Element} from "../../LayoutBuilderProps.ts";

export function PropertiesPanel() {
    const {elements} = useAppContext();
    const selectedDragContainerSignal = useSelectedDragContainer();
    const [callbacksAndAttributes, setCallbacksAndAttributes] = useState<{
        callbacks: Array<string>,
        attributes: Array<string>,
        propertyEditor : Element['propertyEditor']
    }>({callbacks: [], attributes: [],propertyEditor:{}});
    useSignalEffect(() => {
        const callbacks: Array<string> = [];
        const attributes: Array<string> = [];
        const selectedDragContainer = selectedDragContainerSignal.get();
        if (selectedDragContainer === undefined) {
            return setCallbacksAndAttributes({callbacks, attributes,propertyEditor:{}})
        }
        const elementName = selectedDragContainer?.type;
        const isCustomElement = elementName && elementName in elements;

        if (isCustomElement) {
            const element = elements[elementName];
            const property = element.property;
            for (const propKey of Object.keys(property)) {
                const type = property[propKey];
                const isZodFunction = type instanceof ZodFunction;
                if (isZodFunction) {
                    callbacks.push(propKey)
                } else {
                    attributes.push(propKey)
                }
            }
            return setCallbacksAndAttributes({callbacks, attributes,propertyEditor:element.propertyEditor});
        }
        setCallbacksAndAttributes({callbacks, attributes,propertyEditor:{}});
    })

    return <>
        <CollapsibleLabelContainer label={'Properties'} key={'properties'} styleContent={{gap: 10}}>
            {callbacksAndAttributes.attributes.map(propKey => {
                if(callbacksAndAttributes && callbacksAndAttributes.propertyEditor && callbacksAndAttributes.propertyEditor[propKey]){
                    const editor = callbacksAndAttributes.propertyEditor[propKey]!;
                    const Component = editor.component!;
                    return <Component key={propKey} />
                }
                return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey}/>
            })}
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Callbacks'} key={'callbacks'} styleContent={{gap: 10}}>
            {callbacksAndAttributes.callbacks.map(propKey => {
                if(callbacksAndAttributes && callbacksAndAttributes.propertyEditor && callbacksAndAttributes.propertyEditor[propKey]){
                    const editor = callbacksAndAttributes.propertyEditor[propKey]!;
                    const Component = editor.component!;
                    return <Component key={propKey} />
                }
                return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey}/>
            })}
        </CollapsibleLabelContainer>
    </>
}