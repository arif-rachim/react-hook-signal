import './App.css'
import {TaskDetailsPanel} from "./panel/TaskDetailsPanel.tsx";
import TaskListPanel from "./panel/TaskListPanel.tsx";
import {Todo} from "./model/Todo.ts";
import {guid} from "./utils/guid.ts";
import {isEmpty} from "./utils/isEmpty.ts";
import {populateTodosMockData} from "./model/generateMock.ts";
import {deleteCancellationConfirmation} from "./panel/list/notification/deleteCancellationConfirmation.tsx";
import {useShowModal} from "./panel/useShowModal.ts";
import {useComputed,useSignal} from "react-hook-signal"


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
    const todos = useSignal<Todo[]>([]);

    /**
     * The currently selected Todo item.
     */
    const selectedTodo = useSignal<Todo | undefined>(undefined);

    /**
     * A flag indicating whether the Task Details Panel is disabled.
     */
    const disableDetailPanel = useSignal<boolean>(true);

    /**
     * A computed value indicating whether the Task List Panel is disabled.
     */
    const disableListPanel = useComputed(() => !disableDetailPanel.get())

    /**
     * The current sort and filter configuration.
     */
    const sortFilter = useSignal<SortFilter>({});

    /**
     * Populates the Todo items with mock data.
     */
    populateTodosMockData(todos);

    /**
     * A function to show a modal.
     */
    const showModal = useShowModal();

    /**
     * Handles the editing of a Todo item.
     */
    function onEditTodo(todo: Todo){
        selectedTodo.set(todo);
        disableDetailPanel.set(false);
    }

    /**
     * Handles the changes to a Todo item.
     */
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

    /**
     * Handles the deletion of a Todo item.
     */
    async function onDeleteTodo(todo: Todo){
        const result = await showModal<'yes' | 'no'>(deleteCancellationConfirmation(todo))
        if (result === 'yes') {
            todos.set(todos.get().filter(t => t.id !== todo.id))
        }
    }
    return (
        <div className={'flex col gap-10 p-10 overflow-auto grow'}>
                <TaskDetailsPanel todo={selectedTodo} disabled={disableDetailPanel} onChange={onTodoChanged} sortFilter={sortFilter}
                                  onEdit={() => onEditTodo(selectedTodo.get()!)}
                                  onDelete={() => onDeleteTodo(selectedTodo.get()!)}
                />
                <TaskListPanel todos={todos} disabled={disableListPanel} selectedTodo={selectedTodo}
                               onEdit={onEditTodo}
                               onDelete={onDeleteTodo}
                               sortFilter={sortFilter}/>
        </div>
    )
}


export default App
