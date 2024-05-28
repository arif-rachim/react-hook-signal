import {PopupParameter} from "./usePopup.ts";
import {useEffect, useRef} from "react";


function PopupPanel<T>(props: PopupParameter<T>) {

    const {element, config} = props;
    const popupPanelContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const { tapOutside, escapePressed} = config.dismissal ?? {
            containerScrolled: true,
            tapOutside: true,
            escapePressed: true,
        };

        function onDismiss(reason?: 'containerScrolled' | 'tapOutside' | 'escapePressed') {
            if (config.onDismiss) {
                config.closePanel(config.onDismiss(reason));
            } else {
                config.closePanel(undefined);
            }
        }

        const deregisterListeners: (() => void)[] = [];

        function onClickOutside(event: unknown) {
            if (event && typeof event === 'object' && 'target' in event) {
                const isClickInside = popupPanelContainerRef.current!.contains(event.target as Node);
                const isClickOnNode = config.node.contains(event.target as Node);
                const isClickOutside = !(isClickOnNode || isClickInside)
                if (isClickOutside) {
                    onDismiss('tapOutside')
                }
            }
        }

        if (tapOutside) {
            document.body.addEventListener('click', onClickOutside);
            deregisterListeners.push(() => {
                document.body.removeEventListener('click', onClickOutside);
            })
        }

        function onEscapePressed(event: unknown) {
            if (event && typeof event === 'object' && 'key' in event && 'keyCode' in event) {
                if (event.key === 'Escape' || event.keyCode === 27) {
                    onDismiss('escapePressed')
                }
            }
        }

        if (escapePressed) {

            document.body.addEventListener('keydown', onEscapePressed);
            deregisterListeners.push(() => {
                document.body.removeEventListener('keydown', onEscapePressed);
            })
        }
        return () => deregisterListeners.forEach(listener => listener())
    }, [config]);

    const {left, top, width, height} = config.targetRect;
    const anchor = config.anchor ?? 'bottom-left';
    return <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        top: top,
        left: left,
        width: width,
        height: 0,
        backgroundColor: 'white',
    }}>
        <div ref={popupPanelContainerRef} style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            left: anchor === 'bottom-left' || anchor === 'top-left' ? 0 : undefined,
            right: anchor === 'bottom-right' || anchor === 'top-right' ? 0 : undefined,
            top: anchor === 'bottom-right' || anchor === 'bottom-left' ? height : undefined,
            bottom: anchor === 'top-right' || anchor === 'top-left' ? 0 : undefined,
        }}>
            {element}
        </div>
    </div>;
}

export function PopupContainer<T>(props: { popupPanels: Array<PopupParameter<T>> }) {
    const popupPanels = props.popupPanels;
    return <>
        {popupPanels.map(p => {
            return <PopupPanel key={p.id} {...p}/>
        })}
    </>
}

