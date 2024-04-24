import {Todo} from "../../model/Todo.ts";
import {Signal} from "signal-polyfill";
import {AnySignal, notifiable} from "../../../../../src/components.ts";
import {useShowModal} from "../useShowModal.ts";
import {useComputed} from "../../../../../src/hooks.ts";
import {ddMMMyyyy} from "../../utils/dateFormat.ts";
import {MdDelete, MdEdit} from "react-icons/md";
import {ResizeableListener} from "./ResizeableListener.tsx";
import {disableNotification} from "./notification/disableNotification.tsx";
import {deleteCancellationConfirmation} from "./notification/deleteCancellationConfirmation.tsx";

export function RowRenderer(props: {
    todo: Todo,
    currentSelectedRow: Signal.State<Todo | undefined>,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    index: number,
    disabled: AnySignal<boolean>,
    onDelete: (todo: Todo) => void,
    onEdit: (todo: Todo) => void,
}) {
    const {todo, cellsWidth, index, currentSelectedRow, disabled, onDelete, onEdit} = props;
    const showModal = useShowModal();
    const isSelected = useComputed(() => {
        return currentSelectedRow.get()?.id === todo.id
    })
    const className = useComputed(() => {
        const isSelectedValue = isSelected.get();
        const classNames = ['flex', 'row', 'h-30']
        if (isSelectedValue) {
            classNames.push('bg-selected');
        } else if ((index % 2) === 0) {
            classNames.push('bg-darken-1');
        }
        return classNames.join(' ')
    })

    return <notifiable.div className={className} onClick={async () => {
        if (disabled.get()) {
            await showModal<void>(disableNotification)
            return;
        }
        currentSelectedRow.set(todo);
    }}>
        <ResizeableListener className={'flex col p-5 border-r'} cellsWidth={cellsWidth}
                            colId={'title'}>{todo.title}</ResizeableListener>
        <ResizeableListener className={'flex col p-5 border-r'} cellsWidth={cellsWidth}
                            colId={'description'}>{todo.description}</ResizeableListener>
        <ResizeableListener className={'flex col p-5 border-r overflow-hidden text-nowrap align-center'}
                            cellsWidth={cellsWidth}
                            colId={'dueDate'}>{ddMMMyyyy(todo.dueDate)}</ResizeableListener>
        <ResizeableListener className={'flex col p-5 border-r'} cellsWidth={cellsWidth}
                            colId={'priority'}>{todo.priority}</ResizeableListener>
        <ResizeableListener className={'flex col align-center justify-center border-r'} cellsWidth={cellsWidth}
                            colId={'edit'}>
            <button className={'flex col align-center border rounded-5'} onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (disabled.get()) {
                    await showModal<void>(disableNotification)
                    return;
                }
                onEdit(todo);
            }}><MdEdit className={'text-2xl'}/></button>
        </ResizeableListener>
        <ResizeableListener className={'flex col align-center justify-center'} cellsWidth={cellsWidth} colId={'delete'}>
            <button className={'flex col align-center border rounded-5'} onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (disabled.get()) {
                    await showModal<void>(disableNotification)
                    return;
                }
                const result = await showModal<'yes' | 'no'>(deleteCancellationConfirmation(todo))
                if (result === 'yes') {
                    onDelete(todo)
                }
            }}><MdDelete className={'text-2xl'}/></button>
        </ResizeableListener>
    </notifiable.div>;
}



