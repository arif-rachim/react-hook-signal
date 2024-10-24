import {useSelectedDragContainer} from "../hooks/useSelectedDragContainer.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {useAddDashboardPanel} from "../dashboard/useAddDashboardPanel.tsx";
import {isEmpty} from "../../utils/isEmpty.ts";
import {ComponentPropertyEditor} from "../panels/properties/editor/ComponentPropertyEditor.tsx";
import {Icon} from "../Icon.ts";
import {Button} from "../button/Button.tsx";
import {colors} from "stock-watch/src/utils/colors.ts";
import {BORDER} from "../Border.ts";
import {queryGridColumnsTemporalColumns} from "../query-grid/queryGridColumnsTemporalColumns.ts";
import {z, ZodRawShape, ZodType} from "zod";
import {Container} from "../AppDesigner.tsx";
import type {Element} from "../LayoutBuilderProps.ts";
import {AppViewerContext} from "../../app-viewer/AppViewerContext.ts";

type Callback = (props: {
    propertyName: string,
    container: Container,
    gridTemporalColumns?: string[],
    element?: Element,
    allPagesSignal : AppViewerContext['allPagesSignal']
}) => ZodType;

const defaultCallback: Callback = (props) => {
    const {element, gridTemporalColumns, propertyName} = props;
    let returnTypeZod:ZodType = z.any();
    if (element) {
        returnTypeZod = element.property[propertyName]
    }
    if (gridTemporalColumns) {
        const param = gridTemporalColumns.reduce((result, key) => {
            result[key] = z.union([z.number(), z.string(), z.instanceof(Uint8Array), z.null()]);
            return result;
        }, {} as ZodRawShape);
        returnTypeZod = z.function().args(z.object(param)).returns(z.union([z.string(), z.number()]))
    }
    return returnTypeZod;
}

export function createCustomPropertyEditor(callback: Callback) {
    return function CustomPropertyEditor(props: { propertyName: string }) {
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
            if (container) {
                const panelId = `${container?.id}-${propertyName}`;
                let element:Element|undefined = undefined;
                let gridTemporalColumns:string[]|undefined = undefined;
                let returnTypeZod:ZodType = z.any();
                if (context.elements && container.type in context.elements) {
                    element = context.elements[container.type];
                }
                if (container?.id in queryGridColumnsTemporalColumns && queryGridColumnsTemporalColumns[container.id].length > 0) {
                    gridTemporalColumns = queryGridColumnsTemporalColumns[container.id] as string[];
                }
                returnTypeZod = callback ? callback({
                    propertyName,
                    element,
                    container,
                    gridTemporalColumns,
                    allPagesSignal : context.allPagesSignal
                }) : defaultCallback({
                    propertyName,
                    element,
                    container,
                    gridTemporalColumns,
                    allPagesSignal : context.allPagesSignal
                })
                addPanel({
                    position: 'mainCenter',
                    component: () => {
                        return <ComponentPropertyEditor name={propertyName} containerId={container?.id ?? ''}
                                                        panelId={panelId} returnTypeZod={returnTypeZod}/>
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
}
