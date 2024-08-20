import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Container, Fetcher, Page, Variable, VariableInstance} from "../app-designer/AppDesigner.tsx";
import {Signal} from "signal-polyfill";
import {ErrorType} from "../app-designer/errors/ErrorType.ts";
import {useEffect} from "react";
import {VariableInitialization} from "../app-designer/variable-initialization/VariableInitialization.tsx";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {AppViewerContext} from "./AppViewerContext.ts";
import {createNewBlankApplication} from "../app-designer/createNewBlankApplication.ts";
import {ContainerElement} from "./ContainerElement.tsx";

/**
 * Renders the application viewer component.
 */
export default function AppViewer(props: LayoutBuilderProps) {
    const applicationSignal = useSignal(createNewBlankApplication());
    const allPagesSignal = useComputed<Array<Page>>(() => applicationSignal.get().pages);
    const activePageIdSignal = useSignal<string>('');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({})
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);
    const allCallablesSignal = useComputed(() => applicationSignal.get().callables ?? []);
    const allTablesSignal = useComputed(() => applicationSignal.get().tables ?? []);
    const allApplicationVariablesSignal= useComputed(() => applicationSignal.get().variables ?? []);
    const allApplicationVariablesSignalInstance = useSignal<Array<VariableInstance>>([]);
    const allVariablesSignal = useComputed<Array<Variable>>(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)?.variables ?? []
    });
    const allContainersSignal = useComputed<Array<Container>>(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)?.containers ?? []
    });
    const allFetchersSignal = useComputed<Array<Fetcher>>(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)?.fetchers ?? []
    });
    const {value, onChange} = props;
    useEffect(() => {
        applicationSignal.set(value);
        if (value && value.pages && value.pages.length > 0) {
            const currentActivePageId = activePageIdSignal.get();
            const hasSelection = value.pages.findIndex(i => i.id === currentActivePageId) >= 0;
            if (!hasSelection) {
                allErrorsSignal.set([]);
                variableInitialValueSignal.set({});
                activePageIdSignal.set(value.pages[0].id)
            }
        }
    }, [activePageIdSignal, allErrorsSignal, applicationSignal, value, variableInitialValueSignal]);
    useSignalEffect(() => {
        onChange(applicationSignal.get());
    })
    const context: AppViewerContext = {
        applicationSignal,
        allCallablesSignal,
        allTablesSignal,
        allPagesSignal,
        activePageIdSignal,
        allContainersSignal,
        variableInitialValueSignal,
        allVariablesSignal,
        allVariablesSignalInstance,
        allErrorsSignal,
        allFetchersSignal,
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
        elements: props.elements
    }

    return <AppViewerContext.Provider value={context}>
        <ErrorBoundary>
            <VariableInitialization/>
            <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
                {() => {
                    const container = allContainersSignal.get().find(item => item.parent === '');
                    if (container) {
                        return <ContainerElement container={container}/>
                    }
                    return <></>
                }}
            </notifiable.div>
        </ErrorBoundary>
    </AppViewerContext.Provider>
}
