import {LayoutBuilderProps} from "../designer/LayoutBuilderProps.ts";
import {Application, Container, Page} from "../designer/AppDesigner.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {useEffect, useRef, useState} from "react";
import {AppViewerContext} from "./context/AppViewerContext.ts";
import {isEmpty} from "../../core/utils/isEmpty.ts";
import ErrorBoundary from "../../core/components/ErrorBoundary.tsx";
import {ContainerElement} from "./ContainerElement.tsx";
import {useAppInitiator} from "../../core/hooks/useAppInitiator.ts";
import {PageVariableInitialization} from "../designer/variable-initialization/PageVariableInitialization.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";

export function PageViewer(props: {
    elements: LayoutBuilderProps['elements'],
    page: Page,
    appConfig: Omit<Application, 'id' | 'name'>
    value: Record<string, unknown>,
    navigate: AppViewerContext['navigate']
}) {

    const {elements, page, appConfig, value, navigate} = props;
    const variableInitialValueSignal = useSignal<Record<string, unknown>>(value);


    const isMountedRef = useRef(false);

    useEffect(() => {
        if(!isMountedRef.current){
            variableInitialValueSignal.set(value);
            isMountedRef.current = true;
        }
    }, [value, variableInitialValueSignal]);
    const appContext = useAppInitiator({
        value: {
            pages: appConfig.pages,
            queries: appConfig.queries,
            name: `viewer-${page.name}`,
            id: `viewer-${page.id}`,
            fetchers: appConfig.fetchers,
            callables: appConfig.callables,
            tables: appConfig.tables,
            variables: appConfig.variables,
        },
        elements: elements,
        onChange: () => {
            // do nothing, we are not accepting changes
        },
        startingPage: page.name
    })
    const parentContext = useAppContext();

    const context: AppViewerContext = {
        applicationSignal: appContext.applicationSignal,
        allApplicationCallablesSignal: parentContext.allApplicationCallablesSignal,
        allPageCallablesSignal: appContext.allPageCallablesSignal,
        allTablesSignal: parentContext.allTablesSignal,
        allPagesSignal: parentContext.allPagesSignal,
        activePageIdSignal: appContext.activePageIdSignal,
        allContainersSignal: appContext.allContainersSignal,
        allPageVariablesSignal: appContext.allPageVariablesSignal,
        allPageFetchersSignal: appContext.allPageFetchersSignal,
        allApplicationFetchersSignal: parentContext.allApplicationFetchersSignal,
        variableInitialValueSignal,
        allPageVariablesSignalInstance: appContext.allPageVariablesSignalInstance,
        allErrorsSignal: appContext.allErrorsSignal,
        allApplicationVariablesSignal: parentContext.allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance: parentContext.allApplicationVariablesSignalInstance,
        allApplicationQueriesSignal: parentContext.allApplicationQueriesSignal,
        allPageQueriesSignal: appContext.allPageQueriesSignal,
        allVariablesSignalInstance: appContext.allVariablesSignalInstance,
        allVariablesSignal: appContext.allVariablesSignal,
        allFetchersSignal: appContext.allFetchersSignal,
        allQueriesSignal: appContext.allQueriesSignal,
        allCallablesSignal: appContext.allCallablesSignal,
        elements,
        navigate,
    } as AppViewerContext;

    const [container, setContainer] = useState<Container | undefined>();

    useSignalEffect(() => {
        const ctr = context.allContainersSignal.get().find(item => isEmpty(item.parent));
        if (ctr) {
            setContainer(ctr);
        }
    })


    return <AppViewerContext.Provider value={context}>
        <PageVariableInitialization>
            <ErrorBoundary>
                {container && <ContainerElement container={container}/>}
            </ErrorBoundary>
        </PageVariableInitialization>
    </AppViewerContext.Provider>
}