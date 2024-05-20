import {Notifiable, useComputed, useSignal} from "react-hook-signal";
import {notifiable} from "react-hook-signal";
import {createContext, CSSProperties, useContext, useEffect} from "react";
import {Signal} from "signal-polyfill";
import {guid} from "./utils/guid.ts";

const ElementType = {
    Container: 'Container'
}

/**
 * Represents the main application component.
 */
function App() {

    const layoutTree = useSignal<Layout[]>([{
        style: {
            direction: 'column',
        },
        id: 'root',
        parent: '',
        children: []
    }])

    return <div style={{display: 'flex', flexDirection: 'row', height: '100%', overflow: 'auto', gap: 10}}>
        <div style={{borderRight: '1px solid #CCC', display: 'flex', flexDirection: 'column', padding: 10}}>
            CONTAINER ONE
            <div
                style={{padding: 5, border: '1px solid #CCC', borderRadius: 5}}
                draggable={true}
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', ElementType.Container);
                }}
            >Container</div>
        </div>
        <LayoutContext.Provider value={layoutTree}>
            <Notifiable component={LayoutRenderer} layout={() => {
                return layoutTree.get().find(i => i.id === 'root')!
            }}/>
        </LayoutContext.Provider>
        <div style={{borderLeft: '1px solid #CCC'}}>CONTAINER THREE</div>
    </div>
}

interface Layout {
    style: {
        direction: 'row' | 'column',
        padding?: number,
        paddingLeft?: number,
        paddingTop?: number,
        paddingRight?: number,
        paddingBottom?: number,

        margin?: number,
        marginLeft?: number,
        marginTop?: number,
        marginRight?: number,
        marginBottom?: number,

        gap?: number,
        width?: number | `${number}%`,
        minWidth?: number,
        minHeight?: number,

        grow?: number,
        shrink?: number,
    },
    id: string,
    parent: string,
    children: string[]
}


const LayoutContext = createContext<Signal.State<Layout[]> | undefined>(undefined);

function LayoutRenderer(props: { layout: Layout }) {
    const root = useContext(LayoutContext)!;
    const layout = useSignal(props.layout);
    useEffect(() => layout.set(props.layout), [props.layout]);
    const containerIsHover = useSignal(false);
    const elements = useComputed(() => {
        const children = layout.get().children;
        const tree = root.get();
        return children.map(child => {
            return <LayoutRenderer layout={tree.find(t => t.id === child)!} key={child}/>
        })
    });

    function onDrop(elementType: string) {
        if (elementType === ElementType.Container) {
            const containerId = props.layout.id;
            const childId = guid();
            root.set([...root.get().map(l => {
                if(l.id === containerId){
                    l.children.push(childId)
                }
                return l;
            }),{
                id : childId,
                parent : containerId,
                children : [],
                style : {
                    direction : 'column'
                }
            }])
        }
    }

    return <notifiable.div data-id={layout.get().id} style={() => {
        const style = layout.get().style;
        const containerHoverValue = containerIsHover.get();
        const result: CSSProperties = {
            display: 'flex',
            flexDirection: style.direction,
            padding: style.padding ?? 10,
            // paddingLeft: style.paddingLeft,
            // paddingTop: style.paddingTop,
            // paddingRight: style.paddingRight,
            // paddingBottom: style.paddingBottom,
            margin: style.margin,
            marginLeft: style.marginLeft,
            marginTop: style.marginTop,
            marginRight: style.marginRight,
            marginBottom: style.marginBottom,
            minWidth: style.minWidth ?? 20,
            minHeight: style.minHeight ?? 20,
            gap: style.gap ?? 10,
            width: style.width,
            flexShrink: style.shrink,
            backgroundColor:'rgba(0,0,0,0.1)',
            border: containerHoverValue ? `1px dashed rgba(0,0,0,0.2)` : '1px solid rgba(255,255,255,0)'
        }
        return result;
    }} onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        containerIsHover.set(true);
    }}
   onDragLeave={(e) => {
       e.stopPropagation();
       containerIsHover.set(false);
   }}
   onDrop={(e) => {
       e.preventDefault();
       e.stopPropagation();
       const id = e.dataTransfer.getData('text/plain');
       onDrop(id);
       containerIsHover.set(false);
   }}>
        {elements}
    </notifiable.div>
}

export default App;
