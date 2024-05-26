import {useSignal} from "react-hook-signal";
import {CSSProperties, useEffect} from "react";
import {transformValue} from "./transformValue.ts";
import {Signal} from "signal-polyfill";


export type SetStyleProps = {
    to: CSSProperties,
    from: CSSProperties,
    duration?: number,
    onBefore?: (current: CSSProperties) => CSSProperties,
    onAfter?: (current: CSSProperties) => CSSProperties
}
export function useAnimatedStyle(initial: CSSProperties): [Signal.State<CSSProperties>, (props: SetStyleProps) => (props?:Pick<SetStyleProps,'onBefore'|'onAfter'>) => void] {
    const style: Signal.State<CSSProperties> = useSignal<CSSProperties>(initial);
    useEffect(() => style.set(initial),[initial, style])
    const setStyle = (value: SetStyleProps) => {
        const {from, to, duration, onAfter, onBefore} = value;
        if (onBefore) {
            const currentStyle = Signal.subtle.untrack(() => style.get());
            const newStyle = onBefore(currentStyle);
            style.set({...currentStyle,...newStyle})
        }

        transformValue({start: (from as Record<string, unknown>), end: (to as Record<string,unknown>), duration : duration ?? 300}, (value) => {
            style.set({...style.get(), ...value})
        },() => {
            if(onAfter){
                const currentStyle = Signal.subtle.untrack(() => style.get());
                const newStyle = onAfter(currentStyle);
                style.set({...currentStyle,...newStyle})
            }
        })
        return function reverse(props?:Pick<SetStyleProps,'onBefore'|'onAfter'>){
            const onBefore = props?.onBefore ?? (() => ({}));
            const onAfter = props?.onAfter ?? (() => ({}));
            setStyle({...value,from:value.to,to:value.from,onBefore,onAfter} )
        }
    }
    return [style, setStyle]
}