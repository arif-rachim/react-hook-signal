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
        {/*<AppViewer elements={{*/}
        {/*    input: element({*/}
        {/*        icon: MdInput,*/}
        {/*        property: {*/}
        {/*            value: z.string(),*/}
        {/*            onChange: z.function().args(z.string()).returns(z.promise(z.void())),*/}
        {/*        },*/}
        {/*        component: (props, ref) => {*/}
        {/*            const {value, onChange, style} = props;*/}
        {/*            if (style?.border === 'unset') {*/}
        {/*                style.border = BORDER*/}
        {/*            }*/}
        {/*            return <notifiable.input*/}
        {/*                ref={ref}*/}
        {/*                value={value}*/}
        {/*                onChange={async (e) => {*/}
        {/*                    const val = e.target.value;*/}
        {/*                    if (onChange) {*/}
        {/*                        await onChange(val);*/}
        {/*                    }*/}
        {/*                }}*/}
        {/*                style={{...style, borderRadius: 20}}*/}
        {/*            />*/}
        {/*        }*/}
        {/*    }),*/}
        {/*    button: element({*/}
        {/*        icon: MdSmartButton,*/}
        {/*        property: {*/}
        {/*            label: z.string(),*/}
        {/*            onPress: z.function().args().returns(z.void())*/}
        {/*        },*/}
        {/*        component: ({label, onPress}, ref) => {*/}
        {/*            const mutableRef = ref as MutableRefObject<HTMLElement | undefined>*/}
        {/*            return <Provider theme={defaultTheme}>*/}
        {/*                <Button*/}
        {/*                    ref={(instance) => {*/}
        {/*                        mutableRef.current = instance?.UNSAFE_getDOMNode()*/}
        {/*                    }}*/}
        {/*                    variant="accent"*/}
        {/*                    onPress={() => onPress()}*/}
        {/*                >*/}
        {/*                    {label}*/}
        {/*                </Button>*/}
        {/*            </Provider>*/}
        {/*        }*/}
        {/*    })*/}
        {/*}} value={value as unknown as Page[]} onChange={() => {*/}
        {/*}}/>*/}
    </React.StrictMode>
)
