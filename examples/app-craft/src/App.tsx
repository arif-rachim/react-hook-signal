import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {MdInput, MdSmartButton} from "react-icons/md";
import AppDesigner, {Container, Page} from "./app-designer/AppDesigner.tsx";
import {CSSProperties, ForwardedRef, forwardRef, useEffect, useState} from "react";
import {element} from "./app-designer/LayoutBuilderProps.ts";
import {z} from "zod";
import {BORDER} from "./app-designer/Border.ts";
import {defaultTheme, Provider} from "@adobe/react-spectrum";
import {FaGripHorizontal} from "react-icons/fa";
import {useAppContext} from "./app-designer/hooks/useAppContext.ts";
import {PageViewer} from "./app-viewer/AppViewer.tsx";
import {isEmpty} from "./utils/isEmpty.ts";
import {Icon} from "./app-designer/Icon.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {useSelectedDragContainer} from "./app-designer/hooks/useSelectedDragContainer.ts";
import {Button} from "./app-designer/button/Button.tsx";
import {PageInputSelector} from "./app-designer/page-selector/PageInputSelector.tsx";
import {useUpdateDragContainer} from "./app-designer/hooks/useUpdateSelectedDragContainer.ts";

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
                return <Provider theme={defaultTheme}>
                    <Button
                        ref={ref}
                        onClick={() => onPress()}
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
                    label : 'component',
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

function PageSelectionPropertyEditor(props:{propertyName:string}){
    const containerSignal = useSelectedDragContainer();
    const context = useAppContext();
    const container = containerSignal.get();
    const {propertyName} = props;
    const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
    let isFormulaEmpty = true;

    if (container && container.properties[propertyName]) {
        const formula = container.properties[propertyName].formula;
        isFormulaEmpty = isEmpty(formula);
    }
    const update = useUpdateDragContainer();
    const style:CSSProperties = {
        width: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 0,
        borderTopLeftRadius:20,
        borderBottomLeftRadius:20,
        borderBottomRightRadius: 0,
        backgroundColor: isFormulaEmpty ? colors.grey : colors.green,
        padding: 0
    };
    return <div style={{display: 'flex'}}>

        <PageInputSelector value={''} style={style} onChange={(value) => {
            const containerId = containerSignal.get()?.id;
            if(containerId) {
                update(containerId, (selectedContainer: Container) => {
                    if(value){
                        selectedContainer.properties = {...selectedContainer.properties,[propertyName]:{formula : `module.exports = "${value}"`,dependencies:[]}}
                        return selectedContainer;
                    }else{
                        selectedContainer.properties = {...selectedContainer.properties};
                        delete selectedContainer.properties[propertyName];
                        return selectedContainer;
                    }

                });
            }
        }} />
        <div style={{
            display: 'flex',
            padding: '0px 5px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            border: BORDER,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20
        }}>
            {hasError && <Icon.Error style={{fontSize: 18, color: colors.red}}/>}
            {!hasError && <Icon.Checked style={{fontSize: 18, color: colors.green}}/>}
        </div>
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
        {page && (data ?? []).map((item,index) => {
            // here we need to render page
            let key:string = index.toString();
            if(item !== undefined && item !== null && typeof item === 'object' && keyId in item){
                key = (item[keyId] as string).toString();
            }
            return <PageViewer elements={elements} page={page!} key={key} {...item}/>
        })}
    </div>    
})