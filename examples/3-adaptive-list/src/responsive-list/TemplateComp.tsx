import {CSSProperties, FunctionComponent, useContext, useEffect, useRef} from "react";
import {TemplateContext} from "./TemplateContext.ts";
import {ListContextData, SlotComp, TemplateContextData} from "./types.ts";
import {ListContext} from "./ListContext.ts";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {TemplateSlot} from "./TemplateSlot.tsx";
import {delay} from "../utils/delay.ts";

/**
 * Creates a template component.
 *
 * @returns {JSX.Element} - The generated template component.
 */
export function TemplateComp<DataItem, BreakPoint, CellRenderer, Template>(): JSX.Element {
    const {index, item} = useContext(TemplateContext) as TemplateContextData<DataItem>;
    const {
        templateHeight,
        template,
        currentTemplateKey
    } = useContext(ListContext) as ListContextData<DataItem, BreakPoint, CellRenderer, Template>;
    const style = useComputed<CSSProperties>(() => {
        const templateHeightValue = templateHeight.get();
        return {
            position: 'absolute',
            top: index * templateHeightValue,
            display: "flex",
            flexDirection: 'column',
            height: templateHeightValue > 0 ? templateHeightValue : 'unset',
            overflow: "hidden",
            width: '100%',
            opacity: templateHeightValue > 0 ? 1 : 0
        }
    })
    const indexSignal = useSignal(index);
    const itemSignal = useSignal(item);
    useEffect(() => {
        indexSignal.set(index);
        itemSignal.set(item);
    }, [index, item]);
    const ref = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

    useEffect(() => {
        async function getHeight() {
            if (ref.current !== null) {
                const newHeight = ref.current.getBoundingClientRect().height;
                if (newHeight > 0) {
                    return newHeight;
                }
            }
            await delay(100)
            return getHeight();
        }

        (async () => {
            if (templateHeight.get() === 0) {
                const height = await getHeight();
                templateHeight.set(height);
            } else if (ref.current) {
                ref.current.style.height = `${templateHeight.get()}px`;
            }
        })()

    }, [templateHeight]);
    const element = useComputed(() => {
        const templateValue = template.get();
        const activeTemplateKeyValue = currentTemplateKey.get();
        const index = indexSignal.get();
        const item = itemSignal.get();

        const TemplateRenderer = templateValue[activeTemplateKeyValue] as unknown as FunctionComponent<{
            Slot: SlotComp<unknown>,
            item: DataItem,
            index: number
        }>;
        return <TemplateRenderer Slot={TemplateSlot<BreakPoint, CellRenderer, Template, DataItem>} index={index}
                                 item={item}/>
    })


    return <notifiable.div ref={ref} style={style}>{element}</notifiable.div>
}