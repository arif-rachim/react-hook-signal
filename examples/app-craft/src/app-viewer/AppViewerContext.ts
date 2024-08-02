import {Signal} from "signal-polyfill";
import {Container, Page, Variable, VariableInstance} from "../app-designer/AppDesigner.tsx";
import {ErrorType} from "../app-designer/errors/ErrorType.ts";
import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {createContext} from "react";

/**
 * Represents the context of an app viewer.
 */
export interface AppViewerContext {
    allPagesSignal: Signal.State<Array<Page>>;
    activePageIdSignal: Signal.State<string>;
    allContainersSignal: Signal.Computed<Array<Container>>;
    allVariablesSignal: Signal.Computed<Array<Variable>>;
    variableInitialValueSignal: Signal.State<Record<string, unknown>>;
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>;
    allErrorsSignal: Signal.State<Array<ErrorType>>;
    elements: LayoutBuilderProps['elements'];
}

/**
 * Context object for the App Viewer.
 */
export const AppViewerContext = createContext<AppViewerContext|undefined>(undefined)
