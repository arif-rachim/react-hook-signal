import {CSSProperties, useEffect, useState} from "react";
import {AnySignal, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import ErrorBoundary from "../../core/components/ErrorBoundary.tsx";
import {ModalProvider} from "../../core/modal/ModalProvider.tsx";
import {AppVariableInitialization} from "./variable-initialization/AppVariableInitialization.tsx";
import {Dashboard} from "../Dashboard.tsx";
import {Icon} from "../../core/components/icon/Icon.ts";
import {PagesPanel} from "./panels/pages/PagesPanel.tsx";
import {ElementsPanel} from "./panels/elements/ElementsPanel.tsx";
import {VariablesPanel} from "./panels/variables/VariablesPanel.tsx";
import {StylePanel} from "./panels/style/StylePanel.tsx";
import {PropertiesPanel} from "./panels/properties/PropertiesPanel.tsx";
import {ErrorsPanel} from "./panels/errors/ErrorsPanel.tsx";
import PackagePanel from "./panels/package/PackagePanel.tsx";
import {DefaultElements} from "./DefaultElements.tsx";
import {DatabasePanel} from "./panels/database/DatabasePanel.tsx";
import {Query, Table} from "./panels/database/getTables.ts";
import {FetchersPanel} from "./panels/fetchers/FetchersPanel.tsx";
import {CallablePanel} from "./panels/callable/CallablePanel.tsx";
import {QueriesPanel} from "./panels/queries/QueriesPanel.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {isEmpty} from "../../core/utils/isEmpty.ts";
import {useAppInitiator} from "../../core/hooks/useAppInitiator.ts";
import {PageVariableInitialization} from "./variable-initialization/PageVariableInitialization.tsx";

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
    functionCode: string,
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
        allQueriesSignal,
        navigate
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
        navigate
    }

    return <ErrorBoundary>

        <AppDesignerContext.Provider
            value={context}>
            <ModalProvider>
                <AppVariableInitialization>
                    <PageVariableInitialization>

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
                                position: 'leftBottom',
                                component: ElementsPanel,
                            },
                            layoutTree: {
                                title: 'Layout Tree',
                                Icon: Icon.Tree,
                                position: 'right',
                                component: ComponentTree,
                            },
                            properties: {
                                title: 'Properties',
                                Icon: Icon.Property,
                                position: 'rightBottom',
                                component: PropertiesPanel,
                            },
                            styles: {
                                title: 'Styles',
                                Icon: Icon.Style,
                                position: 'rightBottom',
                                component: StylePanel,
                            },
                            variables: {
                                title: 'Variables',
                                Icon: Icon.Variable,
                                position: 'leftBottom',
                                component: VariablesPanel,
                            },
                            functions: {
                                title: 'Callables',
                                Icon: Icon.Function,
                                position: 'leftBottom',
                                component: CallablePanel,
                            },
                            fetchers: {
                                title: 'Fetchers',
                                Icon: Icon.Fetcher,
                                position: 'leftBottom',
                                component: FetchersPanel,
                            },
                            queries: {
                                title: 'Queries',
                                Icon: Icon.Query,
                                position: 'leftBottom',
                                component: QueriesPanel,
                            },
                            database: {
                                title: 'Database',
                                Icon: Icon.Database,
                                position: 'leftBottom',
                                component: DatabasePanel
                            },
                            errors: {
                                title: 'Errors',
                                Icon: Icon.Error,
                                position: 'bottom',
                                component: ErrorsPanel
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
                                       right: 'layoutTree',
                                       rightBottom: 'properties',
                                   }}
                                   onMainCenterClicked={(panel, selectedPanelSignal) => {
                                       setTimeout(() => {
                                           if (panel.tag?.type === 'VariableEditorPanel') {
                                               selectedPanelSignal.set({
                                                   ...selectedPanelSignal.get(),
                                                   leftBottom: 'variables',
                                                   right: '',
                                                   rightBottom: ''
                                               })
                                           }
                                           if (panel.tag?.type === 'ComponentPropertyEditor') {
                                               selectedPanelSignal.set({
                                                   ...selectedPanelSignal.get(),
                                                   right: 'layoutTree',
                                                   rightBottom: 'properties'
                                               })
                                           }
                                           if (panel.tag?.type === 'CallableEditorPanel') {
                                               selectedPanelSignal.set({
                                                   ...selectedPanelSignal.get(),
                                                   leftBottom: 'callable',
                                                   right: '',
                                                   rightBottom: ''
                                               })
                                           }
                                           if (panel.tag?.type === 'FetcherEditorPanel') {
                                               selectedPanelSignal.set({
                                                   ...selectedPanelSignal.get(),
                                                   leftBottom: 'fetcher',
                                                   right: '',
                                                   rightBottom: ''
                                               })
                                           }
                                           if (panel.tag?.type === 'QueryEditorPanel') {
                                               selectedPanelSignal.set({
                                                   ...selectedPanelSignal.get(),
                                                   leftBottom: 'queries',
                                                   right: '',
                                                   rightBottom: ''
                                               })
                                           }
                                           if (panel.tag?.type === 'DesignPanel') {
                                               selectedPanelSignal.set({
                                                   ...selectedPanelSignal.get(),
                                                   left: 'pages',
                                                   right: '',
                                                   rightBottom: ''
                                               })
                                           }
                                       }, 0);
                                   }}>
                        </Dashboard>

                    </PageVariableInitialization>
                </AppVariableInitialization>
            </ModalProvider>
        </AppDesignerContext.Provider>
    </ErrorBoundary>
}

function ComponentTree() {
    const {activePageIdSignal, allPagesSignal} = useAppContext();
    // first we need to get the page
    const activePageSignal = useComputed(() => {
        const activePageId = activePageIdSignal.get();
        return allPagesSignal.get().find(p => p.id === activePageId);
    })
    const [container, setContainer] = useState<Container | undefined>();
    useSignalEffect(() => {
        const containers = activePageSignal.get()?.containers ?? [];
        const parentContainer = containers.find((c: Container) => isEmpty(c.parent)) as Container;
        setContainer(parentContainer);
    })

    return <ComponentTreeNode container={container}/>
}

function ComponentTreeNode(props: { container?: Container, paddingLeft?: number }) {
    const {container} = props;
    let {paddingLeft} = props;
    const {allContainersSignal, selectedDragContainerIdSignal} = useAppContext<AppDesignerContext>();
    const containerSignal = useSignal(container);
    useEffect(() => {
        containerSignal.set(container);
    }, [container, containerSignal]);
    paddingLeft = paddingLeft ?? 0;

    if (container === undefined) {
        return <></>
    }

    return <div style={{display: 'flex', flexDirection: 'column'}}>
        <notifiable.div style={() => {
            const id = selectedDragContainerIdSignal.get();
            const container = containerSignal.get();
            const isSelected = id === container?.id;
            return {
                paddingLeft: paddingLeft + 10,
                paddingRight: 10,
                background: isSelected ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0)'
            }
        }} onClick={() => {
            selectedDragContainerIdSignal.set(container?.id ?? '');
        }}>{container.type}</notifiable.div>
        {container.children.map(c => {
            const subContainer = allContainersSignal.get().find(p => p.id === c);
            return <ComponentTreeNode container={subContainer} key={subContainer?.id ?? ''}
                                      paddingLeft={paddingLeft + 10}/>
        })}
        <ComponentTreeNode/>
    </div>
}