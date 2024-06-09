import {Signal} from "signal-polyfill";


export function isStateSignal(value:unknown):value is Signal.State<unknown>{
    return value !== undefined && value !== null && typeof value === 'object' && 'set' in value && 'get' in value;
}