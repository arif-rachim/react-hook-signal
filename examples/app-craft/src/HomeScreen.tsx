import {createResponsiveList} from "stock-watch/src/responsive-list/createResponsiveList.tsx";
import {Notifiable, notifiable, useSignal} from "react-hook-signal";
import {BORDER} from "./comp/Border.ts";
import LayoutBuilder from "./LayoutBuilder.tsx";
import {Component} from "./comp/Component.ts";
import {CSSProperties} from "react";

export interface View {
    id: string,
    name: string,
    description: string,
    tag: string[],
    components: Component[],
    componentsRootId: string
}

export function HomeScreen() {
    const data = useSignal<Array<View>>([]);
    const showDetailPanel = useSignal<boolean>(false);
    const selectedView = useSignal<View|undefined>(undefined);
    return <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: 10, position: 'relative'}}>
        <h1>Layout</h1>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <button style={{border: BORDER, background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '5px 10px'}}
                    onClick={() => {
                        selectedView.set(undefined);
                        showDetailPanel.set(true);
                    }}>Add View
            </button>
        </div>

        <List.List style={{border:BORDER,marginTop:10,borderRadius:10}} data={data} onEdit={(view:View) => {
            selectedView.set(view);
            showDetailPanel.set(true);
        }}></List.List>
        <notifiable.div style={():CSSProperties => {
            const _showDetailPanel = showDetailPanel.get();
            return {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: _showDetailPanel ? 0 : '100%',
                transition : 'left 300ms linear',
                background:'white'
            }
        }}>

            <Notifiable component={LayoutBuilder} value={selectedView} onChangeHandler={(view?:View) => {
                if(view) {
                    data.set([...data.get(),view]);
                }
                showDetailPanel.set(false);
            }}/>
        </notifiable.div>
    </div>
}

const List = createResponsiveList<View & {edit?:unknown}, {onEdit:(param:View) => void}>().breakPoint({s: 300}).renderer({
    id: ({value}) => value.slice(-12),
    name: ({value}) => value,
    description: ({value}) => value,
    tag: ({value}) => value.join(', '),
    edit : ({onEdit,item}) => <button style={{border:BORDER,borderRadius:5,padding:'5px 10px'}} onClick={() => {
        onEdit(item)
    }}>Edit</button>
}).template({
    s: ({Slot}) => {
        return <div style={{display: 'flex', flexDirection: 'row',borderBottom:BORDER}}>
            <Slot for={'id'} style={{width:150,padding:5,flexShrink:0,borderRight:BORDER}}/>
            <Slot for={'name'} style={{width:200,padding:5,flexShrink:0,borderRight:BORDER}}/>
            <Slot for={'description'} style={{flexGrow:1,padding:5,borderRight:BORDER}}/>
            <Slot for={'tag'} style={{width:100,padding:5,flexShrink:0,borderRight:BORDER}}/>
            <Slot for={'edit'} style={{width:55,padding:5,flexShrink:0}}/>
        </div>
    }
})