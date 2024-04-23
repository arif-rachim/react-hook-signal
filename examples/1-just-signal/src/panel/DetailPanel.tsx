import {Todo} from "../model/Todo.ts";
import {notifiable, useSignal} from "../../../../src/main.ts";
import {formatDateForInputDate} from "../utils/formatDateForInputData.ts";
import {useComputed} from "../../../../src/hooks.ts";
import {Signal} from "signal-polyfill";

export function DetailPanel(props: { todo: Signal.State<Todo | undefined> }) {

    const todo = props.todo;
    const dueDate = useComputed(() => formatDateForInputDate(todo.get()?.dueDate))
    const priority = useComputed(() => todo.get()?.priority ?? '');
    const title = useComputed(() => todo.get()?.title ?? '');
    const description = useComputed(() => todo.get()?.description ?? '');

    const userHasTriedToSubmit = useSignal(false);
    //const isEditMode = useSignal(false);

    const dueDateError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.dueDate) ? 'Due Date required' : '' : '');
    const priorityError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.priority) ? 'Priority required' : '' : '');
    const titleError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.title) ? 'Title required' : '' : '');
    const descriptionError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get()?.description) ? 'Description required' : '' : '');

    const dueDateClassName = useComputed(() => `rounded-5 grow p-5 pl-10 border${isEmpty(dueDateError.get()) ? '' : '-red'} h-30`);
    const priorityClassName = useComputed(() => `rounded-5  border${isEmpty(priorityError.get()) ? '' : '-red'} h-30`);
    const titleClassName = useComputed(() => `rounded-5 p-5 border${isEmpty(titleError.get()) ? '' : '-red'}`);
    const descriptionClassName = useComputed(() => `rounded-5 p-5 border${isEmpty(descriptionError.get()) ? '' : '-red'} h-80`);

    return (
        <>
            <form className={"flex col gap-10"} onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                userHasTriedToSubmit.set(true);
            }}>
                <h1 className={'font-normal text-3xl border-b pb-5'}>Todo</h1>
                <div className={'flex flex-row gap-5'}>
                    <label className={'flex col w-1-2'}>
                        Due Date :
                        <notifiable.input className={dueDateClassName} type={'date'}
                                          value={dueDate}
                                          onChange={(e) => {
                                              todo.set({...todo.get()!, dueDate: new Date(e.target.value)})
                                          }}
                        />
                        <notifiable.div className={'flex col items-end text-red'}>
                            {dueDateError}
                        </notifiable.div>
                    </label>
                    <label className={'flex col w-1-2'}>
                        Priority :
                        <notifiable.select className={priorityClassName}
                                           value={priority}
                                           onChange={(e) => todo.set({
                                               ...todo.get()!,
                                               priority: e.target.value as Todo["priority"]
                                           })}
                        >
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
                                      onChange={(e) => todo.set({...todo.get()!, title: e.target.value})}
                    />
                    <notifiable.div className={'flex col align-end text-red'}>
                        {titleError}
                    </notifiable.div>
                </label>
                <label className={'flex col'}>
                    Description :
                    <notifiable.textarea className={descriptionClassName}
                                         value={description}
                                         onChange={e => todo.set({...todo.get()!, description: e.target.value})}
                    />

                    <notifiable.div className={'flex col align-end text-red'}>
                        {descriptionError}
                    </notifiable.div>
                </label>
                <div className={'flex row justify-end gap-10'}>
                    <button className={'flex p-5 bg-darken-1 border rounded-5 w-100 justify-center font-medium'}>Edit
                    </button>
                    <button className={'flex p-5 bg-darken-1 border rounded-5 w-100 justify-center font-medium'}>Save
                    </button>
                </div>
            </form>
        </>
    )
}

function isEmpty(value: unknown) {
    return value === undefined || value === null || value === '' || value.toString().trim() === '';
}

