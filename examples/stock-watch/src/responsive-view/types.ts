import {Signal} from "signal-polyfill";
import {AnySignal} from "react-hook-signal";

/**
 * Interface representing the data to be used in a view context.
 */
export interface ViewContextData<DataItem extends Record<string,unknown>= Record<string,unknown>, BreakPoint extends Record<string,unknown>= Record<string,unknown>, CellRenderer extends Record<string,unknown>= Record<string,unknown>, Template extends Record<string,unknown>= Record<string,unknown>, Properties extends Record<string,unknown>= Record<string,unknown>> {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
    viewportDimensions: AnySignal<{ width: number, height: number }>,
    currentBreakPoint: AnySignal<keyof BreakPoint>,
    currentTemplateKey: AnySignal<keyof Template>,
    properties: Properties,
    item: DataItem
}
