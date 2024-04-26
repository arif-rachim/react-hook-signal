import {CSSProperties, PropsWithChildren, useEffect, useRef} from "react";
import {Signal} from "signal-polyfill";
import {Todo} from "../../model/Todo.ts";

export function GridHeaderColumnSizeNotifier(props: PropsWithChildren<{
    className: string,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    colId: keyof Todo | string,
    style?: CSSProperties
}>) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const propsRef = useRef(props);

    useEffect(() => {
        const {colId, cellsWidth} = propsRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                cellsWidth.set({...cellsWidth.get(), [colId]: entry.borderBoxSize[0].inlineSize})
            }
        });
        resizeObserver.observe(elementRef.current!);
        return () => {
            resizeObserver.disconnect();
        }
    }, [])

    return <div ref={elementRef} className={props.className} style={props.style}>
        {props.children}
    </div>
}