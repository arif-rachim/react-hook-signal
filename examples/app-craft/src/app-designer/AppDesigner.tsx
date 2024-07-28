import {CSSProperties, useContext, useEffect} from "react";
import {AnySignal, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";

import {guid} from "../utils/guid.ts";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {sortSignal} from "./sortSignal.ts";
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
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');
    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
    const allVariablesSignal = useSignal<Array<Variable>>([]);
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);
    const allContainersSignal = useSignal<Array<Container>>([{
        id: guid(),
        type: 'vertical',
        children: [],
        parent: '',
        height: '',
        width: '',
        minWidth: '100px',
        minHeight: '100px',

        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',

        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',
        properties: {},

        gap: '',
        verticalAlign: '',
        horizontalAlign: '',

    }]);
    const {value, onChange} = props;
    useEffect(() => {
        if (value && value.containers && value.containers.length > 0) {
            allContainersSignal.set(value.containers);
        }
        if (value && value.variables && value.variables.length > 0) {
            allVariablesSignal.set(value.variables.sort(sortSignal));
        }
    }, [allContainersSignal, allVariablesSignal, value]);

    useSignalEffect(() => {
        onChange({
            containers: allContainersSignal.get(),
            variables: allVariablesSignal.get()
        });
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
                    hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
                    selectedDragContainerIdSignal: selectedDragContainerIdSignal,
                    activeDropZoneIdSignal: activeDropZoneIdSignal,
                    uiDisplayModeSignal: uiDisplayModeSignal,
                    allContainersSignal: allContainersSignal,
                    allVariablesSignal: allVariablesSignal,
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
                        backgroundColor: 'rgba(0,0,0,0.2)'
                    }}>
                        <ToggleViewToolbar/>
                        <div style={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 10
                        }}>
                            <notifiable.div style={{flexGrow: 1, borderRadius: 10, overflow: 'auto'}}>
                                {renderedElements}
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

