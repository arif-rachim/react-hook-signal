import {
    Context,
    CSSProperties,
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useEffect,
    useId,
    useImperativeHandle
} from "react";
import {Signal} from "signal-polyfill";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContext} from "./ListContext.ts";
import {CellCompType, ListContextData, ListProps, TemplateContextData, TemplateType} from "./types.ts";
import {Segment} from "./Segment.tsx";

/**
 * Create a responsive list.
 */
export function createResponsiveList<DataItem extends object, Properties extends object = Record<string, unknown>>() {
    return {
        breakPoint: defineBreakPoint<DataItem, Properties>()
    }
}

/**
 * Defines a breakpoint for rendering based on the provided `breakPoint` object.
 */
const defineBreakPoint = <DataItem extends object, Properties>() => <BreakPoint extends Record<string, number>>(breakPoint: BreakPoint) => {
    return {
        renderer: defineRenderer<DataItem, BreakPoint, Properties>({
            breakPoint: new Signal.State(breakPoint)
        })
    }
}

/**
 * Define a renderer for a data item and break point.
 */
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

/**
 * Define a template for rendering a list of items with custom breakpoints and cell renderers.
 */
const defineTemplate = <DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellCompType<DataItem, Properties>, Properties>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>
}) => <Template extends TemplateType<DataItem, BreakPoint, CellRenderer, Properties>>(_template: Template) => {
    const {breakPoint, cellRenderer} = props;
    const template = new Signal.State(_template);
    const ResponsiveListContext = ListContext as Context<ListContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>>;
    const ResponsiveTemplateContext = TemplateContext as Context<TemplateContextData<DataItem>>;

    const List = forwardRef<ListContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>, (ListProps<DataItem> & Properties)>(function List(props, ref) {
        const componentId = useId();
        const levelOneId = `${componentId}-lvl1`;
        const levelTwoId = `${componentId}-lvl2`;
        const viewportDimensions = useSignal({width: window.innerWidth, height: window.innerHeight});
        const scrollOffset = useSignal(0);
        const templateHeight = useSignal(0);
        const totalSegment = useSignal(4);
        const totalOffsetSegment = useSignal(1);
        const {data, onScroll, style, ...properties} = props;
        const totalTemplatePerSegment = useComputed(() => {
            const {height} = viewportDimensions.get();
            const templateHeightValue = templateHeight.get();
            if (height > 0 && templateHeightValue > 0) {
                return Math.ceil(height / templateHeightValue);
            }
            return 1
        });
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
            const element: HTMLElement = document.getElementById(levelOneId)!;
            const resizeObserver: ResizeObserver = new ResizeObserver(entries => {
                const size = entries.pop()!.target.getBoundingClientRect();
                viewportDimensions.set({width: size.width, height: size.height});
            })
            viewportDimensions.set(element.getBoundingClientRect());
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        }, [levelOneId, viewportDimensions]);

        const currentScrollSegment = useComputed(() => {
            const scrollPositionValue = scrollOffset.get();
            const templateHeightValue = templateHeight.get();
            if (templateHeightValue === 0) {
                return 0
            }
            const currentScrollIndex = Math.floor(scrollPositionValue / templateHeightValue);
            const templateToBeDisplayed = totalTemplatePerSegment.get();
            return Math.floor(currentScrollIndex / templateToBeDisplayed);
        });

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
        useImperativeHandle(ref, () => {
            return {
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
                properties: properties as Properties,
                containerLevelOne: () => document.getElementById(levelOneId)! as HTMLDivElement,
                containerLevelTwo: () => document.getElementById(levelTwoId)! as HTMLDivElement
            }
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
                properties: properties as Properties,
                containerLevelOne: () => document.getElementById(levelOneId)! as HTMLDivElement,
                containerLevelTwo: () => document.getElementById(levelTwoId)! as HTMLDivElement
            }}>
            <div id={levelOneId} style={{height: '100%', overflow: 'auto', scrollBehavior: 'smooth', ...style}}
                 onScroll={(e) => {
                     scrollOffset.set((e.target as HTMLDivElement).scrollTop);
                     if (onScroll) {
                         onScroll(e as unknown as {
                             target: {
                                 scrollTop: number
                             }
                         });
                     }
                 }} >
                <notifiable.div id={levelTwoId} style={containerStyle}>
                    {segments}
                </notifiable.div>
            </div>
        </ResponsiveListContext.Provider>
    })
    return {List, ListContext: ResponsiveListContext, TemplateContext: ResponsiveTemplateContext}
}


export type InferContextRef<T> = T extends ForwardRefExoticComponent<infer A> ? A extends RefAttributes<infer B> ? B : never : never;
export type InferListGenerics<T> = InferContextRef<T> extends ListContextData<infer DataItem, infer BreakPoint, infer CellRenderer, infer Template, infer Properties> ? {
    dataItem: DataItem,
    breakPoint: BreakPoint,
    cellRenderer: CellRenderer,
    template: Template,
    properties: Properties
} : never