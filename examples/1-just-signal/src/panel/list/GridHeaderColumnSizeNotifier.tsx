import {CSSProperties, PropsWithChildren, useEffect, useRef} from "react";
import {Signal} from "signal-polyfill";
import {Todo} from "../../model/Todo.ts";

/**
 * Notifies the grid header column size changes.
 *
 * @param {PropsWithChildren} props - The component props.
 * @param {string} props.className - The CSS class name for the component.
 * @param {Signal.State<Partial<{ [K in keyof Todo]: number }>>} props.cellsWidth - The state for storing the width of each column.
 * @param {keyof Todo | string} props.colId - The ID of the column.
 * @param {CSSProperties?} props.style - The optional CSS styles for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export function GridHeaderColumnSizeNotifier(props: PropsWithChildren<{
    className: string,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    colId: keyof Todo | string,
    style?: CSSProperties
}>): JSX.Element {

    /**
     * A mutable ref object that can hold a reference to a HTMLDivElement or null.
     *
     * @type {React.MutableRefObject<HTMLDivElement | null>}
     */
    const elementRef = useRef<HTMLDivElement | null>(null);

    /**
     * propsRef is a reference variable that is used to store a reference to the props object.
     * This reference can be used to access the properties of the props object.
     */
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