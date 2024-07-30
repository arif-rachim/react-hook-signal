import {useContext} from "react";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {DraggableContainerElement} from "./container-renderer/DraggableContainerElement.tsx";
import ErrorBoundary from "../../ErrorBoundary.tsx";

export function DesignPanel() {
    const {allContainersSignal, activePageIdSignal} = useContext(AppDesignerContext);
    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainerElement container={container}/>
        }
        return <></>
    });
    return <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
        {() => {
            const element = renderedElements.get()
            const activePage = activePageIdSignal.get();
            return <ErrorBoundary key={activePage}>
                {element}
            </ErrorBoundary>
        }}
    </notifiable.div>;
}