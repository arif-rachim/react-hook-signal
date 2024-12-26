import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {ComponentPropertyEditor} from "../editor/ComponentPropertyEditor.tsx";
import {notifiable} from "react-hook-signal"
import {useSelectedDragContainer} from "../../../hooks/useSelectedDragContainer.ts";
import {isEmpty} from "../../../../utils/isEmpty.ts";
import {Icon} from "../../../Icon.ts";
import {useAddDashboardPanel} from "../../../dashboard/useAddDashboardPanel.tsx";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {PropertyEditorComponent} from "../../../data-renderer/CustomPropertyEditor.tsx";

export function PropertyCallbackItemRenderer(props: { propertyName: string }) {
    const {propertyName} = props;
    const context = useAppContext();
    const containerSignal = useSelectedDragContainer();
    const addPanel = useAddDashboardPanel();

    return <LabelContainer key={propertyName} label={propertyName}
                           style={{flexDirection: 'row', alignItems: 'center', gap: 5}}
                           styleLabel={{
                               flexGrow: 1,
                               fontSize: 14,
                               overflow: 'hidden',
                               textOverflow: 'ellipsis',
                               width: 110
                           }}
                           styleContent={{flexDirection: 'column', width: 60, flexGrow: 0, flexShrink: 0}}
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
                            type: 'ComponentPropertyEditor'
                        }
                    })
                }
                return <PropertyEditorComponent isFormulaEmpty={isFormulaEmpty} onClick={onClick} hasError={hasError} />
            }}
        </notifiable.div>
    </LabelContainer>
}