import './App.css'
import {DetailPanel} from "./panel/DetailPanel.tsx";
import ListPanel from "./panel/ListPanel.tsx";
import {Todo} from "./model/Todo.ts";
import {useComputed, useSignal} from "../../../src/hooks.ts";
import {ModalProvider} from "./panel/ModalProvider.tsx";
import {guid} from "./utils/guid.ts";
import {isEmpty} from "./utils/isEmpty.ts";
import {populateTodosMockData} from "./model/generateMock.ts";

export type SortFilter = Partial<{
    sort?: { key: keyof Todo, direction?: 'asc' | 'desc' },
    filter?: { [K in keyof Todo]?: string }
}>;

function App() {
    const todos = useSignal<Todo[]>([]);
    const selectedTodo = useSignal<Todo | undefined>(undefined)
    const disableDetailPanel = useSignal<boolean>(true);
    const disableListPanel = useComputed(() => !disableDetailPanel.get())
    const sortFilter = useSignal<SortFilter>({});
    populateTodosMockData(todos);
    return (
        <div className={'flex col gap-30 p-20 overflow-auto grow'}>
            <ModalProvider>
                <DetailPanel todo={selectedTodo} disabled={disableDetailPanel} onChange={(todo: Partial<Todo>) => {
                    const isCreation = isEmpty(todo.id)
                    if (isCreation) {
                        todo.createdTime = new Date();
                        todo.id = guid();
                        todo.status = 'Pending';
                        todos.set([todo as Todo, ...todos.get()]);
                    } else {
                        todo.lastUpdate = new Date()
                        const todosValue = todos.get()
                        const index = todosValue.findIndex(i => i.id === todo.id);
                        todosValue.splice(index, 1, todo as Todo);
                        todos.set([...todosValue])
                    }
                }} sortFilter={sortFilter}/>
                <ListPanel todos={todos} disabled={disableListPanel} selectedTodo={selectedTodo}
                           onEdit={(todo: Todo) => {
                               selectedTodo.set(todo);
                               disableDetailPanel.set(false);
                           }} sortFilter={sortFilter}/>
            </ModalProvider>
        </div>
    )
}



export default App
