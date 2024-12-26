import {Variable} from "../../app/designer/AppDesigner.tsx";
import {useShowModal} from "./modal/useShowModal.ts";
import {ConfirmationDialog} from "../../app/designer/ConfirmationDialog.tsx";

export function useShowErrorsDialogBox(){
    const showModal = useShowModal();
    async function showErrors(errors: Partial<Record<keyof Variable, string[]>>){
        await showModal<string>(cp => {
            const message = (Object.keys(errors) as Array<keyof Variable>).map(k => {
                return errors[k]?.map(val => {
                    return <div key={val}>{(val ?? '') as string}</div>
                })
            }).flat();
            return <ConfirmationDialog message={message} closePanel={cp} buttons={[{
                    icon: 'IoIosExit',
                    label: 'Ok',
                    id: 'Ok'
                }]}/>
        })
    }
    return {showErrors}
}