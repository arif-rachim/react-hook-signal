import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import "./editor/InitEditor.ts";
import AppDesigner from "./app-designer/AppDesigner.tsx";
import {MdInput} from "react-icons/md";
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppDesigner elements={{
            input : {
                icon : MdInput,
                component : InputComponent,
            }
        }} />
    </React.StrictMode>
)

function InputComponent(){
    return <input />
}
