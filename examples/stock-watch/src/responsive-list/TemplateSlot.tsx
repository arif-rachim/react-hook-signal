import {useContext} from "react";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContext} from "./ListContext.ts";
import {ListContextData, SlotCompProps, TemplateContextData} from "./types.ts";
import {TemplateBody} from "./TemplateBody.tsx";

/**
 * Renders a template slot for a cell in a list or grid.
 */
export function TemplateSlot<DataItem, BreakPoint, CellRenderer, Template, Properties, TemplateProps extends Record<string, unknown>>(props: SlotCompProps<CellRenderer> & TemplateProps): JSX.Element {
    const {item, index} = useContext(TemplateContext) as TemplateContextData<DataItem>;
    const {cellRenderer, properties} = useContext(ListContext) as ListContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>;
    const {for: name, style,onSizeChange, ...propsForRenderer} = props;
    return <TemplateBody cellRenderer={cellRenderer} name={name} item={item} index={index} properties={properties} propsForRenderer={propsForRenderer} onSizeChange={onSizeChange} style={style} />
}
