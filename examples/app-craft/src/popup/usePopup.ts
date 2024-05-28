import {ReactElement, useCallback, useState} from "react";
import {guid} from "../utils/guid.ts";
import {PopupAnchor, PopupConfig, PopupFactoryFunction} from "./PopupContext.ts";

export type PopupParameter<T> = {
    id: string,
    element: ReactElement,
    config: PopupConfig<T>,
};


function isHTMLElement(value:unknown):value is HTMLElement{
    if(value && typeof value === 'object' && 'getBoundingClientRect' in value){
        return true;
    }
    return false;
}

export function usePopup() {
    const [popupPanels, setPopupPanels] = useState<Array<PopupParameter<unknown>>>([]);

    const showPopup = <T>(event:{target:unknown,anchor?:PopupAnchor}, factoryFunction: PopupFactoryFunction<T>,config?:Omit<PopupConfig<T>,'targetRect'|'node'|'closePanel'>) => {
        if(!isHTMLElement(event.target)){
            throw new Error('Event target is not HTMLELement');
        }
        const rect = event.target.getBoundingClientRect();
        const node:HTMLElement = event.target;
        return new Promise<unknown>(resolve => {
            const id = guid();
            function closePanel(params?: unknown){
                setPopupPanels(oldPanels => oldPanels.filter(p => p.id !== id));
                resolve(params);
            }
            const element = factoryFunction(closePanel, rect);
            setPopupPanels(p => ([...p, {id, element, config:{...config,targetRect:rect,node,closePanel}}]))
        })
    }
    const showPopupCallback = useCallback(showPopup,[]);

    return {showPopup:showPopupCallback, popupPanels};
}

