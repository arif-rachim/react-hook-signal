import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {notifiable} from "react-hook-signal";
import {VariableInitialization} from "../app-designer/variable-initialization/VariableInitialization.tsx";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {AppViewerContext} from "./AppViewerContext.ts";
import {ContainerElement} from "./ContainerElement.tsx";
import {isEmpty} from "../utils/isEmpty.ts";
import {DefaultElements} from "../app-designer/DefaultElements.tsx";
import {useAppInitiator} from "../app-designer/hooks/useAppInitiator.ts";

/**
 * Renders the application viewer component.
 */
export default function AppViewer(props: LayoutBuilderProps & { startingPage: string }) {
    const appContext = useAppInitiator(props);
    const context = {...appContext, elements: {...DefaultElements, ...props.elements}} as AppViewerContext;
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        background: 'linear-gradient(0deg,#666,#555)'
    }}>
        <AppViewerContext.Provider value={context}>
            <ErrorBoundary>
                <VariableInitialization>
                    <div style={{
                        backgroundColor: '#444',
                        borderRadius: 20,
                        boxShadow: '0px 15px 20px -4px rgba(0,0,0,0.5)'
                    }}>
                        <notifiable.div style={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto',
                            maxWidth: 1200,
                            maxHeight: 900,
                            minWidth: 1200,
                            minHeight: 900,
                            backgroundColor: 'white',
                            margin: 5,
                            borderRadius: 15
                        }}>
                            {() => {
                                const container = context.allContainersSignal.get().find(item => isEmpty(item.parent));
                                if (container) {
                                    return <ContainerElement container={container}/>
                                }
                                return <></>
                            }}
                        </notifiable.div>
                    </div>
                </VariableInitialization>
            </ErrorBoundary>
        </AppViewerContext.Provider>
    </div>
}
