import {BORDER} from "../Border.ts";
import {Icon} from "../Icon.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {useSelectedDragContainer} from "../hooks/useSelectedDragContainer.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {Button} from "../button/Button.tsx";
import {zodSchemaToZodType} from "../zodSchemaToJson.ts";
import {ComponentPropertyEditor} from "../panels/properties/editor/ComponentPropertyEditor.tsx";
import {useAddDashboardPanel} from "../dashboard/useAddDashboardPanel.tsx";
import {z, ZodType} from "zod";

export function PropertiesPropertyEditor(props: { propertyName: string }) {
    const containerSignal = useSelectedDragContainer();
    const context = useAppContext();
    const container = containerSignal.get();
    const {propertyName} = props;
    const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
    let isFormulaEmpty = true;
    const addPanel = useAddDashboardPanel();
    if (container && container.properties[propertyName]) {
        const formula = container.properties[propertyName].formula;
        isFormulaEmpty = isEmpty(formula);
    }

    function onClick() {
        const container = containerSignal.get();
        if (container && 'component' in container.properties) {
            const fun = new Function('module', container.properties['component'].formula)
            const module = {exports: ''};
            fun.apply(null, [module])
            const pageId = module.exports;
            const page = context.allPagesSignal.get().find(p => p.id === pageId);
            if (page) {
                const returnType = page?.variables.filter(v => v.type === 'state').reduce((result, s) => {
                    result[s.name] = zodSchemaToZodType(s.schemaCode).optional()
                    return result;
                }, {} as Record<string, ZodType>);
                const panelId = `${container?.id}-${propertyName}`;
                addPanel({
                    position: 'mainCenter',
                    component: () => {
                        return <ComponentPropertyEditor name={propertyName} containerId={container?.id ?? ''}
                                                        panelId={panelId} returnTypeZod={z.object(returnType)}/>
                    },
                    title: `${container?.type} : ${propertyName}`,
                    Icon: Icon.Property,
                    id: panelId,
                    tag: {
                        containerId: container?.id,
                        propertyName: propertyName,
                        type: 'ComponentPropertyEditor'
                    },
                    visible: () => true
                })
            }
        }
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
            padding: '0px 2px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            border: BORDER,
            width: 28,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20
        }}>
            {hasError && <Icon.Error style={{fontSize: 16, color: colors.red}}/>}
            {!hasError && <Icon.Checked style={{fontSize: 16, color: colors.green}}/>}
        </div>
    </div>
}