import './App.css'
import {Todo} from "./model/Todo.ts";
import {populateTodosMockData} from "./model/generateMock.ts";
import {useSignal} from "react-hook-signal"
import {createAdaptiveList} from "./createAdaptiveList.tsx";
import {useEffect} from "react";


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
    number : () => {
        return <div>HEllo world</div>
    },
    title : ({item}) => {
        return <div>{item.title}</div>
    },
    sedap : () => {
        return <div>Woka</div>
    },
    status : ({value}) => {
        return <div>{value}</div>
    }
}).template({
    l: function Large({Slot}){
        useEffect(() => {
            console.log('Remounted')
        }, []);
        return <div>
            <Slot for={'status'} />
        </div>
    }
}).list();