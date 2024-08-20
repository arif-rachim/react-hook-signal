import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {Callable, Page, Variable, VariableInstance} from "../app-designer/AppDesigner.tsx";
import {Table} from "../app-designer/panels/database/service/getTables.ts";
import {useComputed, useSignal} from "react-hook-signal";
import {useEffect} from "react";
import {Signal} from "signal-polyfill";
import {ErrorType} from "../app-designer/errors/ErrorType.ts";
import {createNewBlankApplication} from "../app-designer/createNewBlankApplication.ts";
import {AppViewerContext} from "./AppViewerContext.ts";
import {isEmpty} from "../utils/isEmpty.ts";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {VariableInitialization} from "../app-designer/variable-initialization/VariableInitialization.tsx";
import {ContainerElement} from "./ContainerElement.tsx";

export function PageViewer(props: {
    elements: LayoutBuilderProps['elements'],
    page: Page,
    allTables: Array<Table>,
    allCallables:Array<Callable>
} & Record<string, unknown>) {
    const {elements, page,allTables,allCallables, ...properties} = props;
    const variableInitialValueSignal = useSignal<Record<string, unknown>>(properties);

    useEffect(() => {
        variableInitialValueSignal.set(properties);
    }, [properties, variableInitialValueSignal]);

    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allCallablesSignal = useComputed(() => allCallables);
    const allTablesSignal = useComputed(() => allTables)
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);
    const allVariablesSignal = useComputed(() => page.variables)
    const allContainersSignal = useComputed(() => page.containers);
    const allFetchersSignal = useComputed(() => page.fetchers);
    const allPagesSignal = useComputed<Array<Page>>(() => [page]);
    const applicationSignal = useSignal(createNewBlankApplication());
    const allApplicationVariablesSignalInstance = useSignal<Array<VariableInstance>>([]);
    const allApplicationVariablesSignal= useComputed<Array<Variable>>(() => [])
    const activePageIdSignal = useSignal(page.id)

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
        allApplicationVariablesSignalInstance,
        allApplicationVariablesSignal,
        elements: elements
    }
    const container = context.allContainersSignal.get().find(item => isEmpty(item.parent));

    return <AppViewerContext.Provider value={context}>
        <ErrorBoundary>
            <VariableInitialization/>
            {container && <ContainerElement container={container}/>}
        </ErrorBoundary>
    </AppViewerContext.Provider>
}