import {CSSProperties, useEffect} from "react";
import {AnySignal, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import ErrorBoundary from "./ErrorBoundary.tsx";
import {ModalProvider} from "../modal/ModalProvider.tsx";
import {VariableInitialization} from "./variable-initialization/VariableInitialization.tsx";
import {ErrorType} from "./errors/ErrorType.ts";
import {Dashboard} from "./dashboard/Dashboard.tsx";
import {Icon} from "./Icon.ts";
import {PagesPanel} from "./panels/pages/PagesPanel.tsx";
import {ElementsPanel} from "./panels/elements/ElementsPanel.tsx";
import {createVariablePanel} from "./panels/variables/VariablesPanel.tsx";
import {StylePanel} from "./panels/style/StylePanel.tsx";
import {PropertiesPanel} from "./panels/properties/PropertiesPanel.tsx";
import {ErrorsPanel} from "./panels/errors/ErrorsPanel.tsx";
import PackagePanel from "./panels/package/PackagePanel.tsx";
import {DefaultElements} from "./DefaultElements.tsx";
import {DatabasePanel} from "./panels/database/DatabasePanel.tsx";
import {createNewBlankApplication} from "./createNewBlankApplication.ts";
import {Query, Table} from "./panels/database/service/getTables.ts";
import {createFetcherPanel} from "./panels/fetchers/FetchersPanel.tsx";
import {createCallablePanel} from "./panels/callable/CallablePanel.tsx";
import {createQueriesPanel} from "./panels/queries/QueriesPanel.tsx";

export type VariableType = 'state' | 'computed' | 'effect';

export type Variable = {
    type: VariableType,
    id: string,
    name: string,
    functionCode: string,
    schemaCode: string,
}

export interface Callable {
    id: string,
    name: string,
    schemaCode: string,
    inputSchemaCode: string,
    functionCode: string,
}

export type FetcherParameter = {
    id: string,
    name: string,
    value: string,
    isInput: boolean,
}

export type Fetcher = {
    id: string,
    name: string,
    protocol: 'http' | 'https',
    domain: string,
    method: 'post' | 'get' | 'put' | 'patch' | 'delete',
    contentType: 'application/x-www-form-urlencoded' | 'application/json'
    path: string,
    headers: Array<FetcherParameter>,
    paths: Array<FetcherParameter>,
    data: Array<FetcherParameter>,
    returnTypeSchemaCode: string,
    // this is to compose the default formula
    defaultValueFormula: string,
}

export type VariableInstance = {
    id: string,
    instance: AnySignal<unknown>
}

export type ContainerPropertyType = {
    formula: string,
}

export type Page = {
    id: string,
    name: string,
    containers: Array<Container>,
    callables: Array<Callable>,
    variables: Array<Variable>,
    fetchers: Array<Fetcher>,
    queries: Array<Query>
}

export type Application = {
    id: string,
    name: string,
    pages: Array<Page>,
    tables: Array<Table>,
    queries: Array<Query>,
    callables: Array<Callable>,
    variables: Array<Variable>, // application variables, we can use this to store the login state !
    fetchers: Array<Fetcher>
}

export type Container = {
    id: string,
    children: string[],
    parent?: string,
    type: 'container' | string,
    verticalAlign?: 'top' | 'center' | 'bottom' | '',
    horizontalAlign?: 'left' | 'center' | 'right' | '',
    properties: Record<string, ContainerPropertyType> & { defaultStyle?: CSSProperties },
}

export function useAppInitiator(props: LayoutBuilderProps) {
    const applicationSignal = useSignal(createNewBlankApplication());

    const allApplicationCallablesSignal = useComputed(() => applicationSignal.get().callables ?? []);
    const allPagesSignal = useComputed<Array<Page>>(() => applicationSignal.get().pages ?? []);
    const allTablesSignal = useComputed<Array<Table>>(() => applicationSignal.get().tables ?? []);
    const allApplicationQueriesSignal = useComputed(() => applicationSignal.get().queries ?? []);

    const activePageIdSignal = useSignal<string>('');
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');

    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({});
    const allApplicationVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);

    const allPageVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);

    const activePageSignal = useComputed(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)
    })

    const allApplicationVariablesSignal = useComputed<Array<Variable>>(() => applicationSignal.get().variables ?? []);
    const allPageVariablesSignal = useComputed<Array<Variable>>(() => activePageSignal.get()?.variables ?? []);
    const allContainersSignal = useComputed<Array<Container>>(() => activePageSignal.get()?.containers ?? []);
    const allApplicationFetchersSignal = useComputed<Array<Fetcher>>(() => applicationSignal.get()?.fetchers ?? []);
    const allPageFetchersSignal = useComputed<Array<Fetcher>>(() => activePageSignal.get()?.fetchers ?? []);
    const allPageCallablesSignal = useComputed<Array<Callable>>(() => activePageSignal.get()?.callables ?? []);
    const allPageQueriesSignal = useComputed<Array<Query>>(() => activePageSignal.get()?.queries ?? []);

    const allVariablesSignalInstance = useComputed(() => [...allPageVariablesSignalInstance.get(), ...allApplicationVariablesSignalInstance.get()])
    const allVariablesSignal = useComputed(() => [...allPageVariablesSignal.get(), ...allApplicationVariablesSignal.get()])
    const allFetchersSignal = useComputed(() => [...allPageFetchersSignal.get(), ...allApplicationFetchersSignal.get()])
    const allQueriesSignal = useComputed(() => [...allPageQueriesSignal.get(), ...allApplicationQueriesSignal.get()])
    const allCallablesSignal = useComputed(() => [...allPageCallablesSignal.get(), ...allApplicationCallablesSignal.get()])
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
    return {
        applicationSignal,
        allApplicationCallablesSignal,
        allPagesSignal,
        allTablesSignal,
        activePageIdSignal,
        activeDropZoneIdSignal,
        selectedDragContainerIdSignal,
        hoveredDragContainerIdSignal,
        uiDisplayModeSignal,
        variableInitialValueSignal,
        allApplicationVariablesSignalInstance,
        allPageVariablesSignalInstance,
        allErrorsSignal,
        allApplicationVariablesSignal,
        allPageVariablesSignal,
        allContainersSignal,
        allPageFetchersSignal,
        allApplicationFetchersSignal,
        allPageCallablesSignal,
        allApplicationQueriesSignal,
        allPageQueriesSignal,


        allVariablesSignalInstance,
        allVariablesSignal,
        allFetchersSignal,
        allQueriesSignal,
        allCallablesSignal,
    };
}

export default function AppDesigner(props: LayoutBuilderProps) {
    const {
        applicationSignal,
        allApplicationCallablesSignal,
        allPagesSignal,
        allTablesSignal,
        activePageIdSignal,
        activeDropZoneIdSignal,
        selectedDragContainerIdSignal,
        hoveredDragContainerIdSignal,
        uiDisplayModeSignal,
        variableInitialValueSignal,
        allApplicationVariablesSignalInstance,
        allPageVariablesSignalInstance,
        allErrorsSignal,
        allApplicationVariablesSignal,
        allPageVariablesSignal,
        allContainersSignal,
        allPageFetchersSignal,
        allApplicationFetchersSignal,
        allPageCallablesSignal,
        allApplicationQueriesSignal,
        allPageQueriesSignal,
        allCallablesSignal,
        allVariablesSignalInstance,
        allVariablesSignal,
        allFetchersSignal,
        allQueriesSignal
    } = useAppInitiator(props);
    const context: AppDesignerContext = {
        applicationSignal,
        allApplicationCallablesSignal,
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
        allApplicationFetchersSignal,
        allApplicationQueriesSignal,

        allTablesSignal,
        allPagesSignal,
        allContainersSignal,

        activePageIdSignal,

        allPageFetchersSignal,
        allPageCallablesSignal,
        allPageVariablesSignal,
        variableInitialValueSignal,
        allPageVariablesSignalInstance,
        allPageQueriesSignal,

        elements: {...DefaultElements, ...props.elements},
        allErrorsSignal: allErrorsSignal,
        allCallablesSignal,
        allVariablesSignalInstance,
        allVariablesSignal,
        allFetchersSignal,
        allQueriesSignal,

        // designer mode
        hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
        selectedDragContainerIdSignal: selectedDragContainerIdSignal,
        activeDropZoneIdSignal: activeDropZoneIdSignal,
        uiDisplayModeSignal: uiDisplayModeSignal,

    }
    return <ErrorBoundary>
        <ModalProvider>
            <AppDesignerContext.Provider
                value={context}>
                <VariableInitialization>
                    <Dashboard panels={{
                        pages: {
                            title: 'Pages',
                            Icon: Icon.Page,
                            position: 'left',
                            component: PagesPanel
                        },
                        applicationVariables: {
                            title: 'Application Variables',
                            Icon: Icon.ApplicationVariable,
                            position: 'left',
                            component: createVariablePanel('application')
                        },
                        applicationFetchers: {
                            title: 'Application Fetchers',
                            Icon: Icon.Fetcher,
                            position: 'left',
                            component: createFetcherPanel('application'),
                        },
                        applicationFunctions: {
                            title: 'Application Callables',
                            Icon: Icon.Function,
                            position: 'left',
                            component: createCallablePanel('application'),
                        },
                        database: {
                            title: 'Database',
                            Icon: Icon.Database,
                            position: 'left',
                            component: DatabasePanel
                        },
                        applicationQueries: {
                            title: 'Application Queries',
                            Icon: Icon.Query,
                            position: 'left',
                            component: createQueriesPanel('application'),
                        },
                        components: {
                            title: 'Components',
                            Icon: Icon.Component,
                            position: 'leftBottom',
                            component: ElementsPanel,
                            visible: (_, selectedPanel) => selectedPanel?.left === 'pages'
                        },
                        variables: {
                            title: 'Variables',
                            Icon: Icon.Variable,
                            position: 'leftBottom',
                            component: createVariablePanel('page'),
                            visible: (_, selectedPanel) => selectedPanel?.left === 'pages'
                        },
                        fetchers: {
                            title: 'Fetchers',
                            Icon: Icon.Fetcher,
                            position: 'leftBottom',
                            component: createFetcherPanel('page'),
                            visible: (_, selectedPanel) => selectedPanel?.left === 'pages'
                        },
                        functions: {
                            title: 'Callables',
                            Icon: Icon.Function,
                            position: 'leftBottom',
                            component: createCallablePanel('page'),
                            visible: (_, selectedPanel) => selectedPanel?.left === 'pages'
                        },
                        queries: {
                            title: 'Queries',
                            Icon: Icon.Query,
                            position: 'leftBottom',
                            component: createQueriesPanel('page'),
                            visible: (_, selectedPanel) => selectedPanel?.left === 'pages'
                        },
                        errors: {
                            title: 'Errors',
                            Icon: Icon.Error,
                            position: 'bottom',
                            component: ErrorsPanel
                        },
                        styles: {
                            title: 'Styles',
                            Icon: Icon.Style,
                            position: 'right',
                            component: StylePanel,
                            visible: (tag) => tag?.type === 'DesignPanel'
                        },
                        properties: {
                            title: 'Properties',
                            Icon: Icon.Property,
                            position: 'right',
                            component: PropertiesPanel,
                            visible: (tag) => tag?.type === 'DesignPanel'
                        },
                        bundle: {
                            title: 'Package',
                            Icon: Icon.Package,
                            position: 'bottom',
                            component: PackagePanel
                        }
                    }}
                               defaultSelectedPanel={{
                                   left: 'pages',
                                   leftBottom: 'components',
                                   bottom: 'errors',
                                   right: 'styles',
                               }}>
                    </Dashboard>
                </VariableInitialization>
            </AppDesignerContext.Provider>
        </ModalProvider>
    </ErrorBoundary>
}


