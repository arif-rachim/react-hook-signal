import {AppDesignerContext} from "../../app/designer/AppDesignerContext.ts";
import {useContext} from "react";
import {AppViewerContext} from "../../app/viewer/context/AppViewerContext.ts";

export function useAppContext<T extends (AppViewerContext | AppDesignerContext)>(): T {
    const appDesignerContext = useContext(AppDesignerContext);
    const appViewerContext = useContext(AppViewerContext);
    if (appViewerContext) {
        return appViewerContext as T;
    } else {
        return appDesignerContext as T;
    }
}