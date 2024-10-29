import {CSSProperties, useMemo} from "react";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {viewMode} from "./viewMode.ts";


export function useContainerStyleHook(style: CSSProperties) {
    const {uiDisplayModeSignal} = useAppContext<AppDesignerContext>();
    const displayMode = uiDisplayModeSignal ?? viewMode;
    const styleString = JSON.stringify(style);
    return useMemo(() => {
        const style = JSON.parse(styleString);
        const mode = displayMode.get();
        const MIN_SPACE = 5;
        if (mode === 'design') {
            style.border = '1px dashed rgba(0,0,0,0.1)';
            const minWidthHeight = ['minWidth', 'minHeight'] as const;
            minWidthHeight.forEach(key => {
                if (style[key] !== 24) {
                    style[key] = 24;
                }
            })
            const keys = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap'] as const;
            keys.forEach(key => {
                if (toInt(style[key]) < MIN_SPACE) {
                    style[key] = MIN_SPACE;
                }
            })
        }
        return style;
    }, [displayMode, styleString]);
}


function toInt(text: unknown) {
    if (typeof text === 'string') {
        return parseInt(text)
    }
    return -1;
}