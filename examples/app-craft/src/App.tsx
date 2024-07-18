import {useModal} from "./modal/useModal.ts";
import {ModalContext} from "./modal/ModalContext.ts";
import {notifiable, Notifiable} from "react-hook-signal";
import {ModalContainer} from "./modal/ModalContainer.tsx";
import {MdInput} from "react-icons/md";
import AppDesigner, {Container, Variable} from "./app-designer/AppDesigner.tsx";
import {useState} from "react";
import {element} from "./app-designer/LayoutBuilderProps.ts";
import {z} from "zod";

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
            input : element({
                icon : MdInput,
                property : z.object({
                    value : z.string(),
                    onChange : z.function().args(z.string()).returns(z.void())
                }),
                component : (props) => {
                    const {value,onChange} = props;
                    return <notifiable.input
                        style={{border: '1px solid rgba(0,0,0,0.1)'}}
                        value={value}
                        onChange={(e) => {
                            const val = e.target.value;
                            onChange(val);
                        }}
                    />
                }
            })
        }} value={value} onChange={(val) => {
            localStorage.setItem('app-designer',JSON.stringify(val));
            setValue(val);
        }}/>
        <Notifiable component={ModalContainer} modalPanels={modalPanels}/>
    </ModalContext.Provider>
}