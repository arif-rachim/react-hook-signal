import {useModal} from "../hooks/modal/useModal.ts";
import {PropsWithChildren} from "react";
import {ModalContext} from "./ModalContext.ts";
import {ModalContainer} from "./ModalContainer.tsx";
import {Notifiable} from "react-hook-signal";

export function ModalProvider(props: PropsWithChildren) {
    const {showModal, modalPanels} = useModal();

    return <ModalContext.Provider value={showModal}>
        {props.children}
        <Notifiable component={ModalContainer} modalPanels={modalPanels}/>
    </ModalContext.Provider>
}