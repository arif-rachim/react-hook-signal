import {createContext} from "react";
import {Signal} from "signal-polyfill";
import {Container, Page, Variable, VariableInstance} from "./AppDesigner.tsx";
import {ErrorType} from "./errors/ErrorType.ts";
import {AppViewerContext} from "./app-viewer/AppViewer.tsx";

/**
 * Represents the context for the App Designer.
 */
export interface AppDesignerContext extends AppViewerContext{
    activeDropZoneIdSignal: Signal.State<string>;
    selectedDragContainerIdSignal: Signal.State<string>;
    hoveredDragContainerIdSignal: Signal.State<string>;
    uiDisplayModeSignal: Signal.State<'design' | 'view'>;
}

export const AppDesignerContext = createContext<AppDesignerContext>({
    allPagesSignal: new Signal.State<Array<Page>>([]),
    activePageIdSignal: new Signal.State(''),
    activeDropZoneIdSignal: new Signal.State<string>(''),
    selectedDragContainerIdSignal: new Signal.State<string>(''),
    hoveredDragContainerIdSignal: new Signal.State<string>(''),
    uiDisplayModeSignal: new Signal.State<"design" | "view">('design'),
    allContainersSignal: new Signal.Computed<Array<Container>>(() => []),
    variableInitialValueSignal: new Signal.State<Record<string, unknown>>({}),
    allVariablesSignal: new Signal.Computed<Array<Variable>>(() => []),
    allVariablesSignalInstance: new Signal.State<Array<VariableInstance>>([]),
    allErrorsSignal: new Signal.State<Array<ErrorType>>([]),
    elements: {},
})