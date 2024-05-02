import {CSSProperties, FunctionComponent, useContext} from "react";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContextData, TemplateContextData, SlotComp} from "./types.ts";
import {ListContext} from "./ListContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {TemplateSlot} from "./TemplateSlot.tsx";

/**
 * Creates a template component.
 *
 * @returns {JSX.Element} - The generated template component.
 */
export function TemplateComp<DataItem,BreakPoint, CellRenderer, Template>(): JSX.Element{
    const {index} = useContext(TemplateContext) as TemplateContextData<DataItem>;
    const {templateHeight,template,currentTemplateKey} = useContext(ListContext) as ListContextData<DataItem,BreakPoint, CellRenderer, Template>;
    const style = useComputed<CSSProperties>(() => {
        const templateHeightValue = templateHeight.get();
        return {
            position:'absolute',
            top : index * templateHeightValue,
            display:"flex",
            flexDirection:'column',
            height : templateHeightValue,
            overflow:"hidden",
            width:'100%'
        }
    })
    const element = useComputed(() => {
        const templateValue = template.get();
        const activeTemplateKeyValue = currentTemplateKey.get();
        const TemplateRenderer = templateValue[activeTemplateKeyValue] as unknown as FunctionComponent<{Slot:SlotComp<unknown>}>;
        return <TemplateRenderer Slot={TemplateSlot<BreakPoint,CellRenderer,Template,DataItem>} />
    })
    return <notifiable.div style={style}>{element}</notifiable.div>
}