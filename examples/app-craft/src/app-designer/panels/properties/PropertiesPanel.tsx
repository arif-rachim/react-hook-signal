import CollapsibleLabelContainer from "../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {PropertyCallbackItemRenderer} from "./item-renderer/PropertyCallbackItemRenderer.tsx";
import {ZodFunction} from "zod";
import {useState} from "react";
import {useSelectedDragContainer} from "../../hooks/useSelectedDragContainer.ts";
import {useSignalEffect} from "react-hook-signal";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {Element} from "../../LayoutBuilderProps.ts";
import {LabelContainer} from "../../label-container/LabelContainer.tsx";

export function PropertiesPanel() {
    const {elements} = useAppContext();
    const selectedDragContainerSignal = useSelectedDragContainer();
    const [callbacksAndAttributes, setCallbacksAndAttributes] = useState<{
        callbacks: Array<string>,
        attributes: Array<string>,
        propertyEditor: Element['propertyEditor']
    }>({callbacks: [], attributes: [], propertyEditor: {}});
    useSignalEffect(() => {
        const callbacks: Array<string> = [];
        const attributes: Array<string> = [];
        const selectedDragContainer = selectedDragContainerSignal.get();
        if (selectedDragContainer === undefined) {
            return setCallbacksAndAttributes({callbacks, attributes, propertyEditor: {}})
        }
        const elementName = selectedDragContainer?.type;
        const isCustomElement = elements && elementName && elementName in elements;

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
            return setCallbacksAndAttributes({callbacks, attributes, propertyEditor: element.propertyEditor});
        }
        setCallbacksAndAttributes({callbacks, attributes, propertyEditor: {}});
    })

    function propertyCallbackItemRenderer(propKey: string) {
        if (callbacksAndAttributes && callbacksAndAttributes.propertyEditor && callbacksAndAttributes.propertyEditor[propKey]) {
            const editor = callbacksAndAttributes.propertyEditor[propKey]!;
            const Component = editor.component!;
            return <LabelContainer key={propKey} label={editor.label}
                                   style={{flexDirection: 'row', alignItems: 'center'}}
                                   styleLabel={{width: 65, fontSize: 13}}
                                   styleContent={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                <Component propertyName={propKey}/>
            </LabelContainer>
        }
        return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey}/>
    }

    return <>
        <CollapsibleLabelContainer label={'Properties'} key={'properties'} styleContent={{gap: 10}}>
            {callbacksAndAttributes.attributes.map(propertyCallbackItemRenderer)}
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Callbacks'} key={'callbacks'} styleContent={{gap: 10}}>
            {callbacksAndAttributes.callbacks.map(propertyCallbackItemRenderer)}
        </CollapsibleLabelContainer>
    </>
}