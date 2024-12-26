import {createContext} from "react";
import {Signal} from "signal-polyfill";
import {AppViewerContext} from "../viewer/context/AppViewerContext.ts";

/**
 * Represents the context for the App Designer.
 */
export interface AppDesignerContext extends AppViewerContext {
    activeDropZoneIdSignal: Signal.State<string>;
    selectedDragContainerIdSignal: Signal.State<string>;
    hoveredDragContainerIdSignal: Signal.State<string>;
    uiDisplayModeSignal: Signal.State<'design' | 'view'>;
}

export const AppDesignerContext = createContext<AppDesignerContext | undefined>(undefined)