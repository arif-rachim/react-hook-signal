import {CSSProperties, FunctionComponent, useContext} from "react";
import {RowContext} from "./RowContext.ts";
import {ListContextData, RowContextData, SlotComp} from "./types.ts";
import {ListContext} from "./ListContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {TemplateSlot} from "./TemplateSlot.tsx";

/**
 * Creates a template component.
 *
 * @returns {JSX.Element} - The generated template component.
 */
export function TemplateComp<DataItem,BreakPoint, CellRenderer, Template>(): JSX.Element{
    const {index} = useContext(RowContext) as RowContextData<DataItem>;
    const {rowHeight,template,activeTemplateKey} = useContext(ListContext) as ListContextData<BreakPoint, CellRenderer, Template>;
    const style = useComputed<CSSProperties>(() => {
        const rowHeightValue = rowHeight.get();
        return {
            position:'absolute',
            top : index * rowHeightValue,
            display:"flex",
            flexDirection:'column',
            height : rowHeightValue,
            overflow:"hidden",
            width:'100%'
        }
    })
    const element = useComputed(() => {
        const templateValue = template.get();
        const activeTemplateKeyValue = activeTemplateKey.get();
        const TemplateRenderer = templateValue[activeTemplateKeyValue] as unknown as FunctionComponent<{Slot:SlotComp<unknown>}>;
        return <TemplateRenderer Slot={TemplateSlot<BreakPoint,CellRenderer,Template,DataItem>} />
    })
    return <notifiable.div style={style}>{element}</notifiable.div>
}