import {useContext} from "react";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {notifiable} from "react-hook-signal";
import {DraggableContainerElement} from "./container-renderer/DraggableContainerElement.tsx";
import ErrorBoundary from "../../ErrorBoundary.tsx";
import ButtonGroup from "../../button/ButtonGroup.tsx";

export function DesignPanel() {
    const context = useContext(AppDesignerContext);
    return <>
            <ToggleViewToolbar/>
            <ErrorBoundary>
                <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
                    {() => {
                        const container = context.allContainersSignal.get().find(item => item.parent === '');
                        if (container) {
                            return <DraggableContainerElement container={container}/>
                        }
                        return <></>
                    }}
                </notifiable.div>
            </ErrorBoundary>
    </>
}

function ToggleViewToolbar() {
    const {uiDisplayModeSignal} = useContext(AppDesignerContext);
    return <div style={{display: 'flex', justifyContent: 'center', padding: 5, background: 'rgba(0,0,0,0.05)'}}>
        <ButtonGroup buttons={{
            'Preview': {
                onClick: () => uiDisplayModeSignal.set('view')
            },
            'Design': {
                onClick: () => uiDisplayModeSignal.set('design')
            }
        }} defaultButton={'Design'}/>
    </div>
}
