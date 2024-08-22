import {useSelectedDragContainer} from "../hooks/useSelectedDragContainer.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {useUpdateDragContainer} from "../hooks/useUpdateSelectedDragContainer.ts";
import {CSSProperties} from "react";
import {colors} from "stock-watch/src/utils/colors.ts";
import {PageInputSelector} from "../page-selector/PageInputSelector.tsx";
import {Container} from "../AppDesigner.tsx";
import {BORDER} from "../Border.ts";
import {Icon} from "../Icon.ts";

export function PageSelectionPropertyEditor(props: { propertyName: string }) {
    const containerSignal = useSelectedDragContainer();
    const context = useAppContext();
    const container = containerSignal.get();
    const {propertyName} = props;
    const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
    let isFormulaEmpty = true;

    if (container && container.properties[propertyName]) {
        const formula = container.properties[propertyName].formula;
        isFormulaEmpty = isEmpty(formula);
    }
    const update = useUpdateDragContainer();
    const style: CSSProperties = {
        width: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
        backgroundColor: isFormulaEmpty ? colors.grey : colors.green,
        padding: 0
    };
    return <div style={{display: 'flex'}}>

        <PageInputSelector value={''} style={style} onChange={(value) => {
            const containerId = containerSignal.get()?.id;
            if (containerId) {
                update(containerId, (selectedContainer: Container) => {
                    if (value) {
                        selectedContainer.properties = {
                            ...selectedContainer.properties,
                            [propertyName]: {formula: `module.exports = "${value}"`,}
                        }
                        return selectedContainer;
                    } else {
                        selectedContainer.properties = {...selectedContainer.properties};
                        delete selectedContainer.properties[propertyName];
                        return selectedContainer;
                    }

                });
            }
        }}/>
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
            {hasError && <Icon.Error style={{fontSize: 18, color: colors.red}}/>}
            {!hasError && <Icon.Checked style={{fontSize: 18, color: colors.green}}/>}
        </div>
    </div>
}
