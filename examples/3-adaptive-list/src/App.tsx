import './App.css'
import {Todo} from "./model/Todo.ts";
import {populateTodosMockData} from "./model/generateMock.ts";
import {useSignal} from "react-hook-signal"
import {createAdaptiveList} from "./createAdaptiveList.tsx";
import {CSSProperties, useEffect} from "react";
import {format_ddMMMyyyy} from "./utils/dateFormat.ts";


export type SortFilter = Partial<{
    sort?: { key: keyof Todo, direction?: 'asc' | 'desc' },
    filter?: { [K in keyof Todo]?: string }
}>;

/**
 * App class representing an application with todo functionality.
 * @constructor
 */
function App() {

    /**
     * Represents a variable for managing TODO items using a signal.
     */
    const todos = useSignal<Todo[]>(populateTodosMockData());

    return <div>
        <AdaptiveList.List data={todos} ></AdaptiveList.List>
    </div>
}


export default App

const AdaptiveList = createAdaptiveList<Todo>().breakPoint({s:300,m:600,l:900,xl:1200}).renderer({
    completionDate : ({value,style}) => {
        return <div style={style}>{format_ddMMMyyyy(value)}</div>
    },
    status : ({value,style}) => {
        return <div style={style}>{value}</div>
    },
    title : ({value,style}) => {
        return <div style={style}>{value}</div>
    },
    createdTime : ({value,style}) => {
        return <div style={style}>{format_ddMMMyyyy(value)}</div>
    },
    dueDate : ({value,style}) => {
        return <div style={style}>{format_ddMMMyyyy(value)}</div>
    },
    description : ({value,style}) => {
        return  <div style={style}>{value}</div>
    },
    lastUpdate : ({value,style}) => {
        return <div style={style}>{format_ddMMMyyyy(value)}</div>
    },
    priority : ({value,style}) => {
        return <div style={style}>{value}</div>
    },
    progress : ({value,style}) => {
        return <div style={style}>{value}</div>
    },
    id : ({value,style}) => {
        return <div style={style}>{value}</div>
    },
    delete : ({style}:{style:CSSProperties}) => {
        return <button style={style}>Delete</button>
    }
}).template({
    l: function Large({Slot}){
        useEffect(() => {
            console.log('Remounted')
        }, []);
        return <div style={{display:'flex'}}>
            <Slot for={'status'} style={{flexShrink:0,width:100}} />
            <Slot for={'description'} style={{flexGrow:1}}/>
            <Slot for={'delete'} style={{flexShrink:0,width:100}}/>
        </div>
    }
}).list();