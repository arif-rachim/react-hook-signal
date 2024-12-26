import {useShowModal} from "../../../core/hooks/modal/useShowModal.ts";
import {useCallback} from "react";
import {IconType} from "../../../core/components/icon/IconElement.tsx";
import {ConfirmationDialog} from "../ConfirmationDialog.tsx";

export type ModalBox = (props: {
    message: string,
    title?: string,
    icon?: IconType,
    buttons?: Array<{ id: string, label: string, icon: IconType }>
}) => Promise<string>

export function useModalBox(): ModalBox {

    const showPanel = useShowModal();

    return useCallback((props: {
        message: string,
        title?: string,
        icon?: IconType,
        buttons?: Array<{ id: string, label: string, icon?: IconType }>
    }) => {
        const {buttons,icon,message,title} = props;
        const defaultButtons = [{id:'ok',label:'Ok'}]
        return showPanel(closePanel => {
            return <ConfirmationDialog message={message} icon={icon} title={title}
                                       buttons={buttons ?? defaultButtons} closePanel={closePanel}/>
        })
    }, [showPanel]);
}