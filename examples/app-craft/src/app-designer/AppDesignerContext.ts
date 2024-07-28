import {createContext} from "react";
import {Signal} from "signal-polyfill";
import {Container, Variable, VariableInstance} from "./AppDesigner.tsx";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {ErrorType} from "./errors/ErrorType.ts";

/**
 * Represents the context for the App Designer.
 */
export interface AppDesignerContext {
    activeDropZoneIdSignal: Signal.State<string>;
    selectedDragContainerIdSignal: Signal.State<string>;
    hoveredDragContainerIdSignal: Signal.State<string>;
    allContainersSignal: Signal.State<Array<Container>>;
    allVariablesSignal: Signal.State<Array<Variable>>;
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>;
    uiDisplayModeSignal: Signal.State<'design' | 'view'>;
    allErrorsSignal: Signal.State<Array<ErrorType>>;
    elements: LayoutBuilderProps['elements'];
}

export const AppDesignerContext = createContext<AppDesignerContext>({
    activeDropZoneIdSignal: new Signal.State<string>(''),
    selectedDragContainerIdSignal: new Signal.State<string>(''),
    hoveredDragContainerIdSignal: new Signal.State<string>(''),
    uiDisplayModeSignal: new Signal.State<"design" | "view">('design'),
    allContainersSignal: new Signal.State<Array<Container>>([]),
    allVariablesSignal: new Signal.State<Array<Variable>>([]),
    allVariablesSignalInstance: new Signal.State<Array<VariableInstance>>([]),
    allErrorsSignal: new Signal.State<Array<ErrorType>>([]),
    elements: {},
})