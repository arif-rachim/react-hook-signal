import {useAddDashboardPanel} from "../designer/hooks/useAddDashboardPanel.tsx";
import {ComponentPropertyEditor} from "../designer/panels/properties/ComponentPropertyEditor.tsx";
import {Icon} from "../../core/components/icon/Icon.ts";
import {queryGridColumnsTemporalColumns} from "../designer/editor/queryGridColumnsTemporalColumns.ts";
import {z, ZodRawShape, ZodType, ZodTypeAny} from "zod";
import {Container} from "../designer/AppDesigner.tsx";
import type {Element} from "../designer/LayoutBuilderProps.ts";
import {AppViewerContext} from "../viewer/context/AppViewerContext.ts";
import {usePropertyEditorInitialHook} from "../../core/hooks/usePropertyEditorInitialHook.ts";
import {PropertyEditorComponent} from "../designer/panels/properties/PropertyEditorComponent.tsx";

type Callback = (props: {
    propertyName: string,
    container: Container,
    gridTemporalColumns?: string[],
    element?: Element,
    allPagesSignal: AppViewerContext['allPagesSignal']
}) => ZodTypeAny;

type ReturnType = z.ZodFunction<z.ZodTuple<[z.ZodObject<z.ZodRawShape, "strip", z.ZodTypeAny, Record<string, unknown>, Record<string, unknown>>], z.ZodUnknown>, z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
const defaultCallback: Callback = (props) => {
    const {element, gridTemporalColumns, propertyName} = props;

    let returnTypeZod: ReturnType | undefined = undefined;
    if (element) {
        returnTypeZod = element.property[propertyName] as ReturnType
    }
    if (gridTemporalColumns) {
        const param = gridTemporalColumns.reduce((result, key) => {
            result[key] = z.union([z.number(), z.string(), z.instanceof(Uint8Array), z.null()]);
            return result;
        }, {} as ZodRawShape);
        returnTypeZod = z.function().args(z.object(param)).returns(z.union([z.string(), z.number()]))
    }
    return returnTypeZod as ZodTypeAny;
}


export function createCustomPropertyEditor(callback: Callback) {
    return function CustomPropertyEditor(props: { propertyName: string }) {
        const {containerSignal, context, propertyName, hasError, isFormulaEmpty} = usePropertyEditorInitialHook(props);

        const addPanel = useAddDashboardPanel();
        function onClick() {
            const container = containerSignal.get();
            if (container) {
                const panelId = `${container?.id}-${propertyName}`;
                let element: Element | undefined = undefined;
                let gridTemporalColumns: string[] | undefined = undefined;
                let returnTypeZod: ZodType = z.any();
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
                    allPagesSignal: context.allPagesSignal
                }) : defaultCallback({
                    propertyName,
                    element,
                    container,
                    gridTemporalColumns,
                    allPagesSignal: context.allPagesSignal
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
        return <PropertyEditorComponent isFormulaEmpty={isFormulaEmpty} onClick={onClick} hasError={hasError} />
    }
}
