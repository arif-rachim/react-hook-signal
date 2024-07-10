import {useModal} from "./modal/useModal.ts";
import {ModalContext} from "./modal/ModalContext.ts";
import {notifiable, Notifiable} from "react-hook-signal";
import {ModalContainer} from "./modal/ModalContainer.tsx";
import {MdInput} from "react-icons/md";
import AppDesigner, {Container, Variable} from "./app-designer/AppDesigner.tsx";
import {useState} from "react";

export function App() {
    const {showModal, modalPanels} = useModal();
    const [value,setValue] = useState<{containers:Array<Container>,variables:Array<Variable>}>(() => {
        const val = localStorage.getItem('app-designer');
        if(val && val.length > 0){
            return JSON.parse(val);
        }
        return {containers:[],variables:[]};
    });
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
        }} value={value} onChange={(val) => {
            localStorage.setItem('app-designer',JSON.stringify(val));
            setValue(val);
        }}/>
        <Notifiable component={ModalContainer} modalPanels={modalPanels}/>
    </ModalContext.Provider>
}