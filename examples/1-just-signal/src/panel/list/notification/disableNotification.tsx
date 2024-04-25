import {MdWarning} from "react-icons/md";

export function disableNotification(closePanel: () => void) {

    return <div className={'bg-gray w-350 p-20 shadow-xl border rounded-10 rounded-br-10 flex col gap-20'}>
        <div className={'flex row gap-20 bg-gradient p-20 rounded-10'}>
            <MdWarning className={'text-7xl text-yellow shrink-0'}/>
            <div className={'font-medium'}>
                You are in edit mode, please save your work before navigate to different record.
            </div>
        </div>
        <div className={'flex justify-end'}>
            <button className={'p-5 w-100 rounded-5 border bg-darken-1'} onClick={() => closePanel()}>OK</button>
        </div>
    </div>
}