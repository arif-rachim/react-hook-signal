import {Notifiable, notifiable, useSignal} from "react-hook-signal";
import {Component} from "./comp/Component.ts";
import {ComponentRenderer} from "./comp/ComponentRenderer.tsx";
import {ComponentProperties} from "./comp/ComponentProperties.tsx";
import {ComponentContext} from "./comp/ComponentContext.ts";
import {ComponentLibrary} from "./comp/ComponentLibrary.tsx";
import {BORDER} from "./comp/Border.ts";
import {guid} from "./utils/guid.ts";

/**
 * Represents the main application comp.
 */
function App() {
    const ROOT_ID = guid();
    const components = useSignal<Component[]>([{
        style: {
            height: '100%',
            overflow: 'auto'
        },
        componentType: 'Vertical',
        id: ROOT_ID,
        parent: '',
        children: []
    }]);
    const focusedComponent = useSignal<Component | undefined>(undefined);
    const rightPanelWidth = useSignal<number | undefined>(undefined);
    const leftPanelWidth = useSignal<number | undefined>(150);

    function onMouseRightMove(e: MouseEvent) {
        rightPanelWidth.set(window.innerWidth - e.clientX - 5);
    }

    function onMouseLeftMove(e: MouseEvent) {
        leftPanelWidth.set(e.clientX)
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseRightMove);
        document.removeEventListener('mousemove', onMouseLeftMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    return <ComponentContext.Provider value={{components, focusedComponent}}>
        <div style={{display: 'flex', flexDirection: 'row', height: '100%', overflow: 'auto'}}>
            <notifiable.div style={() => {
                const widthValue = leftPanelWidth.get();
                return {
                    width: widthValue,
                    borderRight: '1px solid #CCC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5
                }
            }}>
                <div style={{display: 'flex', flexDirection: 'column', marginTop: 5}}>
                    <ComponentLibrary/>
                </div>
                <div style={{borderBottom: BORDER}}></div>
                <div style={{display: 'flex', flexDirection: 'column', marginRight: 5, marginTop: 5}}>
                    <Notifiable component={ComponentRenderer} comp={() => {
                        return components.get().find(i => i.id === ROOT_ID)!
                    }} renderAsTree={true}/>
                </div>
            </notifiable.div>
            <div style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', width: 5, cursor: 'ew-resize'}}
                 onMouseDown={() => {
                     document.addEventListener('mousemove', onMouseLeftMove);
                     document.addEventListener('mouseup', onMouseUp);
                 }}></div>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                <Notifiable component={ComponentRenderer} comp={() => {
                    return components.get().find(i => i.id === ROOT_ID)!
                }}/>
            </div>
            <div style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', width: 5, cursor: 'ew-resize'}}
                 onMouseDown={() => {
                     document.addEventListener('mousemove', onMouseRightMove);
                     document.addEventListener('mouseup', onMouseUp);
                 }}></div>
            <notifiable.div style={() => {
                const widthValue = rightPanelWidth.get();
                return {
                    width: widthValue ?? 250,
                    borderLeft: '1px solid #CCC',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}>
                <ComponentProperties/>
            </notifiable.div>
        </div>
    </ComponentContext.Provider>
}


export default App;
