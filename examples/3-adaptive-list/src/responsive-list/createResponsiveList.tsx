import React, {CSSProperties, useEffect, useId} from "react";
import {Signal} from "signal-polyfill";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContext} from "./ListContext.ts";
import {CellCompType, ListContextData, TemplateContextData, TemplateType} from "./types.ts";
import {TemplateComp} from "./TemplateComp.tsx";

/**
 * Create a responsive list.
 */
export function createResponsiveList<DataItem extends object>() {
    return {
        breakPoint: defineBreakPoint<DataItem>()
    }
}

/**
 * Defines a breakpoint for rendering based on the provided `breakPoint` object.
 */
const defineBreakPoint = <DataItem extends object>() => <BreakPoint extends Record<string, number>>(breakPoint: BreakPoint) => {
    return {
        renderer: defineRenderer<DataItem, BreakPoint>({
            breakPoint: new Signal.State(breakPoint)
        })
    }
}

/**
 * Define a renderer for a data item and break point.
 */
const defineRenderer = <DataItem extends object, BreakPoint extends Record<string, number>>(props: {
    breakPoint: Signal.State<BreakPoint>
}) => <CellRenderer extends CellCompType<DataItem>>(cellRenderer: CellRenderer) => {
    return {
        template: defineTemplate<DataItem, BreakPoint, CellRenderer>({...props, cellRenderer: new Signal.State(cellRenderer)})
    }
}

/**
 * Define a template for rendering a list of items with custom breakpoints and cell renderers.
 */
const defineTemplate = <DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellCompType<DataItem>>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>
}) => <Template extends TemplateType<DataItem, BreakPoint, CellRenderer>>(template: Template) => {
    return {
        list: defineList<DataItem, BreakPoint, CellRenderer, Template>({...props, template: new Signal.State(template)})
    }
}

/**
 * A function that returns a list component and related context providers.
 */
const defineList = <DataItem extends object,
    BreakPoint extends Record<string, number>,
    CellRenderer extends CellCompType<DataItem>,
    Template extends TemplateType<DataItem, BreakPoint, CellRenderer>,
>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
}) => () => {
    const {breakPoint, cellRenderer, template} = props;
    const ResponsiveListContext = ListContext as React.Context<ListContextData<BreakPoint, CellRenderer, Template>>;
    const ResponsiveTemplateContext = TemplateContext as React.Context<TemplateContextData<DataItem>>;

    function List(properties: { data: Signal.State<Array<DataItem>> }) {
        const componentId = useId();
        const containerSize = useSignal({width: window.innerWidth, height: window.innerHeight});
        const scrollPosition = useSignal(0);
        const templateHeight = useSignal(0);
        const {data} = properties;

        const activeBreakPoint = useComputed<keyof BreakPoint>(() => {
            const containerSizeValue: { width: number; height: number } = containerSize.get();
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

        const activeTemplateKey = useComputed(() => {
            const activeBreakPointValue = activeBreakPoint.get();
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
                containerSize.set({width: size.width, height: size.height});
            })
            containerSize.set(element.getBoundingClientRect());
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        }, [componentId, containerSize]);

        const elements = useComputed(() => {
            return data.get().map((item,index) => {
                return <ResponsiveTemplateContext.Provider value={{item, index}} key={index}>
                    <TemplateComp/>
                </ResponsiveTemplateContext.Provider>
            })
        })



        const containerStyle = useComputed<CSSProperties>(() => {
            const templateHeightValue = templateHeight.get();
            const totalData = data.get().length;
            return {
                height : templateHeightValue * totalData,
                position:'relative'
            }
        })
        return <ResponsiveListContext.Provider
            value={{breakPoint, cellRenderer, template, containerSize, activeBreakPoint,templateHeight,scrollPosition,activeTemplateKey}}>
            <div id={componentId} style={{display:"flex",flexDirection:'column',height:'100%',overflow:'auto'}} onScroll={(e) => {
                scrollPosition.set((e.target as HTMLDivElement).scrollTop);
            }}>
                <notifiable.div style={containerStyle}>
                {elements}
                </notifiable.div>
            </div>
        </ResponsiveListContext.Provider>
    }

    return {List,ListContext:ResponsiveListContext,TemplateContext:ResponsiveTemplateContext}
}

