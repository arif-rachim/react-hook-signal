import {createContext, CSSProperties, type FunctionComponent, useContext, useEffect, useId} from "react";
import {Signal} from "signal-polyfill";
import {AnySignal, notifiable, useComputed, useSignal} from "react-hook-signal";

type SlotComponent<CellRenderer> = FunctionComponent<{ for: keyof CellRenderer,style:CSSProperties }>
type TemplateType<DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellRendererType<DataItem>> = { [K in keyof BreakPoint]?: FunctionComponent<{ Slot: SlotComponent<CellRenderer> }> }
type CellRendererProps<DataItem, K extends keyof DataItem> = { item: DataItem, value: DataItem[K],style:CSSProperties};
type CellRendererType<DataItem> = { [K in keyof DataItem]?: FunctionComponent<CellRendererProps<DataItem, K>> }

interface ListContextProps<BreakPoint, CellRenderer, Template> {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
    containerSize?: AnySignal<{ width: number, height: number }>,
    activeBreakPoint?: AnySignal<keyof BreakPoint>
}

export function createAdaptiveList<DataItem extends object>() {
    return {
        breakPoint: createBreakPoint<DataItem>()
    }
}

const createBreakPoint = <DataItem extends object>() => <BreakPoint extends Record<string, number>>(breakPoint: BreakPoint) => {
    return {
        renderer: createRenderer<DataItem, BreakPoint>({
            breakPoint: new Signal.State(breakPoint)
        })
    }
}


const createRenderer = <DataItem extends object, BreakPoint extends Record<string, number>>(props: {
    breakPoint: Signal.State<BreakPoint>
}) => <CellRenderer extends CellRendererType<DataItem>>(cellRenderer: CellRenderer) => {
    return {
        template: createTemplate<DataItem, BreakPoint, CellRenderer>({...props, cellRenderer: new Signal.State(cellRenderer)})
    }
}

const createTemplate = <DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellRendererType<DataItem>>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>
}) => <Template extends TemplateType<DataItem, BreakPoint, CellRenderer>>(template: Template) => {
    return {
        list: createList<DataItem, BreakPoint, CellRenderer, Template>({...props, template: new Signal.State(template)})
    }
}

const createList = <DataItem extends object,
    BreakPoint extends Record<string, number>,
    CellRenderer extends CellRendererType<DataItem>,
    Template extends TemplateType<DataItem, BreakPoint, CellRenderer>,
>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
}) => () => {
    const {breakPoint, cellRenderer, template} = props;
    const ListContext = createContext<ListContextProps<BreakPoint, CellRenderer, Template>>({...props})
    const RowContext = createContext<{ item: DataItem, index: number } | undefined>(undefined);

    function List(properties: { data: Signal.State<Array<DataItem>> }) {
        const componentId = useId();
        const containerSize = useSignal({width: 0, height: 0});
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

        const TemplateSlot:SlotComponent<CellRenderer> = (props: {
            for: keyof CellRenderer,
            style : CSSProperties
        }) => {
            const rowContext = useContext(RowContext);
            const {for: name,style} = props;
            const nameKey = name as keyof DataItem;
            const componentProps = {
                item: rowContext?.item,
                name: name,
                value: rowContext?.item?.[nameKey],
                style
            } as CellRendererProps<DataItem, typeof nameKey>;
            const ItemRenderer = cellRenderer.get()[name] as FunctionComponent<CellRendererProps<DataItem, typeof nameKey>>;
            if (ItemRenderer === null || ItemRenderer === undefined) {
                return <div
                    style={{color: 'red', fontWeight: 'bold', fontStyle: 'italic', fontSize: 'small'}}>{name.toString()}!</div>
            }
            return <ItemRenderer {...componentProps}/>
        }

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
            const TemplateRenderer = templateValue[findMatchingTemplateKey]!;
            return data.get().map((item,index) => {
                return <RowContext.Provider value={{item, index}} key={index}>
                    <TemplateRenderer Slot={TemplateSlot}/>
                </RowContext.Provider>
            })
        })
        return <ListContext.Provider
            value={{breakPoint, cellRenderer, template, containerSize, activeBreakPoint}}>
            <notifiable.div id={componentId} style={{display: 'flex', flexDirection: 'column'}}>
                {elements}
            </notifiable.div>
        </ListContext.Provider>
    }

    return {List,Context:ListContext}
}