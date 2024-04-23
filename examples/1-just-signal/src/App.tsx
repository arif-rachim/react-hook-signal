import './App.css'
import {DetailPanel} from "./panel/DetailPanel.tsx";
import ListPanel from "./panel/ListPanel.tsx";
import {Signal} from "signal-polyfill";
import {Todo} from "./model/Todo.ts";
import {useComputed, useSignal} from "../../../src/hooks.ts";
import {ModalProvider} from "./panel/ModalProvider.tsx";

function App() {
    const todos = useSignal<Todo[]>([]);
    const selectedTodo = useSignal<Todo | undefined>(undefined)
    const disableDetailPanel = useSignal<boolean>(true);
    const disableListPanel = useComputed(() => !disableDetailPanel.get())
    populateTodosMockData(todos);
    return (
        <div className={'flex col gap-30 p-20 overflow-auto grow'}>
            <ModalProvider>
                <DetailPanel todo={selectedTodo} disabled={disableDetailPanel} onChange={(todo:Todo) => {
                    const todosValue = todos.get()
                    const index = todosValue.findIndex(i => i.id === todo.id);
                    todosValue.splice(index, 1,todo);
                    todos.set([...todosValue])
                }}/>
                <ListPanel todos={todos} disabled={disableListPanel} selectedTodo={selectedTodo}/>
            </ModalProvider>
        </div>
    )
}


function populateTodosMockData(todos: Signal.State<Todo[]>) {
    const mockTodos = Array.from({length: 5000}).map<Todo>(() => ({
        completionDate: new Date(),
        createdTime: new Date(),
        description: Math.round(Math.random() * 10000000).toString(),
        dueDate: new Date(),
        id: Math.round(Math.random() * 10000000).toString(),
        lastUpdate: new Date(),
        priority: 'High',
        status: 'Pending',
        title: Math.round(Math.random() * 10000000).toString()
    }))
    todos.set(mockTodos);
}

export default App
