import {Todo} from "../model/Todo.ts";
import {notifiable, useSignal} from "../../../../src/main.ts";
import {formatDateForInputDate} from "../utils/formatDateForInputData.ts";
import {useComputed} from "../../../../src/hooks.ts";

export function DetailPanel() {

    const todo = useSignal<Partial<Todo>>({});
    const dueDate = useComputed(() => formatDateForInputDate(todo.get().dueDate))
    const priority = useComputed(() => todo.get().priority);
    const title = useComputed(() => todo.get().title ?? '');
    const description = useComputed(() => todo.get().description ?? '');

    const userHasTriedToSubmit = useSignal(false);
    //const isEditMode = useSignal(false);


    const dueDateError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().dueDate) ? 'Due Date required' : '' : '');
    const priorityError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().priority) ? 'Priority required' : '' : '');
    const titleError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().title) ? 'Title required' : '' : '');
    const descriptionError = useComputed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().description) ? 'Description required' : '' : '');

    const dueDateClassName = useComputed(() => `border-2 rounded grow p-1 pl-2 border-${isEmpty(dueDateError.get())?'gray':'red'}-400`);
    const priorityClassName = useComputed(() => `border-2 rounded p-2 border-${isEmpty(priorityError.get())?'gray':'red'}-400`);
    const titleClassName = useComputed(() => `border-2 rounded p-2 border-${isEmpty(titleError.get())?'gray':'red'}-400`);
    const descriptionClassName = useComputed(() => `border-2 rounded p-2 border-${isEmpty(descriptionError.get())?'gray':'red'}-400 h-32`);

    return (
        <>
            <form className={"flex flex-col gap-5"} onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                userHasTriedToSubmit.set(true);
            }}>
                <h1 className={'font-normal text-3xl border-b-2'}>Todo</h1>
                <div className={'flex flex-row gap-5'}>
                    <label className={'flex flex-col w-1/2'}>
                        Due Date :
                        <notifiable.input className={dueDateClassName} type={'date'}
                                          value={dueDate}
                                          onChange={(e) => todo.set({...todo.get(), dueDate: new Date(e.target.value)})}
                        />
                        <notifiable.div className={'flex flex-col items-end text-red-600'}>
                            {dueDateError}
                        </notifiable.div>
                    </label>
                    <label className={'flex flex-col w-1/2'}>
                        Priority :
                        <notifiable.select className={priorityClassName}
                                           value={priority}
                                           onChange={(e) => todo.set({
                                               ...todo.get(),
                                               priority: e.target.value as Todo["priority"]
                                           })}
                        >
                            <option value={''}></option>
                            <option value={'High'}>High</option>
                            <option value={'Medium'}>Medium</option>
                            <option value={'Low'}>Low</option>
                        </notifiable.select>
                        <notifiable.div className={'flex flex-col items-end text-red-600'}>
                            {priorityError}
                        </notifiable.div>
                    </label>
                </div>
                <label className={'flex flex-col'}>
                    Title :
                    <notifiable.input className={titleClassName} type={'text'}
                                      value={title}
                                      onChange={(e) => todo.set({...todo.get(), title: e.target.value})}
                    />
                    <notifiable.div className={'flex flex-col items-end text-red-600'}>
                        {titleError}
                    </notifiable.div>
                </label>
                <label className={'flex flex-col'}>
                    Description :
                    <notifiable.textarea className={descriptionClassName}
                                         value={description}
                                         onChange={e => todo.set({...todo.get(), description: e.target.value})}
                    />

                    <notifiable.div className={'flex flex-col items-end text-red-600'}>
                        {descriptionError}
                    </notifiable.div>
                </label>
                <div className={'flex flex-row justify-end gap-4'}>
                    <button className={'flex p-3 bg-gray-200 rounded w-20 justify-center font-medium'}>Edit</button>
                    <button className={'flex p-3 bg-gray-200 rounded w-20 justify-center font-medium'}>Save</button>
                </div>
            </form>
        </>
    )
}

function isEmpty(value: unknown) {
    const empty = value === undefined || value === null || value === '' || value.toString().trim() === '';
    console.log('is empty',value,empty);
    return empty;
}