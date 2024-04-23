import {useComputed, useSignal} from "../../../../src/hooks.ts";
import {createContext, CSSProperties, PropsWithChildren, useEffect, useRef} from "react";
import {delay} from "../utils/delay.ts";
import {notifiable} from "../../../../src/components.ts";
import {guid} from "../utils/guid.ts";

function ModalPanel(props: {
    panel: React.ReactNode,
    beforeHide: (callback: () => Promise<void>) => () => void
}) {
    const style = useSignal<CSSProperties>({top: '-100%', transition: 'all 300ms ease-in-out'})
    const {panel} = props;
    const propsRef = useRef({...props, style});
    propsRef.current = {...props, style};
    useEffect(() => {
        const {style, beforeHide} = propsRef.current;
        (async () => {
            await delay(10);
            style.set({...style.get(), top: 0})
        })();
        return beforeHide(async () => {
            style.set({...style.get(), top: '-100%'});
            await delay(300);
        })
    }, [])
    return <notifiable.div className={'flex col overflow-auto w-full h-full align-center absolute top-0 left-0'}
                           style={style}>
        {panel}
    </notifiable.div>
}

export type ShowDialogType = <T>(factory: (closePanel: (value: T) => void) => React.ReactNode) => Promise<T>
export const ModalContext = createContext<ShowDialogType | null>(null)

export function ModalProvider(props: PropsWithChildren) {

    const panels = useSignal<{
        node: React.ReactNode,
        id: string,
        hideCallback?: () => Promise<void>,
    }[]>([]);
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

    const modalContainerClassName = useComputed(() => {
        const isEmpty = panels.get().length === 0;
        return `${isEmpty ? 'none' : 'flex'} w-full h-full overflow-auto absolute top-0 left-0`
    })

    function showDialog<T>(panelBuilder: (resolver: (value: T) => void) => React.ReactNode) {
        return new Promise<T>((resolve) => {
            const id = guid();

            const node: React.ReactNode = panelBuilder((value: T) => {
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
            <notifiable.div className={modalContainerClassName}>
                {panelsElement}
            </notifiable.div>
        </ModalContext.Provider>
    )
}
