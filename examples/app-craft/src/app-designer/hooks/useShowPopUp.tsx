import {useShowModal} from "../../modal/useShowModal.ts";
import {CSSProperties, ForwardedRef, forwardRef, HTMLProps, PropsWithChildren, useEffect} from "react";
import {FactoryFunction} from "../../modal/ModalContext.ts";
import {useForwardedRef} from "./useForwardedRef.ts";

export function useShowPopUp() {
    const showModal = useShowModal();

    return function showPopUp<T, V extends HTMLElement>(ref: ForwardedRef<V>, panel: FactoryFunction<T>) {

        return showModal<T>((closePanel) => {
            let width: CSSProperties['width'] = '100%';
            let top: CSSProperties['top'] = 0;
            let left: CSSProperties['left'] = 0;
            if (ref && 'current' in ref && ref.current) {
                const rect = ref.current.getBoundingClientRect();
                width = rect.width;
                top = rect.bottom;
                left = rect.left;
            }
            const element = panel(closePanel);
            return <div style={{width: '100%', height: '100%'}}>
                <div style={{width, left, top, position: 'absolute'}}>{element}</div>
            </div>
        }, {plainPanel: true})
    }
}

export function detectClickOutside(ref: ForwardedRef<HTMLElement>, callback: (event: MouseEvent) => void, config?: {
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
