import './App.css'
import {DetailPanel} from "./panel/DetailPanel.tsx";
import ListPanel from "./panel/ListPanel.tsx";
import {Todo} from "./model/Todo.ts";
import {useComputed, useSignal} from "../../../src/hooks.ts";
import {guid} from "./utils/guid.ts";
import {isEmpty} from "./utils/isEmpty.ts";
import {populateTodosMockData} from "./model/generateMock.ts";
import {deleteCancellationConfirmation} from "./panel/list/notification/deleteCancellationConfirmation.tsx";
import {useShowModal} from "./panel/useShowModal.ts";

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
    const showModal = useShowModal();
    function onEditTodo(todo: Todo){
        selectedTodo.set(todo);
        disableDetailPanel.set(false);
    }

    function onTodoChanged(todo: Partial<Todo>){
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
            todos.set([...todosValue]);
            selectedTodo.set(todo as Todo);
        }
    }
    async function onDeleteTodo(todo: Todo){
        const result = await showModal<'yes' | 'no'>(deleteCancellationConfirmation(todo))
        if (result === 'yes') {
            todos.set(todos.get().filter(t => t.id !== todo.id))
        }
    }
    return (
        <div className={'flex col gap-10 p-10 overflow-auto grow'}>
                <DetailPanel todo={selectedTodo} disabled={disableDetailPanel} onChange={onTodoChanged} sortFilter={sortFilter}
                             onEdit={() => onEditTodo(selectedTodo.get()!)}
                             onDelete={() => onDeleteTodo(selectedTodo.get()!)}
                />
                <ListPanel todos={todos} disabled={disableListPanel} selectedTodo={selectedTodo}
                           onEdit={onEditTodo}
                           onDelete={onDeleteTodo}
                           sortFilter={sortFilter}/>
        </div>
    )
}


export default App
