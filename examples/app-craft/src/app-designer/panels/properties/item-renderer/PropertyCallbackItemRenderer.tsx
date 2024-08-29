import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {Button} from "../../../button/Button.tsx";
import {ComponentPropertyEditor} from "../editor/ComponentPropertyEditor.tsx";
import {notifiable} from "react-hook-signal"
import {useSelectedDragContainer} from "../../../hooks/useSelectedDragContainer.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {BORDER} from "../../../Border.ts";
import {Icon} from "../../../Icon.ts";
import {useAddDashboardPanel} from "../../../dashboard/useAddDashboardPanel.tsx";
import {useAppContext} from "../../../hooks/useAppContext.ts";

export function PropertyCallbackItemRenderer(props: { propertyName: string }) {
    const {propertyName} = props;
    const context = useAppContext();
    const containerSignal = useSelectedDragContainer();
    const addPanel = useAddDashboardPanel();

    return <LabelContainer key={propertyName} label={propertyName}
                           style={{flexDirection: 'row', alignItems: 'center',gap:5}}
                           styleLabel={{flexGrow:1,fontSize: 14,overflow:'hidden',textOverflow:'ellipsis',width:110}}
                           styleContent={{flexDirection:'column',width:60,flexGrow:0,flexShrink:0}}
    >
        <notifiable.div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {() => {
                const container = containerSignal.get();
                const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
                let isFormulaEmpty = true;

                if (container && container.properties[propertyName]) {
                    const formula = container.properties[propertyName].formula;
                    isFormulaEmpty = isEmpty(formula);
                }

                const onClick = async () => {
                    const panelId = `${container?.id}-${propertyName}`;
                    addPanel({
                        position: 'mainCenter',
                        component: () => {
                            return <ComponentPropertyEditor name={propertyName} containerId={container?.id ?? ''}
                                                            panelId={panelId}/>
                        },
                        title: `${container?.type} : ${propertyName}`,
                        Icon: Icon.Property,
                        id: panelId,
                        tag: {
                            containerId: container?.id,
                            propertyName: propertyName,
                            type : 'ComponentPropertyEditor'
                        },
                        visible: () => true
                    })
                }
                return <div style={{display: 'flex'}}>
                    <Button style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        backgroundColor: isFormulaEmpty ? colors.grey : colors.green,
                        padding: '0px 5px'
                    }} onClick={onClick}><Icon.Formula style={{fontSize: 16}}/></Button>

                    <div style={{
                        display: 'flex',
                        padding: '0px 5px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        border: BORDER,
                        borderTopRightRadius: 20,
                        borderBottomRightRadius: 20
                    }}>
                        {hasError && <Icon.Error style={{fontSize: 16, color: colors.red}}/>}
                        {!hasError && <Icon.Checked style={{fontSize: 16, color: colors.green}}/>}
                    </div>
                </div>
            }}
        </notifiable.div>
    </LabelContainer>
}