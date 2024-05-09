import {Context, forwardRef, FunctionComponent, useEffect, useId, useImperativeHandle} from "react";
import {Signal} from "signal-polyfill";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {ViewContext} from "./ViewContext.ts";
import {ViewContextData} from "./types.ts";
import {TemplateSlot} from "./TemplateSlot.tsx";
import {CellCompType, SlotComp, TemplateType} from "../responsive-list/types.ts";

export function createResponsiveView<DataItem extends object, Properties extends object = Record<string,unknown>>() {
    return {
        breakPoint: defineBreakPoint<DataItem, Properties>()
    }
}

const defineBreakPoint = <DataItem extends object, Properties>() => <BreakPoint extends Record<string, number>>(breakPoint: BreakPoint) => {
    return {
        renderer: defineRenderer<DataItem, BreakPoint, Properties>({
            breakPoint: new Signal.State(breakPoint)
        })
    }
}

const defineRenderer = <DataItem extends object, BreakPoint extends Record<string, number>, Properties>(props: {
    breakPoint: Signal.State<BreakPoint>
}) => <CellRenderer extends CellCompType<DataItem, Properties>>(cellRenderer: CellRenderer) => {
    return {
        template: defineTemplate<DataItem, BreakPoint, CellRenderer, Properties>({
            ...props,
            cellRenderer: new Signal.State(cellRenderer)
        })
    }
}

const defineTemplate = <DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellCompType<DataItem, Properties>, Properties>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>
}) => <Template extends TemplateType<DataItem, BreakPoint, CellRenderer, Properties>>(_template: Template) => {
    const template = new Signal.State(_template);
    const {breakPoint, cellRenderer} = props;

    const ResponsiveViewContext = ViewContext as Context<ViewContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>>;

    const View = forwardRef<ViewContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>, {item:DataItem} & Properties>(function View(properties, ref) {
        const componentId = useId();

        const viewportDimensions = useSignal({width: window.innerWidth, height: window.innerHeight});
        const currentBreakPoint = useComputed<keyof BreakPoint>(() => {
            const containerSizeValue: {
                width: number;
                height: number
            } = viewportDimensions.get();
            const responsiveBreakPointValue: Record<string, number> = breakPoint.get();
            const entries = Object.entries(responsiveBreakPointValue);
            entries.sort((a, b) => a[1] - b[1]);
            for (const entry of entries) {
                if (containerSizeValue.width <= entry[1]) {
                    return entry[0]
                }
            }
            return entries[entries.length - 1][0]
        });

        const currentTemplateKey = useComputed(() => {
            const activeBreakPointValue = currentBreakPoint.get();
            const templateValue = template.get();
            const breakPointValue = breakPoint.get();
            const templateValueEntries = Object.keys(templateValue).reduce((result, key: keyof Template) => {
                if (breakPointValue && key in breakPointValue) {
                    const keyString = key.toString();
                    result[keyString] = breakPointValue[keyString] as number;
                }
                return result;
            }, {} as Record<string, number>);

            const entries = Object.entries(templateValueEntries);
            entries.sort((a, b) => b[1] - a[1]);
            let findMatchingTemplateKey: string | undefined = undefined;
            for (const entry of entries) {
                if (breakPointValue[activeBreakPointValue] <= entry[1]) {
                    findMatchingTemplateKey = entry[0];
                }
            }
            if (findMatchingTemplateKey === undefined) {
                findMatchingTemplateKey = entries[0][0];
            }

            return findMatchingTemplateKey as keyof Template;
        })

        useEffect(() => {
            const element: HTMLElement = document.getElementById(componentId)!;
            const resizeObserver: ResizeObserver = new ResizeObserver(entries => {
                const size = entries.pop()!.target.getBoundingClientRect();
                viewportDimensions.set({width: size.width, height: size.height});
            })
            viewportDimensions.set(element.getBoundingClientRect());
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        }, [componentId, viewportDimensions]);


        useImperativeHandle(ref, () => {
            return {
                breakPoint,
                cellRenderer,
                template,
                viewportDimensions,
                currentBreakPoint,
                currentTemplateKey,
                properties: properties as Properties,
                item: properties.item
            }
        })
        const element = useComputed(() => {
            const activeTemplateKeyValue = currentTemplateKey.get();
            const templateValue = template.get();
            const TemplateRenderer = templateValue[activeTemplateKeyValue] as unknown as FunctionComponent<{ Slot: SlotComp<unknown>, item: DataItem } & Properties>;

            return <TemplateRenderer Slot={TemplateSlot<BreakPoint, CellRenderer, Template, DataItem, Properties, Record<string,unknown>>}
                                     {...properties}/>
        });

        return <ResponsiveViewContext.Provider
            value={{
                breakPoint,
                cellRenderer,
                template,
                viewportDimensions,
                currentBreakPoint,
                currentTemplateKey,
                properties: properties as Properties,
                item: properties.item,
            }}>
            <notifiable.div id={componentId} style={{flexShrink: 0, overflow: 'auto'}}>
                {element}
            </notifiable.div>
        </ResponsiveViewContext.Provider>
    })
    return {View, Context: ResponsiveViewContext}
}
