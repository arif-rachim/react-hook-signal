import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ModalProvider} from "./panel/ModalProvider.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <div className={'flex col gap-10 p-10 overflow-auto grow'}>
            <ModalProvider>
                <App/>
            </ModalProvider>
        </div>
    </React.StrictMode>
)
