import './App.css'
import {Todo} from "./model/Todo.ts";
import {populateTodosMockData} from "./model/generateMock.ts";
import {useSignal} from "react-hook-signal"
import {createResponsiveList} from "./createResponsiveList.tsx";
import {CSSProperties} from "react";
import {format_ddMMMyyyy} from "./utils/dateFormat.ts";


/**
 * App class representing an application with todo functionality.
 * @constructor
 */
function App() {

    /**
     * Represents a variable for managing TODO items using a signal.
     */
    const todos = useSignal<Todo[]>(populateTodosMockData());

    return <div style={{height:'100vh',overflow:'auto',display:'flex',flexDirection:'column'}}>
        <AdaptiveList.List data={todos} />
    </div>
}


export default App

const AdaptiveList = createResponsiveList<Todo>().breakPoint({s:400,m:600,l:900,xl:1200}).renderer({
    number : ({index}:{index:number,style:CSSProperties}) => {
        return index + 1
    },
    completionDate : ({value}) => {
        return format_ddMMMyyyy(value)
    },
    status : ({value}) => {
        return value
    },
    title : ({value}) => {
        return value
    },
    createdTime : ({value}) => {
        return format_ddMMMyyyy(value)
    },
    dueDate : ({value}) => {
        return format_ddMMMyyyy(value)
    },
    description : ({value}) => {
        return  value
    },
    lastUpdate : ({value}) => {
        return format_ddMMMyyyy(value)
    },
    priority : ({value}) => {
        return value
    },
    progress : ({value}) => {
        return value
    },
    id : ({value}) => {
        return value
    },
    delete : () => {
        return <button>Delete</button>
    }
}).template({
    s: function Small({Slot}){
        return <div style={{display:'flex'}}>
            <Slot for={'number'} style={{flexShrink:0,width:100}} />
            <Slot for={'status'} style={{flexShrink:0,width:100}} />
            <Slot for={'description'} style={{flexGrow:1}}/>
            <Slot for={'delete'} style={{flexShrink:0,width:100}}/>
        </div>
    },
    m: function Medium({Slot}){
        return <div style={{display:'flex'}}>
            <Slot for={'number'} style={{flexShrink:0,width:100}} />
            <Slot for={'status'} style={{flexShrink:0,width:100}} />
            <Slot for={'description'} style={{flexGrow:1}}/>
            <Slot for={'priority'} style={{flexShrink:0,width:100}}/>
            <Slot for={'dueDate'} style={{flexShrink:0,width:100}} />
            <Slot for={'delete'} style={{flexShrink:0,width:60}}/>
        </div>
    }
}).list();