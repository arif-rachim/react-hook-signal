import CollapsibleLabelContainer from "../../collapsible-panel/CollapsibleLabelContainer.tsx";
import {NumericalPercentagePropertyEditor} from "./editor/NumericalPercentagePropertyEditor.tsx";
import {VerticalHorizontalAlignmentPropertyEditor} from "./editor/VerticalHorizontalAlignmentPropertyEditor.tsx";

export function StylePanel() {
    return <>
        <CollapsibleLabelContainer label={'Size'}>
            <div style={{display: 'flex', gap: 10}}>
                <NumericalPercentagePropertyEditor property={'height'} label={'Height'}
                                                   style={{width: 100}} styleLabel={{width: 30}}/>
                <NumericalPercentagePropertyEditor property={'width'} label={'Width'}
                                                   style={{width: 100}} styleLabel={{width: 30}}/>
            </div>
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Padding'}>
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
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Margin'}>
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
        </CollapsibleLabelContainer>

        <CollapsibleLabelContainer label={'Alignment'} styleContent={{overflowX: 'hidden'}}>
            <div style={{display: 'flex', gap: 10}}>
                <VerticalHorizontalAlignmentPropertyEditor property={'verticalAlign'} style={{width: 85}}
                                                           label={'Vertical'}
                                                           dataSource={['', 'top', 'center', 'bottom']}/>
                <VerticalHorizontalAlignmentPropertyEditor property={'horizontalAlign'} style={{width: 85}}
                                                           label={'Horizontal'}
                                                           dataSource={['', 'left', 'center', 'right']}/>
            </div>
            <NumericalPercentagePropertyEditor property={'gap'} label={'Gap'} style={{width: 85}}/>
        </CollapsibleLabelContainer>
    </>
}