import {createContext, CSSProperties, PropsWithChildren, type ReactNode, useEffect, useRef} from "react";
import {delay} from "../utils/delay.ts";
import {notifiable} from "react-hook-signal"
import {guid} from "../utils/guid.ts";
import {useComputed,useSignal} from "react-hook-signal"

/**
 * The ModalPanel component.
 */
function ModalPanel(props: {
    panel: ReactNode,
    beforeHide: (callback: () => Promise<void>) => () => void
}) {

    /**
     * The current style of the modal panel.
     */
    const style = useSignal<CSSProperties>({transform:'scale(0.5)',opacity:0, transition: 'all 300ms ease-in-out'})

    const {panel} = props;

    /**
     * A reference to the props and style.
     */
    const propsRef = useRef({...props, style});
    propsRef.current = {...props, style};

    /**
     * An effect that animates the modal panel when it is shown and hides it when it is closed.
     */
    useEffect(() => {
        const {style, beforeHide} = propsRef.current;
        (async () => {
            await delay(10);
            style.set({...style.get(), transform:'scale(1)',opacity:1})
        })();
        return beforeHide(async () => {
            style.set({...style.get(), transform:'scale(0.5)',opacity:0});
            await delay(300);
        })
    }, [])
    return <notifiable.div className={'flex col overflow-auto w-full h-full  align-center justify-center absolute top-0 left-0'}
                           style={style}>
        {panel}
    </notifiable.div>
}

export type ShowDialogType = <T>(factory: (closePanel: (value: T) => void) => ReactNode) => Promise<T>

/**
 * The context for the modal dialog.
 */
export const ModalContext = createContext<ShowDialogType | null>(null)

/**
 * The ModalProvider component.
 */
export function ModalProvider(props: PropsWithChildren) {

    /**
     * The list of currently displayed modal panels.
     */
    const panels = useSignal<{
        node: ReactNode,
        id: string,
        hideCallback?: () => Promise<void>,
    }[]>([]);

    /**
     * The computed elements for the modal panels.
     */
    const panelsElement = useComputed(() => {
        return panels.get().map(p => {
            return <ModalPanel panel={p.node} key={p.id} beforeHide={(hideCallback: () => Promise<void>) => {
                p.hideCallback = hideCallback
                return () => {
                    p.hideCallback = undefined;
                }
            }}/>
        })
    })

    /**
     * The computed class name for the modal container.
     */
    const modalContainerClassName = useComputed(() => {
        const isEmpty = panels.get().length === 0;
        return `${isEmpty ? 'none' : 'flex'} w-full h-full overflow-auto absolute top-0 left-0`
    })

    /**
     * A function to show a modal dialog.
     */
    function showDialog<T>(panelBuilder: (resolver: (value: T) => void) => ReactNode) {
        return new Promise<T>((resolve) => {
            const id = guid();

            const node: ReactNode = panelBuilder((value: T) => {
                const indexToRemove = panels.get().findIndex(i => i.id === id);
                const p = panels.get()[indexToRemove];
                if (p.hideCallback) {
                    p.hideCallback().then(() => {
                        panels.set(panels.get().filter(i => i.id !== id));
                        resolve(value)
                    })
                } else {
                    panels.set(panels.get().filter(i => i.id !== id));
                    resolve(value)
                }

            })
            const p = {
                id,
                node
            }
            panels.set([...panels.get(), p])
        })
    }

    return (
        <ModalContext.Provider value={showDialog}>
            {props.children}
            <notifiable.div className={modalContainerClassName} >
                {panelsElement}
            </notifiable.div>
        </ModalContext.Provider>
    )
}
