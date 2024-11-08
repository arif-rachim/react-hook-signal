import {useRef} from "react";

type ModifiedProperties = {
    [key: string]: { previous: unknown, current: unknown };
}

export function useModifiedProperties<T>(json: T): ModifiedProperties | null {
    const prevJsonRef = useRef<T | null>(null);
    let modifiedProperties: ModifiedProperties|null  = {};
    const prevJson = prevJsonRef.current;
    if (prevJson) {
        for (const key in json) {
            if (json[key] !== prevJson[key]) {
                modifiedProperties[key] = {
                    previous: prevJson[key],
                    current: json[key]
                }
            }
        }
    }
    if (Object.keys(modifiedProperties).length === 0) {
        modifiedProperties = null;
    }
    prevJsonRef.current = json;
    return modifiedProperties;
}