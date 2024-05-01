import {createContext, CSSProperties, type FunctionComponent, useContext, useEffect, useId, useRef} from "react";
import {Signal} from "signal-polyfill";
import {AnySignal, notifiable, useComputed, useSignal} from "react-hook-signal";

type CellCompProps<DataItem, K extends keyof DataItem> = { item: DataItem, value: DataItem[K],index:number};
type CellCompType<DataItem> = { [K in keyof DataItem]?: FunctionComponent<CellCompProps<DataItem, K>> }
type SlotComp<CellRenderer> = FunctionComponent<{ for: keyof CellRenderer,style:CSSProperties }>
type TemplateType<DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellCompType<DataItem>> = { [K in keyof BreakPoint]?: FunctionComponent<{ Slot: SlotComp<CellRenderer> }> }

interface ContextData<BreakPoint, CellRenderer, Template> {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
    containerSize?: AnySignal<{ width: number, height: number }>,
    activeBreakPoint?: AnySignal<keyof BreakPoint>
}

export function createResponsiveList<DataItem extends object>() {
    return {
        breakPoint: defineBreakPoint<DataItem>()
    }
}

const defineBreakPoint = <DataItem extends object>() => <BreakPoint extends Record<string, number>>(breakPoint: BreakPoint) => {
    return {
        renderer: defineRenderer<DataItem, BreakPoint>({
            breakPoint: new Signal.State(breakPoint)
        })
    }
}


const defineRenderer = <DataItem extends object, BreakPoint extends Record<string, number>>(props: {
    breakPoint: Signal.State<BreakPoint>
}) => <CellRenderer extends CellCompType<DataItem>>(cellRenderer: CellRenderer) => {
    return {
        template: defineTemplate<DataItem, BreakPoint, CellRenderer>({...props, cellRenderer: new Signal.State(cellRenderer)})
    }
}

const defineTemplate = <DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellCompType<DataItem>>(props: {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>
}) => <Template extends TemplateType<DataItem, BreakPoint, CellRenderer>>(template: Template) => {
    return {
        list: defineList<DataItem, BreakPoint, CellRenderer, Template>({...props, template: new Signal.State(template)})
    }
}

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
    const ListContext = createContext<ContextData<BreakPoint, CellRenderer, Template>>({...props})
    const RowContext = createContext<{ item: DataItem, index: number } | undefined>(undefined);

    function List(properties: { data: Signal.State<Array<DataItem>> }) {
        const componentId = useId();
        const containerSize = useSignal({width: window.innerWidth, height: window.innerHeight});
        const scrollPosition = useSignal(0);
        const rowHeight = useSignal(0);
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

        const TemplateSlot:SlotComp<CellRenderer> = (props: {
            for: keyof CellRenderer,
            style : CSSProperties
        }) => {
            const {item,index} = useContext(RowContext)!;
            const {for: name,style} = props;
            const nameKey = name as keyof DataItem;
            const componentProps = {
                item: item,
                name: name,
                value: item?.[nameKey],
                index
            } as CellCompProps<DataItem, typeof nameKey>;
            const ref = useRef<HTMLDivElement>(null);
            useEffect(() => {
                if(ref.current !== null){
                    if(rowHeight.get() === 0 ){
                        rowHeight.set(ref.current.getBoundingClientRect().height);
                    }else{
                        ref.current.style.height = `${rowHeight.get()}px`;
                    }
                }

            }, []);
            const ItemRenderer = cellRenderer.get()[name] as FunctionComponent<CellCompProps<DataItem, typeof nameKey>>;
            const styleComputed = useComputed<CSSProperties>(() => {
                const rowHeightValue = rowHeight.get();
                return {
                    overflow:'hidden',
                    position:'absolute',
                    top:index * rowHeightValue,
                    ...style
                }
            })
            return <notifiable.div ref={ref} style={styleComputed}>
                <ItemRenderer {...componentProps}/>
            </notifiable.div>
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
        const containerStyle = useComputed<CSSProperties>(() => {
            const rowHeightValue = rowHeight.get();
            const totalData = data.get().length;
            return {
                height : rowHeightValue * totalData,
                position:'relative'
            }
        })
        return <ListContext.Provider
            value={{breakPoint, cellRenderer, template, containerSize, activeBreakPoint}}>
            <notifiable.div id={componentId} style={{display:"flex",flexDirection:'column',height:'100%',overflow:'auto'}} onScroll={(e) => {
                scrollPosition.set((e.target as HTMLDivElement).scrollTop);
            }}>
                <notifiable.div style={containerStyle}>
                {elements}
                </notifiable.div>
            </notifiable.div>
        </ListContext.Provider>
    }

    return {List,ListContext,RowContext}
}