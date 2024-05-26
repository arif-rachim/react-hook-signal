import {Todo} from "../../../model/Todo.ts";

/**
 * Function to render a confirmation panel for deleting a Todo.
 */
export const deleteCancellationConfirmation = (todo: Todo) => (closePanel: (params: 'yes' | 'no') => void) => {
    return <div className={'bg-gray w-350 p-20 shadow-xl border rounded-10 rounded-br-10 flex col gap-10'}>
        <div className={'flex col gap-10 bg-gradient p-20 rounded-10'}>
            <div className={'flex col font-medium'}>
                Are you sure you would like to delete :
            </div>
            <div className={'flex row gap-20'}>
                <div className={'flex col grow gap-10'}>
                    <label className={'flex col'}>
                        <div className={'font-medium'}>Title :</div>
                        <input className={'flex col border p-5 rounded-5'} value={todo.title} disabled={true}/>
                    </label>
                    <label className={'flex col'}>
                        <div className={'font-medium'}>Description :</div>
                        <textarea className={'flex col border p-5 rounded-5 h-80'} value={todo.description}
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