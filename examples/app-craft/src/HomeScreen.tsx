import {createResponsiveList} from "stock-watch/src/responsive-list/createResponsiveList.tsx";
import {Notifiable, notifiable, useSignal} from "react-hook-signal";
import {BORDER} from "./comp/Border.ts";
import LayoutBuilder from "./LayoutBuilder.tsx";
import {View} from "./comp/Component.ts";
import {CSSProperties} from "react";
import {guid} from "./utils/guid.ts";


function createNewViewObject() {
    const tempId = guid();
    const newView: View = {
        id: tempId,
        name: "",
        description: "",
        tag: [],
        signals: [],
        components: [{
            style: {
                height: '100%',
                overflow: 'auto',
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                paddingBottom: 10
            },
            componentType: 'Vertical',
            id: tempId,
            parent: '',
            children: [],
            events : {}
        }],
    }
    return newView;
}

export function HomeScreen() {
    const data = useSignal<Array<View>>([]);
    const showDetailPanel = useSignal<boolean>(false);
    const selectedView = useSignal<View>(createNewViewObject());
    return <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: 10, position: 'relative'}}>
        <h1>Layout</h1>
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <button style={{border: BORDER, background: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: '5px 10px'}}
                    onClick={() => {
                        selectedView.set(createNewViewObject());
                        showDetailPanel.set(true);
                    }}>Add View
            </button>
        </div>

        <List.List style={{border: BORDER, marginTop: 10, borderRadius: 10}} data={data} onEdit={(view: View) => {
            selectedView.set(view);
            showDetailPanel.set(true);
        }}></List.List>
        <notifiable.div style={(): CSSProperties => {
            const _showDetailPanel = showDetailPanel.get();
            return {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: _showDetailPanel ? 0 : '100%',
                transition: 'left 300ms linear',
                background: 'white'
            }
        }}>

            <Notifiable component={LayoutBuilder} value={selectedView} onChangeHandler={(view?: View) => {
                if (view) {
                    // in reality this should add to the sql directly !
                    const currentViews = [...data.get()];
                    const currentPosition = currentViews.findIndex(i => i.id === view.id);
                    if (currentPosition > -1) {
                        currentViews.splice(currentPosition, 1, view);
                    } else {
                        currentViews.push(view);
                    }
                    data.set(currentViews);
                }
                showDetailPanel.set(false);
            }}/>
        </notifiable.div>
    </div>
}

const List = createResponsiveList<View & { edit?: unknown }, {
    onEdit: (param: View) => void
}>().breakPoint({s: 300}).renderer({
    id: ({value}) => value.slice(-12),
    name: ({value}) => value,
    description: ({value}) => value,
    tag: ({value}) => {
        return value.join(', ');
    },
    edit: ({onEdit, item}) => <button style={{border: BORDER, borderRadius: 5, padding: '2px 10px'}} onClick={() => {
        onEdit(item)
    }}>Edit</button>
}).template({
    s: ({Slot}) => {
        return <div style={{display: 'flex', flexDirection: 'row', borderBottom: BORDER}}>
            <Slot for={'id'} style={{width: 150, padding: 5, flexShrink: 0, borderRight: BORDER}}/>
            <Slot for={'name'} style={{width: 200, padding: 5, flexShrink: 0, borderRight: BORDER}}/>
            <Slot for={'description'} style={{flexGrow: 1, padding: 5, borderRight: BORDER}}/>
            <Slot for={'tag'} style={{width: 100, padding: 5, flexShrink: 0, borderRight: BORDER}}/>
            <Slot for={'edit'} style={{width: 55, padding: 3, flexShrink: 0}}/>
        </div>
    }
})