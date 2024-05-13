import {Signal} from "signal-polyfill";
import {AnySignal} from "react-hook-signal";

export interface ViewContextData<DataItem, BreakPoint, CellRenderer, Template, Properties> {
    breakPoint: Signal.State<BreakPoint>,
    cellRenderer: Signal.State<CellRenderer>,
    template: Signal.State<Template>,
    viewportDimensions: AnySignal<{ width: number, height: number }>,
    currentBreakPoint: AnySignal<keyof BreakPoint>,
    currentTemplateKey: AnySignal<keyof Template>,
    properties: Properties,
    item: DataItem
}