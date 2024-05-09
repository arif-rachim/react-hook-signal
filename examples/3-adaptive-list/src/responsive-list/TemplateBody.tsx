import {Signal} from "signal-polyfill";
import {CSSProperties, FunctionComponent, useEffect, useRef} from "react";
import {CellCompProps} from "./types.ts";

export function TemplateBody<CellRenderer, DataItem, Properties, TemplateProps>(props:{
    cellRenderer: Signal.State<CellRenderer>,
    name: keyof CellRenderer,
    item: DataItem,
    index: number,
    properties: Properties,
    propsForRenderer: TemplateProps,
    onSizeChange: ((dimension: DOMRect) => void) | undefined,
    style: CSSProperties | undefined
}) {

    const {index,item,properties,propsForRenderer,cellRenderer,style,onSizeChange,name} = props;
    /**
     * Represents an item renderer function component used to render a cell in a table.
     */
    const ItemRenderer = cellRenderer.get()[name] as FunctionComponent<CellCompProps<DataItem, typeof nameKey> & Properties>;
    if (ItemRenderer === undefined || ItemRenderer === null) {
        throw new Error(`Unable to find renderer with key "${name.toString()}"`);
    }
    /**
     * Represents a key to access a specific property in the DataItem object using the name property.
     */
    const nameKey = name as unknown as keyof DataItem;

    const componentProps = {
        item: item,
        name: name,
        value: item[nameKey],
        index,
        ...properties,
        ...propsForRenderer
    } as (CellCompProps<DataItem, typeof nameKey> & Properties);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let observer: ResizeObserver | void;
        const element = ref.current!;
        if (onSizeChange) {
            const observer = new ResizeObserver((entries) => {
                const entry = entries.pop();
                if(entry){
                    const rect = entry.target.getBoundingClientRect();
                    if(rect.width > 0 && rect.height > 0){
                        onSizeChange(rect)
                    }

                }
            });
            observer.observe(element);
        }
        return () => {
            if (observer !== undefined) {
                observer.unobserve(element);
                observer.disconnect();
            }
        }
    }, [onSizeChange])
    return <div ref={ref} style={style}>
        {isNotEmpty(item) && <ItemRenderer {...componentProps}/>}
    </div>
}

function isNotEmpty<T>(value: unknown): value is T {
    return value !== null && value !== undefined
}