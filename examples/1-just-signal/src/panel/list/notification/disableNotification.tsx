import {MdWarning} from "react-icons/md";

export function disableNotification(closePanel: () => void) {

    return <div className={'bg-gray w-1-3 p-20 shadow rounded-bl-10 rounded-br-10 flex col gap-20'}>
        <div className={'flex row gap-10 bg-gradient p-20 rounded-10'}>
            <div >
                <MdWarning className={'text-5xl'}/>
            </div>
        <div>
            You are in edit mode, please save your work before navigate to different page.
        </div>
        </div>
        <div className={'flex justify-end'}>
            <button className={'p-5 w-100 rounded-5 border bg-darken-1'} onClick={() => closePanel()}>OK</button>
        </div>
    </div>
}