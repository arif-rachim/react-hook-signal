import {useContext} from "react";
import {ViewContext} from "./ViewContext.ts";
import {ViewContextData} from "./types.ts";
import {TemplateBody} from "../responsive-list/TemplateBody.tsx";
import {SlotCompProps} from "../responsive-list/types.ts";

export function TemplateSlot<DataItem, BreakPoint, CellRenderer, Template, Properties, TemplateProps extends Record<string, unknown>>(props: SlotCompProps<CellRenderer> & TemplateProps): JSX.Element {
    const {cellRenderer, item, properties} = useContext(ViewContext) as ViewContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>;
    const {for: name, style,onSizeChange, ...propsForRenderer} = props;
    return <TemplateBody cellRenderer={cellRenderer} name={name} item={item} index={0} properties={properties} propsForRenderer={propsForRenderer} onSizeChange={onSizeChange} style={style} />
}
