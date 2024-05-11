import {useSignal} from "react-hook-signal";
import {CSSProperties, useEffect} from "react";
import {transformValue} from "./transformValue.ts";
import {Signal} from "signal-polyfill";

const props =
    ["width",
        "height",
        "margin",
        "marginTop",
        "marginRight",
        "marginBottom",
        "marginLeft",
        "padding",
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "borderWidth",
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderRadius",
        "top",
        "right",
        "bottom",
        "left",
        "fontSize",
        "lineHeight",
        "letterSpacing",
        "wordSpacing",
        "outlineWidth",
        "opacity",
        "textIndent",
        "columnWidth",
        "columnGap",
        "columnRuleWidth",
        "flexBasis",
        "gridGap",
        "gridRowGap",
        "gridColumnGap",
        "scrollMargin",
        "scrollMarginTop",
        "scrollMarginRight",
        "scrollMarginBottom",
        "scrollMarginLeft",
        "scrollPadding",
        "scrollPaddingTop",
        "scrollPaddingRight",
        "scrollPaddingBottom",
        "scrollPaddingLeft",
        "offsetDistance",
        "perspective",
        "perspectiveOrigin",
        "transformOrigin",
        "shapeMargin",
        "maskBorderWidth"] as const
export type AnimatedProperties = {
    [K in (typeof props)[number]]?: number
}

type SetStyleProps<AnimatedProperties> = {
    to: AnimatedProperties,
    from: AnimatedProperties,
    duration: number,
    onBeforeStarted?: (current: CSSProperties) => CSSProperties,
    onAfter?: (current: CSSProperties) => CSSProperties
}
export function useAnimatedStyle(initial: CSSProperties): [Signal.State<CSSProperties>, (props: SetStyleProps<AnimatedProperties>) => void] {
    const style: Signal.State<CSSProperties> = useSignal<CSSProperties>(initial);
    useEffect(() => style.set(initial),[initial, style])
    const setStyle = <T extends AnimatedProperties>(value: SetStyleProps<T>) => {
        const {from, to, duration, onAfter, onBeforeStarted} = value;
        if (onBeforeStarted) {
            const currentStyle = Signal.subtle.untrack(() => style.get());
            const newStyle = onBeforeStarted(currentStyle);
            style.set({...currentStyle,...newStyle})
        }
        transformValue({start: from, end: to, duration}, (value) => {
            style.set({...style.get(), ...value})
        },() => {
            if(onAfter){
                const currentStyle = Signal.subtle.untrack(() => style.get());
                const newStyle = onAfter(currentStyle);
                style.set({...currentStyle,...newStyle})
            }
        })

    }
    return [style, setStyle]
}