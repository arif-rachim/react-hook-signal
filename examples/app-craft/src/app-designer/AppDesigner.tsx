import {CSSProperties, useContext, useEffect} from "react";
import {AnySignal, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import ButtonGroup from "./button/ButtonGroup.tsx";
import {ToolBar} from "./ToolBar.tsx";
import ErrorBoundary from "./ErrorBoundary.tsx";
import {ModalProvider} from "../modal/ModalProvider.tsx";
import {VariableInitialization} from "./variable-initialization/VariableInitialization.tsx";
import {ErrorType} from "./errors/ErrorType.ts";
import {createNewBlankPage} from "./createNewBlankPage.ts";
import {Dashboard} from "../dashboard/Dashboard.tsx";
import {Icon} from "./Icon.ts";
import {PagesPanel} from "./panels/pages/PagesPanel.tsx";
import {ElementsPanel} from "./panels/elements/ElementsPanel.tsx";
import {VariablesPanel} from "./panels/variables/VariablesPanel.tsx";
import {StylePanel} from "./panels/style/StylePanel.tsx";
import {PropertiesPanel} from "./panels/properties/PropertiesPanel.tsx";
import {ErrorsPanel} from "./panels/errors/ErrorsPanel.tsx";
import {DesignPanel} from "./panels/design/DesignPanel.tsx";

export type VariableType = 'state' | 'computed' | 'effect';

export type Variable = {
    type: VariableType,
    id: string,
    name: string,
    functionCode: string,
    schemaCode: string,
    dependencies?: Array<string> // this is only for computed and effect
}

export type VariableInstance = {
    id: string,
    instance: AnySignal<unknown>
}
export type ContainerPropertyType = {
    formula: string,
    dependencies?: Array<string>
}

export type Page = {
    id: string,
    name: string,
    containers: Array<Container>,
    variables: Array<Variable>
}

export type Container = {
    id: string,
    children: string[],
    parent: string,
    type: 'horizontal' | 'vertical' | string,
    width: CSSProperties['width'],
    height: CSSProperties['height'],

    minWidth: CSSProperties['minWidth'],
    minHeight: CSSProperties['minHeight'],


    paddingTop: CSSProperties['paddingTop'],
    paddingRight: CSSProperties['paddingRight'],
    paddingBottom: CSSProperties['paddingBottom'],
    paddingLeft: CSSProperties['paddingLeft'],

    marginTop: CSSProperties['marginTop'],
    marginRight: CSSProperties['marginRight'],
    marginBottom: CSSProperties['marginBottom'],
    marginLeft: CSSProperties['marginLeft'],

    // only for container
    gap: CSSProperties['gap'],
    verticalAlign: 'top' | 'center' | 'bottom' | '',
    horizontalAlign: 'left' | 'center' | 'right' | '',

    properties: Record<string, ContainerPropertyType>,
}


function ToggleViewToolbar() {
    const {uiDisplayModeSignal} = useContext(AppDesignerContext);
    return <div style={{display: 'flex', justifyContent: 'center', padding: 10, background: 'rgba(0,0,0,0.2)'}}>
        <ButtonGroup buttons={{
            'Preview': {
                onClick: () => uiDisplayModeSignal.set('view')
            },
            'Design': {
                onClick: () => uiDisplayModeSignal.set('design')
            }
        }} defaultButton={'Design'}/>
    </div>
}


export default function AppDesigner(props: LayoutBuilderProps) {
    const allPagesSignal = useSignal<Array<Page>>([createNewBlankPage()])
    const activePageIdSignal = useSignal<string>('');
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');
    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({})
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);
    useSignalEffect(() => {
        const errors = allErrorsSignal.get();
        console.log('errors', errors)
    })

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

    const {value, onChange} = props;
    useEffect(() => {
        if (value && value.length > 0) {
            allPagesSignal.set(value);
            const currentActivePageId = activePageIdSignal.get();
            const hasSelection = value.findIndex(i => i.id === currentActivePageId) >= 0;
            if (!hasSelection) {
                allErrorsSignal.set([]);
                variableInitialValueSignal.set({});
                activePageIdSignal.set(value[0].id)
            }
        }
    }, [activePageIdSignal, allErrorsSignal, allPagesSignal, value, variableInitialValueSignal]);

    useSignalEffect(() => {
        onChange(allPagesSignal.get());
    })

    return <ErrorBoundary>
        <ModalProvider>
            <AppDesignerContext.Provider
                value={{
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
                    elements: props.elements
                }}>
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
                        component: StylePanel
                    },
                    properties: {
                        title: 'Properties',
                        Icon: Icon.Property,
                        position: 'right',
                        component: PropertiesPanel
                    },
                    design : {
                        title : 'Design',
                        Icon : Icon.Detail,
                        position : 'center',
                        component : DesignViewPanel
                    }
                }} defaultSelectedPanel={{
                    left: 'components',
                    leftBottom : 'variables',
                    bottom : 'errors',
                    right : 'styles',
                }}>

                </Dashboard>
            </AppDesignerContext.Provider>
        </ModalProvider>
    </ErrorBoundary>
}

function DesignViewPanel(){
    return <>
        <ToggleViewToolbar/>
        <DesignPanel/>
        <ToolBar/>
    </>
}

