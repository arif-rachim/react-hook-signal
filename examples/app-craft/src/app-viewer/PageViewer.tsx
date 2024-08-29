import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {Application, Container, Page, useAppInitiator} from "../app-designer/AppDesigner.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {useEffect, useState} from "react";
import {AppViewerContext} from "./AppViewerContext.ts";
import {isEmpty} from "../utils/isEmpty.ts";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {VariableInitialization} from "../app-designer/variable-initialization/VariableInitialization.tsx";
import {ContainerElement} from "./ContainerElement.tsx";

export function PageViewer(props: {
    elements: LayoutBuilderProps['elements'],
    page: Page,
    appConfig: Omit<Application, 'pages' | 'id' | 'name'>
    value: Record<string, unknown>
}) {
    const {elements, page, appConfig, value} = props;
    const variableInitialValueSignal = useSignal<Record<string, unknown>>(value);
    useEffect(() => {
        variableInitialValueSignal.set(value);
    }, [value, variableInitialValueSignal]);
    const appContext = useAppInitiator({
        value: {
            pages: [page],
            queries: appConfig.queries,
            name: `viewer-${page.name}`,
            id: `viewer-${page.id}`,
            fetchers: appConfig.fetchers,
            callables: appConfig.callables,
            tables: appConfig.tables,
            variables: appConfig.variables
        },
        elements: elements,
        onChange: () => {
            // do nothing, we are not accepting changes
        }
    })
    const context: AppViewerContext = {
        applicationSignal: appContext.applicationSignal,
        allApplicationCallablesSignal: appContext.allApplicationCallablesSignal,
        allPageCallablesSignal: appContext.allPageCallablesSignal,
        allTablesSignal: appContext.allTablesSignal,
        allPagesSignal: appContext.allPagesSignal,
        activePageIdSignal: appContext.activePageIdSignal,
        allContainersSignal: appContext.allContainersSignal,
        allPageVariablesSignal: appContext.allPageVariablesSignal,
        allPageFetchersSignal: appContext.allPageFetchersSignal,
        allApplicationFetchersSignal: appContext.allApplicationFetchersSignal,
        variableInitialValueSignal,
        allPageVariablesSignalInstance: appContext.allPageVariablesSignalInstance,
        allErrorsSignal: appContext.allErrorsSignal,
        allApplicationVariablesSignal: appContext.allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance: appContext.allApplicationVariablesSignalInstance,
        allApplicationQueriesSignal: appContext.allApplicationQueriesSignal,
        allPageQueriesSignal: appContext.allPageQueriesSignal,
        allVariablesSignalInstance: appContext.allVariablesSignalInstance,
        allVariablesSignal: appContext.allVariablesSignal,
        allFetchersSignal: appContext.allFetchersSignal,
        allQueriesSignal: appContext.allQueriesSignal,
        allCallablesSignal: appContext.allCallablesSignal,
        elements,
    } as AppViewerContext;

    const [container, setContainer] = useState<Container | undefined>();

    useSignalEffect(() => {
        const ctr = context.allContainersSignal.get().find(item => isEmpty(item.parent));
        if (ctr) {
            setContainer(ctr);
        }
    })
    return <AppViewerContext.Provider value={context}>
        <VariableInitialization>
            <ErrorBoundary>
                {container && <ContainerElement container={container}/>}
            </ErrorBoundary>
        </VariableInitialization>
    </AppViewerContext.Provider>
}