import {CSSProperties, PropsWithChildren, useRef} from "react";
import {Signal} from "signal-polyfill";
import {Todo} from "../../model/Todo.ts";
import {useComputed} from "../../../../../src/hooks.ts";
import {notifiable} from "../../../../../src/components.ts";

export function ResizeableListener(props: PropsWithChildren<{
    className: string,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    colId: keyof Todo | string,
}>) {
    const propsRef = useRef(props);
    propsRef.current = props;
    const colId = props.colId as keyof Todo;
    const style = useComputed<CSSProperties>(() => ({
        width: props.cellsWidth.get()?.[colId] as number
    }))
    return <notifiable.div className={props.className} style={style}>
        {props.children}
    </notifiable.div>
}