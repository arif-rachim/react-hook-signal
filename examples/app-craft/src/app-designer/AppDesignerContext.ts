import {createContext} from "react";
import {Signal} from "signal-polyfill";
import {Container, Page, Variable, VariableInstance} from "./AppDesigner.tsx";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {ErrorType} from "./errors/ErrorType.ts";

/**
 * Represents the context for the App Designer.
 */
export interface AppDesignerContext {
    allPagesSignal:Signal.State<Array<Page>>;
    activePageIdSignal:Signal.State<string>;
    activeDropZoneIdSignal: Signal.State<string>;
    selectedDragContainerIdSignal: Signal.State<string>;
    hoveredDragContainerIdSignal: Signal.State<string>;
    allContainersSignal: Signal.Computed<Array<Container>>;
    allVariablesSignal: Signal.Computed<Array<Variable>>;
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>;
    uiDisplayModeSignal: Signal.State<'design' | 'view'>;
    allErrorsSignal: Signal.State<Array<ErrorType>>;
    elements: LayoutBuilderProps['elements'];
}

export const AppDesignerContext = createContext<AppDesignerContext>({
    allPagesSignal:new Signal.State<Array<Page>>([]),
    activePageIdSignal : new Signal.State(''),
    activeDropZoneIdSignal: new Signal.State<string>(''),
    selectedDragContainerIdSignal: new Signal.State<string>(''),
    hoveredDragContainerIdSignal: new Signal.State<string>(''),
    uiDisplayModeSignal: new Signal.State<"design" | "view">('design'),
    allContainersSignal: new Signal.Computed<Array<Container>>(() => []),
    allVariablesSignal: new Signal.Computed<Array<Variable>>(() => []),
    allVariablesSignalInstance: new Signal.State<Array<VariableInstance>>([]),
    allErrorsSignal: new Signal.State<Array<ErrorType>>([]),
    elements: {},
})