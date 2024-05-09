import {CSSProperties, FunctionComponent, useContext, useEffect, useId} from "react";
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
export function TemplateComp<DataItem, BreakPoint, CellRenderer, Template, Properties>(): JSX.Element {
    const componentId = useId();
    const {index, item} = useContext(TemplateContext) as TemplateContextData<DataItem>;
    const {templateHeight, template, currentTemplateKey,properties} = useContext(ListContext) as ListContextData<DataItem, BreakPoint, CellRenderer, Template, Properties>;
    const style = useComputed<CSSProperties>(() => {
        const templateHeightValue = templateHeight.get();
        return {
            position: 'absolute',
            top: index * templateHeightValue,
            display: "flex",
            flexDirection: 'column',
            height: templateHeightValue > 0 ? templateHeightValue : 'unset',
            overflow: "hidden",
            width: '100%'
        }
    })
    const readyToRender = useSignal(false);
    const indexSignal = useSignal(index);
    const itemSignal = useSignal(item);
    useEffect(() => {
        indexSignal.set(index);
        itemSignal.set(item);
    }, [index, indexSignal, item, itemSignal]);

    useEffect(() => {
        async function getHeight() {
            const element = document.getElementById(componentId);
            if (element !== null) {
                const newHeight = element.getBoundingClientRect().height;
                if (newHeight > 0) {
                    return newHeight;
                }
            }
            await delay(100)
            return getHeight();
        }

        (async () => {
            const element = document.getElementById(componentId);
            if (templateHeight.get() === 0) {
                const height = await getHeight();
                templateHeight.set(height);
            } else if (element) {
                element.style.height = `${templateHeight.get()}px`;
            }
        })()

    }, [componentId, templateHeight]);
    const element = useComputed(() => {
        const templateValue = template.get();
        const activeTemplateKeyValue = currentTemplateKey.get();
        const index = indexSignal.get();
        const item = itemSignal.get();

        const TemplateRenderer = templateValue[activeTemplateKeyValue] as unknown as FunctionComponent<{ Slot: SlotComp<unknown,Record<string,unknown>>, item: DataItem, index: number } & Properties>;

        return <TemplateRenderer Slot={TemplateSlot<BreakPoint, CellRenderer, Template, DataItem,Properties,Record<string,unknown>>} index={index}
                                 item={item} {...properties}/>
    })

    const rendering = useComputed(() => {
        const readyToRenderValue = readyToRender.get();
        const templateHeightValue = templateHeight.get();
        const elementValue = element.get();
        if (templateHeightValue > 0 && !readyToRenderValue) {
            return false
        }
        return elementValue;
    })


    useEffect(() => {
        const timout = setTimeout(() => {
            readyToRender.set(true)
        }, 50);
        return () => {
            clearTimeout(timout);
        }
    }, [readyToRender]);

    return <notifiable.div id={componentId} style={style}>{rendering}</notifiable.div>
}