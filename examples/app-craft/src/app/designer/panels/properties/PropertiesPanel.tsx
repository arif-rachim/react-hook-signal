import CollapsibleLabelContainer from "../../../../core/components/CollapsibleLabelContainer.tsx";
import {PropertyCallbackItemRenderer} from "./PropertyCallbackItemRenderer.tsx";
import {ZodFunction, ZodOptional} from "zod";
import {useState} from "react";
import {useSelectedDragContainer} from "../../../../core/hooks/useSelectedDragContainer.ts";
import {useSignalEffect} from "react-hook-signal";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {Element} from "../../LayoutBuilderProps.ts";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";

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
        let property: Record<string, unknown> = {};
        let propertyEditor: Element['propertyEditor'] = {};

        if (isCustomElement) {
            const element = elements[elementName];
            property = element.property;
            propertyEditor = element.propertyEditor;
        }
        for (const propKey of Object.keys(property)) {
            const type = property[propKey];
            const isZodFunction = (type instanceof ZodFunction) || (type instanceof ZodOptional && type._def.innerType instanceof ZodFunction);
            if (isZodFunction) {
                callbacks.push(propKey)
            } else {
                attributes.push(propKey)
            }
        }
        return setCallbacksAndAttributes({callbacks, attributes, propertyEditor});
    })

    function propertyCallbackItemRenderer(propKey: string) {
        if (callbacksAndAttributes && callbacksAndAttributes.propertyEditor && callbacksAndAttributes.propertyEditor[propKey]) {
            const editor = callbacksAndAttributes.propertyEditor[propKey]!;
            const Component = editor.component!;
            return <LabelContainer key={propKey} label={editor.label}
                                   style={{flexDirection: 'row', alignItems: 'center', gap: 5}}
                                   styleLabel={{
                                       flexGrow: 1,
                                       fontSize: 14,
                                       overflow: 'hidden',
                                       textOverflow: 'ellipsis',
                                       width: 110
                                   }}
                                   styleContent={{flexDirection: 'column', width: 60, flexGrow: 0, flexShrink: 0}}>
                <Component propertyName={propKey}/>
            </LabelContainer>
        }
        return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey}/>
    }

    return <>
        <CollapsibleLabelContainer label={'Properties'} key={'properties'} styleContent={{gap: 5}}>
            {callbacksAndAttributes.attributes.map(propertyCallbackItemRenderer)}
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Callbacks'} key={'callbacks'} styleContent={{gap: 5}}>
            {callbacksAndAttributes.callbacks.map(propertyCallbackItemRenderer)}
        </CollapsibleLabelContainer>
    </>
}