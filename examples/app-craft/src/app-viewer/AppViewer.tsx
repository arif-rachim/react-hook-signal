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
import LoadingScreen from "../utils/LoadingScreen.tsx";
import {ModalProvider} from "../modal/ModalProvider.tsx";

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
        padding: 10,
        background: 'linear-gradient(0deg,#666,#555)'
    }}>
        <div style={{
            backgroundColor: '#444',
            borderRadius: 20,
            boxShadow: '0px 15px 20px -4px rgba(0,0,0,0.5)',
            maxWidth: 1200,
            maxHeight: 800,
            display: 'flex',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            overflow: 'auto',
            padding: 5
        }}>
            <ErrorBoundary>
                <AppViewerContext.Provider value={context}>
                    <ModalProvider>
                        <AppVariableInitialization>
                            <PageVariableInitialization>
                                <notifiable.div style={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'auto',
                                    backgroundColor: 'white',
                                    borderRadius: 15,
                                    position: 'relative'
                                }}>
                                    {() => {
                                        const container = context.allContainersSignal.get().find(item => isEmpty(item.parent));
                                        if (container) {
                                            return <><ContainerElement container={container}/>
                                                <LoadingScreen/></>
                                        }
                                        return <></>
                                    }}
                                </notifiable.div>

                            </PageVariableInitialization>
                        </AppVariableInitialization>
                    </ModalProvider>
                </AppViewerContext.Provider>

            </ErrorBoundary>

        </div>
    </div>
}
