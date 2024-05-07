import {Context, CSSProperties, useEffect, useId} from "react";
import {Signal} from "signal-polyfill";
import {AnySignal, notifiable, useComputed, useSignal} from "react-hook-signal";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContext} from "./ListContext.ts";
import {CellCompType, ListContextData, TemplateContextData, TemplateType} from "./types.ts";
import {Segment} from "./Segment.tsx";

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
        template: defineTemplate<DataItem, BreakPoint, CellRenderer>({
            ...props,
            cellRenderer: new Signal.State(cellRenderer)
        })
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
    const ResponsiveListContext = ListContext as Context<ListContextData<DataItem, BreakPoint, CellRenderer, Template>>;
    const ResponsiveTemplateContext = TemplateContext as Context<TemplateContextData<DataItem>>;

    function List(properties: { data: AnySignal<Array<DataItem>>,onScroll?:(e:{target:{scrollTop:number}}) => void } & Record<string,unknown>) {
        const componentId = useId();
        const viewportDimensions = useSignal({width: window.innerWidth, height: window.innerHeight});
        const scrollOffset = useSignal(0);
        const templateHeight = useSignal(0);
        const totalSegment = useSignal(4);
        const totalOffsetSegment = useSignal(1);
        const {data,onScroll,...props} = properties;
        const totalTemplatePerSegment = useComputed(() => {
            const {height} = viewportDimensions.get();
            const templateHeightValue = templateHeight.get();
            if (height > 0 && templateHeightValue > 0) {
                return Math.ceil(height / templateHeightValue);
            }
            return 1
        });
        const currentBreakPoint = useComputed<keyof BreakPoint>(() => {
            const containerSizeValue: { width: number; height: number } = viewportDimensions.get();
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

        const currentScrollSegment = useComputed(() => {
            const scrollPositionValue = scrollOffset.get();
            const templateHeightValue = templateHeight.get();
            if (templateHeightValue === 0) {
                return 0
            }
            const currentScrollIndex = Math.floor(scrollPositionValue / templateHeightValue);
            const templateToBeDisplayed = totalTemplatePerSegment.get();
            return Math.floor(currentScrollIndex / templateToBeDisplayed);
        })

        const segmentCurrentlyBeingRendered = useSignal<Array<number>>(Array.from({length: totalSegment.get()}).map((_, i) => i));
        const containerStyle = useComputed<CSSProperties>(() => {
            const templateHeightValue = templateHeight.get();
            const totalData = data.get().length;
            return {
                height: templateHeightValue * totalData,
                position: 'relative'
            }
        })
        const segments = useComputed(() => {
            const totalSegmentValue = totalSegment.get();
            return Array.from({length: totalSegmentValue}).map((_, index) => {
                return <Segment startingPage={index} key={index}/>
            })

        })
        return <ResponsiveListContext.Provider
            value={{
                breakPoint,
                cellRenderer,
                template,
                viewportDimensions,
                currentBreakPoint,
                templateHeight,
                scrollOffset,
                currentTemplateKey,
                data,
                totalTemplatePerSegment,
                currentScrollSegment,
                segmentCurrentlyBeingRendered,
                totalOffsetSegment,
                totalSegment,
                properties:props
            }}>
            <div id={componentId} style={{height: '100%', overflow: 'auto'}} onScroll={(e) => {
                scrollOffset.set((e.target as HTMLDivElement).scrollTop);
                if(onScroll) {
                    onScroll(e as unknown as {target:{scrollTop:number}});
                }
            }}>
                <notifiable.div style={containerStyle}>
                    {segments}
                </notifiable.div>
            </div>
        </ResponsiveListContext.Provider>
    }

    return {List, ListContext: ResponsiveListContext, TemplateContext: ResponsiveTemplateContext}
}
