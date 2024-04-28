import {Todo} from "../model/Todo.ts";
import {notifiable} from "../../../../src/main.ts";
import {Signal} from "signal-polyfill";
import {ReactNode} from "react";
import {isEmpty} from "../utils/isEmpty.ts";
import {MdAdd, MdCancel, MdDelete, MdDirectionsRun, MdEdit, MdSave} from "react-icons/md";
import {SortFilter} from "../App.tsx";
import {format_yyyyMMdd} from "../utils/dateFormat.ts";
import {useShowModal} from "./useShowModal.ts";
import {ProgressUpdateModal} from "./detail/ProgressUpdateModal.tsx";
import {useComputed,useSignal} from "../../../../src/hooks.ts";

/**
 * The TaskDetailsPanel component.
 */
export function TaskDetailsPanel(props: {
    todo: Signal.State<Todo | undefined>,
    disabled: Signal.State<boolean>,
    onChange: (todo: Todo) => void,
    sortFilter: Signal.State<SortFilter>,
    onEdit : () => void,
    onDelete : () => void
}) {

    const {todo, disabled, onChange} = props;

    /**
     * The formatted due date of the current Todo item.
     */
    const dueDate = useComputed(() => format_yyyyMMdd(todo.get()?.dueDate));

    /**
     * The priority of the current Todo item.
     */
    const priority = useComputed(() => todo.get()?.priority ?? '');

    /**
     * The title of the current Todo item.
     */
    const title = useComputed(() => todo.get()?.title ?? '');

    /**
     * The status of the current Todo item.
     */
    const status = useComputed(() => todo.get()?.status ?? '');

    /**
     * The progress of the current Todo item.
     */
    const progress = useComputed(() => todo.get()?.progress ?? '');

    /**
     * The description of the current Todo item.
     */
    const description = useComputed(() => todo.get()?.description ?? '');

    /**
     * A flag indicating whether the user has tried to submit the form.
     */
    const userHasTriedToSubmit = useSignal(false);

    /**
     * The error message for the due date field.
     */
    const dueDateError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.dueDate) ? 'Due Date required' : '' : '');

    /**
     * The error message for the priority field.
     */
    const priorityError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.priority) ? 'Priority required' : '' : '');

    /**
     * The error message for the title field.
     */
    const titleError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.title) ? 'Title required' : '' : '');

    /**
     * The error message for the description field.
     */
    const descriptionError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.description) ? 'Description required' : '' : '');

    /**
     * A flag indicating whether there are any errors in the form.
     */
    const hasError = useComputed(() => {
        return !(isEmpty(dueDateError.get()) && isEmpty(priorityError.get()) && isEmpty(titleError.get()) && isEmpty(descriptionError.get()))
    })

    /**
     * The computed class name for the due date input.
     */
    const dueDateClassName = useComputed(() => `rounded-5 p-5 pl-10 border${isEmpty(dueDateError.get()) ? '' : '-red'} h-30 w-full w-min-0`);

    /**
     * The computed class name for the priority input.
     */
    const priorityClassName = useComputed(() => `rounded-5  border${isEmpty(priorityError.get()) ? '' : '-red'} h-30`);

    /**
     * The computed class name for the title input.
     */
    const titleClassName = useComputed(() => `rounded-5 p-5 border${isEmpty(titleError.get()) ? '' : '-red'}`);

    /**
     * The computed class name for the description input.
     */
    const descriptionClassName = useComputed(() => `rounded-5 p-5 border${isEmpty(descriptionError.get()) ? '' : '-red'} h-80`);

    /**
     * A function to show a modal.
     */
    const showModal = useShowModal();

    /**
     * A function to create a new Todo task.
     */
    const onCreateNewTAsk = () => {
        todo.set({
            status : 'Pending',
            progress : 0
        } as Todo);
        disabled.set(false);
    }

    /**
     * A function to update the progress of the current Todo item.
     */
    const onUpdateProgress = async () => {
        const todoValue = todo.get()!;
        const progress = await showModal<number>(closePanel => {
            return <ProgressUpdateModal closePanel={closePanel} todo={todoValue}/>
        })
        onChange({...todoValue,progress,status:progress === 100 ? 'Completed' : progress === 0 ? 'Pending' : 'On Going'})
    }

    /**
     * A function to handle the saving of the Todo item.
     */
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

    /**
     * A function to handle the cancellation of the Todo item.
     */
    const onCancel = () => {
        disabled.set(true);
        userHasTriedToSubmit.set(false);
    };

    /**
     * A function to handle changes to the input fields.
     */
    const onInputChange = (colId:keyof Todo,formatter?:(value:unknown) => unknown) => (e:{target:{value:string}}) => {
        todo.set({...todo.get()!, [colId]: formatter? formatter(e.target.value) : e.target.value})
    }

    /**
     * The computed header buttons for the component.
     */
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

    /**
     * Determines if a todo is selected.
     */
    const aTodoIsSelected = useComputed(() => !isEmpty(todo.get()?.id))

    /**
     * The computed buttons for the component.
     */
    const buttons = useComputed(() => {
        const isDisabledValue = disabled.get();
        const aTodoIsSelectedValue = aTodoIsSelected.get();
        const result: ReactNode[] = [];

        if(isDisabledValue && aTodoIsSelectedValue){
            result.push(<button key={'edit'} type={'button'}
                                className={' flex p-5 gap-10 bg-darken-1 border rounded-5 w-50 justify-center font-medium'}
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
                    <label className={'flex col w-1-3 '}>
                        <div className={'font-medium'}>Due Date:</div>
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
