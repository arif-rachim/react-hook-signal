import {CSSProperties, FunctionComponent} from "react";
import {Signal} from "signal-polyfill";
import {AnySignal} from "react-hook-signal";

/**
 * Represents the properties for rendering a cell component.
 * @template DataItem The type of the data item.
 * @template K The key of the item property.
 */
export type CellCompProps<DataItem, K extends keyof DataItem> = { item: DataItem, value: DataItem[K],index:number};

/**
 * Represents the type definition for a Cell Component.
 * @template DataItem The type of the data item being used.
 */
export type CellCompType<DataItem> = { [K in keyof DataItem]?: FunctionComponent<CellCompProps<DataItem, K>> }

/**
 * Slot component to render a specific cell in a grid or table component.
 *
 * @template CellRenderer - The type of the cell renderer to be used.
 */
export type SlotComp<CellRenderer> = FunctionComponent<{ for: keyof CellRenderer,style:CSSProperties }>

/**
 * Represents a template type for rendering data items with breakpoints and cell renderers.
 *
 * @template DataItem - The type of the data item to be rendered.
 * @template BreakPoint - The type of the breakpoints.
 * @template CellRenderer - The type of the cell renderer component.
 */
export type TemplateType<DataItem extends object, BreakPoint extends Record<string, number>, CellRenderer extends CellCompType<DataItem>> = { [K in keyof BreakPoint]?: FunctionComponent<{ Slot: SlotComp<CellRenderer> }> }

/**
 * Represents the context data for a list component.
 * @template DataItem - The type of data
 * @template BreakPoint - The type of breakpoint.
 * @template CellRenderer - The type of cell renderer.
 * @template Template - The type of template.
 */
export interface ListContextData<DataItem,BreakPoint, CellRenderer, Template> {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
    viewportDimensions: AnySignal<{ width: number, height: number }>,
    currentBreakPoint: AnySignal<keyof BreakPoint>,
    templateHeight: Signal.State<number>,
    scrollOffset:AnySignal<number>,
    currentTemplateKey:AnySignal<keyof Template>,
    data:AnySignal<Array<DataItem>>,
    totalTemplatePerSegment: AnySignal<number>,
    totalSegment:Signal.State<number>,
    totalOffsetSegment:Signal.State<number>,
    currentScrollSegment:AnySignal<number>,
    segmentCurrentlyBeingRendered:Signal.State<Array<number>>
}

/**
 * Represents the context data for a row in a collection of data items.
 *
 * @template DataItem The type of the data item in the row.
 */
export interface TemplateContextData<DataItem>{
    item: DataItem,
    index: number
}