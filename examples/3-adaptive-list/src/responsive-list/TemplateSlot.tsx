import {CSSProperties, type FunctionComponent, useContext} from "react";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContext} from "./ListContext.ts";
import {CellCompProps, ListContextData, TemplateContextData} from "./types.ts";

/**
 * Renders a template slot for a cell in a list or grid.
 */
export function TemplateSlot<DataItem,BreakPoint,CellRenderer,Template>(props: {
    for: keyof CellRenderer,
    style ?: CSSProperties
} & Record<string, unknown>): JSX.Element{
    const {item,index} = useContext(TemplateContext) as TemplateContextData<DataItem>;
    const {cellRenderer} = useContext(ListContext)  as ListContextData<DataItem,BreakPoint, CellRenderer, Template>;
    const {for: name,style,...propsForRenderer} = props;

    /**
     * Represents an item renderer function component used to render a cell in a table.
     */
    const ItemRenderer = cellRenderer.get()[name] as FunctionComponent<CellCompProps<DataItem, typeof nameKey>>;

    /**
     * Represents a key to access a specific property in the DataItem object using the name property.
     */
    const nameKey = name as unknown as keyof DataItem;


    if(isNotEmpty<DataItem>(item)){
        const componentProps = {
            item: item,
            name: name,
            value: item[nameKey],
            index,
            ...propsForRenderer
        } as CellCompProps<DataItem, typeof nameKey>;
        return <div style={style}>
            <ItemRenderer {...componentProps}/>
        </div>
    }
    return <></>
}


function isNotEmpty<T>(value:unknown): value is T {
    return value !== null && value !== undefined
}
