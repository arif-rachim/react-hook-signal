import {CSSProperties, FC, useEffect} from "react";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import Visible from "../comp/Visible.tsx";
import {BORDER_NONE} from "../comp/Border.ts";
import {colors} from "../utils/colors.ts";

export function Tab(props: { items: Record<string, TabItem>, style?: CSSProperties }) {
    const {items, style} = props;
    const focusedTab = useSignal(Object.keys(items)[0]);
    const itemsSignal = useSignal<Record<string, TabItem>>(items);
    useEffect(() => itemsSignal.set(items), [itemsSignal,items]);

    const elements = useComputed(() => {
        const items = itemsSignal.get();
        return (Object.keys(items) as Array<keyof typeof items>).map(key => {
            const Component = items[key].component;
            return <Visible when={() => {
                const focusedTabKey = focusedTab.get();
                return focusedTabKey === key;
            }} key={key} eagerLoaded={true} style={{flexGrow:1}}><Component/></Visible>
        })
    });
    const buttons = useComputed(() => {
        const items = itemsSignal.get();
        return (Object.keys(items) as Array<keyof typeof items>).map(key => {
            return <notifiable.button style={() => {
                const focusedTabKey = focusedTab.get();
                const isSelected = focusedTabKey === key;
                return {
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderBottom: BORDER_NONE,
                    backgroundColor : isSelected ? colors.grey : colors.white,
                    color : isSelected ? '#FFF' : '#999',
                    borderTopLeftRadius : 5,
                    borderTopRightRadius : 5,
                };
            }} key={key} onClick={() => {
                focusedTab.set(key)
            }}>{items[key].title}</notifiable.button>
        })
    })
    return <div style={{display: 'flex', flexDirection: 'column', ...style}}>
        <notifiable.div style={{display: 'flex', flexDirection: 'row', borderBottom: '1px solid rgba(0,0,0,0.3)',paddingTop:5,paddingLeft:5,paddingRight:5}}>
            {buttons}
        </notifiable.div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column',flexGrow:1}}>
            {elements}
        </notifiable.div>
    </div>
}


export interface TabItem {
    title: string,
    component: FC
}
