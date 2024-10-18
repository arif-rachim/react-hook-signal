import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {notifiable} from "react-hook-signal";
import {AppVariableInitialization} from "../app-designer/variable-initialization/AppVariableInitialization.tsx";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {AppViewerContext} from "./AppViewerContext.ts";
import {ContainerElement} from "./ContainerElement.tsx";
import {isEmpty} from "../utils/isEmpty.ts";
import {DefaultElements} from "../app-designer/DefaultElements.tsx";
import {useAppInitiator} from "../app-designer/hooks/useAppInitiator.ts";
import {PageVariableInitialization} from "../app-designer/variable-initialization/PageVariableInitialization.tsx";

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
        padding : 10,
        background: 'linear-gradient(0deg,#666,#555)'
    }}>
        <AppViewerContext.Provider value={context}>
            <ErrorBoundary>

                <AppVariableInitialization>
                    <PageVariableInitialization>
                        <div style={{
                            backgroundColor: '#444',
                            borderRadius: 20,
                            boxShadow: '0px 15px 20px -4px rgba(0,0,0,0.5)',
                            maxWidth: 1200,
                            maxHeight: 800,
                            display: 'flex',
                            width : '100%',
                            height : '100%',
                            flexDirection: 'column',
                            overflow: 'auto',
                            padding: 5
                        }}>
                            <notifiable.div style={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'auto',
                                backgroundColor: 'white',
                                borderRadius: 15,
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
                    </PageVariableInitialization>
                </AppVariableInitialization>
            </ErrorBoundary>
        </AppViewerContext.Provider>
    </div>
}
