import {ForwardedRef, forwardRef, HTMLProps, PropsWithChildren, useEffect} from "react";
import {useForwardedRef} from "../../../core/hooks/useForwardedRef.ts";

export const DivWithClickOutside = forwardRef(function DivWithClickOutside(props: PropsWithChildren<HTMLProps<HTMLDivElement> & {
    onClickOutside: (event: MouseEvent) => void
}>, ref: ForwardedRef<HTMLElement>) {
    const localRef = useForwardedRef<HTMLDivElement>(ref as ForwardedRef<HTMLDivElement>);
    const {onClickOutside, children, ...properties} = props;
    useEffect(() => {
        let unregisterListener = () => {
        };
        if (onClickOutside) {
            unregisterListener = detectClickOutside(localRef as ForwardedRef<HTMLElement>, (event) => {
                onClickOutside(event);
            }, {delay: 100})
        }
        return () => {
            unregisterListener()
        }
    }, [localRef, onClickOutside]);
    return <div ref={localRef} {...properties}>{children}</div>
})


function detectClickOutside(ref: ForwardedRef<HTMLElement>, callback: (event: MouseEvent) => void, config?: {
    delay: number
}) {
    function onClick(event: MouseEvent) {
        if (ref && 'current' in ref && ref.current && 'contains' in ref.current && 'target' in event && !ref.current.contains(event.target as Node) && callback) {
            callback(event);
        }
    }

    const delay = config?.delay;
    let timeoutTimer: number = 0;
    if (delay) {
        const tm = setTimeout(() => {
            window.addEventListener('click', onClick);
        }, delay);
        timeoutTimer = tm as unknown as number;
    } else {
        window.addEventListener('click', onClick);
    }
    return function unRegister() {
        clearTimeout(timeoutTimer);
        return window.removeEventListener('click', onClick);
    }
}
