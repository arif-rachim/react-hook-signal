import {AppDesignerContext} from "../AppDesignerContext.ts";
import {useContext} from "react";
import {AppViewerContext} from "../../app-viewer/AppViewerContext.ts";

export function useAppContext<T extends (AppViewerContext | AppDesignerContext)>(): T {
    const appDesignerContext = useContext(AppDesignerContext);
    const appViewerContext = useContext(AppViewerContext);
    if (appViewerContext) {
        return appViewerContext as T;
    } else {
        return appDesignerContext as T;
    }
}