import {ForwardedRef, useRef} from "react";

export function useForwardedRef<T>(ref?: ForwardedRef<T>): ForwardedRef<T> {
    const localRef = useRef<T>() as ForwardedRef<T>;
    return ref === undefined || ref === null ? localRef : ref;
}