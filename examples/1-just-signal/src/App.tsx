import './App.css'
import {Signal} from "signal-polyfill";
import {DetailPanel} from "./panel/DetailPanel.tsx";
import {Todo} from "./model/Todo.ts";

export const todos = new Signal.State<Todo[]>([]);
function App() {
    return (
        <div className={'flex flex-col'}>
            <DetailPanel />
        </div>
    )
}

export default App
