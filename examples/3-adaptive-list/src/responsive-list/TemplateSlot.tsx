import {CSSProperties, type FunctionComponent, useContext, useEffect, useRef} from "react";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContext} from "./ListContext.ts";
import {CellCompProps, ListContextData, TemplateContextData} from "./types.ts";

/**
 * Renders a template slot for a cell in a list or grid.
 *
 * @param {object} props - The properties for the template slot.
 * @param {keyof CellRenderer} props.for - The name of the cell renderer to use.
 * @param {CSSProperties} props.style - The custom style for the template slot.
 * @returns {JSX.Element} - The rendered template slot.
 */
export function TemplateSlot<DataItem,BreakPoint,CellRenderer,Template>(props: {
    for: keyof CellRenderer,
    style : CSSProperties
}): JSX.Element{
    const {item,index} = useContext(TemplateContext) as TemplateContextData<DataItem>;
    const {templateHeight,cellRenderer} = useContext(ListContext)  as ListContextData<DataItem,BreakPoint, CellRenderer, Template>;
    const {for: name,style} = props;

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(ref.current !== null){
            if(templateHeight.get() === 0 ){
                templateHeight.set(ref.current.getBoundingClientRect().height);
            }else{
                ref.current.style.height = `${templateHeight.get()}px`;
            }
        }
    }, [templateHeight]);

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
            index
        } as CellCompProps<DataItem, typeof nameKey>;
        return <div ref={ref} style={style}>
            <ItemRenderer {...componentProps}/>
        </div>
    }
    return <></>
}


function isNotEmpty<T>(value:unknown): value is T {
    return value !== null && value !== undefined
}
