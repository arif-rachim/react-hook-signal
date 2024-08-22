import {Signal} from "signal-polyfill";
import {
    Application,
    Callable,
    Container,
    Fetcher,
    Page,
    Variable,
    VariableInstance
} from "../app-designer/AppDesigner.tsx";
import {ErrorType} from "../app-designer/errors/ErrorType.ts";
import {LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {createContext} from "react";
import {Table} from "../app-designer/panels/database/service/getTables.ts";

/**
 * Represents the context of an app viewer.
 */
export interface AppViewerContext {
    applicationSignal:Signal.State<Application>;
    allApplicationCallablesSignal:Signal.Computed<Array<Callable>>;
    allPageCallablesSignal:Signal.Computed<Array<Callable>>;
    allTablesSignal: Signal.Computed<Array<Table>>;
    allPagesSignal: Signal.Computed<Array<Page>>;
    activePageIdSignal: Signal.State<string>;
    allContainersSignal: Signal.Computed<Array<Container>>;
    allPageVariablesSignal: Signal.Computed<Array<Variable>>;
    allPageFetchersSignal: Signal.Computed<Array<Fetcher>>;
    allApplicationFetchersSignal: Signal.Computed<Array<Fetcher>>;
    variableInitialValueSignal: Signal.State<Record<string, unknown>>;
    allPageVariablesSignalInstance: Signal.State<Array<VariableInstance>>;
    allErrorsSignal: Signal.State<Array<ErrorType>>;
    allApplicationVariablesSignal: Signal.Computed<Array<Variable>>,
    allApplicationVariablesSignalInstance : Signal.State<Array<VariableInstance>>,
    elements: LayoutBuilderProps['elements'];
}

/**
 * Context object for the App Viewer.
 */
export const AppViewerContext = createContext<AppViewerContext | undefined>(undefined)
