import {ReactNode, useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {NumericalPercentagePropertyEditor} from "../property-editor/NumericalPercentagePropertyEditor.tsx";
import {ZodFunction, ZodType} from "zod";
import {PropertyCallbackItemRenderer} from "../property-callback-item-renderer/PropertyCallbackItemRenderer.tsx";
import {BORDER} from "../Border.ts";
import {
    VerticalHorizontalAlignmentPropertyEditor
} from "../property-editor/VerticalHorizontalAlignmentPropertyEditor.tsx";
import {
    isVerticalOrHorizontal
} from "../container-element-renderer/draggable-container-element-tools/isVerticalOrHorizontal.ts";

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
        const isContainer = isVerticalOrHorizontal(selectedDragContainer);
        const isCustomElement = elementName && elementName in elements
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
                <NumericalPercentagePropertyEditor property={'paddingTop'} label={'pT'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex'}}>
                <NumericalPercentagePropertyEditor property={'paddingLeft'} label={'pL'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
                <div style={{flexGrow: 1, width: '100%'}}></div>
                <NumericalPercentagePropertyEditor property={'paddingRight'} label={'pR'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'paddingBottom'} label={'pB'}
                                                   style={{width: 80, flexShrink: 0}}
                                                   styleLabel={{display: 'none'}}/>
            </div>
        </CollapsibleLabelContainer>)
        result.push(<CollapsibleLabelContainer label={'Margin'} key={'margin-editor'}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'marginTop'} label={'mT'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex'}}>
                <NumericalPercentagePropertyEditor property={'marginLeft'} label={'mL'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
                <div style={{flexGrow: 1}}></div>
                <NumericalPercentagePropertyEditor property={'marginRight'} label={'mR'}
                                                   style={{width: 80, flexShrink: 0}} styleLabel={{display: 'none'}}/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <NumericalPercentagePropertyEditor property={'marginBottom'} label={'mB'}
                                                   style={{width: 80, flexShrink: 0}}
                                                   styleLabel={{display: 'none'}}/>
            </div>
        </CollapsibleLabelContainer>)

        if(isContainer){
            result.push(<CollapsibleLabelContainer label={'Alignment'} key={'alignment-editor'} styleContent={{gap:10}} >
                <div style={{display:'flex',gap:10}}>
                    <VerticalHorizontalAlignmentPropertyEditor property={'verticalAlign'} style={{width: '50%'}} label={'Vertical'} dataSource={['','top','center','bottom']} />
                    <VerticalHorizontalAlignmentPropertyEditor property={'horizontalAlign'} style={{width: '50%'}} label={'Horizontal'} dataSource={['','left','center','right']} />
                </div>
                <NumericalPercentagePropertyEditor property={'gap'} label={'Gap'} style={{width: '100%', flexShrink: 0}}/>
            </CollapsibleLabelContainer>)
        }

        if (isCustomElement) {
            const element = elements[elementName];
            const property = element.property;
            const callbacks: Array<string> = [];
            const attributes: Array<string> = [];
            for (const propKey of Object.keys(property)) {
                const type = property[propKey];
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
