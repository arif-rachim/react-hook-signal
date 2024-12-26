import {dateToString} from "./dateFormat.ts";

export function toString(val: unknown, defaultVal?: string): string | undefined {
    if (val === undefined || val === null) {
        return defaultVal;
    }
    if (typeof val === 'number') {
        return val.toString()
    }
    if (val instanceof Date) {
        return dateToString(val) ?? defaultVal;
    }
    if (typeof val === 'string') {
        return val;
    }
    if (typeof val === 'object') {
        return JSON.stringify(val)
    }
    return defaultVal;
}