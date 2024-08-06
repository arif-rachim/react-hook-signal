import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {MdInput, MdSmartButton} from "react-icons/md";
import AppDesigner, {Page} from "./app-designer/AppDesigner.tsx";
import {CSSProperties, ForwardedRef, forwardRef, MutableRefObject, useEffect, useState} from "react";
import {element} from "./app-designer/LayoutBuilderProps.ts";
import {z} from "zod";
import {BORDER} from "./app-designer/Border.ts";
import {Button, defaultTheme, Provider} from "@adobe/react-spectrum";
import {FaGripHorizontal} from "react-icons/fa";
import {useAppContext} from "./app-designer/hooks/useAppContext.ts";
import {PageViewer} from "./app-viewer/AppViewer.tsx";

export function App() {
    const [value, setValue] = useState<Array<Page>>(() => {
        const val = localStorage.getItem('app-designer');
        if (val && val.length > 0) {
            return JSON.parse(val);
        }
        return [];
    });
    return <AppDesigner elements={{
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
        }),
        dataGroup : element({
            icon : FaGripHorizontal,
            property : {
                data : z.array(z.record(z.unknown())),
                component : z.string(),
                keyId : z.string(),
                direction : z.enum(['vertical','horizontal']),
            },
            propertyEditor : {
                component : {
                    label : 'Component',
                    component : PageSelectionPropertyEditor
                }
            },
            component : ({component,style,data,direction,keyId},ref) => {
                return <DataGroup data={data} style={style} keyId={keyId} component={component} direction={direction} ref={ref} />
            }
        })
    }} value={value} onChange={(val) => {
        localStorage.setItem('app-designer', JSON.stringify(val));
        setValue(val);
    }}/>
}

function PageSelectionPropertyEditor(){
    return <div>

    </div>
}

const DataGroup = forwardRef(function DataGroup(props:{component:string,style:CSSProperties,data:Array<Record<string, unknown>>,direction:'vertical'|'horizontal',keyId:string},ref){
    const {keyId,direction,style: propsStyle,data,component} = props;
    const [page,setPage] = useState<Page|undefined>(undefined);

    const style:CSSProperties = {
        display:'flex',
        flexDirection : direction === 'horizontal' ? 'row' : 'column',
        ...propsStyle
    }
    
    const {allPagesSignal,elements} = useAppContext();
    const componentIdSignal = useSignal(component);
    useEffect(() => {
        componentIdSignal.set(component)
    },[component, componentIdSignal]);

    useSignalEffect(() => {
        const allPages = allPagesSignal.get();
        const componentId = componentIdSignal.get();
        const page = allPages.find(p => p.id === componentId);
        setPage(page);
    })
    return <div ref={ref as ForwardedRef<HTMLDivElement>} style={style} >
        {(data ?? []).map((item,index) => {
            // here we need to render page
            let key:string = index.toString();
            if(item !== undefined && item !== null && typeof item === 'object' && keyId in item){
                key = (item[keyId] as string).toString();
            }
            return <PageViewer elements={elements} page={page!} key={key} {...item}/>
        })}
    </div>    
})