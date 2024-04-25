import {Todo} from "../model/Todo.ts";
import {notifiable, useSignal} from "../../../../src/main.ts";

import {useComputed} from "../../../../src/hooks.ts";
import {Signal} from "signal-polyfill";
import {ReactNode} from "react";
import {isEmpty} from "../utils/isEmpty.ts";
import {MdAdd, MdCancel, MdDelete, MdDirectionsRun, MdEdit, MdSave} from "react-icons/md";
import {SortFilter} from "../App.tsx";
import {yyyyMMdd} from "../utils/dateFormat.ts";
import {useShowModal} from "./useShowModal.ts";

export function DetailPanel(props: {
    todo: Signal.State<Todo | undefined>,
    disabled: Signal.State<boolean>,
    onChange: (todo: Todo) => void,
    sortFilter: Signal.State<SortFilter>,
    onEdit : () => void,
    onDelete : () => void
}) {

    const {todo, disabled, onChange} = props;
    const dueDate = useComputed(() => yyyyMMdd(todo.get()?.dueDate));
    const priority = useComputed(() => todo.get()?.priority ?? '');
    const title = useComputed(() => todo.get()?.title ?? '');
    const status = useComputed(() => todo.get()?.status ?? '');
    const progress = useComputed(() => todo.get()?.progress ?? '');
    const description = useComputed(() => todo.get()?.description ?? '');

    const userHasTriedToSubmit = useSignal(false);

    const dueDateError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.dueDate) ? 'Due Date required' : '' : '');
    const priorityError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.priority) ? 'Priority required' : '' : '');
    const titleError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.title) ? 'Title required' : '' : '');
    const descriptionError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.description) ? 'Description required' : '' : '');

    const hasError = useComputed(() => {
        return !(isEmpty(dueDateError.get()) && isEmpty(priorityError.get()) && isEmpty(titleError.get()) && isEmpty(descriptionError.get()))
    })

    const dueDateClassName = useComputed(() => `rounded-5 p-5 pl-10 border${isEmpty(dueDateError.get()) ? '' : '-red'} h-30`);
    const priorityClassName = useComputed(() => `rounded-5  border${isEmpty(priorityError.get()) ? '' : '-red'} h-30`);
    const titleClassName = useComputed(() => `rounded-5 p-5 border${isEmpty(titleError.get()) ? '' : '-red'}`);
    const descriptionClassName = useComputed(() => `rounded-5 p-5 border${isEmpty(descriptionError.get()) ? '' : '-red'} h-80`);

    const showModal = useShowModal();
    const onCreateNewTAsk = () => {
        todo.set({
            status : 'Pending',
            progress : 0
        } as Todo);
        disabled.set(false);
    }
    const onUpdateProgress = async () => {
        const todoValue = todo.get()!;
        const progress = await showModal<number>(closePanel => {
            return <UpdateProgressPanel closePanel={closePanel} todo={todoValue}/>
        })
        onChange({...todoValue,progress,status:progress === 100 ? 'Completed' : progress === 0 ? 'Pending' : 'On Going'})
    }
    const onSave = (event:{preventDefault:() => void,stopPropagation:() => void}) => {
        event.preventDefault();
        event.stopPropagation();
        userHasTriedToSubmit.set(true);
        if (hasError.get()) {
            return;
        }
        onChange(todo.get() as Required<Todo>);
        disabled.set(true);
    }

    const onCancel = () => {
        disabled.set(true);
        userHasTriedToSubmit.set(false);
    };

    const onInputChange = (colId:keyof Todo,formatter?:(value:unknown) => unknown) => (e:{target:{value:string}}) => {
        todo.set({...todo.get()!, [colId]: formatter? formatter(e.target.value) : e.target.value})
    }
    const headerButtons = useComputed(() => {
        const result: ReactNode[] = [];
        const isDisabledValue = disabled.get()
        if (isDisabledValue) {
            result.push(<button key={'newTask'} type={'button'}
                                className={'flex gap-5 p-5 bg-blue border rounded-5 w-100 justify-center font-medium'}
                                onClick={onCreateNewTAsk}>New Task <MdAdd className={'text-xl'}/></button>)
        }
        return result;
    });


    const buttons = useComputed(() => {
        const isDisabledValue = disabled.get();
        const selectedTodo = todo.get()?.id;
        const result: ReactNode[] = [];

        if(isDisabledValue && selectedTodo !== undefined){
            result.push(<button key={'edit'} type={'button'}
                                className={'flex p-5 gap-10 bg-darken-1 border rounded-5 w-50 justify-center font-medium'}
                                onClick={props.onEdit}><MdEdit className={'text-xl'}/></button>)
            result.push(<button key={'delete'} type={'button'}
                                className={'flex p-5 gap-10 bg-darken-1 border rounded-5 w-50 justify-center font-medium bg-red'}
                                onClick={props.onDelete}><MdDelete className={'text-xl'}/></button>)
            result.push(<div key={'grow'} className={'grow'}/>)
            result.push(<button key={'updateProgress'} type={'button'}
                                className={'flex gap-5 p-5 bg-green border rounded-5 w-150 justify-center font-medium'}
                                onClick={onUpdateProgress}>Update Progress <MdDirectionsRun className={'text-xl'}/></button>)
        }
        if (!isDisabledValue) {
            result.push(<button key={'save'} type={'button'}
                                className={'flex p-5 gap-10 bg-darken-1 border rounded-5 w-100 justify-center font-medium'}
                                onClick={onSave}>Save <MdSave className={'text-xl'}/></button>)
            result.push(<button key={'cancel'} type={'button'}
                                className={'flex p-5 gap-10 bg-darken-1 border rounded-5 w-100 justify-center font-medium'}
                                onClick={onCancel}>Cancel <MdCancel className={'text-xl'}/></button>)
        }
        return result;
    })

    return (
        <>
            <form className={"flex col gap-10 bg-lighten-1 p-10 rounded-10 border"} onSubmit={onSave}>
                <div className={'flex row border-b pb-5'}>
                    <div className={'font-medium text-3xl grow'}>Todo</div>
                    <notifiable.div>{headerButtons}</notifiable.div>
                </div>
                <div className={'flex flex-row gap-5'}>
                    <label className={'flex col w-1-3'}>
                        <div className={'font-medium'}>Due Date :</div>
                        <notifiable.input className={dueDateClassName} type={'date'}
                                          value={dueDate}
                                          disabled={disabled}
                                          onChange={onInputChange('dueDate', (val) => new Date(val as string))}
                        />
                        <notifiable.div className={'flex col items-end text-red'}>
                            {dueDateError}
                        </notifiable.div>
                    </label>
                    <label className={'flex col w-1-3'}>
                        <div className={'font-medium'}>Priority :</div>
                        <notifiable.select className={priorityClassName}
                                           value={priority}
                                           disabled={disabled}
                                           onChange={onInputChange('priority')}>
                            <option value={''}></option>
                            <option value={'High'}>High</option>
                            <option value={'Medium'}>Medium</option>
                            <option value={'Low'}>Low</option>
                        </notifiable.select>
                        <notifiable.div className={'flex col align-end text-red'}>
                            {priorityError}
                        </notifiable.div>
                    </label>
                    <label className={'flex col w-1-3'}>
                        <div className={'font-medium'}>Status :</div>
                        <notifiable.input className={'rounded-5 p-5 border'} type={'text'}
                                          value={status}
                                          disabled={true}
                        />
                    </label>
                </div>
                <div className={'flex flex-row gap-5'}>
                    <label className={'flex col w-full'}>
                        <div className={'font-medium'}>Title :</div>
                        <notifiable.input className={titleClassName} type={'text'}
                                          value={title}
                                          disabled={disabled}
                                          onChange={onInputChange('title')}
                        />
                        <notifiable.div className={'flex col align-end text-red'}>
                            {titleError}
                        </notifiable.div>
                    </label>
                    <label className={'flex col w-70'}>
                        <div className={'font-medium'}>Progress :</div>
                        <notifiable.input className={'rounded-5 p-5 border'} type={'text'}
                                          value={progress}
                                          disabled={true}
                        />
                    </label>
                </div>
                    <label className={'flex col'}>
                        <div className={'font-medium'}>Description :</div>
                        <notifiable.textarea className={descriptionClassName}
                                             value={description}
                                             disabled={disabled}
                                             onChange={onInputChange('description')}
                        />

                        <notifiable.div className={'flex col align-end text-red'}>
                            {descriptionError}
                        </notifiable.div>
                    </label>
                    <notifiable.div className={'flex row justify-end gap-10'}>
                        {buttons}
                    </notifiable.div>
            </form>
        </>
)
}


function UpdateProgressPanel(props: { closePanel: (param: number) => void, todo: Todo }) {
    const progress = useSignal(props.todo.progress);
    const progressText = useComputed(() => progress.get() + '%')
    return <div className={'bg-gray w-350 p-20 shrink-0 shadow-xl border rounded-10 rounded-br-10 flex col gap-10'}>
        <div className={'flex col gap-10 bg-gradient p-20 rounded-10'}>
            <div className={'font-medium'}>Update : <i>{props.todo.title}</i></div>

            <div className={'font-medium'}>Current Progress :</div>
            <notifiable.div className={'text-7xl flex col align-center'}>{progressText}</notifiable.div>
            <notifiable.input type={'range'} min={0} max={100} value={progress} onChange={e => progress.set(parseInt(e.target.value))}/>
        </div>
        <div className={'flex justify-end'}>
            <button className={'p-5 w-100 rounded-5 border bg-darken-1'} onClick={() => props.closePanel(progress.get())}>OK</button>
        </div>
    </div>
}
