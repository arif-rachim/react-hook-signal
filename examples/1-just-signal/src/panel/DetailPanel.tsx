import {Todo} from "../model/Todo.ts";
import {notifiable, useSignal} from "../../../../src/main.ts";

import {useComputed} from "../../../../src/hooks.ts";
import {Signal} from "signal-polyfill";
import {ReactNode} from "react";
import {isEmpty} from "../utils/isEmpty.ts";
import {MdAdd, MdCancel, MdSave} from "react-icons/md";
import {SortFilter} from "../App.tsx";
import {yyyyMMdd} from "../utils/dateFormat.ts";

export function DetailPanel(props: {
    todo: Signal.State<Todo | undefined>,
    disabled: Signal.State<boolean>,
    onChange: (todo: Todo) => void,
    sortFilter: Signal.State<SortFilter>
}) {

    const {todo, disabled, onChange} = props;
    const dueDate = useComputed(() => yyyyMMdd(todo.get()?.dueDate))
    const priority = useComputed(() => todo.get()?.priority ?? '');
    const title = useComputed(() => todo.get()?.title ?? '');
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

    const onCreateNewTAsk = () => {
        todo.set({} as Todo);
        disabled.set(false);
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

    const buttons = useComputed(() => {
        const isDisabledValue = disabled.get();
        const result: ReactNode[] = [];
        if (isDisabledValue) {
            result.push(<button key={'createNewTask'} type={'button'}
                                className={'flex gap-5 p-5 bg-darken-1 border rounded-5 w-200 justify-center font-medium'}
                                onClick={onCreateNewTAsk}>Create New Task <MdAdd className={'text-xl'}/></button>)
            result.push(<div key={'space'} className={'w-full'}/>)
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
            <form className={"flex col gap-10"} onSubmit={onSave}>
                <h1 className={'font-normal text-3xl border-b pb-5'}>Todo</h1>
                <div className={'flex flex-row gap-5'}>
                    <label className={'flex col w-1-2'}>
                        Due Date :
                        <notifiable.input className={dueDateClassName} type={'date'}
                                          value={dueDate}
                                          disabled={disabled}
                                          onChange={onInputChange('dueDate',(val) => new Date(val as string))}
                        />
                        <notifiable.div className={'flex col items-end text-red'}>
                            {dueDateError}
                        </notifiable.div>
                    </label>
                    <label className={'flex col w-1-2'}>
                        Priority :
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
                </div>
                <label className={'flex col'}>
                    Title :
                    <notifiable.input className={titleClassName} type={'text'}
                                      value={title}
                                      disabled={disabled}
                                      onChange={onInputChange('title')}
                    />
                    <notifiable.div className={'flex col align-end text-red'}>
                        {titleError}
                    </notifiable.div>
                </label>
                <label className={'flex col'}>
                    Description :
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



