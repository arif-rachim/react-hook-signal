import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {format_hhmmss} from "../utils/dateFormat.ts";


export function useRefresh(name: string) {
    const isMountedRef = useRef<boolean>(true);
    const eventName = `refresh-event-${name}`;
    const keyStorage = useMemo(() => {
        return localStorage.getItem(eventName) ?? '';
    }, [eventName]);
    const [key, setKey] = useState(keyStorage);
    const refresh = useCallback(function refresh() {
        const newKey = keyId();
        localStorage.setItem(eventName, newKey);
        window.dispatchEvent(new CustomEvent(eventName, {detail: newKey}));
        if (isMountedRef.current) {
            setKey(newKey);
        }
    }, [eventName])
    useEffect(() => {
        isMountedRef.current = true;

        function onRefreshTrigger(event: unknown) {
            if (isMountedRef.current && event !== undefined && event !== null && typeof event === 'object' && 'detail' in event) {
                setKey(event.detail as string);
            }
        }
        window.addEventListener(eventName, onRefreshTrigger);
        return () => {
            isMountedRef.current = false;
            window.removeEventListener(eventName, onRefreshTrigger);
        }
    }, [eventName]);
    return {key, refresh};
}

function keyId() {
    return format_hhmmss(new Date());
}