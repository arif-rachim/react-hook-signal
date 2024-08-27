import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {notifiable} from "react-hook-signal";
import {useAppInitiator} from "../app-designer/AppDesigner.tsx";
import {VariableInitialization} from "../app-designer/variable-initialization/VariableInitialization.tsx";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {AppViewerContext} from "./AppViewerContext.ts";
import {ContainerElement} from "./ContainerElement.tsx";

/**
 * Renders the application viewer component.
 */
export default function AppViewer(props: LayoutBuilderProps) {
    const appContext = useAppInitiator(props);
    const context = {...appContext, elements: props.elements} as AppViewerContext;

    return <AppViewerContext.Provider value={context}>
        <ErrorBoundary>
            <VariableInitialization>
                <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
                    {() => {
                        const container = context.allContainersSignal.get().find(item => item.parent === '');
                        if (container) {
                            return <ContainerElement container={container}/>
                        }
                        return <></>
                    }}
                </notifiable.div>
            </VariableInitialization>
        </ErrorBoundary>
    </AppViewerContext.Provider>
}
