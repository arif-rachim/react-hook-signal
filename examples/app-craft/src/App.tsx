import {useModal} from "./modal/useModal.ts";
import {ModalContext} from "./modal/ModalContext.ts";
import {notifiable, Notifiable} from "react-hook-signal";
import {ModalContainer} from "./modal/ModalContainer.tsx";
import {MdInput, MdSmartButton} from "react-icons/md";
import AppDesigner, {Container, Variable} from "./app-designer/AppDesigner.tsx";
import {MutableRefObject, useState} from "react";
import {element} from "./app-designer/LayoutBuilderProps.ts";
import {z} from "zod";
import {BORDER} from "./app-designer/Border.ts";
import {Button, defaultTheme, Provider} from "@adobe/react-spectrum";

export function App() {
    const {showModal, modalPanels} = useModal();
    const [value, setValue] = useState<{ containers: Array<Container>, variables: Array<Variable> }>(() => {
        const val = localStorage.getItem('app-designer');
        if (val && val.length > 0) {
            return JSON.parse(val);
        }
        return {containers: [], variables: []};
    });
    return <ModalContext.Provider value={showModal}>
            <AppDesigner elements={{
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
                button : element({
                    icon : MdSmartButton,
                    property : {
                        label:z.string(),
                        onPress:z.function().args().returns(z.void())
                    },
                    component : ({label,onPress},ref) => {
                        const mutableRef = ref as MutableRefObject<HTMLElement|undefined>
;                        return <Provider theme={defaultTheme}>
                            <Button
                            ref={(instance) => {
                                mutableRef.current = instance?.UNSAFE_getDOMNode()
                            }}
                            variant="accent"
                            onPress={() => onPress()}
                        >
                                {label}
                        </Button></Provider>
                    }
                })
            }} value={value} onChange={(val) => {
                localStorage.setItem('app-designer', JSON.stringify(val));
                setValue(val);
            }}/>
            <Notifiable component={ModalContainer} modalPanels={modalPanels}/>
        </ModalContext.Provider>
}