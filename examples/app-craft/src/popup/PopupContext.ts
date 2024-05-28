import {createContext, ReactElement} from "react";

export type PopupFactoryFunction<T> = (closePanel: (param?: T) => void,target:{width:number,height:number}) => ReactElement;
export type PopupAnchor = 'bottom-left'|'bottom-right'|'top-left'|'top-right';
export type PopupConfig<T> = {
    targetRect:DOMRect,
    node : HTMLElement,
    anchor?:PopupAnchor,
    dismissal?:{
        containerScrolled : boolean,
        tapOutside : boolean,
        escapePressed :boolean,
    },
    onDismiss? : (reason?:'containerScrolled'|'tapOutside'|'escapePressed') => T|undefined,
    closePanel : (params?:T) => void
}
export type ShowPopUp = <T>(event:{target:unknown,anchor?:PopupAnchor}, factoryFunction: PopupFactoryFunction<T>,config?:Omit<PopupConfig<T>,'targetRect'|'node'|'closePanel'>) => Promise<T|undefined>;

export const PopupContext = createContext<ShowPopUp|undefined>(undefined);