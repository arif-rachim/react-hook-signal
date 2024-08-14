import {CSSProperties, useEffect} from "react";
import {AnySignal, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {ToolBar} from "./ToolBar.tsx";
import ErrorBoundary from "./ErrorBoundary.tsx";
import {ModalProvider} from "../modal/ModalProvider.tsx";
import {VariableInitialization} from "./variable-initialization/VariableInitialization.tsx";
import {ErrorType} from "./errors/ErrorType.ts";
import {Dashboard} from "./dashboard/Dashboard.tsx";
import {Icon} from "./Icon.ts";
import {PagesPanel} from "./panels/pages/PagesPanel.tsx";
import {ElementsPanel} from "./panels/elements/ElementsPanel.tsx";
import {VariablesPanel} from "./panels/variables/VariablesPanel.tsx";
import {StylePanel} from "./panels/style/StylePanel.tsx";
import {PropertiesPanel} from "./panels/properties/PropertiesPanel.tsx";
import {ErrorsPanel} from "./panels/errors/ErrorsPanel.tsx";
import PackagePanel from "./panels/package/PackagePanel.tsx";
import {FetchersPanel} from "./panels/fetchers/FetchersPanel.tsx";
import {DefaultElements} from "./DefaultElements.tsx";
import {DatabasePanel} from "./panels/database/DatabasePanel.tsx";
import {createNewBlankApplication} from "./createNewBlankApplication.ts";
import {Table} from "./panels/database/service/getTables.ts";

export type VariableType = 'state' | 'computed' | 'effect';

export type Variable = {
    type: VariableType,
    id: string,
    name: string,
    functionCode: string,
    schemaCode: string,
    dependencies?: Array<string> // this is only for computed and effect
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
    returnTypeSchemaCode: string
}

export type VariableInstance = {
    id: string,
    instance: AnySignal<unknown>
}

export type FetcherInstance = {
    id: string,
    instance: (param: unknown) => Promise<{ error: string, result: unknown }>
}

export type ContainerPropertyType = {
    formula: string,
    dependencies?: Array<string>
}

export type Page = {
    id: string,
    name: string,
    containers: Array<Container>,
    variables: Array<Variable>,
    fetchers: Array<Fetcher>
}

export type Application = {
    id: string,
    name: string,
    pages: Array<Page>,
    tables : Array<Table>
}

export type Container = {
    id: string,
    children: string[],
    parent?: string,
    type: 'horizontal' | 'vertical' | string,
    width?: CSSProperties['width'],
    height?: CSSProperties['height'],

    minWidth?: CSSProperties['minWidth'],
    minHeight?: CSSProperties['minHeight'],


    paddingTop?: CSSProperties['paddingTop'],
    paddingRight?: CSSProperties['paddingRight'],
    paddingBottom?: CSSProperties['paddingBottom'],
    paddingLeft?: CSSProperties['paddingLeft'],

    marginTop?: CSSProperties['marginTop'],
    marginRight?: CSSProperties['marginRight'],
    marginBottom?: CSSProperties['marginBottom'],
    marginLeft?: CSSProperties['marginLeft'],

    // only for container
    gap?: CSSProperties['gap'],
    verticalAlign?: 'top' | 'center' | 'bottom' | '',
    horizontalAlign?: 'left' | 'center' | 'right' | '',

    properties: Record<string, ContainerPropertyType>,
}

export default function AppDesigner(props: LayoutBuilderProps) {
    const applicationSignal = useSignal(createNewBlankApplication());
    const allPagesSignal = useComputed<Array<Page>>(() => applicationSignal.get().pages ?? []);
    const activePageIdSignal = useSignal<string>('');
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');
    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({})
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);

    const allTablesSignal = useComputed<Array<Table>>(() => {
        return applicationSignal.get().tables ?? []
    });

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
        if(value && value.pages && value.pages.length > 0){
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
    const context: AppDesignerContext = {
        applicationSignal:applicationSignal,
        allTablesSignal:allTablesSignal,
        allPagesSignal: allPagesSignal,
        activePageIdSignal: activePageIdSignal,
        hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
        selectedDragContainerIdSignal: selectedDragContainerIdSignal,
        activeDropZoneIdSignal: activeDropZoneIdSignal,
        uiDisplayModeSignal: uiDisplayModeSignal,
        allContainersSignal: allContainersSignal,
        allVariablesSignal: allVariablesSignal,
        variableInitialValueSignal: variableInitialValueSignal,
        allVariablesSignalInstance: allVariablesSignalInstance,
        allErrorsSignal: allErrorsSignal,
        allFetchersSignal: allFetchersSignal,
        elements: {...DefaultElements, ...props.elements}
    }
    return <ErrorBoundary>
        <ModalProvider>
            <AppDesignerContext.Provider
                value={context}>
                <VariableInitialization/>
                <Dashboard panels={{
                    pages: {
                        title: 'Pages',
                        Icon: Icon.Page,
                        position: 'left',
                        component: PagesPanel
                    },
                    components: {
                        title: 'Components',
                        Icon: Icon.Component,
                        position: 'left',
                        component: ElementsPanel
                    },
                    variables: {
                        title: 'Variables',
                        Icon: Icon.Variable,
                        position: 'leftBottom',
                        component: VariablesPanel
                    },
                    fetchers: {
                        title: 'Fetchers',
                        Icon: Icon.Fetcher,
                        position: 'leftBottom',
                        component: FetchersPanel
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
                        visible : (tag) => tag?.type === 'DesignPanel'
                    },
                    properties: {
                        title: 'Properties',
                        Icon: Icon.Property,
                        position: 'right',
                        component: PropertiesPanel,
                        visible : (tag) => tag?.type === 'DesignPanel'
                    },
                    bundle: {
                        title: 'Package',
                        Icon: Icon.Package,
                        position: 'bottom',
                        component: PackagePanel
                    },
                    database : {
                        title : 'Database',
                        Icon : Icon.Database,
                        position : 'leftBottom',
                        component : DatabasePanel
                    }
                }}
                           defaultSelectedPanel={{
                               left: 'components',
                               leftBottom: 'variables',
                               bottom: 'errors',
                               right: 'styles',
                           }}>
                </Dashboard>
                <ToolBar/>
            </AppDesignerContext.Provider>
        </ModalProvider>
    </ErrorBoundary>
}


