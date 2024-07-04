import {useModal} from "./modal/useModal.ts";
import {ModalContext} from "./modal/ModalContext.ts";
import {notifiable, Notifiable} from "react-hook-signal";
import {ModalContainer} from "./modal/ModalContainer.tsx";
import {MdInput} from "react-icons/md";
import AppDesigner from "./app-designer/AppDesigner.tsx";

export function App() {
    const {showModal, modalPanels} = useModal();
    return <ModalContext.Provider value={showModal}>
        <AppDesigner elements={{
            input: {
                icon: MdInput,
                component: () => {
                    return <notifiable.input
                        style={{border: '1px solid rgba(0,0,0,0.1)'}}
                        onChange={() => {

                        }}
                    />
                },
                property: {
                    value : 'value',
                    onChange : 'callback'
                }
            }
        }}/>
        <Notifiable component={ModalContainer} modalPanels={modalPanels}/>
    </ModalContext.Provider>
}