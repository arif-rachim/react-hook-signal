import {notifiable} from "react-hook-signal";
import {DraggableContainerElement} from "./DraggableContainerElement.tsx";
import ErrorBoundary from "../../../../core/components/ErrorBoundary.tsx";
import ButtonGroup from "../../../button/ButtonGroup.tsx";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {isEmpty} from "../../../../core/utils/isEmpty.ts";

export function DesignPanel() {
    const context = useAppContext();
    return <>
        <ToggleViewToolbar/>
        <ErrorBoundary>
            <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
                {() => {
                    const container = context.allContainersSignal.get().find(item => isEmpty(item.parent));
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
    const {uiDisplayModeSignal} = useAppContext<AppDesignerContext>();

    return <notifiable.div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 5,
        background: 'rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
    }}>
        {() => {
            const displayMode = uiDisplayModeSignal.get();
            return <ButtonGroup buttons={{
                'view': {
                    title: 'View',
                    onClick: () => uiDisplayModeSignal.set('view')
                },
                'design': {
                    title: 'Design',
                    onClick: () => uiDisplayModeSignal.set('design')
                }
            }} value={displayMode ?? 'Design'}/>
        }}
    </notifiable.div>
}
