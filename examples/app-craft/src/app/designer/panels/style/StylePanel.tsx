import {NumericalPercentagePropertyEditor} from "./NumericalPercentagePropertyEditor.tsx";
import {VerticalHorizontalAlignmentPropertyEditor} from "./VerticalHorizontalAlignmentPropertyEditor.tsx";
import {VerticalHorizonPropertyEditor} from "./VerticalHorizonPropertyEditor.tsx";

export function StylePanel() {
    return <div style={{padding: 10, display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', gap: 10}}>
            <VerticalHorizonPropertyEditor label={'Direction'} style={{width: 80}} styleLabel={{width: 30}}/>
            <NumericalPercentagePropertyEditor property={'gap'} label={'Gap'} style={{width: 80}}
                                               styleLabel={{width: 30}}/>
        </div>
        <div style={{display: 'flex', gap: 10}}>
            <VerticalHorizontalAlignmentPropertyEditor property={'verticalAlign'} style={{width: 80}}
                                                       styleLabel={{width: 30}}
                                                       label={'Vertical'}
                                                       dataSource={['', 'top', 'center', 'bottom']}/>
            <VerticalHorizontalAlignmentPropertyEditor property={'horizontalAlign'} style={{width: 80}}
                                                       styleLabel={{width: 30}}
                                                       label={'Horizontal'}
                                                       dataSource={['', 'left', 'center', 'right']}/>
        </div>
        <div style={{display: 'flex', gap: 10}}>
            <NumericalPercentagePropertyEditor property={'height'} label={'Height'}
                                               style={{width: 80}} styleLabel={{width: 30}}/>
            <NumericalPercentagePropertyEditor property={'width'} label={'Width'}
                                               style={{width: 80}} styleLabel={{width: 30}}/>
        </div>
        <div style={{marginTop: 10}}>Padding</div>
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
        <div style={{marginTop: 10}}>Margin</div>
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
    </div>
}