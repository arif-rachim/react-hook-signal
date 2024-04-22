import {Signal} from "signal-polyfill";
import {Todo} from "../model/Todo.ts";
import {notifiable} from "../../../../src/main.ts";
import {formatDateForInputDate} from "../utils/formatDateForInputData.ts";

export function DetailPanel() {
    const todo = new Signal.State<Partial<Todo>>({});
    const dueDate = new Signal.Computed(() => formatDateForInputDate(todo.get().dueDate))
    const priority = new Signal.Computed(() => todo.get().priority);
    const title = new Signal.Computed(() => todo.get().title ?? '');
    const description = new Signal.Computed(() => todo.get().description ?? '');

    const userHasTriedToSubmit = new Signal.State(false);

    const dueDateError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().dueDate) ? 'Due Date required' : '' : '');
    const priorityError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().priority) ? 'Priority required' : '' : '');
    const titleError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().title) ? 'Title required' : '' : '');
    const descriptionError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().description) ? 'Description required' : '' : '');

    const dueDateClassName = new Signal.Computed(() => `border-2 rounded-lg grow p-1 pl-2 border-${isEmpty(dueDateError.get())?'gray':'red'}-400`);
    const priorityClassName = new Signal.Computed(() => `border-2 rounded-lg p-2 border-${isEmpty(priorityError.get())?'gray':'red'}-400`);
    const titleClassName = new Signal.Computed(() => `border-2 rounded-lg p-2 border-${isEmpty(titleError.get())?'gray':'red'}-400`);
    const descriptionClassName = new Signal.Computed(() => `border-2 rounded-lg p-2 border-${isEmpty(descriptionError.get())?'gray':'red'}-400 h-32`);

    return (
        <>
            <form className={"flex flex-col"} onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                userHasTriedToSubmit.set(true);
            }}>
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
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
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
            </form>
        </>
    )
}

function isEmpty(value: unknown) {
    return value === undefined || value === null || value === '' || value.toString().trim() === '';
}