import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import "./editor/InitEditor.ts";
import {App} from "./App.tsx";
import CryptoJS from "crypto-js";

window.CryptoJS = window.CryptoJS || CryptoJS;
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)

