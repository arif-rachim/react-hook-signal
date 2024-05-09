import {useContext, useEffect} from "react";
import {ListContext} from "../ListContext.ts";
import {useSignal} from "react-hook-signal";

export function useListContext(){
    const context = useContext(ListContext);
    const contextSignal = useSignal(context);
    useEffect(() => contextSignal.set(context), [context, contextSignal]);
    return contextSignal;
}