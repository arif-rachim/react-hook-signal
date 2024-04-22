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
    const priorityError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().dueDate) ? 'Priority required' : '' : '');
    const titleError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().dueDate) ? 'Title required' : '' : '');
    const descriptionError = new Signal.Computed(() => userHasTriedToSubmit.get() ? isEmpty(todo.get().dueDate) ? 'Description required' : '' : '');

    return (
        <>
            <div className={"flex flex-col"}>
                <div className={'flex flex-row gap-5'}>
                    <label className={'flex flex-col w-1/2'}>
                        Due Date :
                        <notifiable.input className={'border-2 rounded-lg grow p-1 pl-2 border-gray-400 '} type={'date'}
                                          value={dueDate}
                                          onChange={(e) => todo.set({...todo.get(), dueDate: new Date(e.target.value)})}
                        />
                        <notifiable.div className={'flex flex-col items-end text-red-600'}>
                            {dueDateError}
                        </notifiable.div>
                    </label>
                    <label className={'flex flex-col w-1/2'}>
                        Priority :
                        <notifiable.select className={'border-2 rounded-lg p-2 border-gray-400 '}
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
                    <notifiable.input className={'border-2 rounded-lg p-2 border-gray-400 '} type={'text'}
                                      value={title}
                                      onChange={(e) => todo.set({...todo.get(), title: e.target.value})}
                    />
                    <notifiable.div className={'flex flex-col items-end text-red-600'}>
                        {titleError}
                    </notifiable.div>
                </label>
                <label className={'flex flex-col'}>
                    Description :
                    <notifiable.textarea className={'border-2 rounded-lg p-2 border-gray-400 h-32'}
                                         value={description}
                                         onChange={e => todo.set({...todo.get(), description: e.target.value})}
                    />
                    <notifiable.div className={'flex flex-col items-end text-red-600'}>
                        {descriptionError}
                    </notifiable.div>
                </label>
            </div>
        </>
    )
}

function isEmpty(value: unknown) {
    return value === undefined || value === null || value === '' || value.toString().trim() === '';
}