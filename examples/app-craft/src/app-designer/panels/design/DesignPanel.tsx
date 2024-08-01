import {useContext} from "react";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {DraggableContainerElement} from "./container-renderer/DraggableContainerElement.tsx";
import ErrorBoundary from "../../ErrorBoundary.tsx";
import ButtonGroup from "../../button/ButtonGroup.tsx";

export function DesignPanel() {
    const {allContainersSignal, activePageIdSignal} = useContext(AppDesignerContext);
    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainerElement container={container}/>
        }
        return <></>
    });
    return <>
        <ToggleViewToolbar/>
        <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
        {() => {
            const element = renderedElements.get()
            const activePage = activePageIdSignal.get();
            return <ErrorBoundary key={activePage}>
                {element}
            </ErrorBoundary>
        }}
    </notifiable.div>
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