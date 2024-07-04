import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import "./editor/InitEditor.ts";
import AppDesigner from "./app-designer/AppDesigner.tsx";
import {MdInput} from "react-icons/md";
import {notifiable} from "react-hook-signal";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/*<App/>*/}
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
                    value : 'computed',
                    onChange : 'effect'
                }
            }
        }}/>
    </React.StrictMode>
)

// function declareElement<Prop extends Record<string, 'computed' | 'effect'>>(name: string) {
//     const self = this !== window ? {...this}:{};
//
//     function property(prop: Prop) {
//
//         function factory(component: React.FC<Prop>) {
//
//             function editor(editor: React.FC<Prop>) {
//                 const data = {
//                     [name]: {
//                         prop,
//                         component,
//                         editor,
//                     },
//                     ...self
//                 }
//                 declareElement.bind(data);
//                 return {
//                     ...data,
//                     declareElement
//                 };
//             }
//
//             return {
//                 editor
//             };
//         }
//
//         return {
//             factory
//         }
//     }
//
//     return {
//         property
//     }
// }

// const shit = declareElement('input')
//     .property({value: 'computed', onChange: 'effect', onClick: 'effect'})
//     .factory((props) => {
//         const value = useComputed(props.value);
//         const onChange = useComputed(props.onChange)
//         return <notifiable.input value={value} onChange={onChange}/>
//     }).editor((props) => {
//
//         return <div>
//             <notifiable.input value={props.value} onChange={(e) => {
//                 props.value.set(e.target.value)
//             }}
//         </div>
//     })