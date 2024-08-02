import CollapsibleLabelContainer from "../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {PropertyCallbackItemRenderer} from "./item-renderer/PropertyCallbackItemRenderer.tsx";
import {ZodFunction} from "zod";
import {useState} from "react";
import {useSelectedDragContainer} from "../../hooks/useSelectedDragContainer.ts";
import {useSignalEffect} from "react-hook-signal";
import {useAppContext} from "../../hooks/useAppContext.ts";

export function PropertiesPanel() {
    const {elements} = useAppContext();
    const selectedDragContainerSignal = useSelectedDragContainer();
    const [callbacksAndAttributes, setCallbacksAndAttributes] = useState<{
        callbacks: Array<string>,
        attributes: Array<string>
    }>({callbacks: [], attributes: []});
    useSignalEffect(() => {
        const callbacks: Array<string> = [];
        const attributes: Array<string> = [];
        const selectedDragContainer = selectedDragContainerSignal.get();
        if (selectedDragContainer === undefined) {
            return setCallbacksAndAttributes({callbacks, attributes})
        }
        const elementName = selectedDragContainer?.type;
        const isCustomElement = elementName && elementName in elements
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
        }
        setCallbacksAndAttributes({callbacks, attributes})
    })

    return <>
        <CollapsibleLabelContainer label={'Properties'} key={'properties'} styleContent={{gap: 10}}>
            {callbacksAndAttributes.attributes.map(propKey => {
                return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey}/>
            })}
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Callbacks'} key={'callbacks'} styleContent={{gap: 10}}>
            {callbacksAndAttributes.callbacks.map(propKey => {
                return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey}/>
            })}
        </CollapsibleLabelContainer>
    </>
}