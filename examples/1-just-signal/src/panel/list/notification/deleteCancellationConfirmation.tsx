import {Todo} from "../../../model/Todo.ts";
import {MdQuestionMark} from "react-icons/md";

export const deleteCancellationConfirmation = (todo: Todo) => (closePanel: (params: 'yes' | 'no') => void) => {
    return <div className={'bg-gray w-1-3 p-10 shadow rounded-bl-10 rounded-br-10 flex col gap-20'}>
        <div className={'flex col gap-10 bg-gradient p-20 rounded-10'}>
            <div className={'flex col text-xl'}>
                Are you sure you would like to delete :
            </div>
            <div className={'flex row gap-20'}>
                <div className={'mt-10'}>
                    <MdQuestionMark className={"text-5xl"}/>
                </div>
                <div className={'flex col grow'}>
                    <label className={'flex col'}>
                        Title :
                        <input className={'flex col border p-5 rounded-5'} value={todo.title} disabled={true}/>
                    </label>
                    <label className={'flex col'}>
                        Description :
                        <textarea className={'flex col border p-5 rounded-5 h-60'} value={todo.description}
                                  disabled={true}/>
                    </label>
                </div>
            </div>

        </div>
        <div className={'flex justify-end gap-10'}>
            <button className={'p-5 w-100 rounded-5 border bg-darken-1'} onClick={() => closePanel('yes')}>YES</button>
            <button className={'p-5 w-100 rounded-5 border bg-darken-1'} onClick={() => closePanel('no')}>Cancel
            </button>
        </div>

    </div>
}