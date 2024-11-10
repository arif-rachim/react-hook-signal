import {useShowModal} from "../../modal/useShowModal.ts";
import {CSSProperties, ForwardedRef, forwardRef, HTMLProps, PropsWithChildren, ReactElement, useEffect} from "react";
import {useForwardedRef} from "./useForwardedRef.ts";
import {guid} from "../../utils/guid.ts";

export function useShowPopUp() {
    const showModal = useShowModal();
    return function showPopUp<T, V extends HTMLElement>(ref: ForwardedRef<V>, panel: (closePanel: (param?: T) => void, commitLayout: () => void) => ReactElement) {

        return showModal<T>((closePanel) => {
            const id = guid();
            let width: CSSProperties['width'] = '100%';
            let top: CSSProperties['top'] = 0;
            let left: CSSProperties['left'] = 0;
            if (ref && 'current' in ref && ref.current) {
                const rect = ref.current.getBoundingClientRect();
                width = rect.width;
                top = rect.bottom;
                left = rect.left;
            }
            const element = panel(closePanel, async () => {
                await delay(0);
                const div = document.getElementById(id);
                if (div === null) {
                    return;
                }
                const {left, top} = ensureVisibleInViewPort(div);
                div.style.left = `${left}px`;
                div.style.top = `${top}px`;
                div.style.opacity = '1';
            });

            return <div style={{width: '100%', height: '100%'}}>
                <div id={id} style={{width, left, top, opacity: 0, position: 'absolute',transition:'opacity 100ms ease-out'}}>{element}</div>
            </div>
        }, {plainPanel: true})
    }
}

function delay(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}


function ensureVisibleInViewPort(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let newLeft = rect.left;
    let newTop = rect.top;

    if (rect.left < 0) {
        newLeft = 0;
    } else if (rect.right > viewportWidth) {
        newLeft = viewportWidth - rect.width;
    }
    if (rect.top < 0) {
        newTop = 0;
    } else if (rect.bottom > viewportHeight) {
        newTop = viewportHeight - rect.height;
    }
    return {left: newLeft, top: newTop};
}

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
