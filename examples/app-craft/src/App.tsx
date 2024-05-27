import {useModal} from "./modal/useModal.ts";
import {ModalContext} from "./modal/ModalContext.ts";
import {HomeScreen} from "./HomeScreen.tsx";
import {Notifiable} from "react-hook-signal";
import {ModalContainer} from "./modal/ModalContainer.tsx";

export function App() {
    const {showModal, modalPanels} = useModal();
    return <ModalContext.Provider value={showModal}>
        <HomeScreen/>
        <Notifiable component={ModalContainer} modalPanels={modalPanels}/>
    </ModalContext.Provider>
}