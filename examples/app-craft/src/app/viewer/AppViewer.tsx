import {LayoutBuilderProps} from "../designer/LayoutBuilderProps.ts";
import {notifiable} from "react-hook-signal";
import {AppVariableInitialization} from "../designer/variable-initialization/AppVariableInitialization.tsx";
import ErrorBoundary from "../../core/components/ErrorBoundary.tsx";
import {AppViewerContext} from "./context/AppViewerContext.ts";
import {ContainerElement} from "./ContainerElement.tsx";
import {isEmpty} from "../../core/utils/isEmpty.ts";
import {DefaultElements} from "../designer/DefaultElements.tsx";
import {useAppInitiator} from "../../core/hooks/useAppInitiator.ts";
import {PageVariableInitialization} from "../designer/variable-initialization/PageVariableInitialization.tsx";
import {ModalProvider} from "../../core/modal/ModalProvider.tsx";

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
                                            return <>
                                                <ContainerElement container={container}/>
                                                {/*<LoadingScreen/>*/}
                                            </>
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
