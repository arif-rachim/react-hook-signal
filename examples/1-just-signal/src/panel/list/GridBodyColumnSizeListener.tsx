import {CSSProperties, PropsWithChildren, useRef} from "react";
import {Signal} from "signal-polyfill";
import {Todo} from "../../model/Todo.ts";
import {notifiable} from "react-hook-signal"

/**
 * Listens for changes in the size of a grid body column and updates the column's width accordingly.
 *
 * @param {PropsWithChildren} props - The properties for the GridBodyColumnSizeListener component.
 * @param {string} props.className - The CSS class name for the container element.
 * @param {Signal.State<Partial<{ [K in keyof Todo]: number }>>} props.cellsWidth - The signal state that contains the width information for the cells.
 * @param {keyof Todo | string} props.colId - The key of the column or string identifier.
 *
 * @returns {JSX.Element} - The GridBodyColumnSizeListener component.
 */
export function GridBodyColumnSizeListener(props: PropsWithChildren<{
    className: string,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    colId: keyof Todo | string,
}>) {

    /**
     * A reference to hold the value of props.
     */
    const propsRef = useRef(props);
    propsRef.current = props;

    /**
     * Represents the column ID of a Todo item.
     *
     *
     * @param {object} props - The props object containing the column ID.
     * @property {string} colId - The column ID.
     */
    const colId = props.colId as keyof Todo;

    /**
     * Returns a computed style object based on the provided conditions.
     */
    const style = new Signal.Computed<CSSProperties>(() => {
        const cw = props.cellsWidth.get();
        if (cw && colId in cw && cw[colId]) {
            return {
                opacity: 1,
                width: cw[colId] as number,
                transition :'opacity 300ms ease-in-out'
            }
        }
        return {
            opacity:0
        }
    })
    return <notifiable.div className={props.className} style={style}>
        {props.children}
    </notifiable.div>
}
