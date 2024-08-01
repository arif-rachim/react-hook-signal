import React, {MutableRefObject} from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import "./editor/InitEditor.ts";
import AppViewer from "./app-designer/app-viewer/AppViewer.tsx";
import {element} from "./app-designer/LayoutBuilderProps.ts";
import {MdInput, MdSmartButton} from "react-icons/md";
import {z} from "zod";
import {BORDER} from "./app-designer/Border.ts";
import {notifiable} from "react-hook-signal";
import {Button, defaultTheme, Provider} from "@adobe/react-spectrum";
import value from "./data.json";
import {Page} from "./app-designer/AppDesigner.tsx";
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AppViewer elements={{
            input: element({
                icon: MdInput,
                property: {
                    value: z.string(),
                    onChange: z.function().args(z.string()).returns(z.promise(z.void())),
                },
                component: (props, ref) => {
                    const {value, onChange, style} = props;
                    if (style?.border === 'unset') {
                        style.border = BORDER
                    }
                    return <notifiable.input
                        ref={ref}
                        value={value}
                        onChange={async (e) => {
                            const val = e.target.value;
                            if (onChange) {
                                await onChange(val);
                            }
                        }}
                        style={{...style, borderRadius: 20}}
                    />
                }
            }),
            button: element({
                icon: MdSmartButton,
                property: {
                    label: z.string(),
                    onPress: z.function().args().returns(z.void())
                },
                component: ({label, onPress}, ref) => {
                    const mutableRef = ref as MutableRefObject<HTMLElement | undefined>
                    return <Provider theme={defaultTheme}>
                        <Button
                            ref={(instance) => {
                                mutableRef.current = instance?.UNSAFE_getDOMNode()
                            }}
                            variant="accent"
                            onPress={() => onPress()}
                        >
                            {label}
                        </Button>
                    </Provider>
                }
            })
        }} value={value as unknown as Page[]} onChange={() => {

        }}/>
    </React.StrictMode>
)
