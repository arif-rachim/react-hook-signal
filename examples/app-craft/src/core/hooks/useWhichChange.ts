import type {MutableRefObject} from "react";
import {useRef} from "react";

const debug:boolean = false;
export function whichChange(params:{label: string, props: Record<string, unknown> | undefined, ref: MutableRefObject<Record<string, unknown> | undefined>}) {
    const {ref,label,props} = params;
    const previousValue = ref.current ?? {};
    if (props === previousValue) {
        return;
    }
    let difference: Record<string, { current: unknown, prev: unknown }> | undefined = undefined;
    const val = props ?? {};

    Object.keys(val).concat(Object.keys(previousValue)).forEach(key => {
        difference = difference || {};
        if (previousValue[key] !== val[key]) {
            difference[key] = {
                prev: previousValue[key],
                current: val[key]
            }
        }
    })

    ref.current = props;
    if (difference && debug) {
        console.log('[whichChange]',label, difference);
    }
}

export function useWhichChange(label: string, props?: Record<string, unknown>) {
    const ref = useRef<Record<string, unknown> | undefined>();
    whichChange({label,ref,props});
}