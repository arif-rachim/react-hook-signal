import {ReactNode, useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {NumericalPercentagePropertyEditor} from "../property-editor/NumericalPercentagePropertyEditor.tsx";
import {ZodFunction, ZodType, ZodTypeAny} from "zod";
import {PropertyCallbackItemRenderer} from "../property-callback-item-renderer/PropertyCallbackItemRenderer.tsx";
import {BORDER} from "../Border.ts";

export function RightPanel() {
    const context = useContext(AppDesignerContext)
    const {
        selectedDragContainerIdSignal,
        allContainersSignal,
        elements
    } = context;

    const propertyEditors = useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        const selectedDragContainer = allContainersSignal.get().find(i => i.id === selectedDragContainerId);
        const elementName = selectedDragContainer?.type;
        const result: Array<ReactNode> = [];
        result.push(<CollapsibleLabelContainer label={'Size'} key={'height-width'}
                                               styleContent={{flexDirection: 'row', gap: 10}}>
            <NumericalPercentagePropertyEditor property={'height'} label={'Height'} key={'height-editor'}
                                               style={{width: '50%'}} styleLabel={{width: 30}}/>
            <NumericalPercentagePropertyEditor property={'width'} label={'Width'} key={'width-editor'}
                                               style={{width: '50%'}} styleLabel={{width: 30}}/>
        </CollapsibleLabelContainer>);
        result.push(<CollapsibleLabelContainer label={'Padding'} key={'padding-editor'}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'paddingTop'} label={'pT'} key={'padding-top'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex'}}>
                <NumericalPercentagePropertyEditor property={'paddingLeft'} label={'pL'} key={'padding-left'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
                <div style={{flexGrow: 1, width: '100%'}}></div>
                <NumericalPercentagePropertyEditor property={'paddingRight'} label={'pR'} key={'padding-right'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'paddingBottom'} label={'pB'}
                                                   key={'padding-bottom'} style={{width: 80, flexShrink: 0}}
                                                   styleLabel={{display: 'none'}}/>
            </div>
        </CollapsibleLabelContainer>)
        result.push(<CollapsibleLabelContainer label={'Margin'} key={'margin-editor'}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'marginTop'} label={'mT'} key={'margin-top'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex'}}>
                <NumericalPercentagePropertyEditor property={'marginLeft'} label={'mL'} key={'margin-left'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
                <div style={{flexGrow: 1}}></div>
                <NumericalPercentagePropertyEditor property={'marginRight'} label={'mR'} key={'margin-right'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'marginBottom'} label={'mB'}
                                                   key={'margin-bottom'} style={{width: 80, flexShrink: 0}}
                                                   styleLabel={{display: 'none'}}/>
            </div>
        </CollapsibleLabelContainer>)

        if (elementName && elementName in elements) {
            const element = elements[elementName];
            const props = element.property;
            let property: Record<string, unknown> = {};
            if (isShapeable(props)) {
                property = props.shape;
            }
            const callbacks: Array<string> = [];
            const attributes: Array<string> = [];
            for (const propKey of Object.keys(property)) {
                const type = property[propKey] as ZodTypeAny;
                const isZodFunction = type instanceof ZodFunction;
                if (isZodFunction) {
                    callbacks.push(propKey)
                } else {
                    attributes.push(propKey)
                }
            }
            result.push(<CollapsibleLabelContainer label={'Properties'} key={'properties'} styleContent={{gap: 10}}>
                {attributes.map(propKey => {
                    const type = property[propKey] as ZodType
                    return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey} type={type}/>
                })}
            </CollapsibleLabelContainer>);
            result.push(<CollapsibleLabelContainer label={'Callbacks'} key={'callbacks'} styleContent={{gap: 10}}>
                {callbacks.map(propKey => {
                    const type = property[propKey] as ZodType
                    return <PropertyCallbackItemRenderer key={propKey} propertyName={propKey} type={type}/>
                })}
            </CollapsibleLabelContainer>);
        }
        return result
    })
    return <notifiable.div
        style={{
            width: 250,
            backgroundColor: 'rgba(0,0,0,0.01)',
            borderLeft: BORDER,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
        }}>
        {propertyEditors}
    </notifiable.div>;
}


function isShapeable(value: unknown): value is { shape: Record<string, unknown> } {
    return value !== null && value !== undefined && typeof value === 'object' && 'shape' in value
}