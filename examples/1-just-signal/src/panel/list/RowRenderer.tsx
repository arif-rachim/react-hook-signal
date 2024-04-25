import {Todo} from "../../model/Todo.ts";
import {Signal} from "signal-polyfill";
import {AnySignal, notifiable} from "../../../../../src/components.ts";
import {useShowModal} from "../useShowModal.ts";
import {useComputed, useSignal} from "../../../../../src/hooks.ts";
import {ddMMMyyyy} from "../../utils/dateFormat.ts";
import {MdDelete, MdEdit} from "react-icons/md";
import {ResizeableListener} from "./ResizeableListener.tsx";
import {disableNotification} from "./notification/disableNotification.tsx";
import {Visible} from "../Visible.tsx";
import {CSSProperties, useEffect, useRef} from "react";

export function RowRenderer(props: {
    todo: Todo,
    currentSelectedRow: Signal.State<Todo | undefined>,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    index: number,
    disabled: AnySignal<boolean>,
    onDelete: (todo: Todo) => void,
    onEdit: (todo: Todo) => void,
    style: CSSProperties
}) {
    const {todo, cellsWidth, index, currentSelectedRow, disabled, onDelete, onEdit, style} = props;
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
    const todoSignal = useSignal(todo);
    const propsRef = useRef({todoSignal,todo});
    propsRef.current = {todoSignal,todo};
    const todoProgress = todo.progress;
    useEffect(() => {
        const {todoSignal,todo} = propsRef.current;
        todoSignal.set(todo);
    },[todoProgress])
    const styleRowBackground = useComputed<CSSProperties>(() => {
        const isSelectedValue = isSelected.get();
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${todoSignal.get().progress}%`,
            background: `rgba(14,155,49,${isSelectedValue ? 1 : 0.2})`,
            color : isSelectedValue ? 'white' : 'black',
            transition : 'all 300ms ease-in-out'
        }
    })
    const styleColor = useComputed(() => {
        const isSelectedValue = isSelected.get();
        const result:CSSProperties = {
            position: 'relative',
            color : isSelectedValue ? 'rgba(255,255,255,0.9)' : 'black',
            fontStyle : isSelectedValue ? 'italic' : 'unset',
            fontWeight:isSelectedValue ? 500 : 'unset',
        }
        return result;
    });
    return <notifiable.div className={className} onClick={async () => {
        if (disabled.get()) {
            await showModal<void>(disableNotification)
            return;
        }
        currentSelectedRow.set(todo);
    }} style={style}>
        <ResizeableListener className={'flex col p-5 border-r text-ellipsis'} cellsWidth={cellsWidth}
                            colId={'no'}>
            <div className={'text-ellipsis overflow-hidden'}>{index + 1}</div>
        </ResizeableListener>
        <ResizeableListener className={'flex col  border-r text-ellipsis'} cellsWidth={cellsWidth}
                            colId={'title'}>
            <div className={'flex col relative'}>
                <notifiable.div style={styleRowBackground}></notifiable.div>
                <notifiable.div className={'text-ellipsis p-5 overflow-hidden'} style={styleColor}>
                    {todo.title}
                </notifiable.div>
            </div>
        </ResizeableListener>
        <Visible onDesktop={true}>
            <ResizeableListener className={'flex col p-5 border-r text-ellipsis'} cellsWidth={cellsWidth}
                                colId={'description'}>
                <div className={'text-ellipsis overflow-hidden'}>{todo.description}</div>
            </ResizeableListener>
        </Visible>
        <Visible onDesktop={true} onTablet={true}>
            <ResizeableListener className={'flex col p-5 border-r overflow-hidden text-nowrap align-center'}
                                cellsWidth={cellsWidth}
                                colId={'dueDate'}>{ddMMMyyyy(todo.dueDate)}</ResizeableListener>
        </Visible>
        <ResizeableListener className={'flex col p-5 border-r'} cellsWidth={cellsWidth}
                            colId={'priority'}>{todo.priority}</ResizeableListener>
        <Visible onDesktop={true}>
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
        </Visible>
        <Visible onDesktop={true}>
            <ResizeableListener className={'flex col align-center justify-center'} cellsWidth={cellsWidth}
                                colId={'delete'}>
                <button className={'flex col align-center border rounded-5'} onClick={async (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (disabled.get()) {
                        await showModal<void>(disableNotification)
                        return;
                    }
                    onDelete(todo);
                }}><MdDelete className={'text-2xl'}/></button>
            </ResizeableListener>
        </Visible>
    </notifiable.div>
}



