import {Todo} from "../../model/Todo.ts";
import {notifiable} from "react-hook-signal"
import {type ReactElement} from "react";
import {useComputed,useSignal} from "react-hook-signal"

/**
 * Renders a progress update modal.
 *
 * @param {Object} props - The properties for the progress update modal.
 * @param {Function} props.closePanel - The function to close the progress update modal and pass the progress value.
 * @param {Object} props.todo - The todo object containing the progress value.
 * @returns {ReactElement} The progress update modal component.
 */
export function ProgressUpdateModal(props: { closePanel: (param: number) => void, todo: Todo }): ReactElement {
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
