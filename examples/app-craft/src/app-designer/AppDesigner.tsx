import {CSSProperties, useContext, useEffect} from "react";
import {AnySignal, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {LeftPanel} from "./left-panel/LeftPanel.tsx";
import {RightPanel} from "./right-panel/RightPanel.tsx";
import ButtonGroup from "./button/ButtonGroup.tsx";
import {ToolBar} from "./ToolBar.tsx";
import {DraggableContainerElement} from "./container-element-renderer/DraggableContainerElement.tsx";
import ErrorBoundary from "./ErrorBoundary.tsx";
import {ModalProvider} from "../modal/ModalProvider.tsx";
import {BottomPanel} from "./bottom-panel/BottomPanel.tsx";
import {VariableInitialization} from "./variable-initialization/VariableInitialization.tsx";
import {ErrorType} from "./errors/ErrorType.ts";
import {createNewBlankPage} from "./createNewBlankPage.ts";

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
    id : string,
    name : string,
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
    const variableInitialValueSignal = useSignal<Record<string,unknown>>({})
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);


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
        if(value && value.length > 0){
            allPagesSignal.set(value);
            const currentActivePageId = activePageIdSignal.get();
            const hasSelection = value.findIndex(i => i.id === currentActivePageId) >= 0;
            if(!hasSelection){
                allErrorsSignal.set([]);
                variableInitialValueSignal.set({});
                activePageIdSignal.set(value[0].id)
            }
        }
    }, [activePageIdSignal, allErrorsSignal, allPagesSignal, value, variableInitialValueSignal]);

    useSignalEffect(() => {
        onChange(allPagesSignal.get());
    })

    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainerElement container={container}/>
        }
        return <></>
    });
    return <ErrorBoundary>
        <ModalProvider>
            <AppDesignerContext.Provider
                value={{
                    allPagesSignal:allPagesSignal,
                    activePageIdSignal:activePageIdSignal,
                    hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
                    selectedDragContainerIdSignal: selectedDragContainerIdSignal,
                    activeDropZoneIdSignal: activeDropZoneIdSignal,
                    uiDisplayModeSignal: uiDisplayModeSignal,
                    allContainersSignal: allContainersSignal,
                    allVariablesSignal: allVariablesSignal,
                    variableInitialValueSignal:variableInitialValueSignal,
                    allVariablesSignalInstance: allVariablesSignalInstance,
                    allErrorsSignal: allErrorsSignal,
                    elements: props.elements
                }}>
                <VariableInitialization/>
                <div style={{display: 'flex', flexDirection: 'row', height: '100%', overflow: 'hidden'}}>
                    <LeftPanel/>
                    <div style={{
                        flexGrow: 1,
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'rgba(0,0,0,0.02)'
                    }}>
                        <ToggleViewToolbar/>
                        <div style={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 10
                        }}>
                            <notifiable.div style={{flexGrow: 1, boxShadow:'0px 0px 5px 5px rgba(0,0,0,0.1)', overflow: 'auto'}}>
                                {() => {
                                    const element = renderedElements.get()
                                    const activePage = activePageIdSignal.get();
                                    return <ErrorBoundary key={activePage}>
                                        {element}
                                    </ErrorBoundary>
                                }}
                            </notifiable.div>

                        </div>
                        <BottomPanel />
                        <ToolBar/>
                    </div>
                    <RightPanel/>
                </div>
            </AppDesignerContext.Provider>
        </ModalProvider>
    </ErrorBoundary>
}

